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
import { Download, Upload, Edit } from 'lucide-react';
import type { BreadcrumbItem } from '@/types/navigation';

type Sector = { id: number; name: string };

type JobRole = {
    id: number;
    name: string;
    qp_code?: string | null;
    qp_version?: string | null;
    nsqf_level?: string | null;
    category?: string | null;
    training_hours?: number | null;
    ojt_hours?: number | null;
    total_hours?: number | null;
    cost_per_hour?: number | null;
    expiry_date?: string | null;
    syllabus_file?: string | null;
    sector_id: number;
    status: boolean;
    sector?: Sector;
};

type Paginated<T> = {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
};

type Props = {
    jobRoles: Paginated<JobRole>;
    sectors: Sector[];
    filters: {
        search?: string;
        sector_id?: string;
    };
};

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Job Roles', href: '/admin/job-roles' }];

const statusOptions = [
    { value: true, label: 'Active' },
    { value: false, label: 'Inactive' },
];

const categoryLevelOptions = [
    { value: 1, label: 'Category I' },
    { value: 2, label: 'Category II' },
    { value: 3, label: 'Category III' },
];

export default function JobRolesIndex({ jobRoles, sectors, filters }: Props) {
    const { data: searchData, setData: setSearchData } = useForm({
        search: filters.search ?? '',
        sector_id: filters.sector_id ?? '',
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingJobRole, setEditingJobRole] = useState<JobRole | null>(null);
    const [isSyllabusModalOpen, setIsSyllabusModalOpen] = useState(false);
    const [syllabusJobRole, setSyllabusJobRole] = useState<JobRole | null>(null);

    const { data: formData, setData: setFormData, post, put, processing, errors, reset, clearErrors } = useForm({
        sector_id: '',
        name: '',
        qp_code: '',
        qp_version: '',
        nsqf_level: '',
        category: '',
        training_hours: '',
        ojt_hours: '',
        total_hours: '',
        cost_per_hour: '',
        expiry_date: '',
        syllabus_file: null as File | null,
        status: true,
    });

    const { data: syllabusData, setData: setSyllabusData, post: postSyllabus, processing: syllabusProcessing } = useForm({
        syllabus_file: null as File | null,
    });

    // Auto-calculate total hours when training_hours or ojt_hours change
    const calculateTotalHours = (trainingHours: string, ojtHours: string) => {
        const training = parseFloat(trainingHours) || 0;
        const ojt = parseFloat(ojtHours) || 0;
        return (training + ojt).toString();
    };

    const updateFormData = (field: keyof typeof formData, value: string) => {
        setFormData(field, value);
        
        // Auto-calculate total hours when training_hours or ojt_hours change
        if (field === 'training_hours' || field === 'ojt_hours') {
            const trainingHours = field === 'training_hours' ? value : formData.training_hours;
            const ojtHours = field === 'ojt_hours' ? value : formData.ojt_hours;
            const total = calculateTotalHours(trainingHours, ojtHours);
            setFormData('total_hours', total);
        }
    };

    const sectorOptions = useMemo(
        () => sectors.map((s) => ({ value: String(s.id), label: s.name })),
        [sectors],
    );

    const onSearch = (e: FormEvent) => {
        e.preventDefault();
        router.get('/admin/job-roles', searchData, {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    };

    const handleDelete = (id: number) => {
        router.delete(`/admin/job-roles/${id}`, { preserveScroll: true });
    };

    const openCreateModal = () => {
        clearErrors();
        reset();
        setEditingJobRole(null);
        setIsModalOpen(true);
    };

    const openEditModal = (jobRole: JobRole) => {
        clearErrors();
        const trainingHours = jobRole.training_hours?.toString() ?? '';
        const ojtHours = jobRole.ojt_hours?.toString() ?? '';
        const totalHours = jobRole.total_hours?.toString() ?? calculateTotalHours(trainingHours, ojtHours);
        
        // Format expiry date for date input
        const formatExpiryDate = (date: string | null) => {
            if (!date) return '';
            const d = new Date(date);
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };
        
        setFormData({
            sector_id: String(jobRole.sector_id),
            name: jobRole.name,
            qp_code: jobRole.qp_code ?? '',
            qp_version: jobRole.qp_version ?? '',
            nsqf_level: jobRole.nsqf_level ?? '',
            category: jobRole.category ?? '',
            training_hours: trainingHours,
            ojt_hours: ojtHours,
            total_hours: totalHours,
            cost_per_hour: jobRole.cost_per_hour?.toString() ?? '',
            expiry_date: formatExpiryDate(jobRole.expiry_date ?? null),
            syllabus_file: null,
            status: jobRole.status,
        });
        setEditingJobRole(jobRole);
        setIsModalOpen(true);
    };

    const onSubmitForm = (e: FormEvent) => {
        e.preventDefault();
        const options = {
            forceFormData: true,
            onSuccess: () => {
                setIsModalOpen(false);
                // Clear form data after successful submission
                reset();
                setEditingJobRole(null);
            },
            preserveScroll: true,
        };

        if (editingJobRole) {
            // In Laravel, PUT requests with multipart/form-data must be sent as POST with _method=PUT
            post(`/admin/job-roles/${editingJobRole.id}?_method=PUT`, options);
        } else {
            post('/admin/job-roles', options);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Job Roles" />
            <Card>
                <CardContent className="space-y-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-xl font-semibold">Job Roles</h1>
                            <p className="text-sm text-muted-foreground">Manage job roles.</p>
                        </div>
                        <Button onClick={openCreateModal}>Create Job Role</Button>
                    </div>

                    <form
                        onSubmit={onSearch}
                        className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap z-10 relative"
                    >
                        <Input
                            placeholder="Search by name/qp code"
                            value={searchData.search}
                            onChange={(e) => setSearchData('search', e.target.value)}
                            className="sm:max-w-xs"
                        />
                        <div className="w-[200px]">
                            <Select
                                placeholder="All sectors"
                                isClearable
                                options={sectorOptions}
                                value={sectorOptions.find((o) => o.value === searchData.sector_id) || null}
                                onChange={(option) => setSearchData('sector_id', option?.value ?? '')}
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
                                    setSearchData((prev) => ({ ...prev, search: '', sector_id: '' }));
                                    router.get('/admin/job-roles', {}, { preserveScroll: true, replace: true });
                                }}
                            >
                                Reset
                            </Button>
                        </div>
                    </form>

                    <DataTable
                        className="table-border"
                        columns={[
                            { key: 'name', label: 'Job Role' },
                            { key: 'sector', label: 'Sector' },
                            { key: 'qp', label: 'QP Code' },
                            { key: 'nsqf', label: 'NSQF' },
                            { key: 'category', label: 'Category' },
                            { key: 'training_hours', label: 'Training Hours' },
                            { key: 'ojt_hours', label: 'OJT Hours' },
                            { key: 'hours', label: 'Total Hours' },
                            { key: 'expiry_date', label: 'Expiry Date' },
                            { key: 'status', label: 'Status' },
                            { key: 'actions', label: 'Actions', className: 'text-right' },
                        ]}
                    >
                        {jobRoles.data.map((jobRole) => (
                            <tr key={jobRole.id}>
                                <td className="px-4 py-3">{jobRole.name}</td>
                                <td className="px-4 py-3">{jobRole.sector?.name ?? '-'}</td>
                                <td className="px-4 py-3">{jobRole.qp_code ?? '-'}</td>
                                <td className="px-4 py-3">{jobRole.nsqf_level ?? '-'}</td>
                                <td className="px-4 py-3">
                                    {categoryLevelOptions.find(
                                        (option) => String(option.value) === String(jobRole.category)
                                    )?.label ?? '-'}
                                </td>
                                <td className="px-4 py-3 text-center">{jobRole.training_hours ?? '-'}</td>
                                <td className="px-4 py-3 text-center">{jobRole.ojt_hours ?? '-'}</td>
                                <td className="px-4 py-3 text-center">{jobRole.total_hours ?? '-'}</td>
                                <td className="px-4 py-3 text-center">
                                    {jobRole.expiry_date ? new Date(jobRole.expiry_date).toLocaleDateString('en-GB') : '-'}
                                </td>
                                <td className="px-4 py-3">
                                    <Badge variant={jobRole.status ? 'default' : 'secondary'}>
                                        {jobRole.status ? 'Active' : 'Inactive'}
                                    </Badge>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <div className="flex justify-end gap-2">
                                        {jobRole.syllabus_file && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => window.open(`/storage/${jobRole.syllabus_file}`, '_blank')}
                                                className="text-green-600 hover:text-green-800 hover:bg-green-50"
                                                title="Download Syllabus"
                                            >
                                                <Download className="h-4 w-4" />
                                            </Button>
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => openEditModal(jobRole)}
                                            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                                            title="Edit"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <DeleteDialog onConfirm={() => handleDelete(jobRole.id)} />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </DataTable>

                    <Pagination links={jobRoles.links} />
                </CardContent>
            </Card>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingJobRole ? 'Edit Job Role' : 'Create Job Role'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={onSubmitForm} className="space-y-4" encType="multipart/form-data">
                        <div className="space-y-2">
                            <Label htmlFor="sector_id">Sector</Label>
                            <Select
                                id="sector_id"
                                placeholder="Select sector"
                                options={sectorOptions}
                                value={sectorOptions.find((o) => o.value === formData.sector_id) || null}
                                onChange={(option) => setFormData('sector_id', option?.value ?? '')}
                                className="react-select-container z-50"
                                classNamePrefix="react-select"
                            />
                            <InputError message={errors.sector_id} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="name">Job Role</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData('name', e.target.value)}
                                placeholder="Enter job role name"
                                required
                            />
                            <InputError message={errors.name} />
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="qp_code">QP Code</Label>
                                <Input
                                    id="qp_code"
                                    value={formData.qp_code}
                                    onChange={(e) => setFormData('qp_code', e.target.value)}
                                    placeholder="QP Code"
                                />
                                <InputError message={errors.qp_code} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="qp_version">QP Version</Label>
                                <Input
                                    id="qp_version"
                                    value={formData.qp_version}
                                    onChange={(e) => setFormData('qp_version', e.target.value)}
                                    placeholder="QP Version"
                                />
                                <InputError message={errors.qp_version} />
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="nsqf_level">NSQF Level</Label>
                                <Input
                                    id="nsqf_level"
                                    value={formData.nsqf_level}
                                    onChange={(e) => setFormData('nsqf_level', e.target.value)}
                                    placeholder="NSQF Level"
                                />
                                <InputError message={errors.nsqf_level} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <Select
                                    id="category"
                                    placeholder="Select category"
                                    options={categoryLevelOptions}
                                    value={categoryLevelOptions.find((o) => o.value === Number(formData.category)) || null}
                                    onChange={(option) => setFormData('category', option?.value?.toString() ?? '')}
                                    className="react-select-container z-50"
                                    classNamePrefix="react-select"
                                />
                                <InputError message={errors.category} />
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="training_hours">Training Hours</Label>
                                <Input
                                    id="training_hours"
                                    type="number"
                                    min="0"
                                    value={formData.training_hours}
                                    onChange={(e) => updateFormData('training_hours', e.target.value)}
                                    placeholder="Training hours"
                                />
                                <InputError message={errors.training_hours} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="ojt_hours">OJT Hours</Label>
                                <Input
                                    id="ojt_hours"
                                    type="number"
                                    min="0"
                                    value={formData.ojt_hours}
                                    onChange={(e) => updateFormData('ojt_hours', e.target.value)}
                                    placeholder="OJT hours"
                                />
                                <InputError message={errors.ojt_hours} />
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="total_hours">Total Hours</Label>
                                <Input
                                    id="total_hours"
                                    type="number"
                                    min="0"
                                    value={formData.total_hours}
                                    onChange={(e) => setFormData('total_hours', e.target.value)}
                                    placeholder="Total hours (auto-calculated)"
                                    readOnly
                                />
                                <InputError message={errors.total_hours} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="cost_per_hour">Cost per Hour</Label>
                                <Input
                                    id="cost_per_hour"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={formData.cost_per_hour}
                                    onChange={(e) => setFormData('cost_per_hour', e.target.value)}
                                    placeholder="Cost per hour"
                                />
                                <InputError message={errors.cost_per_hour} />
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="expiry_date">Expiry Date</Label>
                                <Input
                                    id="expiry_date"
                                    type="date"
                                    value={formData.expiry_date}
                                    onChange={(e) => setFormData('expiry_date', e.target.value)}
                                />
                                <InputError message={errors.expiry_date} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="syllabus_file">Syllabus File</Label>
                                <Input
                                    id="syllabus_file"
                                    type="file"
                                    onChange={(e) => setFormData('syllabus_file', e.target.files?.[0] ?? null)}
                                />
                                {editingJobRole?.syllabus_file && (
                                    <p className="text-xs text-muted-foreground mt-1">Current: {editingJobRole.syllabus_file}</p>
                                )}
                                <InputError message={errors.syllabus_file} />
                            </div>
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
                            <Button type="submit" disabled={processing}>{editingJobRole ? 'Update' : 'Create'}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
