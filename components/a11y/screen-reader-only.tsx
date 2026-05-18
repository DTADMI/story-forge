import type { ReactNode, HTMLAttributes } from "react";

interface VisuallyHiddenProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  as?: "span" | "div";
}

export function VisuallyHidden({ children, as: Tag = "span", ...props }: VisuallyHiddenProps) {
  return (
    <Tag className="sr-only" {...props}>
      {children}
    </Tag>
  );
}

export { VisuallyHidden as SrOnly };
