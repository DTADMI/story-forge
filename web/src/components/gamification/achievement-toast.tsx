"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

interface AchievementToastProps {
  badgeName?: string;
  autoDismissMs?: number;
  onDismiss?: () => void;
}

export function AchievementToast({
  badgeName,
  autoDismissMs = 4000,
  onDismiss,
}: AchievementToastProps) {
  const [visible, setVisible] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    const newlyEarned = searchParams?.get("new_badge");
    if ((badgeName || newlyEarned) && !visible) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        onDismiss?.();
      }, autoDismissMs);
      return () => clearTimeout(timer);
    }
  }, [badgeName, searchParams, autoDismissMs, onDismiss, visible]);

  if (!visible) return null;

  const displayName = badgeName || searchParams?.get("new_badge") || "Badge";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className="pointer-events-auto bg-bg border border-brand/30 rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-4 animate-in zoom-in-95 fade-in duration-300">
        <div className="relative w-20 h-20">
          <svg
            className="absolute inset-0 w-full h-full animate-spin-slow"
            viewBox="0 0 80 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="40"
              cy="40"
              r="36"
              stroke="var(--brand)"
              strokeOpacity="0.15"
              strokeWidth="2"
            />
            {Array.from({ length: 8 }).map((_, i) => {
              const angle = (i * 45 * Math.PI) / 180;
              const x = 40 + 34 * Math.cos(angle);
              const y = 40 + 34 * Math.sin(angle);
              const size = i % 2 === 0 ? 4 : 6;
              const colors = [
                "#FFD700",
                "#FF4500",
                "#7B68EE",
                "#00CED1",
                "#FF69B4",
                "#32CD32",
                "#FFA500",
                "#87CEEB",
              ];
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r={size / 2}
                  fill={colors[i]}
                  className="animate-pulse"
                  style={{ animationDelay: `${i * 150}ms` }}
                />
              );
            })}
          </svg>
          <svg viewBox="0 0 80 80" fill="none" className="absolute inset-0 w-full h-full">
            <circle
              cx="40"
              cy="40"
              r="28"
              fill="var(--brand)"
              fillOpacity="0.15"
              stroke="var(--brand)"
              strokeWidth="2.5"
            />
            <circle cx="40" cy="40" r="22" fill="var(--brand)" fillOpacity="0.05" />
            <text
              x="40"
              y="36"
              textAnchor="middle"
              fill="var(--brand)"
              fontSize="18"
              fontWeight="bold"
            >
              ★
            </text>
          </svg>
        </div>
        <div className="text-center">
          <p className="text-lg font-extrabold text-brand">Achievement Unlocked!</p>
          <p className="text-sm text-fg/60 mt-1">{displayName}</p>
        </div>
      </div>
    </div>
  );
}
