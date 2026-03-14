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
import Select from 'react-select';
import type { BreadcrumbItem } from '@/types/navigation';

type State = {
    id: number;
    state: string;
    status: boolean;
};

type Paginated<T> = {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
};

type Props = {
    states: Paginated<State>;
    filters: {
        search?: string;
    };
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'States', href: '/admin/states' },
];

const statusOptions = [
    { value: true, label: 'Active' },
    { value: false, label: 'Inactive' },
];

export default function StatesIndex({ states, filters }: Props) {
    const { data: searchData, setData: setSearchData } = useForm({
        search: filters.search ?? '',
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingState, setEditingState] = useState<State | null>(null);

    const { data: formData, setData: setFormData, post, put, processing, errors, reset, clearErrors } = useForm({
        state: '',
        status: true,
    });

    const onSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/admin/states', searchData, {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    };

    const handleDelete = (id: number) => {
        if (!confirm('Delete this state?')) return;
        router.delete(`/admin/states/${id}`, { preserveScroll: true });
    };

    const openCreateModal = () => {
        clearErrors();
        reset();
        setEditingState(null);
        setIsModalOpen(true);
    };

    const openEditModal = (state: State) => {
        clearErrors();
        setFormData({ state: state.state, status: state.status });
        setEditingState(state);
        setIsModalOpen(true);
    };

    const onSubmitForm = (e: FormEvent) => {
        e.preventDefault();
        if (editingState) {
            put(`/admin/states/${editingState.id}`, {
                onSuccess: () => setIsModalOpen(false),
                preserveScroll: true,
            });
        } else {
            post('/admin/states', {
                onSuccess: () => setIsModalOpen(false),
                preserveScroll: true,
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="States" />
            <Card>
                <CardContent className="space-y-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-xl font-semibold">States</h1>
                            <p className="text-sm text-muted-foreground">Manage states.</p>
                        </div>
                        <Button onClick={openCreateModal}>Create State</Button>
                    </div>

                    <form onSubmit={onSearch} className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <Input
                            placeholder="Search state"
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
                                    router.get('/admin/states', {}, {
                                        preserveScroll: true,
                                        replace: true,
                                    });
                                }}
                            >
                                Reset
                            </Button>
                        </div>
                    </form>

                    <DataTable
                        columns={[
                            { key: 'state', label: 'State' },
                            { key: 'status', label: 'Status' },
                            { key: 'actions', label: 'Actions', className: 'text-right' },
                        ]}
                    >
                        {states.data.map((state) => (
                            <tr key={state.id}>
                                <td className="px-4 py-3">{state.state}</td>
                                <td className="px-4 py-3">
                                    <Badge variant={state.status ? 'default' : 'secondary'}>
                                        {state.status ? 'Active' : 'Inactive'}
                                    </Badge>
                                </td>
                                <td className="px-4 py-3 text-right space-x-2">
                                    <Button variant="outline" size="sm" onClick={() => openEditModal(state)}>
                                        Edit
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => handleDelete(state.id)}
                                    >
                                        Delete
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </DataTable>

                    <Pagination links={states.links} />
                </CardContent>
            </Card>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingState ? 'Edit State' : 'Create State'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={onSubmitForm} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="state">State Name</Label>
                            <Input
                                id="state"
                                value={formData.state}
                                onChange={(e) => setFormData('state', e.target.value)}
                                placeholder="Enter state name"
                                required
                            />
                            <InputError message={errors.state} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select
                                id="status"
                                options={statusOptions}
                                value={statusOptions.find(o => o.value === formData.status)}
                                onChange={(option) => setFormData('status', option?.value ?? true)}
                                className="react-select-container"
                                classNamePrefix="react-select"
                            />
                            <InputError message={errors.status} />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={processing}>{editingState ? 'Update' : 'Create'}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
