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
type District = { id: number; state_id: number; district: string; status: boolean; state?: State };
type Paginated<T> = { data: T[]; links: { url: string | null; label: string; active: boolean }[] };

type Props = {
    districts: Paginated<District>;
    states: State[];
    filters: {
        search?: string;
        state_id?: string;
    };
};

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Districts', href: '/admin/districts' }];

const statusOptions = [
    { value: true, label: 'Active' },
    { value: false, label: 'Inactive' },
];

export default function DistrictsIndex({ districts, states, filters }: Props) {
    const { data: searchData, setData: setSearchData } = useForm({
        search: filters.search ?? '',
        state_id: filters.state_id ?? '',
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDistrict, setEditingDistrict] = useState<District | null>(null);

    const { data: formData, setData: setFormData, post, put, processing, errors, reset, clearErrors } = useForm({
        state_id: '',
        district: '',
        status: true,
    });

    const stateOptions = useMemo(
        () => states.map((s) => ({ value: String(s.id), label: s.state })),
        [states],
    );

    const onSearch = (e: FormEvent) => {
        e.preventDefault();
        router.get('/admin/districts', searchData, {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    };

    const handleDelete = (id: number) => {
        router.delete(`/admin/districts/${id}`, { preserveScroll: true });
    };

    const openCreateModal = () => {
        clearErrors();
        reset();
        setEditingDistrict(null);
        setIsModalOpen(true);
    };

    const openEditModal = (district: District) => {
        clearErrors();
        setFormData({
            state_id: String(district.state_id),
            district: district.district,
            status: district.status,
        });
        setEditingDistrict(district);
        setIsModalOpen(true);
    };

    const onSubmitForm = (e: FormEvent) => {
        e.preventDefault();
        if (editingDistrict) {
            put(`/admin/districts/${editingDistrict.id}`, {
                onSuccess: () => setIsModalOpen(false),
                preserveScroll: true,
            });
        } else {
            post('/admin/districts', {
                onSuccess: () => setIsModalOpen(false),
                preserveScroll: true,
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Districts" />
            <Card>
                <CardContent className="space-y-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-xl font-semibold">Districts</h1>
                            <p className="text-sm text-muted-foreground">Manage districts.</p>
                        </div>
                        <Button onClick={openCreateModal}>Create District</Button>
                    </div>

                    <form
                        onSubmit={onSearch}
                        className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap z-10 relative"
                    >
                        <Input
                            placeholder="Search district"
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
                                    router.get('/admin/districts', {}, {
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
                            { key: 'district', label: 'District' },
                            { key: 'state', label: 'State' },
                            { key: 'status', label: 'Status' },
                            { key: 'actions', label: 'Actions', className: 'text-right' },
                        ]}
                    >
                        {districts.data.map((district) => (
                            <tr key={district.id}>
                                <td className="px-4 py-3">{district.district}</td>
                                <td className="px-4 py-3">{district.state?.state}</td>
                                <td className="px-4 py-3">
                                    <Badge variant={district.status ? 'default' : 'secondary'}>
                                        {district.status ? 'Active' : 'Inactive'}
                                    </Badge>
                                </td>
                                <td className="px-4 py-3 text-right space-x-2">
                                    <Button variant="outline" size="sm" onClick={() => openEditModal(district)}>
                                        Edit
                                    </Button>
                                    <DeleteDialog onConfirm={() => handleDelete(district.id)} />
                                </td>
                            </tr>
                        ))}
                    </DataTable>

                    <Pagination links={districts.links} />
                </CardContent>
            </Card>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingDistrict ? 'Edit District' : 'Create District'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={onSubmitForm} className="space-y-4">
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
                            <Label htmlFor="district">District Name</Label>
                            <Input
                                id="district"
                                value={formData.district}
                                onChange={(e) => setFormData('district', e.target.value)}
                                placeholder="Enter district name"
                                required
                            />
                            <InputError message={errors.district} />
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
                            <Button type="submit" disabled={processing}>{editingDistrict ? 'Update' : 'Create'}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
