import { FormEvent, useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { Pagination } from '@/components/pagination';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import InputError from '@/components/input-error';
import { DeleteDialog } from '@/components/delete-dialog';
import Select from 'react-select';
import type { BreadcrumbItem } from '@/types/navigation';

type Sector = {
    id: number;
    name: string;
    level?: string | null;
    status: boolean;
};

type Paginated<T> = {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
};

type Props = {
    sectors: Paginated<Sector>;
    filters: {
        search?: string;
    };
};

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Sectors', href: '/admin/sectors' }];

const statusOptions = [
    { value: true, label: 'Active' },
    { value: false, label: 'Inactive' },
];

export default function SectorsIndex({ sectors, filters }: Props) {
    const { data: searchData, setData: setSearchData } = useForm({
        search: filters.search ?? '',
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSector, setEditingSector] = useState<Sector | null>(null);

    const { data: formData, setData: setFormData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        level: '',
        status: true,
    });

    const onSearch = (e: FormEvent) => {
        e.preventDefault();
        router.get('/admin/sectors', searchData, {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    };

    const handleDelete = (id: number) => {
        router.delete(`/admin/sectors/${id}`, { preserveScroll: true });
    };

    const openCreateModal = () => {
        clearErrors();
        reset();
        setEditingSector(null);
        setIsModalOpen(true);
    };

    const openEditModal = (sector: Sector) => {
        clearErrors();
        setFormData({
            name: sector.name,
            level: sector.level ?? '',
            status: sector.status,
        });
        setEditingSector(sector);
        setIsModalOpen(true);
    };

    const onSubmitForm = (e: FormEvent) => {
        e.preventDefault();
        if (editingSector) {
            put(`/admin/sectors/${editingSector.id}`, {
                onSuccess: () => setIsModalOpen(false),
                preserveScroll: true,
            });
        } else {
            post('/admin/sectors', {
                onSuccess: () => setIsModalOpen(false),
                preserveScroll: true,
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Sectors" />
            <Card>
                <CardContent className="space-y-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-xl font-semibold">Sectors</h1>
                            <p className="text-sm text-muted-foreground">Manage sectors.</p>
                        </div>
                        <Button onClick={openCreateModal}>Create Sector</Button>
                    </div>

                    <form onSubmit={onSearch} className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <Input
                            placeholder="Search sector"
                            value={searchData.search}
                            onChange={(e) => setSearchData('search', e.target.value)}
                            className="sm:max-w-xs"
                        />
                        <div className="flex gap-2">
                            <Button type="submit">Search</Button>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => {
                                    setSearchData('search', '');
                                    router.get('/admin/sectors', {}, { preserveScroll: true, replace: true });
                                }}
                            >
                                Reset
                            </Button>
                        </div>
                    </form>

                    <DataTable
                        columns={[
                            { key: 'name', label: 'Sector' },
                            { key: 'level', label: 'Level' },
                            { key: 'status', label: 'Status' },
                            { key: 'actions', label: 'Actions', className: 'text-right' },
                        ]}
                    >
                        {sectors.data.map((sector) => (
                            <tr key={sector.id}>
                                <td className="px-4 py-3">{sector.name}</td>
                                <td className="px-4 py-3">{sector.level ?? '-'}</td>
                                <td className="px-4 py-3">
                                    <Badge variant={sector.status ? 'default' : 'secondary'}>
                                        {sector.status ? 'Active' : 'Inactive'}
                                    </Badge>
                                </td>
                                <td className="px-4 py-3 text-right space-x-2">
                                    <Button variant="outline" size="sm" onClick={() => openEditModal(sector)}>
                                        Edit
                                    </Button>
                                    <DeleteDialog onConfirm={() => handleDelete(sector.id)} />
                                </td>
                            </tr>
                        ))}
                    </DataTable>

                    <Pagination links={sectors.links} />
                </CardContent>
            </Card>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingSector ? 'Edit Sector' : 'Create Sector'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={onSubmitForm} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Sector Name</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData('name', e.target.value)}
                                placeholder="Enter sector name"
                                required
                            />
                            <InputError message={errors.name} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="level">Level</Label>
                            <Input
                                id="level"
                                value={formData.level}
                                onChange={(e) => setFormData('level', e.target.value)}
                                placeholder="Level (optional)"
                            />
                            <InputError message={errors.level} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select
                                id="status"
                                options={statusOptions}
                                value={statusOptions.find((o) => o.value === formData.status)}
                                onChange={(option) => setFormData('status', option?.value ?? true)}
                                className="react-select-container"
                                classNamePrefix="react-select"
                            />
                            <InputError message={errors.status} />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={processing}>{editingSector ? 'Update' : 'Create'}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
