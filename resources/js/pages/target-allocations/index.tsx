import { Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Eye, Edit } from 'lucide-react';
import type { BreadcrumbItem } from '@/types/navigation';

// Helper function to format date to dd-mm-yyyy
const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Target Allocations', href: '/tp/target-allocations' },
];

export default function TargetAllocationsIndex({ allocations }: any) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h1 className="text-2xl font-bold">Target Allocations</h1>
                    <Button asChild>
                        <Link href="/tp/target-allocations/create">
                            <Plus className="mr-2 h-4 w-4" /> New Allocation
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader className="pb-3" />
                    <CardContent>
                        <div className="rounded-md border">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-muted text-muted-foreground">
                                    <tr>
                                        <th className="px-4 py-3 font-medium">Work Order No</th>
                                        <th className="px-4 py-3 font-medium">Scheme</th>
                                        <th className="px-4 py-3 font-medium">Project Type</th>
                                        <th className="px-4 py-3 font-medium">Duration</th>
                                        <th className="px-4 py-3 font-medium">Agreement Date</th>
                                        <th className="px-4 py-3 font-medium text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {allocations.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                                                No Target Allocations found.
                                            </td>
                                        </tr>
                                    ) : (
                                        allocations.data.map((allocation: any) => (
                                            <tr key={allocation.id} className="bg-background">
                                                <td className="px-4 py-3 font-medium">{allocation.work_order_no}</td>
                                                <td className="px-4 py-3">{allocation.scheme?.name}</td>
                                                <td className="px-4 py-3">{allocation.project_type}</td>
                                                <td className="px-4 py-3 text-xs">
                                                    {formatDate(allocation.project_duration_from)} to {formatDate(allocation.project_duration_to)}
                                                </td>
                                                <td className="px-4 py-3">{formatDate(allocation.agreement_date)}</td>
                                                <td className="px-4 py-3 text-right">
                                                    <Button variant="outline" size="sm" asChild>
                                                        <Link href={`/tp/target-allocations/${allocation.id}/edit`}>
                                                            <Edit className="h-4 w-4 mr-2" />
                                                            Manage
                                                        </Link>
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {allocations.links?.length > 3 && (
                            <div className="flex items-center justify-center space-x-1 mt-4">
                                {allocations.links.map((link: any, k: number) => (
                                    <Link
                                        key={k}
                                        href={link.url || '#'}
                                        className={`px-3 py-1 text-sm border rounded ${
                                            link.active ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-muted'
                                        } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
