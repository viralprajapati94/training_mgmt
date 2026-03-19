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


type DocumentMaster = {
    id: number;
    document_name: string;
    role_type: string;
    is_required: boolean;
    status: boolean;
};

type Paginated<T> = {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
};

type Props = {
    documents: Paginated<DocumentMaster>;
    filters: {
        search?: string;
        role_type?: string;
    };
    roleTypes: string[];
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Document Master', href: '/admin/masters/document-master' },
];

const statusOptions = [
    { value: true, label: 'Active' },
    { value: false, label: 'Inactive' },
];

export default function DocumentMasterIndex({ documents, filters, roleTypes }: Props) {
    const { data: searchData, setData: setSearchData } = useForm({
        search: filters.search ?? '',
        role_type: filters.role_type ?? '',
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDoc, setEditingDoc] = useState<DocumentMaster | null>(null);

    const { data: formData, setData: setFormData, post, put, processing, errors, reset, clearErrors } = useForm({
        document_name: '',
        role_type: roleTypes[0] ?? '',
        is_required: false,
        status: true,
    });

    const roleOptions = roleTypes.map((role) => ({ value: role, label: role.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase()) }));

    const onSearch = (e: FormEvent) => {
        e.preventDefault();
        router.get('/admin/masters/document-master', searchData, {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    };

    const handleDelete = (id: number) => {
        if (!confirm('Delete this document?')) return;
        router.delete(`/admin/masters/document-master/${id}`, { preserveScroll: true });
    };

    const openCreateModal = () => {
        clearErrors();
        reset();
        setFormData({
            document_name: '',
            role_type: roleTypes[0] ?? '',
            is_required: false,
            status: true,
        });
        setEditingDoc(null);
        setIsModalOpen(true);
    };

    const openEditModal = (document: DocumentMaster) => {
        clearErrors();
        setFormData({
            document_name: document.document_name,
            role_type: document.role_type,
            is_required: document.is_required,
            status: document.status,
        });
        setEditingDoc(document);
        setIsModalOpen(true);
    };

    const onSubmitForm = (e: FormEvent) => {
        e.preventDefault();
        if (editingDoc) {
            put(`/admin/masters/document-master/${editingDoc.id}`, {
                onSuccess: () => setIsModalOpen(false),
                preserveScroll: true,
            });
        } else {
            post('/admin/masters/document-master', {
                onSuccess: () => setIsModalOpen(false),
                preserveScroll: true,
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Document Master" />
            <Card>
                <CardContent className="space-y-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-xl font-semibold">Document Master</h1>
                            <p className="text-sm text-muted-foreground">Manage required documents per role.</p>
                        </div>
                        <Button onClick={openCreateModal}>Add Document</Button>
                    </div>

                    <form onSubmit={onSearch} className="grid gap-3 md:grid-cols-4 md:items-center">
                        <Input
                            placeholder="Search document"
                            value={searchData.search}
                            onChange={(e) => setSearchData('search', e.target.value)}
                            className="w-full"
                        />
                        <Select
                            options={roleOptions}
                            value={roleOptions.find((o) => o.value === searchData.role_type) ?? null}
                            onChange={(option) => setSearchData('role_type', option?.value ?? '')}
                            className="react-select-container"
                            classNamePrefix="react-select"
                            placeholder="Filter by role"
                            isClearable
                        />
                        <Button type="submit">Search</Button>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => {
                                setSearchData({ search: '', role_type: '' });
                                router.get('/admin/masters/document-master', {}, {
                                    preserveScroll: true,
                                    replace: true,
                                });
                            }}
                        >
                            Reset
                        </Button>
                    </form>

                    <DataTable
                        columns={[
                            { key: 'document_name', label: 'Document Name' },
                            { key: 'role_type', label: 'Role Type' },
                            { key: 'is_required', label: 'Required' },
                            { key: 'status', label: 'Status' },
                            { key: 'actions', label: 'Actions', className: 'text-right' },
                        ]}
                    >
                        {documents.data.map((doc) => (
                            <tr key={doc.id}>
                                <td className="px-4 py-3 whitespace-nowrap">{doc.document_name}</td>
                                <td className="px-4 py-3 whitespace-nowrap capitalize">{doc.role_type.replace('_', ' ')}</td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                    <Badge variant={doc.is_required ? 'default' : 'secondary'}>
                                        {doc.is_required ? 'Required' : 'Optional'}
                                    </Badge>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                    <Badge variant={doc.status ? 'default' : 'secondary'}>
                                        {doc.status ? 'Active' : 'Inactive'}
                                    </Badge>
                                </td>
                                <td className="px-4 py-3 text-right space-x-2">
                                    <Button variant="outline" size="sm" onClick={() => openEditModal(doc)}>
                                        Edit
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => handleDelete(doc.id)}
                                    >
                                        Delete
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </DataTable>

                    <Pagination links={documents.links} />
                </CardContent>
            </Card>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingDoc ? 'Edit Document' : 'Add Document'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={onSubmitForm} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="document_name">Document Name</Label>
                            <Input
                                id="document_name"
                                value={formData.document_name}
                                onChange={(e) => setFormData('document_name', e.target.value)}
                                placeholder="Enter document name"
                                required
                            />
                            <InputError message={errors.document_name} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="role_type">Role Type</Label>
                            <Select
                                id="role_type"
                                options={roleOptions}
                                value={roleOptions.find((o) => o.value === formData.role_type) ?? null}
                                onChange={(option) => setFormData('role_type', option?.value ?? '')}
                                className="react-select-container"
                                classNamePrefix="react-select"
                                placeholder="Select role type"
                            />
                            <InputError message={errors.role_type} />
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="is_required"
                                checked={formData.is_required}
                                onChange={(e) => setFormData('is_required', e.target.checked)}
                                className="h-4 w-4 rounded border"
                            />
                            <Label htmlFor="is_required" className="mb-0">Is Required?</Label>
                        </div>
                        <InputError message={errors.is_required} />

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
                            <Button type="submit" disabled={processing}>{editingDoc ? 'Update' : 'Create'}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
