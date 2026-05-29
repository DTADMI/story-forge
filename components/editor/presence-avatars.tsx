"use client";

import { usePresence } from "@/lib/realtime";
import { isEnabledSync } from "@/lib/flags";
import { useI18n } from "@/lib/i18n";

interface PresenceAvatarsProps {
  projectId: string;
  currentUser: { id: string; name: string };
}

const AVATAR_COLORS = [
  "bg-blue-500",
  "bg-green-500",
  "bg-purple-500",
  "bg-orange-500",
  "bg-pink-500",
  "bg-teal-500",
  "bg-indigo-500",
  "bg-rose-500",
];

export function PresenceAvatars({ projectId, currentUser }: PresenceAvatarsProps) {
  const { activeUsers } = usePresence(`project:${projectId}`, currentUser);
  const { t } = useI18n();

  if (!isEnabledSync("real_time_collaboration")) return null;

  const displayUsers = activeUsers.filter((u) => u.id !== currentUser.id);

  if (displayUsers.length === 0) return null;

  return (
    <div className="flex items-center gap-1">
      <span className="text-xs text-fg/40 mr-1">{t("social.viewers")}:</span>
      {displayUsers.map((user, i) => (
        <span
          key={user.id}
          className="relative inline-flex shrink-0"
          title={`${user.name} — viewing now`}
        >
          <span
            className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-medium text-white ${
              AVATAR_COLORS[i % AVATAR_COLORS.length]
            }`}
          >
            {(user.name || "?")[0].toUpperCase()}
          </span>
          <span className="absolute -bottom-[1px] -right-[1px] h-2 w-2 rounded-full bg-green-400 border border-bg" />
        </span>
      ))}
    </div>
  );
}
