"use client";

import { useMutation, useQueryClient, type QueryKey } from "@tanstack/react-query";

interface OptimisticOptions<TData, TVariables> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  queryKey: QueryKey;
  updater: (old: TData[] | undefined, variables: TVariables) => TData[];
  onSuccess?: (data: TData) => void;
  onError?: (error: Error) => void;
}

export function useOptimisticMutation<TData, TVariables>({
  mutationFn,
  queryKey,
  updater,
  onSuccess,
  onError,
}: OptimisticOptions<TData, TVariables>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<TData[]>(queryKey);
      queryClient.setQueryData<TData[]>(queryKey, (old) => updater(old, variables));
      return { previous };
    },
    onError: (error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
      onError?.(error as Error);
    },
    onSuccess: (data) => {
      onSuccess?.(data);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}
