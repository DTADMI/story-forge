"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as Y from "yjs";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import type { Extension } from "@tiptap/core";
import { getYjsProvider } from "./yjs-provider";
import { isEnabledSync } from "./flags";

const COLORS = [
  "#958DF1",
  "#F98181",
  "#FBBC88",
  "#FAF594",
  "#70CFF8",
  "#94FADB",
  "#B9F18D",
  "#C3E2C2",
  "#EAECCC",
  "#AFC8AD",
  "#EEC759",
  "#9BB8CD",
  "#E7CBCB",
  "#C6C6C6",
  "#B0A695",
  "#EBE3D5",
];

function getRandomColor(): string {
  return COLORS[Math.floor(Math.random() * COLORS.length)] || "#958DF1";
}

export function useYjsCollaboration(projectId: string, currentUser: { id: string; name: string }) {
  const [doc, setDoc] = useState<Y.Doc | undefined>(undefined);
  const [synced, setSynced] = useState(false);
  const disconnectRef = useRef<(() => void) | null>(null);

  const handleConnected = useCallback((ydoc: Y.Doc) => {
    setDoc(ydoc);
    setSynced(true);
  }, []);

  useEffect(() => {
    if (!isEnabledSync("real_time_collaboration")) return;

    let timedOut = false;

    const timeout = setTimeout(() => {
      if (!timedOut) {
        timedOut = true;
        const fallbackProvider = getYjsProvider(projectId, currentUser.id);
        handleConnected(fallbackProvider.doc);
        disconnectRef.current = fallbackProvider.disconnect;
      }
    }, 5000);

    const provider = getYjsProvider(projectId, currentUser.id, (ydoc) => {
      if (!timedOut) {
        clearTimeout(timeout);
        timedOut = true;
        handleConnected(ydoc);
      }
    });

    disconnectRef.current = provider.disconnect;

    return () => {
      clearTimeout(timeout);
      disconnectRef.current?.();
    };
  }, [projectId, currentUser.id, currentUser.name, handleConnected]);

  const extensions: Extension[] = useMemo(() => {
    if (!isEnabledSync("real_time_collaboration") || !doc) return [];

    return [
      Collaboration.configure({ document: doc }),
      CollaborationCursor.configure({
        // @tiptap/extension-collaboration-cursor expects a Yjs-compatible provider
        // doc serves as a minimal provider that exposes awareness
        provider: doc as unknown as Record<string, unknown>,
        user: {
          name: currentUser.name || "Unknown",
          color: getRandomColor(),
        },
        render: (user: { name: string; avatar?: string; color: string }) => {
          const cursor = document.createElement("span");
          cursor.classList.add("collaboration-cursor");
          cursor.style.borderLeft = `2px solid ${user.color}`;

          const label = document.createElement("div");
          label.classList.add("collaboration-cursor-label");
          label.style.backgroundColor = user.color;
          label.textContent = user.name;
          cursor.appendChild(label);

          return cursor;
        },
      }),
    ];
  }, [doc, currentUser.name]);

  return { extensions, synced, doc };
}
