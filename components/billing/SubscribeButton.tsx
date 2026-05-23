"use client";
import { Button } from "@/components/ui/button";
import { useApiMutation } from "@/lib/query-hooks";
import { getErrorMessage } from "@/lib/client-api";

type Plan = "monthly" | "yearly" | "lifetime";

const LABELS: Record<Plan, string> = {
  monthly: "Subscribe Monthly",
  yearly: "Subscribe Yearly",
  lifetime: "Buy Lifetime",
};

export function SubscribeButton({ plan, disabled }: { plan: Plan; disabled?: boolean }) {
  const checkout = useApiMutation<{ url?: string; message?: string }, { plan: Plan }>(
    "/api/billing/checkout",
    {
      onSuccess: (data) => {
        if (data?.url) {
          window.location.href = data.url;
        } else {
          alert(data?.message || "Checkout not available yet.");
        }
      },
      onError: (err) => {
        alert(getErrorMessage(err, "Failed to start checkout."));
      },
    }
  );

  return (
    <Button
      className="w-full"
      disabled={disabled || checkout.isPending}
      aria-disabled={disabled || checkout.isPending}
      onClick={() => {
        if (disabled) return;
        checkout.mutate({ plan });
      }}
    >
      {checkout.isPending ? "Processing..." : LABELS[plan] || "Subscribe"}
    </Button>
  );
}
