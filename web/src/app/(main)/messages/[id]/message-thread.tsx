"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useToast } from "@/components/toast";

interface MessageData {
  id: string;
  content: string;
  createdAt: string;
  read: boolean;
  senderId: string;
  receiverId: string;
  sender: {
    id: string;
    name: string | null;
    username: string | null;
    image: string | null;
  };
  receiver: {
    id: string;
    name: string | null;
    username: string | null;
    image: string | null;
  };
}

export function MessageThread({
  initialMessages,
  currentUserId,
  partnerId,
  partnerName,
}: {
  initialMessages: MessageData[];
  currentUserId: string;
  partnerId: string;
  partnerName: string;
}) {
  const [messages, setMessages] = useState<MessageData[]>(initialMessages);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    fetch(`/api/messages/${partnerId}`, { method: "PATCH" }).catch(() => {});
  }, [partnerId]);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/messages?with=${partnerId}`);
        if (!res.ok) return;
        const remote: MessageData[] = await res.json();
        const remoteIds = new Set(remote.map((m) => m.id));
        const localIds = new Set(messages.map((m) => m.id));
        const hasNew = remote.some((m) => !localIds.has(m.id));
        if (hasNew) {
          setMessages(remote);
          fetch(`/api/messages/${partnerId}`, { method: "PATCH" }).catch(() => {});
        }
      } catch {}
    }, 10000);
    return () => clearInterval(interval);
  }, [partnerId, messages]);

  const handleSend = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || sending) return;

    setSending(true);
    setInput("");

    const tempId = "temp-" + Date.now();
    const optimistic: MessageData = {
      id: tempId,
      content: trimmed,
      createdAt: new Date().toISOString(),
      read: false,
      senderId: currentUserId,
      receiverId: partnerId,
      sender: {
        id: currentUserId,
        name: null,
        username: null,
        image: null,
      },
      receiver: {
        id: partnerId,
        name: null,
        username: null,
        image: null,
      },
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: partnerId, content: trimmed }),
      });

      if (!res.ok) {
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
        setInput(trimmed);
        toast({
          title: "Failed to send message",
          variant: "destructive",
        });
        return;
      }

      const saved: MessageData = await res.json();
      setMessages((prev) => prev.map((m) => (m.id === tempId ? saved : m)));
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setInput(trimmed);
      toast({
        title: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  }, [input, sending, currentUserId, partnerId, toast]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <div className="flex-1 overflow-y-auto space-y-3 py-2">
        {messages.length === 0 && (
          <p className="text-sm text-fg/40 text-center py-8">
            No messages yet. Say hello!
          </p>
        )}
        {messages.map((msg) => {
          const isMine = msg.senderId === currentUserId;
          return (
            <div
              key={msg.id}
              className={`flex ${isMine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                  isMine
                    ? "bg-brand text-white rounded-br-md"
                    : "bg-fg/10 text-fg rounded-bl-md"
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                <span className={`text-[10px] mt-1 block ${isMine ? "text-white/60" : "text-fg/40"}`}>
                  {formatTime(msg.createdAt)}
                  {isMine && (msg.read ? " ✓✓" : " ✓")}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="shrink-0 flex gap-2 pt-3 border-t border-fg/10">
        <label htmlFor="message-input" className="sr-only">
          Message {partnerName}
        </label>
        <input
          id="message-input"
          aria-label={`Message ${partnerName}`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Message ${partnerName}...`}
          className="flex-1 rounded-lg border border-fg/20 px-4 py-2 text-sm bg-bg focus:outline-none focus:border-brand"
          disabled={sending}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || sending}
          className="bg-brand text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand/90 disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </>
  );
}

function formatTime(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
