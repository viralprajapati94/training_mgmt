import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { useState } from 'react';
import type { BreadcrumbItem } from '@/types/navigation';
import { CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
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
    { title: 'Batch Approvals', href: '/tp/batches' },
];

export default function TPBatchesIndex({ batches, filters }: any) {
    const [search, setSearch] = useState(filters.search || '');
    
    // Modal states
    const [actionModal, setActionModal] = useState<{
        open: boolean;
        type: 'approve' | 'reject' | 'modify' | null;
        batchId: number | null;
    }>({ open: false, type: null, batchId: null });
    
    const [remarks, setRemarks] = useState('');
    const [errors, setErrors] = useState('');

    const onSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/tp/batches', { search }, { preserveState: true });
    };

    const handleAction = () => {
        if (!actionModal.batchId || !actionModal.type) return;

        if (['reject', 'modify'].includes(actionModal.type) && remarks.length < 5) {
            setErrors('Remarks are required and must be at least 5 characters.');
            return;
        }

        router.post(`/tp/batches/${actionModal.batchId}/${actionModal.type}`, 
            { remarks }, 
            {
                onSuccess: () => {
                    setActionModal({ open: false, type: null, batchId: null });
                    setRemarks('');
                    setErrors('');
                },
                onError: (err) => {
                    setErrors(err.remarks || 'An error occurred.');
                }
            }
        );
    };

    const getStatusBadge = (status: string) => {
        const colors: Record<string, string> = {
            submitted: 'bg-blue-100 text-blue-800 border-blue-200',
            approved: 'bg-green-100 text-green-800 border-green-200',
            rejected: 'bg-red-100 text-red-800 border-red-200',
            modified_by_tp: 'bg-amber-100 text-amber-800 border-amber-200',
        };

        const labels: Record<string, string> = {
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
            key: 'trainingCenter',
            label: 'Training Center',
            render: (batch: any) => batch.training_center?.name || '-',
        },
        {
            key: 'jobRole',
            label: 'Job Role',
            render: (batch: any) => batch.job_role?.name || '-',
        },
        {
            key: 'sector',
            label: 'Sector',
            render: (batch: any) => batch.sector?.name || '-',
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
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => router.visit(`/tp/batches/${batch.id}/edit`)}
                        title="Edit"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg>
                    </Button>
                    
                    {batch.status === 'submitted' && (
                        <>
                            <Button
                                variant="outline"
                                size="icon"
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                onClick={() => setActionModal({ open: true, type: 'approve', batchId: batch.id })}
                                title="Approve"
                            >
                                <CheckCircle className="h-4 w-4" />
                            </Button>
                            
                            <Button
                                variant="outline"
                                size="icon"
                                className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                                onClick={() => setActionModal({ open: true, type: 'modify', batchId: batch.id })}
                                title="Send Back for Modification"
                            >
                                <RefreshCw className="h-4 w-4" />
                            </Button>
                            
                            <Button
                                variant="outline"
                                size="icon"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => setActionModal({ open: true, type: 'reject', batchId: batch.id })}
                                title="Reject"
                            >
                                <XCircle className="h-4 w-4" />
                            </Button>
                        </>
                    )}
                </div>
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Batch Approvals" />

            <div className="space-y-6">
                <Card>
                    <CardContent className="space-y-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h1 className="text-xl font-semibold">Batch Approvals</h1>
                                <p className="text-sm text-muted-foreground">Manage batches submitted by Training Centers.</p>
                            </div>
                        </div>

                        <form onSubmit={onSearch} className="flex gap-3 max-w-sm">
                            <Input
                                placeholder="Search batches..."
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
                                        router.get('/tp/batches');
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

            {/* Action Modal */}
            <AlertDialog open={actionModal.open} onOpenChange={(open) => {
                if (!open) {
                    setActionModal({ open: false, type: null, batchId: null });
                    setRemarks('');
                    setErrors('');
                }
            }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {actionModal.type === 'approve' && 'Approve Batch'}
                            {actionModal.type === 'reject' && 'Reject Batch'}
                            {actionModal.type === 'modify' && 'Send Back for Modification'}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {actionModal.type === 'approve' && 'Are you sure you want to approve this batch? This action cannot be undone.'}
                            {actionModal.type === 'reject' && 'Please provide remarks for rejecting this batch.'}
                            {actionModal.type === 'modify' && 'Please provide remarks specifying what needs to be modified by the Training Center.'}
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    {['reject', 'modify'].includes(actionModal.type || '') && (
                        <div className="py-4">
                            <Textarea
                                placeholder="Enter remarks (required)..."
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                                className={errors ? 'border-red-500' : ''}
                                rows={4}
                            />
                            {errors && <p className="text-sm text-red-500 mt-2">{errors}</p>}
                        </div>
                    )}

                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={handleAction}
                            className={
                                actionModal.type === 'approve' ? 'bg-green-600 hover:bg-green-700' :
                                actionModal.type === 'reject' ? 'bg-red-600 hover:bg-red-700' :
                                'bg-amber-600 hover:bg-amber-700'
                            }
                        >
                            Confirm {actionModal.type}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
