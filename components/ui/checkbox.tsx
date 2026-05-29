import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { forwardRef } from "react";

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id, ...props }, ref) => {
    const checkboxId = id || label?.replace(/\s/g, "-").toLowerCase();

    return (
      <label
        htmlFor={checkboxId}
        className={cn("inline-flex items-center gap-2 cursor-pointer group", className)}
      >
        <span className="relative flex h-4 w-4 shrink-0 items-center justify-center rounded border border-input bg-background group-hover:border-ring transition-colors has-[:checked]:bg-brand has-[:checked]:border-brand">
          <input ref={ref} type="checkbox" id={checkboxId} className="sr-only peer" {...props} />
          <Check className="h-3 w-3 text-white hidden peer-checked:block" />
        </span>
        {label && <span className="text-sm">{label}</span>}
      </label>
    );
  }
);

Checkbox.displayName = "Checkbox";
