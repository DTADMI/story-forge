import * as React from 'react';
import {twMerge} from 'tailwind-merge';

export function Card({className, ...props}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={twMerge(
                'rounded-lg border border-fg/10 bg-white text-fg shadow-sm dark:border-white/10 dark:bg-[color:var(--bg)]',
                className
            )}
            {...props}
        />
    );
}

export function CardHeader({className, ...props}: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={twMerge('px-6 pt-5 pb-2', className)} {...props} />;
}

export function CardTitle({className, ...props}: React.HTMLAttributes<HTMLHeadingElement>) {
    return <h3 className={twMerge('text-base font-semibold leading-none tracking-tight', className)} {...props} />;
}

export function CardDescription({className, ...props}: React.HTMLAttributes<HTMLParagraphElement>) {
    return <p className={twMerge('text-sm text-fg/70', className)} {...props} />;
}

export function CardContent({className, ...props}: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={twMerge('px-6 py-4', className)} {...props} />;
}

export function CardFooter({className, ...props}: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={twMerge('px-6 pb-5 pt-2', className)} {...props} />;
}
