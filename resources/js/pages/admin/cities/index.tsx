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
type Taluka = { id: number; taluko: string; state_id: number; district_id: number };
type City = {
    id: number;
    city: string;
    state_id: number;
    district_id: number;
    taluka_id: number;
    status: boolean;
    state?: State;
    district?: District;
    taluka?: Taluka;
};
type Paginated<T> = { data: T[]; links: { url: string | null; label: string; active: boolean }[] };

type Props = {
    cities: Paginated<City>;
    states: State[];
    districts: District[];
    talukas: Taluka[];
    filters: {
        search?: string;
        state_id?: string;
        district_id?: string;
        taluka_id?: string;
    };
};

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Cities', href: '/admin/cities' }];

const statusOptions = [
    { value: true, label: 'Active' },
    { value: false, label: 'Inactive' },
];

export default function CitiesIndex({ cities, states, districts, talukas, filters }: Props) {
    const { data: searchData, setData: setSearchData } = useForm({
        search: filters.search ?? '',
        state_id: filters.state_id ?? '',
        district_id: filters.district_id ?? '',
        taluka_id: filters.taluka_id ?? '',
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCity, setEditingCity] = useState<City | null>(null);

    const { data: formData, setData: setFormData, post, put, processing, errors, reset, clearErrors } = useForm({
        state_id: '',
        district_id: '',
        taluka_id: '',
        city: '',
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

    const getTalukaOptions = (stateId: string, districtId: string) => {
        return talukas
            .filter(
                (t) =>
                    (!stateId || String(t.state_id) === stateId) &&
                    (!districtId || String(t.district_id) === districtId),
            )
            .map((t) => ({ value: String(t.id), label: t.taluko }));
    };

    const filterDistrictOptions = useMemo(() => getDistrictOptions(searchData.state_id), [districts, searchData.state_id]);
    const filterTalukaOptions = useMemo(() => getTalukaOptions(searchData.state_id, searchData.district_id), [talukas, searchData.state_id, searchData.district_id]);

    const formDistrictOptions = useMemo(() => getDistrictOptions(formData.state_id), [districts, formData.state_id]);
    const formTalukaOptions = useMemo(() => getTalukaOptions(formData.state_id, formData.district_id), [talukas, formData.state_id, formData.district_id]);

    const onSearch = (e: FormEvent) => {
        e.preventDefault();
        router.get('/admin/cities', searchData, {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    };

    const handleDelete = (id: number) => {
        router.delete(`/admin/cities/${id}`, { preserveScroll: true });
    };

    const openCreateModal = () => {
        clearErrors();
        reset();
        setEditingCity(null);
        setIsModalOpen(true);
    };

    const openEditModal = (city: City) => {
        clearErrors();
        setFormData({
            state_id: String(city.state_id),
            district_id: String(city.district_id),
            taluka_id: String(city.taluka_id),
            city: city.city,
            status: city.status,
        });
        setEditingCity(city);
        setIsModalOpen(true);
    };

    const onSubmitForm = (e: FormEvent) => {
        e.preventDefault();
        if (editingCity) {
            put(`/admin/cities/${editingCity.id}`, {
                onSuccess: () => setIsModalOpen(false),
                preserveScroll: true,
            });
        } else {
            post('/admin/cities', {
                onSuccess: () => setIsModalOpen(false),
                preserveScroll: true,
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Cities" />
            <Card>
                <CardContent className="space-y-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-xl font-semibold">Cities</h1>
                            <p className="text-sm text-muted-foreground">Manage cities.</p>
                        </div>
                        <Button onClick={openCreateModal}>Create City</Button>
                    </div>

                    <form
                        onSubmit={onSearch}
                        className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap z-10 relative"
                    >
                        <Input
                            placeholder="Search city"
                            value={searchData.search}
                            onChange={(e) => setSearchData('search', e.target.value)}
                            className="sm:max-w-xs"
                        />
                        <div className="w-[180px]">
                            <Select
                                placeholder="All states"
                                isClearable
                                options={stateOptions}
                                value={stateOptions.find((o) => o.value === searchData.state_id) || null}
                                onChange={(option) => setSearchData({ ...searchData, state_id: option?.value ?? '', district_id: '', taluka_id: '' })}
                                className="react-select-container"
                                classNamePrefix="react-select"
                            />
                        </div>
                        <div className="w-[180px]">
                            <Select
                                placeholder="All districts"
                                isClearable
                                options={filterDistrictOptions}
                                value={filterDistrictOptions.find((o) => o.value === searchData.district_id) || null}
                                onChange={(option) => setSearchData({ ...searchData, district_id: option?.value ?? '', taluka_id: '' })}
                                className="react-select-container"
                                classNamePrefix="react-select"
                            />
                        </div>
                        <div className="w-[180px]">
                            <Select
                                placeholder="All talukas"
                                isClearable
                                options={filterTalukaOptions}
                                value={filterTalukaOptions.find((o) => o.value === searchData.taluka_id) || null}
                                onChange={(option) => setSearchData('taluka_id', option?.value ?? '')}
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
                                    setSearchData({ search: '', state_id: '', district_id: '', taluka_id: '' });
                                    router.get('/admin/cities', {}, { preserveScroll: true, replace: true });
                                }}
                            >
                                Reset
                            </Button>
                        </div>
                    </form>

                    <DataTable
                        columns={[
                            { key: 'city', label: 'City' },
                            { key: 'taluka', label: 'Taluka' },
                            { key: 'district', label: 'District' },
                            { key: 'state', label: 'State' },
                            { key: 'status', label: 'Status' },
                            { key: 'actions', label: 'Actions', className: 'text-right' },
                        ]}
                    >
                        {cities.data.map((city) => (
                            <tr key={city.id}>
                                <td className="px-4 py-3">{city.city}</td>
                                <td className="px-4 py-3">{city.taluka?.taluko}</td>
                                <td className="px-4 py-3">{city.district?.district}</td>
                                <td className="px-4 py-3">{city.state?.state}</td>
                                <td className="px-4 py-3">
                                    <Badge variant={city.status ? 'default' : 'secondary'}>
                                        {city.status ? 'Active' : 'Inactive'}
                                    </Badge>
                                </td>
                                <td className="px-4 py-3 text-right space-x-2">
                                    <Button variant="outline" size="sm" onClick={() => openEditModal(city)}>
                                        Edit
                                    </Button>
                                    <DeleteDialog onConfirm={() => handleDelete(city.id)} />
                                </td>
                            </tr>
                        ))}
                    </DataTable>

                    <Pagination links={cities.links} />
                </CardContent>
            </Card>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingCity ? 'Edit City' : 'Create City'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={onSubmitForm} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="state_id">State</Label>
                            <Select
                                id="state_id"
                                placeholder="Select state"
                                options={stateOptions}
                                value={stateOptions.find((o) => o.value === formData.state_id) || null}
                                onChange={(option) => setFormData({ ...formData, state_id: option?.value ?? '', district_id: '', taluka_id: '' })}
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
                                onChange={(option) => setFormData({ ...formData, district_id: option?.value ?? '', taluka_id: '' })}
                                className="react-select-container z-40"
                                classNamePrefix="react-select"
                            />
                            <InputError message={errors.district_id} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="taluka_id">Taluka</Label>
                            <Select
                                id="taluka_id"
                                placeholder="Select taluka"
                                options={formTalukaOptions}
                                value={formTalukaOptions.find((o) => o.value === formData.taluka_id) || null}
                                onChange={(option) => setFormData('taluka_id', option?.value ?? '')}
                                className="react-select-container z-30"
                                classNamePrefix="react-select"
                            />
                            <InputError message={errors.taluka_id} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="city">City Name</Label>
                            <Input
                                id="city"
                                value={formData.city}
                                onChange={(e) => setFormData('city', e.target.value)}
                                placeholder="Enter city name"
                                required
                            />
                            <InputError message={errors.city} />
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
                            <Button type="submit" disabled={processing}>{editingCity ? 'Update' : 'Create'}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
