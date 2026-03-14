import { FormEvent, useMemo } from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
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
            <p className="text-sm text-muted-foreground">Upload or replace required documents for the Training Partner.</p>
            <div className="space-y-4">
                {documents.map((doc) => {
                    const existing = existingDocuments.find((d) => d.document_master_id === doc.id);
                    return (
                        <div key={doc.id} className="space-y-1">
                            <Label>{doc.document_name}</Label>
                            {existing?.original_name && (
                                <p className="text-xs text-muted-foreground mb-1">
                                    Current file: <a href={`/storage/${existing.file_path}`} target="_blank" className="text-blue-600 hover:underline">{existing.original_name}</a>
                                </p>
                            )}
                            <Input
                                type="file"
                                onChange={(e) => setData('documents', { ...data.documents, [doc.id]: e.target.files?.[0] })}
                            />
                            <InputError message={errors[`documents.${doc.id}` as keyof typeof errors]} />
                        </div>
                    );
                })}
            </div>
            <div className="flex justify-end gap-2 mt-4">
                <Button type="submit" disabled={processing}>
                    Save Documents
                </Button>
            </div>
        </form>
    );
}
