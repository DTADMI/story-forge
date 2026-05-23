"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/toast";
import { fetchVoid, getErrorMessage } from "@/lib/client-api";
import { useMutation } from "@tanstack/react-query";

interface JoinLeaveButtonProps {
  groupId: string;
  isMember: boolean;
  isPrivate: boolean;
}

export function JoinLeaveButton({ groupId, isMember }: JoinLeaveButtonProps) {
  const [memberStatus, setMemberStatus] = useState(isMember);
  const router = useRouter();
  const { toast } = useToast();
  const joinMutation = useMutation({
    mutationFn: (method: "POST" | "DELETE") =>
      fetchVoid(`/api/social/groups/${groupId}/join`, { method }),
    onSuccess: (_data, method) => {
      setMemberStatus(method === "POST");
      router.refresh();
    },
    onError: (error, method) => {
      toast({
        title: "Error",
        description: getErrorMessage(
          error,
          method === "POST" ? "Failed to join group." : "Failed to leave group."
        ),
        variant: "destructive",
      });
    },
  });

  if (memberStatus) {
    return (
      <Button
        variant="outline"
        onClick={() => joinMutation.mutate("DELETE")}
        isLoading={joinMutation.isPending}
      >
        Leave
      </Button>
    );
  }

  return (
    <Button onClick={() => joinMutation.mutate("POST")} isLoading={joinMutation.isPending}>
      Join
    </Button>
  );
}
