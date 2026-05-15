"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface CharacterNode {
  id: string;
  name: string;
  imageUrl?: string | null;
  initials: string;
}

interface RelatedCharacter extends CharacterNode {
  count: number;
}

interface RelationshipGraphProps {
  centralCharacter: CharacterNode;
  relatedCharacters: RelatedCharacter[];
}

export function RelationshipGraph({
  centralCharacter,
  relatedCharacters,
}: RelationshipGraphProps) {
  const router = useRouter();
  const [hovered, setHovered] = useState<RelatedCharacter | null>(null);

  if (relatedCharacters.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-fg/40 text-sm">
          No relationship data yet. Add {centralCharacter.name} to timeline events
          shared with other characters.
        </p>
      </div>
    );
  }

  const svgSize = 500;
  const centerX = svgSize / 2;
  const centerY = svgSize / 2;
  const centerRadius = 35;
  const nodeRadius = 28;
  const orbitRadius = 180;

  const nodes = relatedCharacters.map((rc, i) => {
    const angle = (2 * Math.PI * i) / relatedCharacters.length - Math.PI / 2;
    const x = centerX + orbitRadius * Math.cos(angle);
    const y = centerY + orbitRadius * Math.sin(angle);
    return { ...rc, x, y };
  });

  const maxCount = Math.max(...relatedCharacters.map((rc) => rc.count), 1);

  function handleNodeClick(id: string) {
    router.push(`/world/characters/${id}`);
  }

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${svgSize} ${svgSize}`}
        className="w-full max-w-[500px] mx-auto"
      >
        {/* Edges */}
        {nodes.map((node) => {
          const thickness = Math.max(1.5, (node.count / maxCount) * 6);
          return (
            <line
              key={`edge-${node.id}`}
              x1={centerX}
              y1={centerY}
              x2={node.x}
              y2={node.y}
              stroke="var(--brand)"
              strokeOpacity={0.3 + (node.count / maxCount) * 0.5}
              strokeWidth={thickness}
            />
          );
        })}

        {/* Relationship strength labels */}
        {nodes.map((node, i) => {
          const midX = centerX + (node.x - centerX) * 0.65;
          const midY = centerY + (node.y - centerY) * 0.65;
          return (
            <text
              key={`count-${node.id}`}
              x={midX}
              y={midY}
              textAnchor="middle"
              className="text-[10px] fill-fg/30"
              dominantBaseline="middle"
            >
              {node.count}
            </text>
          );
        })}

        {/* Related nodes */}
        {nodes.map((node) => (
          <g
            key={node.id}
            className="cursor-pointer"
            onClick={() => handleNodeClick(node.id)}
            onMouseEnter={() => setHovered(node)}
            onMouseLeave={() => setHovered(null)}
          >
            <circle
              cx={node.x}
              cy={node.y}
              r={nodeRadius}
              className="fill-bg stroke-brand/40"
              strokeWidth={2}
            />
            <text
              x={node.x}
              y={node.y}
              textAnchor="middle"
              dominantBaseline="central"
              className="text-xs font-bold fill-brand"
            >
              {node.initials}
            </text>
          </g>
        ))}

        {/* Center node */}
        <circle
          cx={centerX}
          cy={centerY}
          r={centerRadius}
          className="fill-brand"
        />
        <text
          x={centerX}
          y={centerY}
          textAnchor="middle"
          dominantBaseline="central"
          className="text-sm font-bold fill-white"
        >
          {centralCharacter.initials}
        </text>
      </svg>

      {/* Tooltip */}
      {hovered && (
        <div className="absolute top-2 right-2 bg-fg text-bg rounded-lg px-3 py-2 text-xs shadow-lg pointer-events-none">
          <p className="font-semibold">{hovered.name}</p>
          <p className="opacity-70">
            {hovered.count} shared event{hovered.count !== 1 ? "s" : ""}
          </p>
        </div>
      )}
    </div>
  );
}
