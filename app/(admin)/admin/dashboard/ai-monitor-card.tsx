"use client";

import { useApiQuery, useApiMutation } from "@/lib/query-hooks";
import { Card } from "@/components/ui/card";
import type { AiMetricsSummary } from "@/lib/ai-monitoring";
import type { ApiError } from "@/lib/client-api";

export function AiMonitorCard() {
  const { data, isLoading, isError, refetch } = useApiQuery<AiMetricsSummary>(
    ["ai-monitor"],
    "/api/ai/monitor"
  );

  const clear = useApiMutation<{ cleared: boolean }, void>("/api/ai/monitor", {
    method: "DELETE",
    onSuccess: () => refetch(),
  });

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-bold">AI Monitoring</h2>
        <button
          onClick={() => clear.mutate(undefined)}
          disabled={clear.isPending}
          className="text-xs rounded bg-red-600 px-2 py-1 text-white hover:opacity-90 disabled:opacity-50"
        >
          {clear.isPending ? "Clearing..." : "Clear Metrics"}
        </button>
      </div>

      {isLoading && <p className="text-sm text-fg/50">Loading metrics...</p>}
      {isError && <p className="text-sm text-red-500">Failed to load metrics</p>}
      {clear.isError && (
        <p className="text-xs text-red-500 mb-2">
          {(clear.error as ApiError).message ?? "Clear failed"}
        </p>
      )}
      {clear.isSuccess && <p className="text-xs text-green-600 mb-2">Metrics cleared</p>}

      {data && (
        <div className="space-y-3 text-sm">
          <div className="grid grid-cols-4 gap-2">
            <div className="text-center">
              <p className="text-lg font-bold">{data.totalRequests}</p>
              <p className="text-xs text-fg/50">Requests</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold">{data.successRate}%</p>
              <p className="text-xs text-fg/50">Success</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold">{data.avgLatencyMs}ms</p>
              <p className="text-xs text-fg/50">Avg Latency</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold">{(data.totalTokens / 1000).toFixed(1)}k</p>
              <p className="text-xs text-fg/50">Tokens</p>
            </div>
          </div>

          <div className="border-t pt-2">
            <p className="text-xs font-semibold text-fg/50 mb-1">Per Feature</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              {Object.entries(data.byFeature).map(([feature, metrics]) => (
                <div key={feature} className="flex justify-between text-xs">
                  <span className="capitalize">{feature}</span>
                  <span className="text-fg/60">
                    {metrics.requests} req &middot; {metrics.successRate}% &middot;{" "}
                    {metrics.avgLatencyMs}ms
                  </span>
                </div>
              ))}
            </div>
          </div>

          {data.recentRequests.length > 0 && (
            <div className="border-t pt-2">
              <p className="text-xs font-semibold text-fg/50 mb-1">Recent Requests</p>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {data.recentRequests.slice(0, 10).map((r, i) => (
                  <div key={i} className="flex justify-between text-xs text-fg/60">
                    <span className="capitalize">{r.feature}</span>
                    <span>
                      {r.latencyMs}ms &middot; {r.success ? "OK" : "FAIL"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
