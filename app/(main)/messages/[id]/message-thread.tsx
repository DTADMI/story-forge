"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/toast";
import { fetchJson, fetchVoid } from "@/lib/client-api";
import { useApiQuery } from "@/lib/query-hooks";
import { useOptimisticMutation } from "@/lib/mutation";

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
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const queryKey = ["messages", partnerId];
  const messagesQuery = useApiQuery<MessageData[]>(queryKey, `/api/messages?with=${partnerId}`, {
    initialData: initialMessages,
    refetchInterval: 10_000,
  });
  const messages = messagesQuery.data ?? initialMessages;
  const markReadMutation = useMutation({
    mutationFn: () => fetchVoid(`/api/messages/${partnerId}`, { method: "PATCH" }),
  });
  const sendMessageMutation = useOptimisticMutation<
    MessageData,
    { content: string; tempId: string },
    MessageData[]
  >({
    mutationFn: ({ content }) =>
      fetchJson<MessageData>("/api/messages", {
        method: "POST",
        body: JSON.stringify({ receiverId: partnerId, content }),
      }),
    queryKey,
    updater: (current, variables) => [
      ...(current ?? []),
      {
        id: variables.tempId,
        content: variables.content,
        createdAt: new Date().toISOString(),
        read: false,
        senderId: currentUserId,
        receiverId: partnerId,
        sender: { id: currentUserId, name: null, username: null, image: null },
        receiver: { id: partnerId, name: null, username: null, image: null },
      },
    ],
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey });
    },
    onError: () => {
      toast({ title: "Failed to send message", variant: "destructive" });
    },
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    markReadMutation.mutate();
  }, [partnerId]);

  return (
    <>
      <div className="flex-1 space-y-3 overflow-y-auto py-2">
        {messages.length === 0 && (
          <p className="py-8 text-center text-sm text-fg/40">No messages yet. Say hello!</p>
        )}
        {messages.map((message) => {
          const isMine = message.senderId === currentUserId;
          return (
            <div key={message.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                  isMine ? "rounded-br-md bg-brand text-white" : "rounded-bl-md bg-fg/10 text-fg"
                }`}
              >
                <p className="break-words whitespace-pre-wrap">{message.content}</p>
                <span
                  className={`mt-1 block text-[10px] ${isMine ? "text-white/60" : "text-fg/40"}`}
                >
                  {formatTime(message.createdAt)}
                  {isMine && (message.read ? " ✓✓" : " ✓")}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="flex shrink-0 gap-2 border-t border-fg/10 pt-3">
        <label htmlFor="message-input" className="sr-only">
          Message {partnerName}
        </label>
        <input
          id="message-input"
          aria-label={`Message ${partnerName}`}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              const content = input.trim();
              if (!content || sendMessageMutation.isPending) return;
              const tempId = `temp-${Date.now()}`;
              setInput("");
              sendMessageMutation.mutate({ content, tempId });
            }
          }}
          placeholder={`Message ${partnerName}...`}
          className="flex-1 rounded-lg border border-fg/20 bg-bg px-4 py-2 text-sm focus:border-brand focus:outline-none"
          disabled={sendMessageMutation.isPending}
        />
        <button
          onClick={() => {
            const content = input.trim();
            if (!content || sendMessageMutation.isPending) return;
            const tempId = `temp-${Date.now()}`;
            setInput("");
            sendMessageMutation.mutate({ content, tempId });
          }}
          disabled={!input.trim() || sendMessageMutation.isPending}
          className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand/90 disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </>
  );
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
