import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react";

const alertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg+div]:translate-y-[-3px] [&>svg~*]:pl-7",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive:
          "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
        success:
          "border-green-500/50 text-green-700 dark:border-green-500/30 dark:text-green-400 [&>svg]:text-green-600",
        warning:
          "border-yellow-500/50 text-yellow-700 dark:border-yellow-500/30 dark:text-yellow-400 [&>svg]:text-yellow-600",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

const icons = {
  default: Info,
  destructive: AlertCircle,
  success: CheckCircle,
  warning: AlertTriangle,
};

export interface AlertProps extends VariantProps<typeof alertVariants> {
  className?: string;
  children: React.ReactNode;
}

export function Alert({ variant = "default", className, children }: AlertProps) {
  const Icon = icons[variant ?? "default"];
  return (
    <div role="alert" className={cn(alertVariants({ variant }), className)}>
      <Icon className="h-4 w-4" />
      {children}
    </div>
  );
}

export function AlertTitle({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <h5 className={cn("mb-1 font-medium leading-none tracking-tight", className)}>{children}</h5>
  );
}

export function AlertDescription({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn("text-sm [&_p]:leading-relaxed", className)}>{children}</div>;
}
