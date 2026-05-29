"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

interface AccordionItem {
  value: string;
  trigger: React.ReactNode;
  content: React.ReactNode;
}

interface AccordionProps {
  items: AccordionItem[];
  type?: "single" | "multiple";
  defaultValue?: string | string[];
  className?: string;
}

export function Accordion({ items, type = "single", defaultValue, className }: AccordionProps) {
  const [openValues, setOpenValues] = React.useState<string[]>(
    defaultValue ? (Array.isArray(defaultValue) ? defaultValue : [defaultValue]) : []
  );

  const toggle = (value: string) => {
    if (type === "single") {
      setOpenValues(openValues.includes(value) ? [] : [value]);
    } else {
      setOpenValues((prev) =>
        prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
      );
    }
  };

  return (
    <div className={cn("divide-y divide-border rounded-md border", className)}>
      {items.map((item) => {
        const isOpen = openValues.includes(item.value);
        return (
          <div key={item.value}>
            <button
              onClick={() => toggle(item.value)}
              className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium hover:bg-muted/50 transition-colors"
              aria-expanded={isOpen}
            >
              {item.trigger}
              <ChevronDown
                className={cn(
                  "h-4 w-4 shrink-0 transition-transform duration-200",
                  isOpen && "rotate-180"
                )}
              />
            </button>
            {isOpen && <div className="px-4 pb-4 text-sm">{item.content}</div>}
          </div>
        );
      })}
    </div>
  );
}
