"use client";

import { useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  side?: "left" | "right";
  children: React.ReactNode;
}

export function Sheet({ open, onOpenChange, side = "left", children }: SheetProps) {
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    },
    [onOpenChange]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open, handleEscape]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={() => onOpenChange(false)}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "fixed inset-y-0 flex w-full max-w-xs bg-card shadow-xl transition-transform duration-300",
          side === "left" ? "left-0" : "right-0"
        )}
      >
        {children}
      </div>
    </div>
  );
}

interface SheetCloseProps {
  children: React.ReactNode;
  asChild?: boolean;
}

export function SheetClose({ children }: SheetCloseProps) {
  return <>{children}</>;
}
