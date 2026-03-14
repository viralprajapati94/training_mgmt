import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent } from '@/components/ui/card';
import ProjectDetailsForm from './components/ProjectDetailsForm';
import TrainingCenterSelector from './components/TrainingCenterSelector';
import JobRoleTargetTable from './components/JobRoleTargetTable';
import type { BreadcrumbItem } from '@/types/navigation';

const breadcrumbs = (id: number): BreadcrumbItem[] => [
    { title: 'Target Allocations', href: '/tp/target-allocations' },
    { title: 'Edit', href: `/tp/target-allocations/${id}/edit` },
];

export default function TargetAllocationEdit({ 
    allocation, 
    trainingCenters, 
    schemes, 
    assessmentBodies, 
    sectors, 
    jobRoles, 
    projectTypes 
}: any) {
    return (
        <AppLayout breadcrumbs={breadcrumbs(allocation.id)}>
            <Head title="Edit Target Allocation" />
            <div className="p-4">
            
                <Card>
                    <CardContent className="">
                        <ProjectDetailsForm 
                            allocation={allocation}
                            schemes={schemes} 
                            assessmentBodies={assessmentBodies} 
                            projectTypes={projectTypes} 
                        />
                    </CardContent>
                
                    <CardContent className="">
                        <TrainingCenterSelector 
                            allocationId={allocation.id}
                            centers={allocation.centers || []}
                            trainingCenters={trainingCenters}
                        />
                        
                        <JobRoleTargetTable 
                            allocationId={allocation.id}
                            jobRolesTargets={allocation.job_roles || []}
                            sectors={sectors}
                            jobRoles={jobRoles}
                        />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
