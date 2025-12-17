import * as React from 'react';
import {twMerge} from 'tailwind-merge';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({className, ...props}, ref) => {
    return (
        <input
            ref={ref}
            className={twMerge(
                'flex h-10 w-full rounded-md border border-fg/20 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-fg/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-[color:var(--bg)] dark:ring-offset-[color:var(--bg)]',
                className
            )}
            {...props}
        />
    );
});
Input.displayName = 'Input';
