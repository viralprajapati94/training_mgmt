import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import type { AppLayoutProps } from '@/types';
import { Toaster } from '@/components/ui/sonner';
import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';

export default ({ children, breadcrumbs, ...props }: AppLayoutProps) => {
    const { flash } = usePage<{ flash?: { success?: string; error?: string } } & Record<string, any>>().props;

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    return (
        <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
            {children}
            <Toaster position="top-right" richColors />
        </AppLayoutTemplate>
    );
};
