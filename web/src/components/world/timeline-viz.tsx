"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useCallback, useEffect } from "react";

interface TimelineCharacter {
  id: string;
  name: string;
}

interface TimelineLocation {
  id: string;
  name: string;
}

interface TimelineEvent {
  id: string;
  title: string;
  date: string | null;
  description: string | null;
  characters: TimelineCharacter[];
  locations: TimelineLocation[];
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");
}

const CHIP_COLORS = [
  "bg-blue-500",
  "bg-green-500",
  "bg-purple-500",
  "bg-orange-500",
  "bg-pink-500",
  "bg-teal-500",
  "bg-amber-500",
  "bg-indigo-500",
];

export function TimelineViz({ events }: { events: TimelineEvent[] }) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [offsetY, setOffsetY] = useState(0);
  const isDragging = useRef(false);
  const lastY = useRef(0);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      setScale((s) => Math.min(3, Math.max(0.3, s - e.deltaY * 0.001)));
    } else {
      setOffsetY((o) => o - e.deltaY);
    }
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    isDragging.current = true;
    lastY.current = e.clientY;
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const dy = e.clientY - lastY.current;
    lastY.current = e.clientY;
    setOffsetY((o) => o + dy);
  }, []);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  useEffect(() => {
    window.addEventListener("mouseup", handleMouseUp);
    return () => window.removeEventListener("mouseup", handleMouseUp);
  }, [handleMouseUp]);

  if (events.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-fg/40">No timeline events to display.</p>
      </div>
    );
  }

  const lineHeight = 160;
  const totalHeight = events.length * lineHeight + 100;

  return (
    <div
      ref={containerRef}
      className="overflow-hidden relative touch-none select-none"
      style={{ height: "calc(100vh - 200px)" }}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
    >
      <div
        className="relative"
        style={{
          transform: `scale(${scale}) translateY(${offsetY}px)`,
          transformOrigin: "top center",
          height: totalHeight,
        }}
      >
        {/* Central timeline line */}
        <div
          className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-brand/30 -translate-x-1/2"
          style={{ height: totalHeight }}
        />

        {events.map((event, i) => {
          const y = 60 + i * lineHeight;
          const isLeft = i % 2 === 0;

          return (
            <div
              key={event.id}
              className="absolute left-0 right-0 flex items-start"
              style={{ top: y, height: lineHeight - 20 }}
            >
              {/* Left side card (even indices) */}
              {isLeft && (
                <EventCard
                  event={event}
                  side="left"
                  onClick={() => router.push(`/world/timeline/${event.id}`)}
                />
              )}

              {/* Center dot */}
              <div className="absolute left-1/2 -translate-x-1/2 z-10">
                <div className="h-4 w-4 rounded-full bg-brand border-2 border-bg shadow-md" />
                {event.date && (
                  <span
                    className={`absolute top-5 text-xs text-fg/50 whitespace-nowrap ${
                      isLeft ? "left-1" : "right-1"
                    }`}
                  >
                    {event.date}
                  </span>
                )}
              </div>

              {/* Right side card (odd indices) */}
              {!isLeft && (
                <EventCard
                  event={event}
                  side="right"
                  onClick={() => router.push(`/world/timeline/${event.id}`)}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Zoom controls */}
      <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-bg border border-fg/10 rounded-lg px-3 py-1.5 shadow-sm">
        <button
          onClick={() => setScale((s) => Math.max(0.3, s - 0.2))}
          className="text-fg/60 hover:text-fg text-sm font-bold px-1"
        >
          -
        </button>
        <span className="text-xs text-fg/40">{Math.round(scale * 100)}%</span>
        <button
          onClick={() => setScale((s) => Math.min(3, s + 0.2))}
          className="text-fg/60 hover:text-fg text-sm font-bold px-1"
        >
          +
        </button>
      </div>
    </div>
  );
}

function EventCard({
  event,
  side,
  onClick,
}: {
  event: TimelineEvent;
  side: "left" | "right";
  onClick: () => void;
}) {
  return (
    <div
      className={`w-[42%] cursor-pointer hover:shadow-md transition-shadow rounded-lg border border-fg/10 bg-bg p-3 ${
        side === "left" ? "mr-auto mr-[55%]" : "ml-auto ml-[55%]"
      }`}
      onClick={onClick}
    >
      <h3 className="font-bold text-sm mb-1">{event.title}</h3>
      {event.description && (
        <p className="text-xs text-fg/50 line-clamp-2 mb-2">{event.description}</p>
      )}

      {/* Character chips */}
      {event.characters.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-1">
          {event.characters.map((c, ci) => (
            <span
              key={c.id}
              className={`inline-flex items-center justify-center h-5 w-5 rounded-full text-[9px] font-bold text-white ${
                CHIP_COLORS[ci % CHIP_COLORS.length]
              }`}
              title={c.name}
            >
              {getInitials(c.name)}
            </span>
          ))}
        </div>
      )}

      {/* Location pins */}
      {event.locations.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {event.locations.map((l) => (
            <span
              key={l.id}
              className="inline-flex items-center gap-0.5 text-[10px] text-fg/40 bg-fg/5 px-1.5 py-0.5 rounded"
            >
              &#x1F4CD; {l.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
