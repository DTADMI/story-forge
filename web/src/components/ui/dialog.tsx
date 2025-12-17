import * as React from 'react';
import {twMerge} from 'tailwind-merge';

type DialogProps = {
    open: boolean;
    onOpenChange(open: boolean): void;
    title?: string;
    description?: string;
    children?: React.ReactNode;
    footer?: React.ReactNode;
};

export function Dialog({open, onOpenChange, title, description, children, footer}: DialogProps) {
    if (!open) return null;
    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'dialog-title' : undefined}
            aria-describedby={description ? 'dialog-desc' : undefined}
            className="fixed inset-0 z-50 flex items-center justify-center"
            onClick={() => onOpenChange(false)}
        >
            <div className="absolute inset-0 bg-black/40"/>
            <div
                className={twMerge(
                    'relative z-10 w-full max-w-lg rounded-lg border border-fg/10 bg-bg p-4 shadow-xl outline-none',
                    'focus-visible:ring-2 focus-visible:ring-[color:var(--ring)]'
                )}
                onClick={(e) => e.stopPropagation()}
            >
                {(title || description) && (
                    <header className="mb-2">
                        {title && (
                            <h2 id="dialog-title" className="text-lg font-semibold">
                                {title}
                            </h2>
                        )}
                        {description && (
                            <p id="dialog-desc" className="text-sm text-fg/70">
                                {description}
                            </p>
                        )}
                    </header>
                )}
                <div className="py-2">{children}</div>
                {footer && <footer className="mt-4">{footer}</footer>}
            </div>
        </div>
    );
}
