import * as React from 'react';
import {twMerge} from 'tailwind-merge';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    error?: string;
    description?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({className, error, description, ...props}, ref) => {
        return (
            <div className={twMerge('grid gap-1.5', className)}>
        <textarea
            ref={ref}
            className={
                'border-fg/20 placeholder:text-fg/50 min-h-[96px] w-full rounded-md border bg-white px-3 py-2 text-sm ring-offset-white focus-visible:ring-2 focus-visible:ring-[color:var(--ring)] focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-[color:var(--bg)] dark:ring-offset-[color:var(--bg)]'
            }
            aria-invalid={error ? 'true' : undefined}
            {...props}
        />
                {description && !error && (
                    <p className="text-fg/60 text-xs">{description}</p>
                )}
                {error && (
                    <p role="alert" className="text-xs text-[color:#b91c1c]">
                        {error}
                    </p>
                )}
            </div>
        );
    }
);
Textarea.displayName = 'Textarea';
