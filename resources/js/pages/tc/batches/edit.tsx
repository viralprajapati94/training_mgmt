import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types/navigation';
import BatchForm from './components/BatchForm';

export default function EditBatch({ batch, sectors, jobRoles, trainers }: any) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Batches', href: '/tc/batches' },
        { title: 'Edit Batch', href: `/tc/batches/${batch.id}/edit` },
    ];

    // Combine current job role from batch and job roles list to ensure selected is always present
    const batchJobRole = batch.job_role ? [{
        ...batch.job_role,
        version: batch.version
    }] : [];
    
    // Create a unique array of job roles prioritizing the fetched list over the standalone batch job role
    const combinedJobRoles = [...jobRoles];
    if (batch.job_role && !combinedJobRoles.find(j => j.id === batch.job_role_id)) {
        combinedJobRoles.push(batchJobRole[0]);
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Batch - ${batch.id}`} />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Edit Batch #{batch.id}</h1>
                    <p className="text-sm text-muted-foreground">
                        Update batch details. You can only edit batches in Draft or Modified by TP status.
                    </p>
                </div>

                <div className="mx-auto w-full max-w-5xl">
                    <BatchForm 
                        batch={{...batch, job_role: combinedJobRoles.find(j => j.id === batch.job_role_id)}} 
                        sectors={sectors} 
                        trainers={trainers} 
                        isEdit={true} 
                    />
                </div>
            </div>
        </AppLayout>
    );
}
