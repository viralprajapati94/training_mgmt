import { Head, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { useState } from 'react';
import type { BreadcrumbItem } from '@/types/navigation';
import { Pencil, Trash2, Send } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Batches', href: '/tc/batches' },
];

export default function BatchesIndex({ batches, filters }: any) {
    const [search, setSearch] = useState(filters.search || '');
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [submitModalOpen, setSubmitModalOpen] = useState(false);
    const [selectedBatchId, setSelectedBatchId] = useState<number | null>(null);

    const onSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/tc/batches', { search }, { preserveState: true });
    };

    const handleDelete = () => {
        if (!selectedBatchId) return;
        router.delete(`/tc/batches/${selectedBatchId}`, {
            onSuccess: () => setDeleteModalOpen(false),
        });
    };

    const handleSubmit = () => {
        if (!selectedBatchId) return;
        router.post(`/tc/batches/${selectedBatchId}/submit`, {}, {
            onSuccess: () => setSubmitModalOpen(false),
        });
    };

    const getStatusBadge = (status: string) => {
        const colors: Record<string, string> = {
            draft: 'bg-gray-100 text-gray-800 border-gray-200',
            submitted: 'bg-blue-100 text-blue-800 border-blue-200',
            approved: 'bg-green-100 text-green-800 border-green-200',
            rejected: 'bg-red-100 text-red-800 border-red-200',
            modified_by_tp: 'bg-amber-100 text-amber-800 border-amber-200',
        };

        const labels: Record<string, string> = {
            draft: 'Draft',
            submitted: 'Submitted',
            approved: 'Approved',
            rejected: 'Rejected',
            modified_by_tp: 'Modified by TP',
        };

        return (
            <Badge variant="outline" className={`${colors[status]} capitalize`}>
                {labels[status] || status}
            </Badge>
        );
    };

    const dataTableColumns = [
        {
            key: 'batch_number',
            label: 'Batch Number',
            render: (batch: any) => batch.batch_number || '-',
        },
        {
            key: 'jobRole',
            label: 'Job Role',
            render: (batch: any) => batch.job_role?.name || '-',
        },
        {
            key: 'batch_size',
            label: 'Batch Size',
        },
        {
            key: 'start_date',
            label: 'Start Date',
            render: (batch: any) => new Date(batch.start_date).toLocaleDateString(),
        },
        {
            key: 'status',
            label: 'Status',
            render: (batch: any) => getStatusBadge(batch.status),
        },
        {
            key: 'actions',
            label: 'Actions',
            className: 'text-right w-[150px]',
            render: (batch: any) => (
                <div className="flex justify-end gap-2">
                    {['draft', 'modified_by_tp'].includes(batch.status) && (
                        <>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => router.visit(`/tc/batches/${batch.id}/edit`)}
                                title="Edit"
                            >
                                <Pencil className="h-4 w-4" />
                            </Button>
                            
                            <Button
                                variant="default"
                                size="icon"
                                className="bg-blue-600 hover:bg-blue-700"
                                onClick={() => {
                                    setSelectedBatchId(batch.id);
                                    setSubmitModalOpen(true);
                                }}
                                title="Submit to TP"
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                        </>
                    )}
                    
                    {batch.status === 'draft' && (
                        <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => {
                                setSelectedBatchId(batch.id);
                                setDeleteModalOpen(true);
                            }}
                            title="Delete"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Batches" />

            <div className="space-y-6">
                <Card>
                    <CardContent className="space-y-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h1 className="text-xl font-semibold">Batches</h1>
                                <p className="text-sm text-muted-foreground">Manage your training batches.</p>
                            </div>
                            <Button onClick={() => router.visit('/tc/batches/create')}>Create Batch</Button>
                        </div>

                        <form onSubmit={onSearch} className="flex gap-3 max-w-sm">
                            <Input
                                placeholder="Search by Job Role or ID..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full"
                            />
                            <Button type="submit" variant="secondary">Search</Button>
                            {search && (
                                <Button 
                                    type="button" 
                                    variant="ghost" 
                                    onClick={() => {
                                        setSearch('');
                                        router.get('/tc/batches');
                                    }}
                                >
                                    Clear
                                </Button>
                            )}
                        </form>

                        <DataTable columns={dataTableColumns.map(c => ({ key: c.key, label: c.label, className: c.className }))}>
                            {batches.data.length === 0 ? (
                                <tr>
                                    <td colSpan={dataTableColumns.length} className="p-4 text-center text-muted-foreground">
                                        No batches found.
                                    </td>
                                </tr>
                            ) : (
                                batches.data.map((batch: any) => (
                                    <tr key={batch.id} className="hover:bg-muted/50 transition-colors">
                                        {dataTableColumns.map((col) => (
                                            <td key={`${batch.id}-${col.key}`} className={`p-4 align-middle [&:has([role=checkbox])]:pr-0 ${col.className || ''}`}>
                                                {col.render ? col.render(batch) : batch[col.key]}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            )}
                        </DataTable>
                    </CardContent>
                </Card>
            </div>

            {/* Delete Confirmation Modal */}
            <AlertDialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the batch.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setSelectedBatchId(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Submit Confirmation Modal */}
            <AlertDialog open={submitModalOpen} onOpenChange={setSubmitModalOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Submit Batch for Approval</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to submit this batch? Once submitted, you will not be able to edit it unless the Training Partner returns it for modifications.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setSelectedBatchId(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleSubmit} className="bg-blue-600 text-white hover:bg-blue-700">
                            Submit
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
