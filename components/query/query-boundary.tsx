"use client";

import { Component, Suspense, type ErrorInfo, type ReactNode } from "react";
import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getErrorMessage } from "@/lib/client-api";

class Boundary extends Component<
  {
    children: ReactNode;
    onReset: () => void;
    fallbackTitle?: string;
  },
  { error: Error | null }
> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(_error: Error, _errorInfo: ErrorInfo) {}

  render() {
    if (this.state.error) {
      return (
        <Card className="border-destructive/20 bg-destructive/5 p-4">
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-semibold">
                {this.props.fallbackTitle ?? "Unable to load this view"}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {getErrorMessage(this.state.error)}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                this.setState({ error: null });
                this.props.onReset();
              }}
            >
              Try again
            </Button>
          </div>
        </Card>
      );
    }

    return this.props.children;
  }
}

export function QueryBoundary({
  children,
  loadingFallback,
  errorTitle,
}: {
  children: ReactNode;
  loadingFallback: ReactNode;
  errorTitle?: string;
}) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <Boundary onReset={reset} fallbackTitle={errorTitle}>
          <Suspense fallback={loadingFallback}>{children}</Suspense>
        </Boundary>
      )}
    </QueryErrorResetBoundary>
  );
}
