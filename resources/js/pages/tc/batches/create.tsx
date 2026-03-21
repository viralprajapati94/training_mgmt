import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent } from '@/components/ui/card';
import type { BreadcrumbItem } from '@/types/navigation';
import BatchForm from './components/BatchForm';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Batches', href: '/tc/batches' },
    { title: 'Create Batch', href: '/tc/batches/create' },
];

export default function CreateBatch({ sectors, trainers }: any) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Batch" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Create New Batch</h1>
                    <p className="text-sm text-muted-foreground">
                        Fill out the details to create a new training batch.
                    </p>
                </div>

                <div className="mx-auto w-full max-w-5xl">
                    <BatchForm sectors={sectors} trainers={trainers} />
                </div>
            </div>
        </AppLayout>
    );
}
