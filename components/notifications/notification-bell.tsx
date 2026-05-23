"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { fetchVoid } from "@/lib/client-api";
import { useApiQuery } from "@/lib/query-hooks";
import { useOptimisticMutation } from "@/lib/mutation";

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string | null;
  read: boolean;
  createdAt: string;
}

const notificationsKey = ["notifications", "bell"];

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const notificationsQuery = useApiQuery<Notification[]>(notificationsKey, "/api/notifications", {
    refetchInterval: 60_000,
  });
  const notifications = notificationsQuery.data ?? [];
  const unreadCount = notifications.length;
  const markAsReadMutation = useOptimisticMutation<void, { id: string }, Notification[]>({
    mutationFn: ({ id }) => fetchVoid(`/api/notifications/${id}/read`, { method: "POST" }),
    queryKey: notificationsKey,
    updater: (current, { id }) => (current ?? []).filter((notification) => notification.id !== id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationsKey });
    },
  });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen((open) => !open)}
        className="relative inline-flex items-center justify-center rounded-md p-1 transition-colors hover:bg-fg/5"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] leading-none font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 z-50 mt-2 w-72 rounded-lg border border-fg/10 bg-bg shadow-xl">
          <div className="flex items-center justify-between border-b border-fg/10 px-4 py-3">
            <span className="text-sm font-semibold">Notifications</span>
            {unreadCount > 0 && (
              <Link
                href="/notifications"
                className="text-xs text-brand hover:underline"
                onClick={() => setIsOpen(false)}
              >
                View all
              </Link>
            )}
          </div>

          {notificationsQuery.isLoading ? (
            <p className="px-4 py-6 text-center text-sm text-fg/40">Loading notifications...</p>
          ) : notifications.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-fg/40">No new notifications</p>
          ) : (
            <div className="max-h-64 overflow-y-auto">
              {notifications.slice(0, 5).map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => {
                    markAsReadMutation.mutate({ id: notification.id });
                    setIsOpen(false);
                  }}
                  className="w-full border-b border-fg/5 px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-fg/5"
                >
                  <p className="text-sm font-medium">{notification.title}</p>
                  {notification.body && (
                    <p className="mt-0.5 line-clamp-1 text-xs text-fg/40">{notification.body}</p>
                  )}
                  <span className="mt-1 block text-xs capitalize text-fg/20">
                    {notification.type.replace(/_/g, " ")}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
