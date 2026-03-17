import { FormEvent, useMemo } from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import InputError from '@/components/input-error';
import { Download } from 'lucide-react';
import type { DocumentOption, ExistingDocument } from '../types';

type Props = {
    partnerId: number;
    documents: DocumentOption[];
    existingDocuments?: ExistingDocument[];
};

export default function DocumentsTab({ partnerId, documents, existingDocuments = [] }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        documents: {} as Record<string, File | undefined>,
    });

    const onSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(`/admin/training-partners/${partnerId}/documents?next_tab=`, {
            preserveScroll: true,
            forceFormData: true,
        });
    };

    return (
        <form onSubmit={onSubmit} className="space-y-4 pt-4" encType="multipart/form-data">
            <Card>
                <CardHeader>
                    <CardTitle>Document Upload</CardTitle>
                    <p className="text-sm text-muted-foreground">Upload or replace required documents for the Training Partner.</p>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {/* Table Header */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-2 border-b">
                            <div className="font-medium text-sm text-center">Document Name</div>
                            <div className="font-medium text-sm text-center">Input Type</div>
                            <div className="font-medium text-sm text-center">Existing Document</div>
                        </div>

                        {/* Document Rows */}
                        {documents.map((doc) => {
                            const existing = existingDocuments.find((d) => d.document_master_id === doc.id);
                            return (
                                <div key={doc.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center py-3 border-b last:border-b-0">
                                    {/* Document Name */}
                                    <div className="font-medium text-center">{doc.document_name}</div>
                                    
                                    {/* File Input */}
                                    <div className="space-y-2">
                                        <label className="flex items-center justify-center w-full px-4 py-2 border border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition">
                                            <span className="text-sm font-medium text-gray-600">
                                            Upload Document
                                            </span>
                                            <input
                                            type="file"
                                            className="hidden"
                                            onChange={(e) =>
                                                setData('documents', {
                                                ...data.documents,
                                                [doc.id]: e.target.files?.[0],
                                                })
                                            }
                                            />
                                        </label>

                                        {data.documents?.[doc.id] && (
                                            <p className="text-xs text-green-600">
                                            {data.documents[doc.id]?.name}
                                            </p>
                                        )}

                                        <InputError message={errors[`documents.${doc.id}` as keyof typeof errors]} />
                                    </div>
                                    
                                    {/* Existing Document with Download */}
                                    <div className="space-y-2 flex justify-center">
                                        {existing?.original_name ? (
                                            <div className="flex items-center">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => window.open(`/storage/${existing.file_path}`, '_blank')}
                                                className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 border border-blue-200 hover:border-blue-300 transition-colors"
                                            >
                                                <Download className="h-4 w-4 mr-1" />
                                                Download
                                            </Button>
                                            </div>
                                        ) : (
                                            <span className="text-sm text-muted-foreground">
                                            No document uploaded
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="flex justify-end gap-2 mt-6">
                        <Button type="submit" disabled={processing}>
                            Save Documents
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </form>
    );
}
