"use client";

import { useState } from "react";
import { useToast } from "@/components/toast";
import { getErrorMessage } from "@/lib/client-api";
import { useApiMutation } from "@/lib/query-hooks";
import { Button } from "../ui/button";

interface FollowButtonProps {
  targetUserId: string;
  initialIsFollowing: boolean;
}

export function FollowButton({ targetUserId, initialIsFollowing }: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const { toast } = useToast();
  const followMutation = useApiMutation<{ following: boolean }, { userId: string }>(
    "/api/social/follow",
    {
      onSuccess: (data) => {
        setIsFollowing(data.following);
      },
      onError: (error) => {
        toast({
          title: "Could not update follow state",
          description: getErrorMessage(error),
          variant: "destructive",
        });
      },
    }
  );

  return (
    <Button
      onClick={() => followMutation.mutate({ userId: targetUserId })}
      disabled={followMutation.isPending}
      isLoading={followMutation.isPending}
      variant={isFollowing ? "outline" : "default"}
    >
      {isFollowing ? "Unfollow" : "Follow"}
    </Button>
  );
}
