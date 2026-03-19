import { FormEvent, useEffect, useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { PlusCircle, Trash2 } from 'lucide-react';
import InputError from '@/components/input-error';
import Select from 'react-select';

type QualificationData = {
    id?: number;
    sector_id: string | number;
    job_role_id: string | number;
    qp_code: string;
    version: string;
    training_type: string;
    is_certified: boolean;
    certificate_number: string;
    certificate_file: File | null;
    existing_certificate_file?: string;
};

type Option = { value: number; label: string };
type JobRoleOption = Option & { qp_code: string; version: string };

export default function QualificationsForm({ trainerId, initialData = [], onSuccess }: any) {
    const isEdit = initialData && initialData.length > 0;

    const [sectors, setSectors] = useState<Option[]>([]);
    const [jobRolesBySector, setJobRolesBySector] = useState<Record<string, JobRoleOption[]>>({});

    useEffect(() => {
        fetch('/master-data/sectors')
            .then(res => res.json())
            .then(data => setSectors(data.map((s: any) => ({ value: s.id, label: s.name }))));
    }, []);

    const fetchJobRoles = async (sectorId: string | number) => {
        if (!sectorId || jobRolesBySector[sectorId]) return;

        try {
            const res = await fetch(`/master-data/job-roles?sector_id=${sectorId}`);
            const data = await res.json();
            setJobRolesBySector(prev => ({
                ...prev,
                [sectorId]: data.map((jr: any) => ({
                    value: jr.id,
                    label: jr.name,
                    qp_code: jr.qp_code,
                    version: jr.version
                }))
            }));
        } catch (error) {
            console.error('Failed to fetch job roles:', error);
        }
    };

    const emptyQualification: QualificationData = {
        sector_id: '',
        job_role_id: '',
        qp_code: '',
        version: '',
        training_type: '',
        is_certified: false,
        certificate_number: '',
        certificate_file: null,
    };

    const { data, setData, post, processing, errors } = useForm({
        _method: 'PUT', // We use POST with _method=PUT to handle file uploads properly in Laravel
        qualifications: isEdit ? initialData.map((q: any) => ({
            id: q.id,
            sector_id: q.sector_id,
            job_role_id: q.job_role_id,
            qp_code: q.qp_code || '',
            version: q.version || '',
            training_type: q.training_type || '',
            is_certified: Boolean(q.is_certified),
            certificate_number: q.certificate_number || '',
            certificate_file: null, // New file
            existing_certificate_file: q.certificate_file || null, // Existing file path
        })) : [{ ...emptyQualification }]
    });

    // Fetch initial job roles if editing
    useEffect(() => {
        if (isEdit) {
            data.qualifications.forEach((q: QualificationData) => {
                if (q.sector_id) {
                    fetchJobRoles(q.sector_id);
                }
            });
        }
    }, []);

    const addQualification = () => {
        setData('qualifications', [...data.qualifications, { ...emptyQualification }]);
    };

    const removeQualification = (index: number) => {
        const newQualifications = [...data.qualifications];
        newQualifications.splice(index, 1);
        setData('qualifications', newQualifications);
    };

    const handleChange = (index: number, field: string, value: any) => {
        const newQualifications = [...data.qualifications];
        newQualifications[index] = { ...newQualifications[index], [field]: value };
        
        if (field === 'sector_id') {
            newQualifications[index].job_role_id = '';
            newQualifications[index].qp_code = '';
            newQualifications[index].version = '';
            fetchJobRoles(value);
        } else if (field === 'job_role_id') {
            const sectorId = newQualifications[index].sector_id;
            const jobRole = jobRolesBySector[sectorId as string]?.find(jr => jr.value === Number(value));
            if (jobRole) {
                newQualifications[index].qp_code = jobRole.qp_code || '';
                newQualifications[index].version = jobRole.version || '';
            } else {
                newQualifications[index].qp_code = '';
                newQualifications[index].version = '';
            }
        } else if (field === 'is_certified' && !value) {
            newQualifications[index].certificate_number = '';
            newQualifications[index].certificate_file = null;
        }

        setData('qualifications', newQualifications);
    };

    const handleFileChange = (index: number, file: File | null) => {
        const newQualifications = [...data.qualifications];
        newQualifications[index].certificate_file = file;
        setData('qualifications', newQualifications);
    };

    const onSubmit = (e: FormEvent) => {
        e.preventDefault();
        // Since we are uploading files and Inertia has issues with PUT requests + files,
        // we use POST and let Inertia/Laravel handle the _method parameter we defined above
        post(`/tp/trainers/${trainerId}/qualifications`, {
            preserveScroll: true,
            forceFormData: true, // Needed for file uploads
            onSuccess: () => onSuccess?.(),
        });
    };

    const trainingTypeOptions = [
        { value: 'Online', label: 'Online' },
        { value: 'Offline', label: 'Offline' },
    ];

    return (
        <form onSubmit={onSubmit} className="space-y-6 pt-4">
            <div className="space-y-6">
                {data.qualifications.map((q: QualificationData, index: number) => (
                    <div key={index} className="relative p-6 border rounded-lg bg-card/50">
                        {data.qualifications.length > 1 && (
                            <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute -top-3 -right-3 h-8 w-8 rounded-full"
                                onClick={() => removeQualification(index)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label>Sector *</Label>
                                <Select
                                    options={sectors}
                                    value={sectors.find(s => s.value === Number(q.sector_id)) || null}
                                    onChange={(val: any) => handleChange(index, 'sector_id', val?.value || '')}
                                    placeholder="Select Sector"
                                    className="react-select-container text-sm"
                                    classNamePrefix="react-select"
                                />
                                <InputError message={errors[`qualifications.${index}.sector_id` as keyof typeof errors]} />
                            </div>

                            <div className="space-y-2">
                                <Label>Job Role *</Label>
                                <Select
                                    options={jobRolesBySector[q.sector_id as string] || []}
                                    value={(jobRolesBySector[q.sector_id as string] || []).find(jr => jr.value === Number(q.job_role_id)) || null}
                                    onChange={(val: any) => handleChange(index, 'job_role_id', val?.value || '')}
                                    placeholder="Select Job Role"
                                    className="react-select-container text-sm"
                                    classNamePrefix="react-select"
                                    isDisabled={!q.sector_id}
                                />
                                <InputError message={errors[`qualifications.${index}.job_role_id` as keyof typeof errors]} />
                            </div>

                            <div className="space-y-2">
                                <Label>QP Code</Label>
                                <Input
                                    value={q.qp_code}
                                    readOnly
                                    className="bg-muted"
                                    placeholder="Auto-filled"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Version</Label>
                                <Input
                                    value={q.version}
                                    readOnly
                                    className="bg-muted"
                                    placeholder="Auto-filled"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Training Type</Label>
                                <Select
                                    options={trainingTypeOptions}
                                    value={trainingTypeOptions.find(t => t.value === q.training_type) || null}
                                    onChange={(val: any) => handleChange(index, 'training_type', val?.value || '')}
                                    placeholder="Select Training Type"
                                    className="react-select-container text-sm"
                                    classNamePrefix="react-select"
                                    isClearable
                                />
                                <InputError message={errors[`qualifications.${index}.training_type` as keyof typeof errors]} />
                            </div>

                            <div className="space-y-2 flex flex-col justify-center">
                                <div className="flex items-center space-x-2 mt-4">
                                    <Checkbox
                                        id={`is_certified_${index}`}
                                        checked={q.is_certified}
                                        onCheckedChange={(checked) => handleChange(index, 'is_certified', checked)}
                                    />
                                    <Label htmlFor={`is_certified_${index}`} className="cursor-pointer">
                                        Is Certified?
                                    </Label>
                                </div>
                            </div>

                            {q.is_certified && (
                                <>
                                    <div className="space-y-2">
                                        <Label>Certificate Number *</Label>
                                        <Input
                                            value={q.certificate_number}
                                            onChange={(e) => handleChange(index, 'certificate_number', e.target.value)}
                                            placeholder="Enter certificate number"
                                            required={q.is_certified}
                                        />
                                        <InputError message={errors[`qualifications.${index}.certificate_number` as keyof typeof errors]} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Certificate File *</Label>
                                        <div className="relative border border-dashed rounded-lg p-3 text-center hover:bg-muted/50 transition-colors">
                                            <Input
                                                type="file"
                                                accept=".pdf,.jpg,.jpeg,.png"
                                                onChange={(e) => handleFileChange(index, e.target.files?.[0] || null)}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                required={q.is_certified && !q.existing_certificate_file}
                                            />
                                            <span className="text-sm font-medium text-muted-foreground">
                                                {q.certificate_file ? q.certificate_file.name : 'Upload Document'}
                                            </span>
                                        </div>
                                        <InputError message={errors[`qualifications.${index}.certificate_file` as keyof typeof errors]} />
                                        
                                        {q.existing_certificate_file && (
                                            <div className="mt-2 text-sm flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-muted-foreground">Current File:</span>
                                                    <a 
                                                        href={`/storage/${q.existing_certificate_file}`} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 hover:underline flex items-center gap-1 font-medium"
                                                    >
                                                        View
                                                    </a>
                                                </div>                                                
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex justify-between items-center mt-6 border-t pt-6">
                <Button type="button" variant="outline" onClick={addQualification} className="flex items-center">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add More
                </Button>

                <Button type="submit" disabled={processing}>
                    Save Qualifications
                </Button>
            </div>
        </form>
    );
}
