import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type DataTableColumn = {
    key: string;
    label: string;
    className?: string;
};

export function DataTable({
    columns,
    children,
    className,
}: {
    columns: DataTableColumn[];
    children: ReactNode;
    className?: string;
}) {
    return (
        <div className={cn('overflow-hidden rounded-xl border shadow-sm', className)}>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border text-sm">
                    <thead className="bg-muted/50">
                        <tr>
                            {columns.map((column) => (
                                <th
                                    key={column.key}
                                    scope="col"
                                    className={cn(
                                        'px-4 py-3 text-left font-semibold text-muted-foreground whitespace-nowrap',
                                        column.className,
                                    )}
                                >
                                    {column.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border bg-card">{children}</tbody>
                </table>
            </div>
        </div>
    );
}
