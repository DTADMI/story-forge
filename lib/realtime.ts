"use client";

import { useCallback, useEffect, useState } from "react";
import { createBrowserClient } from "./supabase/client";

export function useRealtimeChannel(channelName: string) {
  const supabase = createBrowserClient();
  const channel = supabase.channel(channelName);
  return { channel, supabase };
}

interface PresenceUser {
  id: string;
  name: string;
  online_at: string;
}

export function usePresence(channelName: string, user: { id: string; name: string }) {
  const { channel, supabase } = useRealtimeChannel(channelName);
  const [presenceState, setPresenceState] = useState<Record<string, PresenceUser[]>>({});

  useEffect(() => {
    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState<PresenceUser>();
        setPresenceState(state as Record<string, PresenceUser[]>);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            id: user.id,
            name: user.name,
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [channelName, user.id, user.name]);

  const updatePresence = useCallback(
    (data: Partial<PresenceUser>) => {
      void channel.track({
        id: user.id,
        name: user.name,
        online_at: new Date().toISOString(),
        ...data,
      });
    },
    [user.id, user.name, channel]
  );

  const activeUsers: PresenceUser[] = Object.values(presenceState).flat();

  return { presenceState, activeUsers, updatePresence };
}
