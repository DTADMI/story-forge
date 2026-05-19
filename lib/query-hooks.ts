"use client";

import { useQuery } from "@tanstack/react-query";

export function useApiQuery<T = unknown>(
  key: string[],
  path: string,
  options?: { enabled?: boolean; staleTime?: number }
) {
  return useQuery<T>({
    queryKey: key,
    queryFn: async () => {
      const res = await fetch(path);
      if (!res.ok) {
        throw new Error(`Request failed (${res.status})`);
      }
      return res.json() as Promise<T>;
    },
    staleTime: options?.staleTime ?? 60_000,
    enabled: options?.enabled ?? true,
  });
}
