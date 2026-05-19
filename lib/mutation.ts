"use client";

import { useMutation, useQueryClient, type UseMutationOptions } from "@tanstack/react-query";
import { useToast } from "@/components/toast";

type MutationConfig<TData, TVars> = {
  path: string;
  method?: "POST" | "PATCH" | "PUT" | "DELETE";
  invalidateKeys?: string[];
  successTitle?: string;
  successDescription?: string;
  optimisticUpdate?: (vars: TVars) => unknown;
  rollback?: () => void;
} & Omit<UseMutationOptions<TData, Error, TVars>, "mutationFn">;

export function useApiMutation<TData = unknown, TVars = Record<string, unknown>>({
  path,
  method = "POST",
  invalidateKeys = [],
  successTitle,
  successDescription,
  ...mutationOptions
}: MutationConfig<TData, TVars>) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation<TData, Error, TVars>({
    mutationFn: async (vars) => {
      const res = await fetch(path, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(vars),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Request failed" }));
        throw new Error(err.error || err.message || `Request failed (${res.status})`);
      }

      return res.json() as Promise<TData>;
    },

    onSuccess: () => {
      if (successTitle) {
        toast({ title: successTitle, description: successDescription });
      }
      for (const key of invalidateKeys) {
        queryClient.invalidateQueries({ queryKey: [key] });
      }
    },

    onError: (error) => {
      toast({ title: error.message || "Something went wrong", variant: "destructive" });
    },

    ...mutationOptions,
  });
}
