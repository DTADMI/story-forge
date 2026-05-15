"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Input } from "@/components/ui/input";

interface GalaxyNode {
  id: string;
  type: "character" | "event" | "location" | "organization";
  label: string;
  group: string;
}

interface GalaxyEdge {
  source: string;
  target: string;
  type: string;
  strength: number;
  label?: string;
}

interface GalaxyData {
  nodes: GalaxyNode[];
  edges: GalaxyEdge[];
}

interface SimNode extends GalaxyNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  fx: number | null;
  fy: number | null;
}

const ENTITY_COLORS: Record<string, string> = {
  character: "#3b82f6",
  event: "#f97316",
  location: "#22c55e",
  organization: "#8b5cf6",
};

const INITIALS_REGEX = /[A-Z]/g;

function getInitials(label: string): string {
  const parts = label.split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  const caps = label.match(INITIALS_REGEX);
  if (caps && caps.length >= 2) return caps.slice(0, 2).join("");
  return label.slice(0, 2).toUpperCase();
}

function getEntityRoute(type: string, id: string): string {
  switch (type) {
    case "character":
      return `/world/characters/${id}`;
    case "event":
      return `/world/timeline/${id}`;
    case "location":
      return `/world/locations/${id}`;
    case "organization":
      return `/world/organizations/${id}`;
    default:
      return `/world`;
  }
}

interface GalaxyGraphProps {
  data: GalaxyData;
}

