import { FormEvent, useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import Select from 'react-select';
import { Camera, Upload, X } from 'lucide-react';

export default function BasicDetailsForm({ trainer, trainingCenters, onSuccess }: any) {
    const isEdit = Boolean(trainer?.id);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    // Set initial photo preview if editing
    useEffect(() => {
        if (trainer?.photo) {
            setPhotoPreview(`/storage/${trainer.photo}`);
        }
    }, [trainer]);

    const { data, setData, post, put, processing, errors } = useForm({
        tc_id: trainer?.tc_id ?? '',
        trainer_id: trainer?.trainer_id ?? '',
        gtr_id: trainer?.gtr_id ?? '',
        name: trainer?.name ?? '',
        aadhaar_number: trainer?.aadhaar_number ?? '',
        pan_number: trainer?.pan_number ?? '',
        email: trainer?.email ?? '',
        mobile: trainer?.mobile ?? '',
        photo: null as File | null,
    });

    const onSubmit = (e: FormEvent) => {
        e.preventDefault();
        
        if (isEdit) {
            post(`/tp/trainers/${trainer.id}?_method=PUT`, {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => onSuccess?.(),
            });
        } else {
            post('/tp/trainers', {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: (page) => {
                    const id = (page.props.flash as any)?.trainer_id;
                    if (id) onSuccess?.(id);
                },
            });
        }
    };

    return (
        <form onSubmit={onSubmit} className="space-y-6 pt-4" encType="multipart/form-data">
            {/* Photo Upload Section */}
            <div className="flex flex-col items-center justify-center pb-6 border-b">
                <div className="relative group">
                    <div className="h-32 w-32 rounded-full border-4 border-muted bg-muted/30 overflow-hidden flex items-center justify-center object-cover">
                        {photoPreview ? (
                            <img src={photoPreview} alt="Trainer Preview" className="h-full w-full object-cover" />
                        ) : (
                            <Camera className="h-10 w-10 text-muted-foreground" />
                        )}
                    </div>
                    <label 
                        htmlFor="photo-upload" 
                        className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-2 rounded-full cursor-pointer shadow-sm hover:bg-primary/90 transition-colors"
                        title="Upload Photo"
                    >
                        <Upload className="h-4 w-4" />
                    </label>
                    <input 
                        id="photo-upload"
                        type="file" 
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                                setData('photo', file);
                                const reader = new FileReader();
                                reader.onload = (e) => setPhotoPreview(e.target?.result as string);
                                reader.readAsDataURL(file);
                            }
                        }}
                    />
                    {photoPreview && (
                        <button
                            type="button"
                            onClick={() => {
                                setPhotoPreview(null);
                                setData('photo', null);
                            }}
                            className="absolute top-0 right-0 bg-destructive text-destructive-foreground p-1 rounded-full shadow-sm hover:bg-destructive/90 transition-colors"
                            title="Remove Photo"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    )}
                </div>
                <div className="mt-2 text-center">
                    <Label className="text-sm font-medium">Trainer Photo</Label>
                    <InputError message={errors.photo} className="mt-1 text-center" />
                </div>
            </div>

            {/* Grid Layout for Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                <div className="space-y-2">
                    <Label htmlFor="tc_id">Training Center *</Label>
                    <Select
                        options={trainingCenters.map((tc: any) => ({ value: tc.id, label: tc.name }))}
                        value={trainingCenters.find((tc: any) => tc.id === data.tc_id) ? { value: data.tc_id, label: trainingCenters.find((tc: any) => tc.id === data.tc_id).name } : null}
                        onChange={(o: any) => setData('tc_id', o?.value ?? '')}
                        className="react-select-container text-sm"
                        classNamePrefix="react-select"
                        placeholder="Select Center..."
                    />
                    <InputError message={errors.tc_id} />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="trainer_id">Trainer ID *</Label>
                    <Input
                        id="trainer_id"
                        value={data.trainer_id}
                        onChange={(e) => setData('trainer_id', e.target.value)}
                        placeholder="Enter Trainer ID"
                        disabled={isEdit}
                        className={isEdit ? "bg-muted" : ""}
                    />
                    <InputError message={errors.trainer_id} />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="gtr_id">GTR ID *</Label>
                    <Input
                        id="gtr_id"
                        value={data.gtr_id}
                        onChange={(e) => setData('gtr_id', e.target.value)}
                        placeholder="Enter GTR ID"
                    />
                    <InputError message={errors.gtr_id} />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="name">Trainer Name (As per Aadhaar) *</Label>
                    <Input
                        id="name"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        placeholder="Enter full name"
                    />
                    <InputError message={errors.name} />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="aadhaar_number">Aadhaar Number *</Label>
                    <Input
                        id="aadhaar_number"
                        value={data.aadhaar_number}
                        onChange={(e) => setData('aadhaar_number', e.target.value.replace(/\D/g, '').slice(0, 12))}
                        placeholder="12 digit Aadhaar number"
                        maxLength={12}
                    />
                    <InputError message={errors.aadhaar_number} />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="pan_number">PAN Number *</Label>
                    <Input
                        id="pan_number"
                        value={data.pan_number}
                        onChange={(e) => setData('pan_number', e.target.value.toUpperCase().slice(0, 10))}
                        placeholder="10 char PAN"
                        maxLength={10}
                    />
                    <InputError message={errors.pan_number} />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="mobile">Mobile Number *</Label>
                    <Input
                        id="mobile"
                        value={data.mobile}
                        onChange={(e) => setData('mobile', e.target.value.replace(/\D/g, '').slice(0, 10))}
                        placeholder="10 digit mobile"
                        maxLength={10}
                    />
                    <InputError message={errors.mobile} />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                        id="email"
                        type="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        placeholder="Email address"
                    />
                    <InputError message={errors.email} />
                </div>
            </div>

            <div className="flex justify-end gap-2 mt-8 pt-4 border-t">
                <Button type="submit" disabled={processing}>
                    {isEdit ? 'Update Basic Details' : 'Save Basic Details'}
                </Button>
            </div>
        </form>
    );
}
