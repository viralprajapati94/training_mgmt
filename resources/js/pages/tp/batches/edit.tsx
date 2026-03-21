import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types/navigation';
import BatchForm from '../../tc/batches/components/BatchForm';

export default function EditBatch({ batch, sectors, jobRoles, trainers, trainingCenters, isTP }: any) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Batches', href: '/tp/batches' },
        { title: 'Edit Batch', href: `/tp/batches/${batch.id}/edit` },
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
            <Head title={`Edit Batch - ${batch.batch_number || batch.id}`} />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Edit Batch #{batch.batch_number || batch.id}</h1>
                    <p className="text-sm text-muted-foreground">
                        Update batch details.
                    </p>
                </div>

                <div className="mx-auto w-full max-w-5xl">
                    <BatchForm 
                        batch={{...batch, job_role: combinedJobRoles.find(j => j.id === batch.job_role_id)}} 
                        sectors={sectors} 
                        trainers={trainers} 
                        trainingCenters={trainingCenters}
                        isEdit={true} 
                        isTP={isTP}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
