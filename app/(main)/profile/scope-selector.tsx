"use client";

import { useState } from "react";
import { useToast } from "@/components/toast";
import { getErrorMessage } from "@/lib/client-api";
import { useApiMutation } from "@/lib/query-hooks";

export function ScopeSelector({ userId, currentScope }: { userId: string; currentScope: string }) {
  const [scope, setScope] = useState(currentScope);
  const { toast } = useToast();
  const updateScopeMutation = useApiMutation<unknown, Record<string, unknown>>(
    `/api/users/${userId}`,
    {
      method: "PATCH",
      onSuccess: () => {
        toast({ title: "Default scope updated" });
      },
      onError: (error) => {
        setScope(currentScope);
        toast({
          title: "Failed to update scope",
          description: getErrorMessage(error),
          variant: "destructive",
        });
      },
    }
  );

  return (
    <select
      value={scope}
      onChange={(event) => {
        const nextScope = event.target.value;
        setScope(nextScope);
        updateScopeMutation.mutate({ defaultPublicationScope: nextScope });
      }}
      disabled={updateScopeMutation.isPending}
      className="rounded-md border border-fg/20 bg-bg px-3 py-1.5 text-sm disabled:opacity-50"
    >
      <option value="PRIVATE">Private</option>
      <option value="FRIENDS">Friends</option>
      <option value="PUBLIC_AUTHENTICATED">Public (Authenticated)</option>
      <option value="PUBLIC_ANYONE">Public (Anyone)</option>
    </select>
  );
}
