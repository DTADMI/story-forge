"use client";

import * as Y from "yjs";
import { createBrowserClient } from "./supabase/client";
import { isEnabledSync } from "./flags";

const docs = new Map<
  string,
  {
    doc: Y.Doc;
    channel: ReturnType<ReturnType<typeof createBrowserClient>["channel"]>;
    connected: boolean;
  }
>();

export function getYjsProvider(
  projectId: string,
  _userId: string,
  onConnected?: (doc: Y.Doc) => void
): {
  doc: Y.Doc;
  connected: boolean;
  disconnect: () => void;
} {
  const key = `project:${projectId}`;

  if (!isEnabledSync("real_time_collaboration")) {
    return {
      doc: new Y.Doc(),
      connected: false,
      disconnect: () => {},
    };
  }

  const existing = docs.get(key);
  if (existing) {
    return {
      doc: existing.doc,
      connected: existing.connected,
      disconnect: () => {
        existing.channel.unsubscribe();
        existing.doc.destroy();
        docs.delete(key);
      },
    };
  }

  const doc = new Y.Doc();
  const supabase = createBrowserClient();
  const channel = supabase.channel(`yjs:${projectId}`, {
    config: { broadcast: { self: false } },
  });

  let connected = false;

  channel
    .on("broadcast", { event: "yjs-update" }, (payload: { payload: number[] }) => {
      try {
        const update = new Uint8Array(payload.payload);
        Y.applyUpdate(doc, update);
      } catch {
        // Ignore malformed updates
      }
    })
    .subscribe((status) => {
      if (status === "SUBSCRIBED") {
        connected = true;
        const existingEntry = docs.get(key);
        if (existingEntry) {
          existingEntry.connected = true;
        }
        onConnected?.(doc);
      }
    });

  // Broadcast local updates
  doc.on("update", (update: Uint8Array) => {
    channel.send({
      type: "broadcast",
      event: "yjs-update",
      payload: Array.from(update),
    });
  });

  docs.set(key, { doc, channel, connected: false });

  return {
    doc,
    connected,
    disconnect: () => {
      channel.unsubscribe();
      doc.destroy();
      docs.delete(key);
    },
  };
}
