import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface RadioGroupProps {
  name: string;
  options: { value: string; label: string }[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export function RadioGroup({
  name,
  options,
  value,
  defaultValue,
  onChange,
  className,
}: RadioGroupProps) {
  return (
    <div className={cn("grid gap-2", className)} role="radiogroup">
      {options.map((opt) => (
        <label
          key={opt.value}
          className="inline-flex items-center gap-2 cursor-pointer group text-sm"
        >
          <span className="relative flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-input group-hover:border-ring transition-colors has-[:checked]:border-brand">
            <input
              type="radio"
              name={name}
              value={opt.value}
              defaultChecked={defaultValue === opt.value}
              checked={value !== undefined ? value === opt.value : undefined}
              onChange={(e) => onChange?.(e.target.value)}
              className="sr-only peer"
            />
            <span className="h-2 w-2 rounded-full bg-brand hidden peer-checked:block" />
          </span>
          {opt.label}
        </label>
      ))}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options, placeholder, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs transition-colors focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
);

Select.displayName = "Select";
