"use client";

import { useState, useRef } from "react";

interface MapLocation {
  id: string;
  name: string;
  description?: string;
  x?: number;
  y?: number;
}

interface InteractiveMapProps {
  locations: MapLocation[];
  mapUrl?: string;
  onPinSave?: (locationId: string, x: number, y: number) => void;
  onPinClick?: (locationId: string) => void;
}

export function InteractiveMap({ locations, mapUrl, onPinSave, onPinClick }: InteractiveMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [pins, setPins] = useState<MapLocation[]>(locations);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; location: MapLocation } | null>(
    null
  );
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [addMode, setAddMode] = useState(false);
  const [newPinName, setNewPinName] = useState("");
  const [pendingCoords, setPendingCoords] = useState<{ x: number; y: number } | null>(null);

  const svgWidth = 800;
  const svgHeight = 600;

  function getSvgCoords(e: React.MouseEvent) {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    const scaleX = svgWidth / rect.width;
    const scaleY = svgHeight / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }

  function handleMapClick(e: React.MouseEvent) {
    if (!addMode) return;
    const coords = getSvgCoords(e);
    setPendingCoords(coords);
  }

  function confirmAddPin() {
    if (!pendingCoords || !newPinName.trim()) return;
    const newLoc: MapLocation = {
      id: `new-${Date.now()}`,
      name: newPinName.trim(),
      x: pendingCoords.x,
      y: pendingCoords.y,
    };
    setPins((prev) => [...prev, newLoc]);
    onPinSave?.(newLoc.id, pendingCoords.x, pendingCoords.y);
    setNewPinName("");
    setPendingCoords(null);
    setAddMode(false);
  }

  function handlePinMouseDown(e: React.MouseEvent, id: string) {
    if (addMode) return;
    e.stopPropagation();
    setDraggingId(id);
  }

  function handlePinMouseUp(e: React.MouseEvent, id: string) {
    if (addMode) return;
    if (draggingId === id) {
      setDraggingId(null);
      return;
    }
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (!draggingId) return;
    const coords = getSvgCoords(e);
    setPins((prev) =>
      prev.map((p) => (p.id === draggingId ? { ...p, x: coords.x, y: coords.y } : p))
    );
  }

  function handleMouseUp() {
    if (draggingId) {
      const pin = pins.find((p) => p.id === draggingId);
      if (pin && pin.x != null && pin.y != null) {
        onPinSave?.(draggingId, pin.x, pin.y);
      }
      setDraggingId(null);
    }
  }

  return (
    <div className="relative space-y-3">
      <div className="flex items-center gap-3">
        <button
          onClick={() => {
            setAddMode(!addMode);
            setPendingCoords(null);
            setNewPinName("");
          }}
          className={`px-3 py-1.5 text-xs rounded-md border ${
            addMode ? "bg-brand text-white border-brand" : "border-fg/20 hover:bg-fg/5"
          }`}
        >
          {addMode ? "Cancel Add Mode" : "Add Pin Mode"}
        </button>
        {addMode && <span className="text-xs text-fg/50">Click on the map to place a new pin</span>}
      </div>

      {pendingCoords && (
        <div className="flex items-center gap-2 p-2 border border-fg/10 rounded-md bg-bg">
          <input
            value={newPinName}
            onChange={(e) => setNewPinName(e.target.value)}
            placeholder="Location name..."
            className="flex-1 rounded-md border border-fg/20 px-2 py-1 text-xs bg-bg"
            onKeyDown={(e) => e.key === "Enter" && confirmAddPin()}
          />
          <button
            onClick={confirmAddPin}
            disabled={!newPinName.trim()}
            className="px-3 py-1 text-xs bg-brand text-white rounded-md disabled:opacity-50"
          >
            Add Pin
          </button>
        </div>
      )}

      <svg
        ref={svgRef}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="w-full border border-fg/10 rounded-lg bg-fg/[0.02]"
        style={{ minHeight: 400 }}
        onClick={handleMapClick}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Background image if provided */}
        {mapUrl && <image href={mapUrl} x={0} y={0} width={svgWidth} height={svgHeight} />}

        {/* Grid lines */}
        {!mapUrl && (
          <>
            {Array.from({ length: 8 }, (_, i) => (
              <line
                key={`h${i}`}
                x1={0}
                y1={(svgHeight / 8) * (i + 1)}
                x2={svgWidth}
                y2={(svgHeight / 8) * (i + 1)}
                stroke="var(--fg)"
                strokeOpacity={0.05}
                strokeWidth={1}
              />
            ))}
            {Array.from({ length: 8 }, (_, i) => (
              <line
                key={`v${i}`}
                x1={(svgWidth / 8) * (i + 1)}
                y1={0}
                x2={(svgWidth / 8) * (i + 1)}
                y2={svgHeight}
                stroke="var(--fg)"
                strokeOpacity={0.05}
                strokeWidth={1}
              />
            ))}
          </>
        )}

        {/* Pins */}
        {pins.map((loc) => {
          const px = loc.x ?? svgWidth / 2;
          const py = loc.y ?? svgHeight / 2;
          return (
            <g
              key={loc.id}
              className="cursor-pointer"
              onMouseDown={(e) => handlePinMouseDown(e, loc.id)}
              onMouseUp={(e) => handlePinMouseUp(e, loc.id)}
              onClick={(e) => {
                if (draggingId === loc.id) {
                  e.stopPropagation();
                  return;
                }
                onPinClick?.(loc.id);
              }}
              onMouseEnter={() => setTooltip({ x: px, y: py, location: loc })}
              onMouseLeave={() => setTooltip(null)}
            >
              {/* Pin shape */}
              <circle cx={px} cy={py - 4} r={6} fill="var(--brand)" stroke="#fff" strokeWidth={2} />
              <polygon
                points={`${px - 4},${py} ${px + 4},${py} ${px},${py + 10}`}
                fill="var(--brand)"
              />
              <text x={px} y={py + 18} textAnchor="middle" className="text-[8px] fill-fg/60">
                {loc.name.length > 10 ? loc.name.slice(0, 10) + ".." : loc.name}
              </text>
            </g>
          );
        })}

        {/* Tooltip */}
        {tooltip && (
          <g>
            <rect
              x={tooltip.x - 60}
              y={tooltip.y - 40}
              width={120}
              height={30}
              rx={4}
              fill="var(--fg)"
              opacity={0.9}
            />
            <text
              x={tooltip.x}
              y={tooltip.y - 22}
              textAnchor="middle"
              className="text-[9px] font-medium fill-white"
            >
              {tooltip.location.name}
            </text>
            {tooltip.location.description && (
              <text
                x={tooltip.x}
                y={tooltip.y - 12}
                textAnchor="middle"
                className="text-[8px] fill-fg/70"
              >
                {tooltip.location.description.slice(0, 25)}
              </text>
            )}
          </g>
        )}
      </svg>
    </div>
  );
}
