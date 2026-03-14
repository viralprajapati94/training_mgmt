import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type PaginationProps = {
    links: PaginationLink[];
    className?: string;
};

export function Pagination({ links, className }: PaginationProps) {
    if (!links || links.length === 0) return null;

    return (
        <nav className={cn('flex items-center justify-end gap-1 text-sm', className)}>
            {links.map((link, index) => (
                <Link
                    key={`${link.label}-${index}`}
                    preserveScroll
                    preserveState
                    href={link.url || ''}
                    dangerouslySetInnerHTML={{ __html: link.label }}
                    className={cn(
                        'min-w-8 rounded-md px-3 py-1 text-center transition-colors',
                        link.active
                            ? 'bg-primary text-primary-foreground'
                            : link.url
                                ? 'hover:bg-muted'
                                : 'opacity-50 cursor-not-allowed',
                    )}
                />
            ))}
        </nav>
    );
}
