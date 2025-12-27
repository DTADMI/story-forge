import * as React from 'react';
import {cva, type VariantProps} from 'class-variance-authority';
import {twMerge} from 'tailwind-merge';

const buttonVariants = cva(
    'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
    {
      variants: {
        variant: {
          primary:
              'bg-brand text-white hover:brightness-110 focus-visible:ring-[var(--ring)]',
          secondary:
              'bg-accent text-white hover:brightness-110 focus-visible:ring-[var(--ring)]',
          outline:
              'border border-[color:var(--ring)] text-fg hover:bg-[color:var(--ring)]/10',
          ghost: 'bg-transparent hover:bg-fg/5',
        },
        size: {
          sm: 'h-8 px-3 py-1',
          md: 'h-10 px-4 py-2',
          lg: 'h-12 px-6 py-3',
        },
      },
      defaultVariants: {
        variant: 'primary',
        size: 'md',
      },
    }
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {className, variant, size, isLoading, disabled, children, ...props},
        ref
    ) => {
      const isDisabled = disabled || isLoading;
      return (
          <button
              ref={ref}
              className={twMerge(buttonVariants({variant, size}), className)}
              aria-busy={isLoading ? 'true' : undefined}
              disabled={isDisabled}
              {...props}
          >
            {isLoading ? (
                <span className="inline-flex items-center gap-2">
            <svg
                className="h-4 w-4 animate-spin"
                viewBox="0 0 24 24"
                aria-hidden="true"
            >
              <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  opacity="0.25"
              />
              <path
                  d="M22 12a10 10 0 0 1-10 10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
              />
            </svg>
            <span>Loading…</span>
          </span>
            ) : (
                children
            )}
          </button>
      );
    }
);
Button.displayName = 'Button';
