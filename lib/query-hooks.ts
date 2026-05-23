"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useSuspenseQuery,
  type QueryKey,
  type UseMutationOptions,
  type UseQueryOptions,
  type UseSuspenseQueryOptions,
} from "@tanstack/react-query";
import { fetchJson, type ApiError } from "@/lib/client-api";

type ApiQueryOptions<TData> = Omit<
  UseQueryOptions<TData, ApiError, TData, QueryKey>,
  "queryKey" | "queryFn"
>;

type SuspenseApiQueryOptions<TData> = Omit<
  UseSuspenseQueryOptions<TData, ApiError, TData, QueryKey>,
  "queryKey" | "queryFn"
>;

export function useApiQuery<TData = unknown>(
  key: QueryKey,
  path: string,
  options?: ApiQueryOptions<TData>
) {
  return useQuery<TData, ApiError>({
    queryKey: key,
    queryFn: ({ signal }) => fetchJson<TData>(path, { signal }),
    placeholderData: keepPreviousData,
    ...options,
  });
}

export function useSuspenseApiQuery<TData = unknown>(
  key: QueryKey,
  path: string,
  options?: SuspenseApiQueryOptions<TData>
) {
  return useSuspenseQuery<TData, ApiError>({
    queryKey: key,
    queryFn: ({ signal }) => fetchJson<TData>(path, { signal }),
    ...options,
  });
}

type ApiMutationOptions<TData, TVariables, TContext> = Omit<
  UseMutationOptions<TData, ApiError, TVariables, TContext>,
  "mutationFn"
> & {
  method?: "POST" | "PATCH" | "PUT" | "DELETE";
};

export function useApiMutation<TData = unknown, TVariables = void, TContext = unknown>(
  path: string,
  options?: ApiMutationOptions<TData, TVariables, TContext>
) {
  return useMutation<TData, ApiError, TVariables, TContext>({
    mutationFn: (variables) =>
      fetchJson<TData>(path, {
        method: options?.method ?? "POST",
        body: variables === undefined ? undefined : JSON.stringify(variables),
      }),
    ...options,
  });
}
