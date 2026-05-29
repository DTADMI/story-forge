import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, label, id, ...props }, ref) => {
    const switchId = id || label?.replace(/\s/g, "-").toLowerCase();

    return (
      <label
        htmlFor={switchId}
        className={cn("inline-flex items-center gap-2 cursor-pointer group", className)}
      >
        <span className="relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent bg-muted transition-colors group-has-[:checked]:bg-brand">
          <input
            ref={ref}
            type="checkbox"
            role="switch"
            id={switchId}
            className="sr-only peer"
            {...props}
          />
          <span className="h-4 w-4 rounded-full bg-background shadow-sm transition-transform translate-x-0 peer-checked:translate-x-4" />
        </span>
        {label && <span className="text-sm">{label}</span>}
      </label>
    );
  }
);

Switch.displayName = "Switch";
