import React, { createContext, useContext, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';

interface TabsContextValue {
    value: string;
    setValue: (value: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

export function Tabs({ defaultValue, value: valueProp, onValueChange, className, children }: {
    defaultValue: string;
    value?: string;
    onValueChange?: (value: string) => void;
    className?: string;
    children: React.ReactNode;
}) {
    const [internal, setInternal] = useState(defaultValue);
    const value = valueProp ?? internal;

    const ctx = useMemo<TabsContextValue>(() => ({
        value,
        setValue: (val: string) => {
            setInternal(val);
            onValueChange?.(val);
        },
    }), [value, onValueChange]);

    return (
        <TabsContext.Provider value={ctx}>
            <div className={cn('w-full', className)}>{children}</div>
        </TabsContext.Provider>
    );
}

export function TabsList({ className, children }: { className?: string; children: React.ReactNode }) {
    return <div className={cn('inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground', className)}>{children}</div>;
}

export function TabsTrigger({ value, className, children, disabled }: { value: string; className?: string; children: React.ReactNode; disabled?: boolean }) {
    const ctx = useTabs();
    const isActive = ctx.value === value;
    return (
        <button
            type="button"
            onClick={() => !disabled && ctx.setValue(value)}
            disabled={disabled}
            className={cn(
                'inline-flex min-w-[120px] items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                isActive ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
                disabled && 'opacity-60 pointer-events-none',
                className,
            )}
        >
            {children}
        </button>
    );
}

export function TabsContent({ value, className, children }: { value: string; className?: string; children: React.ReactNode }) {
    const ctx = useTabs();
    if (ctx.value !== value) return null;
    return <div className={cn('border border-border/70 rounded-lg p-4', className)}>{children}</div>;
}

function useTabs(): TabsContextValue {
    const ctx = useContext(TabsContext);
    if (!ctx) throw new Error('Tabs components must be used within <Tabs>');
    return ctx;
}
