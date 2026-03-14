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
type District = { id: number; district: string; state_id: number };
type Taluka = {
    id: number;
    taluko: string;
    state_id: number;
    district_id: number;
    status: boolean;
    state?: State;
    district?: District;
};
type Paginated<T> = { data: T[]; links: { url: string | null; label: string; active: boolean }[] };

type Props = {
    talukas: Paginated<Taluka>;
    states: State[];
    districts: District[];
    filters: {
        search?: string;
        state_id?: string;
        district_id?: string;
    };
};

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Talukas', href: '/admin/talukas' }];

const statusOptions = [
    { value: true, label: 'Active' },
    { value: false, label: 'Inactive' },
];

export default function TalukasIndex({ talukas, states, districts, filters }: Props) {
    const { data: searchData, setData: setSearchData } = useForm({
        search: filters.search ?? '',
        state_id: filters.state_id ?? '',
        district_id: filters.district_id ?? '',
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTaluka, setEditingTaluka] = useState<Taluka | null>(null);

    const { data: formData, setData: setFormData, post, put, processing, errors, reset, clearErrors } = useForm({
        state_id: '',
        district_id: '',
        taluko: '',
        status: true,
    });

    const stateOptions = useMemo(
        () => states.map((s) => ({ value: String(s.id), label: s.state })),
        [states],
    );

    const getDistrictOptions = (stateId: string) => {
        return districts
            .filter((d) => !stateId || String(d.state_id) === stateId)
            .map((d) => ({ value: String(d.id), label: d.district }));
    };

    const filterDistrictOptions = useMemo(() => getDistrictOptions(searchData.state_id), [districts, searchData.state_id]);
    const formDistrictOptions = useMemo(() => getDistrictOptions(formData.state_id), [districts, formData.state_id]);

    const onSearch = (e: FormEvent) => {
        e.preventDefault();
        router.get('/admin/talukas', searchData, {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    };

    const handleDelete = (id: number) => {
        router.delete(`/admin/talukas/${id}`, { preserveScroll: true });
    };

    const openCreateModal = () => {
        clearErrors();
        reset();
        setEditingTaluka(null);
        setIsModalOpen(true);
    };

    const openEditModal = (taluka: Taluka) => {
        clearErrors();
        setFormData({
            state_id: String(taluka.state_id),
            district_id: String(taluka.district_id),
            taluko: taluka.taluko,
            status: taluka.status,
        });
        setEditingTaluka(taluka);
        setIsModalOpen(true);
    };

    const onSubmitForm = (e: FormEvent) => {
        e.preventDefault();
        if (editingTaluka) {
            put(`/admin/talukas/${editingTaluka.id}`, {
                onSuccess: () => setIsModalOpen(false),
                preserveScroll: true,
            });
        } else {
            post('/admin/talukas', {
                onSuccess: () => setIsModalOpen(false),
                preserveScroll: true,
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Talukas" />
            <Card>
                <CardContent className="space-y-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-xl font-semibold">Talukas</h1>
                            <p className="text-sm text-muted-foreground">Manage talukas.</p>
                        </div>
                        <Button onClick={openCreateModal}>Create Taluka</Button>
                    </div>

                    <form
                        onSubmit={onSearch}
                        className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap z-10 relative"
                    >
                        <Input
                            placeholder="Search taluka"
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
                                onChange={(option) => setSearchData((prev) => ({ ...prev, state_id: option?.value ?? '', district_id: '' }))}
                                className="react-select-container"
                                classNamePrefix="react-select"
                            />
                        </div>
                        <div className="w-[200px]">
                            <Select
                                placeholder="All districts"
                                isClearable
                                options={filterDistrictOptions}
                                value={filterDistrictOptions.find((o) => o.value === searchData.district_id) || null}
                                onChange={(option) => setSearchData('district_id', option?.value ?? '')}
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
                                    setSearchData({ search: '', state_id: '', district_id: '' });
                                    router.get('/admin/talukas', {}, {
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
                            { key: 'taluka', label: 'Taluka' },
                            { key: 'district', label: 'District' },
                            { key: 'state', label: 'State' },
                            { key: 'status', label: 'Status' },
                            { key: 'actions', label: 'Actions', className: 'text-right' },
                        ]}
                    >
                        {talukas.data.map((taluka) => (
                            <tr key={taluka.id}>
                                <td className="px-4 py-3">{taluka.taluko}</td>
                                <td className="px-4 py-3">{taluka.district?.district}</td>
                                <td className="px-4 py-3">{taluka.state?.state}</td>
                                <td className="px-4 py-3">
                                    <Badge variant={taluka.status ? 'default' : 'secondary'}>
                                        {taluka.status ? 'Active' : 'Inactive'}
                                    </Badge>
                                </td>
                                <td className="px-4 py-3 text-right space-x-2">
                                    <Button variant="outline" size="sm" onClick={() => openEditModal(taluka)}>
                                        Edit
                                    </Button>
                                    <DeleteDialog onConfirm={() => handleDelete(taluka.id)} />
                                </td>
                            </tr>
                        ))}
                    </DataTable>

                    <Pagination links={talukas.links} />
                </CardContent>
            </Card>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingTaluka ? 'Edit Taluka' : 'Create Taluka'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={onSubmitForm} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="state_id">State</Label>
                            <Select
                                id="state_id"
                                placeholder="Select state"
                                options={stateOptions}
                                value={stateOptions.find((o) => o.value === formData.state_id) || null}
                                onChange={(option) => setFormData((prev) => ({ ...prev, state_id: option?.value ?? '', district_id: '' }))}
                                className="react-select-container z-50"
                                classNamePrefix="react-select"
                            />
                            <InputError message={errors.state_id} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="district_id">District</Label>
                            <Select
                                id="district_id"
                                placeholder="Select district"
                                options={formDistrictOptions}
                                value={formDistrictOptions.find((o) => o.value === formData.district_id) || null}
                                onChange={(option) => setFormData('district_id', option?.value ?? '')}
                                className="react-select-container z-40"
                                classNamePrefix="react-select"
                            />
                            <InputError message={errors.district_id} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="taluko">Taluka Name</Label>
                            <Input
                                id="taluko"
                                value={formData.taluko}
                                onChange={(e) => setFormData('taluko', e.target.value)}
                                placeholder="Enter taluka name"
                                required
                            />
                            <InputError message={errors.taluko} />
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
                            <Button type="submit" disabled={processing}>{editingTaluka ? 'Update' : 'Create'}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