export function GalaxyGraph({ data }: GalaxyGraphProps) {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);

  const [filter, setFilter] = useState<string>("All");
  const [search, setSearch] = useState("");
  const [hoveredNode, setHoveredNode] = useState<SimNode | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const offsetRef = useRef({ x: 0, y: 0 });
  const scaleRef = useRef(1);
  const isPanningRef = useRef(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  const dragNodeRef = useRef<SimNode | null>(null);
  const mouseDownPosRef = useRef({ x: 0, y: 0 });
  const dprRef = useRef(1);
  const nodesRef = useRef<SimNode[]>([]);
  const nodeMapRef = useRef<Map<string, SimNode>>(new Map());

  const filteredNodes = useMemo(() => {
    return data.nodes.filter((n) => {
      if (filter !== "All" && n.type !== filter.toLowerCase()) return false;
      if (search && !n.label.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [data.nodes, filter, search]);

  const filteredNodeIds = useMemo(() => new Set(filteredNodes.map((n) => n.id)), [filteredNodes]);

  const filteredEdges = useMemo(() => {
    return data.edges.filter((e) => filteredNodeIds.has(e.source) && filteredNodeIds.has(e.target));
  }, [data.edges, filteredNodeIds]);

  // Initialize node positions when filtered nodes change
  useEffect(() => {
    const w = containerRef.current?.clientWidth ?? 800;
    const h = containerRef.current?.clientHeight ?? 600;
    nodesRef.current = filteredNodes.map((n) => ({
      ...n,
      x: w / 2 + (Math.random() - 0.5) * 200,
      y: h / 2 + (Math.random() - 0.5) * 200,
      vx: 0,
      vy: 0,
      fx: null,
      fy: null,
    }));
  }, [filteredNodes]);

  // Render function — reads from refs, paints to canvas
  const renderFn = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = container.clientWidth;
    const h = container.clientHeight;
    const dpr = dprRef.current;
    const nodes = nodesRef.current;
    const ox = offsetRef.current.x;
    const oy = offsetRef.current.y;
    const s = scaleRef.current;
    const edges = filteredEdges;
    const nodeMap = nodeMapRef.current;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const isSearchActive = search.length > 0;
    const searchMatchIds = isSearchActive
      ? new Set(nodes.filter((n) => n.label.toLowerCase().includes(search.toLowerCase())).map((n) => n.id))
      : null;

    for (const e of edges) {
      const source = nodeMap.get(e.source);
      const target = nodeMap.get(e.target);
      if (!source || !target) continue;

      let alpha = 0.3;
      if (isSearchActive && searchMatchIds) {
        const matchCount = (searchMatchIds.has(e.source) ? 1 : 0) + (searchMatchIds.has(e.target) ? 1 : 0);
        if (matchCount === 0) alpha = 0.05;
        else if (matchCount === 2) alpha = 0.7;
      }

      const sx = (source.x + ox) * s;
      const sy = (source.y + oy) * s;
      const tx = (target.x + ox) * s;
      const ty = (target.y + oy) * s;
      const midX = (sx + tx) / 2;
      const midY = (sy + ty) / 2 - 8;
      const cpX = midX;
      const cpY = midY;

      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.quadraticCurveTo(cpX, cpY, tx, ty);
      ctx.strokeStyle = `rgba(148,163,184,${alpha})`;
      ctx.lineWidth = Math.max(0.5, e.strength * 2 * s);
      ctx.stroke();
    }

    for (const n of nodes) {
      const nx = (n.x + ox) * s;
      const ny = (n.y + oy) * s;
      const r = 18 * s;

      let nodeAlpha = 1;
      if (isSearchActive && searchMatchIds) {
        nodeAlpha = searchMatchIds.has(n.id) ? 1 : 0.15;
      }

      const color = ENTITY_COLORS[n.type] || "#94a3b8";
      const alphaHex = Math.round(nodeAlpha * 255).toString(16).padStart(2, "0");

      ctx.beginPath();
      ctx.arc(nx, ny, r, 0, Math.PI * 2);
      ctx.fillStyle = color + alphaHex;
      ctx.fill();
      ctx.strokeStyle = `rgba(255,255,255,${0.3 * nodeAlpha})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = `rgba(255,255,255,${nodeAlpha})`;
      ctx.font = `bold ${10 * s}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(getInitials(n.label), nx, ny);
    }
  }, [filteredEdges, search]);

  const renderFnRef = useRef(renderFn);

  useEffect(() => {
    renderFnRef.current = renderFn;
  });

  // Animation loop
  useEffect(() => {
    function tick() {
      const nodes = nodesRef.current;
      const container = containerRef.current;
      if (!container) { animationRef.current = requestAnimationFrame(tick); return; }

      const w = container.clientWidth;
      const h = container.clientHeight;
      const alpha = 0.3;
      const repulsionStrength = 3000;
      const attractionStrength = 0.005;
      const gravityStrength = 0.03;
      const minDist = 50;

      const nodeMap = new Map<string, SimNode>();
      for (const n of nodes) nodeMap.set(n.id, n);
      nodeMapRef.current = nodeMap;

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        if (n.fx !== null) { n.x = n.fx; n.y = n.fy; n.vx = 0; n.vy = 0; continue; }

        for (let j = i + 1; j < nodes.length; j++) {
          const m = nodes[j];
          const dx = n.x - m.x;
          const dy = n.y - m.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          if (dist < minDist) {
            const force = repulsionStrength / (dist * dist);
            const fx = (dx / dist) * force * alpha;
            const fy = (dy / dist) * force * alpha;
            n.vx += fx;
            n.vy += fy;
            m.vx -= fx;
            m.vy -= fy;
          }
        }

        n.vx += (w / 2 - n.x) * gravityStrength * alpha;
        n.vy += (h / 2 - n.y) * gravityStrength * alpha;
      }

      for (const e of filteredEdges) {
        const s = nodeMap.get(e.source);
        const t = nodeMap.get(e.target);
        if (!s || !t) continue;
        if (s.fx !== null && t.fx !== null) continue;
        const dx = t.x - s.x;
        const dy = t.y - s.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = dist * attractionStrength * e.strength;
        const fx = (dx / dist) * force * alpha;
        const fy = (dy / dist) * force * alpha;
        if (s.fx === null) { s.vx += fx; s.vy += fy; }
        if (t.fx === null) { t.vx -= fx; t.vy -= fy; }
      }

      for (const n of nodes) {
        if (n.fx !== null) continue;
        n.vx *= 0.9;
        n.vy *= 0.9;
        n.x += n.vx;
        n.y += n.vy;
        n.x = Math.max(20, Math.min(w - 20, n.x));
        n.y = Math.max(20, Math.min(h - 20, n.y));
      }

      renderFnRef.current();
      animationRef.current = requestAnimationFrame(tick);
    }

    animationRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationRef.current);
  }, [filteredEdges]);

  const screenToWorld = useCallback((clientX: number, clientY: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    const sx = (clientX - rect.left) / scaleRef.current - offsetRef.current.x;
    const sy = (clientY - rect.top) / scaleRef.current - offsetRef.current.y;
    return { x: sx, y: sy };
  }, []);

  const findNodeAt = useCallback((wx: number, wy: number): SimNode | null => {
    const r = 18;
    const nodes = nodesRef.current;
    for (const n of nodes) {
      const dx = n.x - wx;
      const dy = n.y - wy;
      if (Math.sqrt(dx * dx + dy * dy) < r + 4) return n;
    }
    return null;
  }, []);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      const world = screenToWorld(e.clientX, e.clientY);
      mouseDownPosRef.current = { x: e.clientX, y: e.clientY };
      const node = findNodeAt(world.x, world.y);
      if (node) {
        dragNodeRef.current = node;
        node.fx = node.x;
        node.fy = node.y;
      } else {
        isPanningRef.current = true;
        panStartRef.current = { x: e.clientX - offsetRef.current.x, y: e.clientY - offsetRef.current.y };
      }
    },
    [screenToWorld, findNodeAt]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (dragNodeRef.current) {
        const world = screenToWorld(e.clientX, e.clientY);
        dragNodeRef.current.fx = world.x;
        dragNodeRef.current.fy = world.y;
        return;
      }
      if (isPanningRef.current) {
        offsetRef.current.x = e.clientX - panStartRef.current.x;
        offsetRef.current.y = e.clientY - panStartRef.current.y;
        return;
      }
      const world = screenToWorld(e.clientX, e.clientY);
      const node = findNodeAt(world.x, world.y);
      setHoveredNode(node);
      if (node) {
        setTooltipPos({ x: e.clientX + 12, y: e.clientY + 12 });
      }
    },
    [screenToWorld, findNodeAt]
  );

  const handleMouseUp = useCallback(
    (e: React.MouseEvent) => {
      if (dragNodeRef.current) {
        const dx = Math.abs(e.clientX - mouseDownPosRef.current.x);
        const dy = Math.abs(e.clientY - mouseDownPosRef.current.y);
        if (dx < 3 && dy < 3) {
          const route = getEntityRoute(dragNodeRef.current.type, dragNodeRef.current.id);
          router.push(route);
        }
        dragNodeRef.current.fx = null;
        dragNodeRef.current.fy = null;
        dragNodeRef.current = null;
      }
      isPanningRef.current = false;
    },
    [router]
  );

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(0.2, Math.min(3, scaleRef.current * delta));
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      offsetRef.current.x = mx - (mx - offsetRef.current.x) * (newScale / scaleRef.current);
      offsetRef.current.y = my - (my - offsetRef.current.y) * (newScale / scaleRef.current);
    }
    scaleRef.current = newScale;
  }, []);

  // Build edge relationships per node for tooltip
  const edges = useMemo(() => {
    const m = new Map<string, Array<GalaxyEdge & { otherLabel: string }>>();
    for (const n of filteredNodes) {
      const rels = filteredEdges
        .filter((e) => e.source === n.id || e.target === n.id)
        .map((e) => {
          const otherId = e.source === n.id ? e.target : e.source;
          const otherNode = data.nodes.find((x) => x.id === otherId);
          return { ...e, otherLabel: otherNode?.label ?? otherId };
        });
      m.set(n.id, rels);
    }
    return m;
  }, [filteredNodes, filteredEdges, data.nodes]);

  if (data.nodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-fg/5">
          <svg className="h-6 w-6 text-fg/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <circle cx="12" cy="12" r="3" />
            <circle cx="5" cy="18" r="3" />
            <circle cx="19" cy="18" r="3" />
            <line x1="8.5" y1="15.5" x2="10" y2="14" />
            <line x1="15.5" y1="15.5" x2="14" y2="14" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold">No data to visualize</h3>
        <p className="text-sm text-fg/40 mt-1 max-w-sm">
          Add characters, events, and locations to your world to see them connected in the galaxy view.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {["All", "Characters", "Events", "Locations", "Organizations"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 text-xs rounded-full border transition-colors ${
              filter === f
                ? "bg-brand text-white border-brand"
                : "border-fg/15 text-fg/60 hover:border-fg/30"
            }`}
          >
            {f}
          </button>
        ))}
        <div className="w-40">
          <Input
            placeholder="Search nodes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-7 text-xs"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-3 text-xs text-fg/50">
        <span className="inline-flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Characters
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500" /> Events
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-green-500" /> Locations
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Organizations
        </span>
      </div>

      <div
        ref={containerRef}
        className="relative w-full aspect-[4/3] min-h-[400px] bg-fg/[0.02] border border-fg/10 rounded-xl overflow-hidden cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => { isPanningRef.current = false; dragNodeRef.current = null; setHoveredNode(null); }}
        onWheel={handleWheel}
      >
        <canvas ref={canvasRef} className="absolute inset-0" />
      </div>

      {hoveredNode && (
        <div
          className="fixed z-50 bg-bg border border-fg/15 rounded-lg px-3 py-2 text-xs shadow-lg pointer-events-none max-w-[220px]"
          style={{ left: tooltipPos.x, top: tooltipPos.y }}
        >
          <p className="font-semibold text-sm">{hoveredNode.label}</p>
          <p className="text-fg/50 capitalize">{hoveredNode.type}</p>
          {edges.get(hoveredNode.id) && edges.get(hoveredNode.id)!.length > 0 && (
            <div className="mt-1.5 space-y-0.5">
              <p className="text-fg/40 font-medium">Relationships:</p>
              {edges.get(hoveredNode.id)!.slice(0, 5).map((rel, i) => (
                <p key={i} className="text-fg/60 leading-tight">
                  {rel.label || rel.type} &rarr; {rel.otherLabel}
                </p>
              ))}
              {edges.get(hoveredNode.id)!.length > 5 && (
                <p className="text-fg/30">+{edges.get(hoveredNode.id)!.length - 5} more</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
