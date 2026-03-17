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
import { Edit } from 'lucide-react';
import type { BreadcrumbItem } from '@/types/navigation';

type ProjectType = {
    id: number;
    type: string;
    status: boolean;
    created_at: string;
    updated_at: string;
};

type Paginated<T> = {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
};

type Props = {
    projectTypes: Paginated<ProjectType>;
    filters: {
        search?: string;
    };
};

const statusOptions = [
    { value: true, label: 'Active' },
    { value: false, label: 'Inactive' },
];

export default function ProjectTypesIndex({ projectTypes, filters }: Props) {
    const { data: searchData, setData: setSearchData } = useForm({
        search: filters.search ?? '',
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProjectType, setEditingProjectType] = useState<ProjectType | null>(null);

    const { data: formData, setData: setFormData, post, put, processing, errors, reset, clearErrors } = useForm({
        type: '',
        status: true,
    });

    const onSearch = (e: FormEvent) => {
        e.preventDefault();
        router.get('/admin/project-types', searchData, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const handleDelete = (id: number) => {
        router.delete(`/admin/project-types/${id}`, { preserveScroll: true });
    };

    const openCreateModal = () => {
        clearErrors();
        reset();
        setEditingProjectType(null);
        setIsModalOpen(true);
    };

    const openEditModal = (projectType: ProjectType) => {
        clearErrors();
        setFormData({
            type: projectType.type,
            status: projectType.status,
        });
        setEditingProjectType(projectType);
        setIsModalOpen(true);
    };

    const onSubmitForm = (e: FormEvent) => {
        e.preventDefault();
        const options = {
            onSuccess: () => {
                setIsModalOpen(false);
                reset();
                setEditingProjectType(null);
            },
            preserveScroll: true,
        };

        if (editingProjectType) {
            put(`/admin/project-types/${editingProjectType.id}`, options);
        } else {
            post('/admin/project-types', options);
        }
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/admin/dashboard' },
        { title: 'Project Types', href: '/admin/project-types' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Project Types" />
            <Card>
                <CardContent className="space-y-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-xl font-semibold">Project Types</h1>
                            <p className="text-sm text-muted-foreground">Manage project types.</p>
                        </div>
                        <Button onClick={openCreateModal}>Create Project Type</Button>
                    </div>

                    <form
                        onSubmit={onSearch}
                        className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap z-10 relative"
                    >
                        <Input
                            placeholder="Search by type"
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
                                    router.get('/admin/project-types', {}, { preserveScroll: true, replace: true });
                                }}
                            >
                                Reset
                            </Button>
                        </div>
                    </form>

                    <DataTable
                        className="table-border"
                        columns={[
                            { key: 'type', label: 'Project Type' },
                            { key: 'status', label: 'Status' },
                            { key: 'created_at', label: 'Created At' },
                            { key: 'actions', label: 'Actions', className: 'text-right' },
                        ]}
                    >
                        {projectTypes.data.map((projectType) => (
                            <tr key={projectType.id}>
                                <td className="px-4 py-3">{projectType.type}</td>
                                <td className="px-4 py-3">
                                    <Badge variant={projectType.status ? 'default' : 'secondary'}>
                                        {projectType.status ? 'Active' : 'Inactive'}
                                    </Badge>
                                </td>
                                <td className="px-4 py-3">
                                    {new Date(projectType.created_at).toLocaleDateString('en-GB')}
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => openEditModal(projectType)}
                                            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                                            title="Edit"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <DeleteDialog onConfirm={() => handleDelete(projectType.id)} />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </DataTable>

                    <Pagination links={projectTypes.links} />
                </CardContent>
            </Card>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editingProjectType ? 'Edit Project Type' : 'Create Project Type'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={onSubmitForm} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="type">Project Type</Label>
                            <Input
                                id="type"
                                value={formData.type}
                                onChange={(e) => setFormData('type', e.target.value)}
                                placeholder="Enter project type"
                                required
                            />
                            <InputError message={errors.type} />
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
                            <Button type="submit" disabled={processing}>{editingProjectType ? 'Update' : 'Create'}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
