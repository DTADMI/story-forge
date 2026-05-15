"use client";

import { useRouter } from "next/navigation";

interface Relationship {
  id: string;
  targetId: string;
  targetName: string;
  type: string;
  description?: string;
}

interface FamilyTreeProps {
  characterId: string;
  characterName: string;
  relationships: Relationship[];
}

const NODE_WIDTH = 100;
const NODE_HEIGHT = 36;
const COLORS: Record<string, string> = {
  parent: "#e11d48",
  child: "#7c3aed",
  sibling: "#2563eb",
  spouse: "#ec4899",
  lover: "#f43f5e",
  rival: "#f97316",
  ally: "#22c55e",
  mentor: "#06b6d4",
  student: "#8b5cf6",
  friend: "#3b82f6",
  enemy: "#ef4444",
};

function groupBy<T>(arr: T[], key: (item: T) => string): Record<string, T[]> {
  const groups: Record<string, T[]> = {};
  for (const item of arr) {
    const k = key(item);
    if (!groups[k]) groups[k] = [];
    groups[k].push(item);
  }
  return groups;
}

export function FamilyTree({ characterId, characterName, relationships }: FamilyTreeProps) {
  const router = useRouter();

  if (relationships.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-fg/40 text-sm">No relationships defined yet.</p>
      </div>
    );
  }

  const grouped = groupBy(relationships, (r) => r.type);
  const parents = grouped.parent || [];
  const children = grouped.child || [];
  const siblings = grouped.sibling || [];
  const spouse = grouped.spouse || [];
  const others = relationships.filter(
    (r) => !["parent", "child", "sibling", "spouse"].includes(r.type)
  );

  const maxCol = Math.max(parents.length, children.length, siblings.length + 2, 1);
  const svgWidth = Math.max(600, maxCol * (NODE_WIDTH + 60) + 40);
  const svgHeight = 480;

  const centerX = svgWidth / 2;
  const layerY = { parents: 40, spouse: 130, siblings: 175, center: 220, children: 310, others: 400 };

  function renderNode(x: number, y: number, id: string, name: string, color: string) {
    const w = NODE_WIDTH;
    const h = NODE_HEIGHT;
    const isSelf = id === characterId;
    return (
      <g
        key={`${id}-${y}`}
        className="cursor-pointer"
        onClick={() => !isSelf && router.push(`/world/characters/${id}`)}
      >
        <rect
          x={x - w / 2}
          y={y}
          width={w}
          height={h}
          rx={6}
          fill={isSelf ? "var(--brand)" : color}
          opacity={isSelf ? 1 : 0.15}
          stroke={isSelf ? "var(--brand)" : color}
          strokeWidth={isSelf ? 2 : 1.5}
        />
        <text
          x={x}
          y={y + h / 2 + 1}
          textAnchor="middle"
          dominantBaseline="central"
          className="text-xs font-medium"
          fill={isSelf ? "#fff" : color}
        >
          {name.length > 14 ? name.slice(0, 12) + ".." : name}
        </text>
      </g>
    );
  }

  function renderLine(x1: number, y1: number, x2: number, y2: number, color?: string) {
    return (
      <line
        key={`line-${x1}-${y1}-${x2}-${y2}`}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={color || "var(--fg)"}
        strokeOpacity={0.2}
        strokeWidth={1.5}
      />
    );
  }

  const lines: React.ReactNode[] = [];
  const nodes: React.ReactNode[] = [];

  // Parents row
  parents.forEach((r, i) => {
    const x = centerX + (i - (parents.length - 1) / 2) * (NODE_WIDTH + 40);
    lines.push(renderLine(centerX, layerY.parents + NODE_HEIGHT, centerX, layerY.center));
    nodes.push(renderNode(x, layerY.parents, r.targetId, r.targetName, COLORS.parent));
  });

  // Siblings row
  siblings.forEach((r, i) => {
    const x = centerX + (i + 1) * (NODE_WIDTH + 40);
    lines.push(renderLine(x, layerY.siblings, centerX, layerY.center));
    nodes.push(renderNode(x, layerY.siblings, r.targetId, r.targetName, COLORS.sibling));
  });

  // Spouse next to center
  spouse.forEach((r, i) => {
    const x = centerX + NODE_WIDTH + 20;
    nodes.push(renderNode(x, layerY.spouse, r.targetId, r.targetName, COLORS.spouse));
    lines.push(renderLine(centerX, layerY.center + NODE_HEIGHT / 2, x, layerY.spouse + NODE_HEIGHT / 2, COLORS.spouse));
    const midX = (centerX + x) / 2;
    lines.push(
      <text key={`spouse-label-${i}`} x={midX} y={layerY.spouse - 6} textAnchor="middle" className="text-[9px] fill-fg/40">
        spouse
      </text>
    );
  });

  // Center node
  nodes.push(renderNode(centerX, layerY.center, characterId, characterName, ""));

  // Children row
  children.forEach((r, i) => {
    const x = centerX + (i - (children.length - 1) / 2) * (NODE_WIDTH + 40);
    lines.push(renderLine(centerX, layerY.center + NODE_HEIGHT, x, layerY.children));
    nodes.push(renderNode(x, layerY.children, r.targetId, r.targetName, COLORS.child));
  });

  // Others row
  others.forEach((r, i) => {
    const x = centerX + (i - (others.length - 1) / 2) * (NODE_WIDTH + 40);
    const color = COLORS[r.type] || "#9ca3af";
    lines.push(renderLine(centerX, layerY.center + NODE_HEIGHT, x, layerY.others, color));
    nodes.push(renderNode(x, layerY.others, r.targetId, r.targetName, color));
  });

  return (
    <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full max-w-[700px] mx-auto">
      {lines}
      {nodes}
    </svg>
  );
}
