import { FormEvent, useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Select from 'react-select';
import { Pagination } from '@/components/pagination';
import type { BreadcrumbItem } from '@/types/navigation';

type StateOption = { id: number; state: string };
type DistrictOption = { id: number; district: string; state_id: number };

type Partner = {
    id: number;
    tp_id: string;
    sip_id?: string | null;
    tp_name: string;
    mobile: string;
    email: string;
    state?: { id: number; state: string } | null;
    district?: { id: number; district: string } | null;
    status: boolean;
};

type Paginated<T> = {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
};

type Props = {
    partners: Paginated<Partner>;
    filters: {
        search?: string;
        state_id?: number | '';
        district_id?: number | '';
    };
    states: StateOption[];
    districts: DistrictOption[];
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Training Partners', href: '/admin/training-partners' },
];

export default function TrainingPartnersIndex({ partners, filters, states, districts }: Props) {
    const { data: filterData, setData: setFilterData } = useForm({
        search: filters.search ?? '',
        state_id: filters.state_id ?? '',
        district_id: filters.district_id ?? '',
    });

    const [stateOptions] = useState(states.map((s) => ({ value: s.id, label: s.state })));
    const districtOptions = districts
        .filter((d) => !filterData.state_id || d.state_id === Number(filterData.state_id))
        .map((d) => ({ value: d.id, label: d.district }));

    const onSearch = (e: FormEvent) => {
        e.preventDefault();
        router.get('/admin/training-partners', filterData, {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    };

    const handleDelete = (id: number) => {
        if (!confirm('Delete this Training Partner?')) return;
        router.delete(`/admin/training-partners/${id}`, { preserveScroll: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs} className="p-6">
            <Head title="Training Partners" />
            <Card className="">
                <CardContent className="space-y-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-xl font-semibold">Training Partners</h1>
                            <p className="text-sm text-muted-foreground">Search, filter, and manage training partners.</p>
                        </div>
                        <Button asChild>
                            <a href="/admin/training-partners/create">Add Training Partner</a>
                        </Button>
                    </div>

                    {/* <form onSubmit={onSearch} className="grid gap-3 md:grid-cols-[1fr,220px,220px,auto] md:items-center"> */}
                    <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                        <div className="space-y-2"> 
                        <Input
                            placeholder="Search TP ID / SIP / Name"
                            value={filterData.search}
                            onChange={(e) => setFilterData('search', e.target.value)}
                        />
                        </div>
                        <div className="space-y-2">
                        <Select
                            options={stateOptions}
                            value={stateOptions.find((o) => o.value === Number(filterData.state_id)) ?? null}
                            onChange={(option) => {
                                setFilterData('state_id', option?.value ?? '');
                                setFilterData('district_id', '');
                            }}
                            className="react-select-container"
                            classNamePrefix="react-select"
                            placeholder="Filter by state"
                            isClearable
                        />
                        </div>
                        <div className="space-y-2">
                        <Select
                            options={districtOptions}
                            value={districtOptions.find((o) => o.value === Number(filterData.district_id)) ?? null}
                            onChange={(option) => setFilterData('district_id', option?.value ?? '')}
                            className="react-select-container"
                            classNamePrefix="react-select"
                            placeholder="Filter by district"
                            isClearable
                        />
                        </div>
                        <div className="flex gap-2">
                            <Button type="submit">Search</Button>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => {
                                    setFilterData({ search: '', state_id: '', district_id: '' });
                                    router.get('/admin/training-partners', {}, {
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
                            { key: 'tp_id', label: 'TP ID' },
                            { key: 'sip_id', label: 'SIP ID' },
                            { key: 'tp_name', label: 'TP Name' },
                            { key: 'mobile', label: 'Mobile' },
                            { key: 'email', label: 'Email' },
                            { key: 'state', label: 'State' },
                            { key: 'district', label: 'District' },
                            { key: 'status', label: 'Status' },
                            { key: 'actions', label: 'Actions', className: 'text-right' },
                        ]}
                    >
                        {partners.data.map((tp) => (
                            <tr key={tp.id}>
                                <td className="px-4 py-3 whitespace-nowrap">{tp.tp_id}</td>
                                <td className="px-4 py-3 whitespace-nowrap">{tp.sip_id ?? '-'}</td>
                                <td className="px-4 py-3 whitespace-nowrap">{tp.tp_name}</td>
                                <td className="px-4 py-3 whitespace-nowrap">{tp.mobile}</td>
                                <td className="px-4 py-3 whitespace-nowrap">{tp.email}</td>
                                <td className="px-4 py-3 whitespace-nowrap">{tp.state?.state ?? '-'}</td>
                                <td className="px-4 py-3 whitespace-nowrap">{tp.district?.district ?? '-'}</td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                    <Badge variant={tp.status ? 'default' : 'secondary'}>{tp.status ? 'Active' : 'Inactive'}</Badge>
                                </td>
                                <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                                    <Button variant="outline" size="sm" asChild>
                                        <a href={`/admin/training-partners/${tp.id}/edit`}>Edit</a>
                                    </Button>
                                    <Button variant="destructive" size="sm" onClick={() => handleDelete(tp.id)}>
                                        Delete
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </DataTable>

                    <Pagination links={partners.links} />
                </CardContent>
            </Card>
        </AppLayout>
    );
}
