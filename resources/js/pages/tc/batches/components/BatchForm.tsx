import { FormEvent, useEffect, useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select as UISelect, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Trash2 } from 'lucide-react';
import InputError from '@/components/input-error';
import Select from 'react-select';

export default function BatchForm({ batch, sectors, trainers, trainingCenters, isEdit = false, isTP = false }: any) {
    const isReadOnly = isEdit && !isTP && !['draft', 'modified_by_tp'].includes(batch?.status);
    
    const [jobRoles, setJobRoles] = useState<any[]>(isEdit && batch?.job_role ? [batch.job_role] : []);
    
    const { data, setData, post, put, processing, errors } = useForm({
        // Basic Details
        batch_number: batch?.batch_number || '',
        training_center_id: batch?.training_center_id || '',
        training_type: batch?.training_type || '',
        batch_type: batch?.batch_type || '',
        job_role_id: batch?.job_role_id || '',
        sector_id: batch?.sector_id || '',
        qp_code: batch?.qp_code || '',
        nsqf_level: batch?.nsqf_level || '',
        version: batch?.version || '',
        education_requirement: batch?.education_requirement || '',
        
        // Metrics
        batch_size: batch?.batch_size || '',
        target_available: batch?.target_available !== undefined ? batch.target_available : '0',
        eligible_to_create: batch?.eligible_to_create !== undefined ? batch.eligible_to_create : '0',
        registered_to_enroll: batch?.registered_to_enroll !== undefined ? batch.registered_to_enroll : '0',
        enrolled_so_far: batch?.enrolled_so_far !== undefined ? batch.enrolled_so_far : '0',
        
        // Schedule
        training_hours_per_day: batch?.training_hours_per_day || '',
        start_date: batch?.start_date ? new Date(batch.start_date).toISOString().split('T')[0] : '',
        end_date: batch?.end_date ? new Date(batch.end_date).toISOString().split('T')[0] : '',
        freeze_date: batch?.freeze_date ? new Date(batch.freeze_date).toISOString().split('T')[0] : '',
        
        // Arrays
        slots: batch?.slots ? batch.slots.map((s: any) => ({
            ...s,
            start_time: s.start_time ? s.start_time.substring(0, 5) : '',
            end_time: s.end_time ? s.end_time.substring(0, 5) : '',
        })) : [{ start_time: '', end_time: '', hours: '' }],
        trainers: batch?.trainers || [{ trainer_id: '', is_certified: false, mobile_number: '' }],
    });

    const sectorOptions = sectors.map((s: any) => ({ value: s.id, label: s.name }));
    const trainerOptions = trainers.map((t: any) => ({ value: t.id, label: `${t.name} (${t.trainer_id})`, original: t }));

    const fetchJobRoles = async (sectorId: string | number) => {
        if (!sectorId) return;
        try {
            const res = await fetch(`/master-data/job-roles?sector_id=${sectorId}`);
            const data = await res.json();
            setJobRoles(data);
        } catch (error) {
            console.error('Failed to fetch job roles:', error);
        }
    };

    // If editing, fetch job roles for the selected sector
    useEffect(() => {
        if (isEdit && batch?.sector_id && jobRoles.length <= 1) {
            fetchJobRoles(batch.sector_id);
        }
    }, [isEdit, batch?.sector_id]);

    const handleSectorChange = (option: any) => {
        setData('sector_id', option?.value || '');
        setData('job_role_id', '');
        setData('qp_code', '');
        setData('nsqf_level', '');
        setData('version', '');
        
        if (option?.value) {
            fetchJobRoles(option.value);
        } else {
            setJobRoles([]);
        }
    };

    const handleJobRoleChange = (option: any) => {
        setData('job_role_id', option?.value || '');
        
        if (option?.value) {
            const selected = jobRoles.find((j: any) => j.id === option.value);
            if (selected) {
                setData(data => ({
                    ...data,
                    job_role_id: option.value,
                    qp_code: selected.qp_code || '',
                    nsqf_level: selected.nsqf_level || '',
                    version: selected.version || '',
                }));
            }
        }
    };

    const addSlot = () => {
        setData('slots', [...data.slots, { start_time: '', end_time: '', hours: '' }]);
    };

    const removeSlot = (index: number) => {
        const newSlots = [...data.slots];
        newSlots.splice(index, 1);
        setData('slots', newSlots);
    };

    const updateSlot = (index: number, field: string, value: string) => {
        const newSlots = [...data.slots];
        newSlots[index] = { ...newSlots[index], [field]: value };
        
        // Auto-calculate hours if start and end time are set
        if ((field === 'start_time' || field === 'end_time') && newSlots[index].start_time && newSlots[index].end_time) {
            const start = new Date(`2000-01-01T${newSlots[index].start_time}`);
            const end = new Date(`2000-01-01T${newSlots[index].end_time}`);
            if (end > start) {
                const diffMs = end.getTime() - start.getTime();
                const diffHrs = diffMs / (1000 * 60 * 60);
                newSlots[index].hours = diffHrs.toFixed(2);
            }
        }
        
        setData('slots', newSlots);
    };

    const addTrainer = () => {
        setData('trainers', [...data.trainers, { trainer_id: '', is_certified: false, mobile_number: '' }]);
    };

    const removeTrainer = (index: number) => {
        const newTrainers = [...data.trainers];
        newTrainers.splice(index, 1);
        setData('trainers', newTrainers);
    };

    const updateTrainer = (index: number, field: string, value: any) => {
        const newTrainers = [...data.trainers];
        newTrainers[index] = { ...newTrainers[index], [field]: value };
        setData('trainers', newTrainers);
    };

    const onSubmit = (e: FormEvent) => {
        e.preventDefault();
        
        if (isEdit) {
            if (isTP) {
                put(`/tp/batches/${batch.id}`, {
                    preserveScroll: true,
                    onError: (err) => console.error("Validation Errors:", err)
                });
            } else {
                put(`/tc/batches/${batch.id}`, {
                    preserveScroll: true,
                    onError: (err) => console.error("Validation Errors:", err)
                });
            }
        } else {
            if (isTP) {
                post('/tp/batches', {
                    preserveScroll: true,
                    onError: (err) => console.error("Validation Errors:", err)
                });
            } else {
                post('/tc/batches', {
                    preserveScroll: true,
                    onError: (err) => console.error("Validation Errors:", err)
                });
            }
        }
    };

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            {Object.keys(errors).length > 0 && (
                <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-md mb-6">
                    <h4 className="font-semibold">Please fix the following errors:</h4>
                    <ul className="list-disc pl-5 mt-2 text-sm">
                        {Object.entries(errors).map(([key, error]) => (
                            <li key={key}>{key}: {error as string}</li>
                        ))}
                    </ul>
                </div>
            )}
            
            {batch?.status === 'modified_by_tp' && batch?.remarks && (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-md mb-6">
                    <h4 className="font-semibold flex items-center gap-2">
                        <span>⚠️</span> Modification Required
                    </h4>
                    <p className="mt-1 text-sm">{batch.remarks}</p>
                </div>
            )}
            
            <Card>
                <CardHeader>
                    <CardTitle>Section 1: Basic Details</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2 lg:col-span-3 mb-2">
                        <Label>Batch Number *</Label>
                        <Input
                            value={data.batch_number}
                            onChange={(e) => setData('batch_number', e.target.value)}
                            disabled={isReadOnly}
                            placeholder="Enter unique batch number"
                            className="max-w-md"
                        />
                        <InputError message={errors.batch_number} />
                    </div>

                    {isTP && trainingCenters && (
                        <div className="space-y-2 lg:col-span-3 mb-2">
                            <Label>Training Center *</Label>
                            <Select
                                options={trainingCenters.map((tc: any) => ({ value: tc.id, label: tc.name }))}
                                value={data.training_center_id ? { 
                                    value: data.training_center_id, 
                                    label: trainingCenters.find((tc: any) => tc.id === Number(data.training_center_id))?.name 
                                } : null}
                                onChange={(val: any) => setData('training_center_id', val?.value || '')}
                                isDisabled={isReadOnly}
                                className="react-select-container text-sm max-w-md"
                                classNamePrefix="react-select"
                                placeholder="Select Training Center"
                            />
                            <InputError message={errors.training_center_id} />
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label>Training Type *</Label>
                        <UISelect
                            value={data.training_type}
                            onValueChange={(val) => setData('training_type', val)}
                            disabled={isReadOnly}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select Training Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Short Term">Short Term</SelectItem>
                                <SelectItem value="Long Term">Long Term</SelectItem>
                                <SelectItem value="RPL">RPL</SelectItem>
                            </SelectContent>
                        </UISelect>
                        <InputError message={errors.training_type} />
                    </div>

                    <div className="space-y-2">
                        <Label>Batch Type *</Label>
                        <UISelect
                            value={data.batch_type}
                            onValueChange={(val) => setData('batch_type', val)}
                            disabled={isReadOnly}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select Batch Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Regular">Regular</SelectItem>
                                <SelectItem value="Special">Special</SelectItem>
                            </SelectContent>
                        </UISelect>
                        <InputError message={errors.batch_type} />
                    </div>

                    <div className="space-y-2">
                        <Label>Sector *</Label>
                        <Select
                            options={sectorOptions}
                            value={sectorOptions.find(s => s.value === Number(data.sector_id)) || null}
                            onChange={handleSectorChange}
                            isDisabled={isReadOnly}
                            className="react-select-container text-sm"
                            classNamePrefix="react-select"
                            placeholder="Select Sector"
                        />
                        <InputError message={errors.sector_id} />
                    </div>

                    <div className="space-y-2">
                        <Label>Job Role *</Label>
                        <Select
                            options={jobRoles.map(j => ({ value: j.id, label: j.name }))}
                            value={data.job_role_id ? { value: data.job_role_id, label: jobRoles.find(j => j.id === Number(data.job_role_id))?.name } : null}
                            onChange={handleJobRoleChange}
                            isDisabled={isReadOnly || !data.sector_id}
                            className="react-select-container text-sm"
                            classNamePrefix="react-select"
                            placeholder="Select Job Role"
                        />
                        <InputError message={errors.job_role_id} />
                    </div>

                    <div className="space-y-2">
                        <Label>QP Code *</Label>
                        <Input value={data.qp_code} readOnly className="bg-muted" />
                        <InputError message={errors.qp_code} />
                    </div>

                    <div className="space-y-2">
                        <Label>NSQF Level *</Label>
                        <Input 
                            value={data.nsqf_level} 
                            onChange={(e) => setData('nsqf_level', e.target.value)}
                            disabled={isReadOnly}
                            placeholder="Enter NSQF Level"
                        />
                        <InputError message={errors.nsqf_level} />
                    </div>

                    <div className="space-y-2">
                        <Label>Version *</Label>
                        <Input value={data.version} readOnly className="bg-muted" />
                        <InputError message={errors.version} />
                    </div>

                    <div className="space-y-2 lg:col-span-2">
                        <Label>Minimum Education Qualification</Label>
                        <Input
                            value={data.education_requirement}
                            onChange={(e) => setData('education_requirement', e.target.value)}
                            disabled={isReadOnly}
                            placeholder="e.g. 10th Pass"
                        />
                        <InputError message={errors.education_requirement} />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Section 2: Batch Metrics</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label>Batch Size *</Label>
                        <Input
                            type="number"
                            min="1"
                            value={data.batch_size}
                            onChange={(e) => setData('batch_size', e.target.value)}
                            disabled={isReadOnly}
                        />
                        <InputError message={errors.batch_size} />
                    </div>

                    <div className="space-y-2">
                        <Label>Target Available *</Label>
                        <Input
                            type="number"
                            min="0"
                            value={data.target_available}
                            onChange={(e) => setData('target_available', e.target.value)}
                            disabled={isReadOnly}
                        />
                        <InputError message={errors.target_available} />
                    </div>

                    <div className="space-y-2">
                        <Label>Eligible to Create Batch *</Label>
                        <Input
                            type="number"
                            min="0"
                            value={data.eligible_to_create}
                            onChange={(e) => setData('eligible_to_create', e.target.value)}
                            disabled={isReadOnly}
                        />
                        <InputError message={errors.eligible_to_create} />
                    </div>

                    <div className="space-y-2">
                        <Label>Registered Yet to Enroll *</Label>
                        <Input
                            type="number"
                            min="0"
                            value={data.registered_to_enroll}
                            onChange={(e) => setData('registered_to_enroll', e.target.value)}
                            disabled={isReadOnly}
                        />
                        <InputError message={errors.registered_to_enroll} />
                    </div>

                    <div className="space-y-2">
                        <Label>Enrolled So Far *</Label>
                        <Input
                            type="number"
                            min="0"
                            value={data.enrolled_so_far}
                            onChange={(e) => setData('enrolled_so_far', e.target.value)}
                            disabled={isReadOnly}
                        />
                        <InputError message={errors.enrolled_so_far} />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Section 3: Schedule</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Training Hours Per Day *</Label>
                        <Input
                            type="number"
                            step="0.5"
                            min="0.5"
                            max="24"
                            value={data.training_hours_per_day}
                            onChange={(e) => setData('training_hours_per_day', e.target.value)}
                            disabled={isReadOnly}
                        />
                        <InputError message={errors.training_hours_per_day} />
                    </div>

                    <div className="space-y-2">
                        <Label>Batch Start Date *</Label>
                        <Input
                            type="date"
                            value={data.start_date}
                            onChange={(e) => setData('start_date', e.target.value)}
                            disabled={isReadOnly}
                        />
                        <InputError message={errors.start_date} />
                    </div>

                    <div className="space-y-2">
                        <Label>Batch End Date *</Label>
                        <Input
                            type="date"
                            value={data.end_date}
                            onChange={(e) => setData('end_date', e.target.value)}
                            min={data.start_date}
                            disabled={isReadOnly}
                        />
                        <InputError message={errors.end_date} />
                    </div>

                    <div className="space-y-2">
                        <Label>Batch Freeze Date</Label>
                        <Input
                            type="date"
                            value={data.freeze_date}
                            onChange={(e) => setData('freeze_date', e.target.value)}
                            disabled={isReadOnly}
                        />
                        <InputError message={errors.freeze_date} />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Section 4: Batch Slots</CardTitle>
                    {!isReadOnly && (
                        <Button type="button" variant="outline" size="sm" onClick={addSlot}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Slot
                        </Button>
                    )}
                </CardHeader>
                <CardContent className="space-y-4">
                    {data.slots.map((slot, index) => (
                        <div key={index} className="flex flex-wrap items-end gap-4 p-4 border rounded-md relative">
                            <div className="space-y-2 flex-1 min-w-[150px]">
                                <Label>Start Time *</Label>
                                <Input
                                    type="time"
                                    value={slot.start_time}
                                    onChange={(e) => updateSlot(index, 'start_time', e.target.value)}
                                    disabled={isReadOnly}
                                    required
                                />
                                <InputError message={(errors as any)[`slots.${index}.start_time`] as string} />
                            </div>
                            
                            <div className="space-y-2 flex-1 min-w-[150px]">
                                <Label>End Time *</Label>
                                <Input
                                    type="time"
                                    value={slot.end_time}
                                    onChange={(e) => updateSlot(index, 'end_time', e.target.value)}
                                    disabled={isReadOnly}
                                    required
                                />
                                <InputError message={(errors as any)[`slots.${index}.end_time`] as string} />
                            </div>

                            <div className="space-y-2 flex-1 min-w-[150px]">
                                <Label>Hours *</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={slot.hours}
                                    onChange={(e) => updateSlot(index, 'hours', e.target.value)}
                                    disabled={isReadOnly}
                                    required
                                />
                                <InputError message={(errors as any)[`slots.${index}.hours`] as string} />
                            </div>

                            {!isReadOnly && data.slots.length > 1 && (
                                <Button 
                                    type="button" 
                                    variant="destructive" 
                                    size="icon" 
                                    className="mb-0.5"
                                    onClick={() => removeSlot(index)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    ))}
                    {typeof errors.slots === 'string' && <InputError message={errors.slots} />}
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Section 5: Trainer Details</CardTitle>
                    {!isReadOnly && (
                        <Button type="button" variant="outline" size="sm" onClick={addTrainer}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Trainer
                        </Button>
                    )}
                </CardHeader>
                <CardContent className="space-y-4">
                    {data.trainers.map((trainer, index) => (
                        <div key={index} className="flex flex-wrap items-center gap-4 p-4 border rounded-md relative">
                            <div className="space-y-2 flex-1 min-w-[250px]">
                                <Label>Select Trainer *</Label>
                                <Select
                                    options={trainerOptions}
                                    value={trainerOptions.find(t => t.value === Number(trainer.trainer_id)) || null}
                                    onChange={(val: any) => updateTrainer(index, 'trainer_id', val?.value || '')}
                                    isDisabled={isReadOnly}
                                    className="react-select-container text-sm"
                                    classNamePrefix="react-select"
                                />
                                <InputError message={(errors as any)[`trainers.${index}.trainer_id`] as string} />
                            </div>
                            
                            <div className="space-y-2 flex-1 min-w-[150px]">
                                <Label>Mobile Number</Label>
                                <Input
                                    value={trainer.mobile_number}
                                    onChange={(e) => updateTrainer(index, 'mobile_number', e.target.value)}
                                    disabled={isReadOnly}
                                    placeholder="Optional"
                                />
                                <InputError message={(errors as any)[`trainers.${index}.mobile_number`] as string} />
                            </div>

                            <div className="flex items-center space-x-2 pt-8 flex-1 min-w-[120px]">
                                <Checkbox
                                    id={`certified_${index}`}
                                    checked={trainer.is_certified}
                                    onCheckedChange={(checked) => updateTrainer(index, 'is_certified', checked)}
                                    disabled={isReadOnly}
                                />
                                <Label htmlFor={`certified_${index}`} className="cursor-pointer">
                                    Certified
                                </Label>
                            </div>

                            {!isReadOnly && data.trainers.length > 1 && (
                                <Button 
                                    type="button" 
                                    variant="destructive" 
                                    size="icon" 
                                    className="mb-0.5"
                                    onClick={() => removeTrainer(index)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    ))}
                    {typeof errors.trainers === 'string' && <InputError message={errors.trainers} />}
                </CardContent>
            </Card>

            {!isReadOnly && (
                <div className="flex justify-end pt-4 border-t gap-3">
                    <Button type="button" variant="outline" onClick={() => window.history.back()}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={processing}>
                        {isEdit ? 'Update Draft' : 'Save as Draft'}
                    </Button>
                </div>
            )}
        </form>
    );
}
