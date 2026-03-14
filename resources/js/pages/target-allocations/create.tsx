import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent } from '@/components/ui/card';
import ProjectDetailsForm from './components/ProjectDetailsForm';
import type { BreadcrumbItem } from '@/types/navigation';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Target Allocations', href: '/tp/target-allocations' },
    { title: 'Create', href: '/tp/target-allocations/create' },
];

export default function TargetAllocationCreate({ schemes, assessmentBodies, sectors, jobRoles, projectTypes }: any) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Target Allocation" />
            <div className="space-y-6">
                <div>
                    <h1 className="text-xl font-semibold">Target Allocation</h1>
                    <p className="text-sm text-muted-foreground">Complete project details first to proceed to assigning Training Centers and Job Roles.</p>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <ProjectDetailsForm 
                            schemes={schemes} 
                            assessmentBodies={assessmentBodies} 
                            projectTypes={projectTypes} 
                        />
                    </CardContent>
                </Card>

                {/* Centers and Job Roles tabs remain locked/hidden until Project is created */}
                <Card className="opacity-50 pointer-events-none">
                    <CardContent className="pt-6 flex justify-center py-12">
                        <p className="text-muted-foreground text-sm">Save Project Details to unlock Training Center Assignment</p>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
