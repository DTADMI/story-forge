"use client";

import { useState } from "react";
import { getErrorMessage } from "@/lib/client-api";
import { useApiMutation } from "@/lib/query-hooks";
import { Button } from "../ui/button";

interface CheerButtonProps {
  targetUserId: string;
}

export function CheerButton({ targetUserId }: CheerButtonProps) {
  const [message, setMessage] = useState<string | null>(null);
  const cheerMutation = useApiMutation<unknown, { userId: string }>("/api/social/cheer", {
    onSuccess: () => {
      setMessage("Sent cheer.");
      window.setTimeout(() => setMessage(null), 3000);
    },
    onError: (error) => {
      setMessage(getErrorMessage(error, "Failed to cheer"));
    },
  });

  return (
    <div className="flex flex-col items-center gap-2">
      <Button
        onClick={() => {
          setMessage(null);
          cheerMutation.mutate({ userId: targetUserId });
        }}
        disabled={cheerMutation.isPending}
        variant="outline"
        className="hover:border-brand hover:text-brand"
      >
        {cheerMutation.isPending ? "Sending..." : "Cheer"}
      </Button>
      {message && <span className="text-xs font-medium animate-pulse">{message}</span>}
    </div>
  );
}
