import { Link, useForm, router, Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { Pagination } from '@/components/pagination';
import { Plus, Search, MapPin, Mail, Phone, Edit, Trash } from 'lucide-react';
import { DeleteDialog } from '@/components/delete-dialog';
import { FormEvent, useState, useEffect } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import type { BreadcrumbItem } from '@/types/navigation';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Training Centers', href: '/tp/training-centers' },
];

export default function TrainingCentersIndex({ trainingCenters, filters }: any) {
    const [search, setSearch] = useState(filters?.search || '');
    const debouncedSearch = useDebounce(search, 300);

    useEffect(() => {
        if (debouncedSearch !== filters?.search) {
            router.get(
                '/tp/training-centers',
                { search: debouncedSearch },
                { preserveState: true, preserveScroll: true, replace: true }
            );
        }
    }, [debouncedSearch]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Training Centers" />
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Training Centers</h1>
                        <p className="text-sm text-muted-foreground">Search, filter, and manage your training centers.</p>
                    </div>
                    <Button asChild>
                        <Link href="/tp/training-centers/create">
                            <Plus className="mr-2 h-4 w-4" /> Add Training Center
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex max-w-sm w-full space-x-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Search by Name, TC ID or Email"
                                    className="pl-9"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <DataTable
                            columns={[
                                { key: 'tc_id', label: 'TC ID' },
                                { key: 'name', label: 'Center Name' },
                                { key: 'contact', label: 'Contact Details' },
                                { key: 'location', label: 'Location' },
                                { key: 'status', label: 'Status' },
                                { key: 'actions', label: 'Actions', className: 'text-right' },
                            ]}
                        >
                            {trainingCenters.data.map((tc: any) => (
                                <tr key={tc.id} className="bg-background">
                                    <td className="px-4 py-3 font-medium whitespace-nowrap">{tc.tc_id}</td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <div className="font-medium">{tc.name}</div>
                                        {tc.spoc_name && <div className="text-xs text-muted-foreground">SPOC: {tc.spoc_name}</div>}
                                    </td>
                                    <td className="px-4 py-3 space-y-1 whitespace-nowrap">
                                        <div className="flex items-center text-xs">
                                            <Mail className="mr-1.5 h-3 w-3 text-muted-foreground" />
                                            {tc.email}
                                        </div>
                                        <div className="flex items-center text-xs">
                                            <Phone className="mr-1.5 h-3 w-3 text-muted-foreground" />
                                            {tc.mobile}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <div className="flex items-center text-xs">
                                            <MapPin className="mr-1.5 h-3 w-3 text-muted-foreground shrink-0" />
                                            <span className="line-clamp-1">{tc.district?.district || 'N/A'}, {tc.state?.state || 'N/A'}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <Badge variant={tc.status ? 'default' : 'secondary'}>
                                            {tc.status ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={`/tp/training-centers/${tc.id}/edit`}>Edit</Link>
                                            </Button>
                                            <DeleteDialog
                                                onConfirm={() => router.delete(`/tp/training-centers/${tc.id}`)}
                                                title="Delete Training Center"
                                                description="Are you sure you want to delete this training center? This action cannot be undone."
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </DataTable>

                        <div className="mt-4">
                            <Pagination links={trainingCenters.links} />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
