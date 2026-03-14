import { FormEvent, useState, useMemo } from 'react';
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

type State = { id: number; state: string };

type Scheme = {
    id: number;
    name: string;
    code?: string | null;
    logo?: string | null;
    state_id: number;
    status: boolean;
    state?: State;
};

type Paginated<T> = {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
};

type Props = {
    schemes: Paginated<Scheme>;
    states: State[];
    filters: {
        search?: string;
        state_id?: string;
    };
};

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Schemes', href: '/admin/schemes' }];

const statusOptions = [
    { value: true, label: 'Active' },
    { value: false, label: 'Inactive' },
];

export default function SchemesIndex({ schemes, states, filters }: Props) {
    const { data: searchData, setData: setSearchData } = useForm({
        search: filters.search ?? '',
        state_id: filters.state_id ?? '',
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingScheme, setEditingScheme] = useState<Scheme | null>(null);

    const { data: formData, setData: setFormData, post, put, processing, errors, reset, clearErrors } = useForm({
        state_id: '',
        name: '',
        code: '',
        logo: null as File | null,
        status: true,
    });

    const stateOptions = useMemo(
        () => states.map((s) => ({ value: String(s.id), label: s.state })),
        [states],
    );

    const onSearch = (e: FormEvent) => {
        e.preventDefault();
        router.get('/admin/schemes', searchData, {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    };

    const handleDelete = (id: number) => {
        router.delete(`/admin/schemes/${id}`, { preserveScroll: true });
    };

    const openCreateModal = () => {
        clearErrors();
        reset();
        setEditingScheme(null);
        setIsModalOpen(true);
    };

    const openEditModal = (scheme: Scheme) => {
        clearErrors();
        setFormData({
            state_id: String(scheme.state_id),
            name: scheme.name,
            code: scheme.code ?? '',
            logo: null,
            status: scheme.status,
        });
        setEditingScheme(scheme);
        setIsModalOpen(true);
    };

    const onSubmitForm = (e: FormEvent) => {
        e.preventDefault();
        const options = {
            forceFormData: true,
            onSuccess: () => setIsModalOpen(false),
            preserveScroll: true,
        };

        if (editingScheme) {
            put(`/admin/schemes/${editingScheme.id}`, options);
        } else {
            post('/admin/schemes', options);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Schemes" />
            <Card>
                <CardContent className="space-y-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-xl font-semibold">Schemes</h1>
                            <p className="text-sm text-muted-foreground">Manage schemes.</p>
                        </div>
                        <Button onClick={openCreateModal}>Create Scheme</Button>
                    </div>

                    <form
                        onSubmit={onSearch}
                        className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap z-10 relative"
                    >
                        <Input
                            placeholder="Search by name/code"
                            value={searchData.search}
                            onChange={(e) => setSearchData('search', e.target.value)}
                            className="sm:max-w-xs"
                        />
                        <div className="w-[200px]">
                            <Select
                                placeholder="All states"
                                isClearable
                                options={stateOptions}
                                value={stateOptions.find((o) => o.value === searchData.state_id) || null}
                                onChange={(option) => setSearchData('state_id', option?.value ?? '')}
                                className="react-select-container"
                                classNamePrefix="react-select"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button type="submit">Search</Button>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => {
                                    setSearchData((prev) => ({ ...prev, search: '', state_id: '' }));
                                    router.get('/admin/schemes', {}, { preserveScroll: true, replace: true });
                                }}
                            >
                                Reset
                            </Button>
                        </div>
                    </form>

                    <DataTable
                        columns={[
                            { key: 'name', label: 'Scheme' },
                            { key: 'code', label: 'Code' },
                            { key: 'state', label: 'State' },
                            { key: 'status', label: 'Status' },
                            { key: 'actions', label: 'Actions', className: 'text-right' },
                        ]}
                    >
                        {schemes.data.map((scheme) => (
                            <tr key={scheme.id}>
                                <td className="px-4 py-3">{scheme.name}</td>
                                <td className="px-4 py-3">{scheme.code || '-'}</td>
                                <td className="px-4 py-3">{scheme.state?.state}</td>
                                <td className="px-4 py-3">
                                    <Badge variant={scheme.status ? 'default' : 'secondary'}>
                                        {scheme.status ? 'Active' : 'Inactive'}
                                    </Badge>
                                </td>
                                <td className="px-4 py-3 text-right space-x-2">
                                    <Button variant="outline" size="sm" onClick={() => openEditModal(scheme)}>
                                        Edit
                                    </Button>
                                    <DeleteDialog onConfirm={() => handleDelete(scheme.id)} />
                                </td>
                            </tr>
                        ))}
                    </DataTable>

                    <Pagination links={schemes.links} />
                </CardContent>
            </Card>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingScheme ? 'Edit Scheme' : 'Create Scheme'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={onSubmitForm} className="space-y-4" encType="multipart/form-data">
                        <div className="space-y-2">
                            <Label htmlFor="state_id">State</Label>
                            <Select
                                id="state_id"
                                placeholder="Select state"
                                options={stateOptions}
                                value={stateOptions.find((o) => o.value === formData.state_id) || null}
                                onChange={(option) => setFormData('state_id', option?.value ?? '')}
                                className="react-select-container z-50"
                                classNamePrefix="react-select"
                            />
                            <InputError message={errors.state_id} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="name">Scheme Name</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData('name', e.target.value)}
                                placeholder="Enter scheme name"
                                required
                            />
                            <InputError message={errors.name} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="code">Code</Label>
                            <Input
                                id="code"
                                value={formData.code}
                                onChange={(e) => setFormData('code', e.target.value)}
                                placeholder="Code (optional)"
                            />
                            <InputError message={errors.code} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="logo">Logo</Label>
                            <Input
                                id="logo"
                                type="file"
                                accept="image/*"
                                onChange={(e) => setFormData('logo', e.target.files?.[0] ?? null)}
                            />
                            {editingScheme?.logo && (
                                <p className="text-xs text-muted-foreground mt-1">Current: {editingScheme.logo}</p>
                            )}
                            <InputError message={errors.logo} />
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
                            <Button type="submit" disabled={processing}>{editingScheme ? 'Update' : 'Create'}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
