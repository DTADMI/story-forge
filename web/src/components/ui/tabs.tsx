import * as React from 'react';
import {twMerge} from 'tailwind-merge';

type TabItem = {
    value: string;
    label: string;
};

export interface TabsProps {
    items: TabItem[];
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    className?: string;
    children?: React.ReactNode;
}

export function Tabs({
                         items,
                         value,
                         defaultValue,
                         onValueChange,
                         className,
                         children,
                     }: TabsProps) {
    const [internal, setInternal] = React.useState<string>(
        defaultValue ?? items[0]?.value
    );
    const active = value ?? internal;

    const setActive = (v: string) => {
        if (!value) setInternal(v);
        onValueChange?.(v);
    };

    return (
        <div className={twMerge('w-full', className)}>
            <div className="flex gap-2 border-b border-[color:var(--fg)]/15">
                {items.map((it) => (
                    <button
                        key={it.value}
                        onClick={() => setActive(it.value)}
                        className={twMerge(
                            'relative -mb-px px-3 py-2 text-sm font-medium',
                            active === it.value
                                ? 'text-brand'
                                : 'text-[color:var(--fg)]/70 hover:text-[color:var(--fg)]'
                        )}
                        aria-current={active === it.value}
                    >
                        {it.label}
                        <span
                            className={twMerge(
                                'absolute inset-x-2 -bottom-px h-0.5 rounded bg-transparent',
                                active === it.value && 'bg-brand'
                            )}
                        />
                    </button>
                ))}
            </div>
            {children}
        </div>
    );
}

export function TabsContent({
                                value,
                                active,
                                className,
                                ...props
                            }: React.HTMLAttributes<HTMLDivElement> & {
    value: string;
    active: string;
}) {
    if (value !== active) return null;
    return <div className={twMerge('py-3', className)} {...props} />;
}
