"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/toast";
import { fetchJson, fetchVoid } from "@/lib/client-api";
import { useApiQuery } from "@/lib/query-hooks";
import { useOptimisticMutation } from "@/lib/mutation";
import { VoiceRecorder, VoicePlayer } from "@/lib/voice";
import { createClient } from "@/lib/supabase/client";

interface MessageData {
  id: string;
  content: string;
  createdAt: string;
  read: boolean;
  senderId: string;
  receiverId: string;
  messageType?: string;
  metadata?: Record<string, unknown>;
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
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
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

  const handleVoiceComplete = async (blob: Blob, duration: number) => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const userId = user?.id;
    if (!userId) return;
    const messageId = crypto.randomUUID();
    const filePath = `voice-messages/${userId}/${messageId}.webm`;
    const { error: uploadError } = await supabase.storage
      .from("private-media")
      .upload(filePath, blob, { upsert: true, contentType: "audio/webm" });
    if (uploadError) {
      toast({ title: "Failed to upload voice message", variant: "destructive" });
      return;
    }
    const { data: urlData } = supabase.storage.from("private-media").getPublicUrl(filePath);
    const voiceUrl = urlData.publicUrl;
    fetchVoid("/api/messages", {
      method: "POST",
      body: JSON.stringify({
        receiverId: partnerId,
        content: "",
        messageType: "voice",
        metadata: { voiceUrl, duration },
      }),
    })
      .then(() => {
        queryClient.invalidateQueries({ queryKey });
      })
      .catch(() => {
        toast({ title: "Failed to send voice message", variant: "destructive" });
      });
    setShowVoiceRecorder(false);
  };

  return (
    <>
      <div className="flex-1 space-y-3 overflow-y-auto py-2">
        {messages.length === 0 && (
          <p className="py-8 text-center text-sm text-fg/40">No messages yet. Say hello!</p>
        )}
        {messages.map((message) => {
          const isMine = message.senderId === currentUserId;
          const isVoice =
            message.messageType === "voice" ||
            (message.metadata as { voiceUrl?: string } | undefined)?.voiceUrl;
          const voiceUrl = (message.metadata as { voiceUrl?: string } | undefined)?.voiceUrl;

          if (isVoice && voiceUrl) {
            return (
              <div key={message.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                    isMine ? "rounded-br-md bg-brand text-white" : "rounded-bl-md bg-fg/10 text-fg"
                  }`}
                >
                  <VoicePlayer
                    url={voiceUrl}
                    compact
                    t={(key: string) => key}
                    className="min-w-[180px]"
                  />
                  <span
                    className={`mt-1 block text-[10px] ${isMine ? "text-white/60" : "text-fg/40"}`}
                  >
                    {formatTime(message.createdAt)}
                    {isMine && (message.read ? " ✓✓" : " ✓")}
                  </span>
                </div>
              </div>
            );
          }

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
        {showVoiceRecorder ? (
          <div className="flex-1">
            <VoiceRecorder
              onRecordingComplete={handleVoiceComplete}
              onCancel={() => setShowVoiceRecorder(false)}
              t={(key) => key}
            />
          </div>
        ) : (
          <>
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
              type="button"
              onClick={() => setShowVoiceRecorder(true)}
              className="rounded-lg border border-fg/20 px-3 py-2 text-sm text-fg/60 hover:text-fg hover:border-fg/40"
              title="Record voice message"
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            </button>
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
          </>
        )}
      </div>
    </>
  );
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
