import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Pagination } from '@/components/pagination';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { DeleteDialog } from '@/components/delete-dialog';
import type { BreadcrumbItem } from '@/types/navigation';
import { useDebounce } from '@/hooks/use-debounce';
import { useState, useEffect } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Trainers', href: '/tp/trainers' },
];

export default function TrainersIndex({ trainers, filters }: any) {
    const [search, setSearch] = useState(filters?.search || '');
    const debouncedSearch = useDebounce(search, 300);

    useEffect(() => {
        if (debouncedSearch !== filters?.search) {
            router.get(
                '/tp/trainers',
                { search: debouncedSearch },
                { preserveState: true, preserveScroll: true, replace: true }
            );
        }
    }, [debouncedSearch]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Trainers Master" />

            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Trainers Master</h1>
                        <p className="text-sm text-muted-foreground">
                            Manage your training center's trainers.
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/tp/trainers/create">
                            <Plus className="mr-2 h-4 w-4" /> Add Trainer
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex justify-between items-center">
                            <CardTitle>All Trainers</CardTitle>
                            <div className="relative w-64">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search trainers..."
                                    className="pl-8"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <DataTable
                            columns={[
                                { key: 'photo', label: 'Photo' },
                                { key: 'name', label: 'Trainer Name' },
                                { key: 'training_center', label: 'Training Center' },
                                { key: 'trainer_id', label: 'Trainer ID' },
                                { key: 'gtr_id', label: 'GTR ID' },
                                { key: 'aadhaar_pan', label: 'Aadhaar / PAN' },
                                { key: 'contact', label: 'Contact' },
                                { key: 'status', label: 'Status' },
                                { key: 'actions', label: 'Actions', className: 'text-right' },
                            ]}
                        >
                            {trainers.data.map((trainer: any) => (
                                <tr key={trainer.id} className="bg-background">
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        {trainer.photo ? (
                                            <img src={`/storage/${trainer.photo}`} alt={trainer.name} className="h-10 w-10 rounded-full object-cover border" />
                                        ) : (
                                            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center border text-xs text-muted-foreground">
                                                N/A
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 font-medium whitespace-nowrap">{trainer.name}</td>
                                    <td className="px-4 py-3 whitespace-nowrap">{trainer.training_center?.name}</td>
                                    <td className="px-4 py-3 whitespace-nowrap">{trainer.trainer_id}</td>
                                    <td className="px-4 py-3 whitespace-nowrap">{trainer.gtr_id}</td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <div className="text-xs">
                                            <div>Aadhaar: <span className="font-medium">{trainer.aadhaar_number}</span></div>
                                            <div>PAN: <span className="font-medium">{trainer.pan_number}</span></div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <div className="text-xs">
                                            <div>Mobile: {trainer.mobile}</div>
                                            {trainer.email && <div>Email: {trainer.email}</div>}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <Badge variant={trainer.status ? 'default' : 'secondary'}>
                                            {trainer.status ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-right whitespace-nowrap">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" asChild>
                                                <Link href={`/tp/trainers/${trainer.id}/edit`}>
                                                    <Edit className="h-4 w-4 text-blue-600" />
                                                </Link>
                                            </Button>
                                            <DeleteDialog
                                                onConfirm={() => router.delete(`/tp/trainers/${trainer.id}`)}
                                                title="Delete Trainer"
                                                description="Are you sure you want to delete this trainer? This action cannot be undone."
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </DataTable>

                        <div className="mt-4">
                            <Pagination links={trainers.links} />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
