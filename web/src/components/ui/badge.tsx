import * as React from 'react';
import {cva, type VariantProps} from 'class-variance-authority';
import {twMerge} from 'tailwind-merge';

const badgeVariants = cva(
    'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
    {
        variants: {
            variant: {
                default: 'bg-brand text-white border-transparent',
                secondary: 'bg-accent text-white border-transparent',
                outline: 'bg-transparent text-fg border-[color:var(--ring)]',
                muted: 'bg-fg/10 text-fg border-transparent'
            }
        },
        defaultVariants: {
            variant: 'default'
        }
    }
);

export interface BadgeProps
    extends React.HTMLAttributes<HTMLSpanElement>,
        VariantProps<typeof badgeVariants> {
}

export function Badge({className, variant, ...props}: BadgeProps) {
    return <span className={twMerge(badgeVariants({variant}), className)} {...props} />;
}
