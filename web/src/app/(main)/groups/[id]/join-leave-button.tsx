"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/toast";

interface JoinLeaveButtonProps {
  groupId: string;
  isMember: boolean;
  isPrivate: boolean;
}

export function JoinLeaveButton({ groupId, isMember, isPrivate }: JoinLeaveButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [memberStatus, setMemberStatus] = useState(isMember);
  const router = useRouter();
  const { toast } = useToast();

  async function toggle() {
    setIsLoading(true);
    try {
      if (memberStatus) {
        const res = await fetch(`/api/social/groups/${groupId}/join`, {
          method: "DELETE",
        });
        if (res.ok) {
          setMemberStatus(false);
          router.refresh();
        } else {
          toast({
            title: "Error",
            description: "Failed to leave group.",
            variant: "destructive",
          });
        }
      } else {
        const res = await fetch(`/api/social/groups/${groupId}/join`, {
          method: "POST",
        });
        if (res.ok) {
          setMemberStatus(true);
          router.refresh();
        } else {
          toast({
            title: "Error",
            description: "Failed to join group.",
            variant: "destructive",
          });
        }
      }
    } catch {
      toast({
        title: "Error",
        description: "Could not connect to server.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (memberStatus) {
    return (
      <Button variant="outline" onClick={toggle} isLoading={isLoading}>
        Leave
      </Button>
    );
  }

  return (
    <Button onClick={toggle} isLoading={isLoading}>
      Join
    </Button>
  );
}
