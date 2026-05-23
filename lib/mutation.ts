"use client";

import { useMutation, useQueryClient, type QueryKey } from "@tanstack/react-query";
import type { ApiError } from "@/lib/client-api";

interface OptimisticOptions<TData, TVariables, TQueryData = TData> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  queryKey: QueryKey;
  updater: (old: TQueryData | undefined, variables: TVariables) => TQueryData;
  onSuccess?: (data: TData) => void;
  onError?: (error: ApiError) => void;
}

export function useOptimisticMutation<TData, TVariables, TQueryData = TData>({
  mutationFn,
  queryKey,
  updater,
  onSuccess,
  onError,
}: OptimisticOptions<TData, TVariables, TQueryData>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<TQueryData>(queryKey);
      queryClient.setQueryData<TQueryData>(queryKey, (old) => updater(old, variables));
      return { previous };
    },
    onError: (error, _variables, context) => {
      if (context && "previous" in context) {
        queryClient.setQueryData(queryKey, context.previous);
      }
      onError?.(error as ApiError);
    },
    onSuccess: (data) => {
      onSuccess?.(data);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}
