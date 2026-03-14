import { FormEvent } from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import Select from 'react-select';

export default function ProjectDetailsForm({ allocation, schemes, assessmentBodies, projectTypes }: any) {
    const isEdit = Boolean(allocation?.id);

    const { data, setData, post, put, processing, errors } = useForm({
        work_order_no: allocation?.work_order_no ?? '',
        scheme_id: allocation?.scheme_id ?? '',
        project_type: allocation?.project_type ?? '',
        assessment_body_id: allocation?.assessment_body_id ?? '',
        project_duration_from: allocation?.project_duration_from ?? '',
        project_duration_to: allocation?.project_duration_to ?? '',
        agreement_date: allocation?.agreement_date ?? '',
    });

    const onSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (isEdit) {
            put(`/tp/target-allocations/${allocation.id}`);
        } else {
            post('/tp/target-allocations/project-details');
        }
    };

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <h2 className="text-lg font-semibold border-b pb-2 mb-4">Project Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                    <Label>Target Allocation / Work Order No: *</Label>
                    <Input value={data.work_order_no} onChange={(e) => setData('work_order_no', e.target.value)} required />
                    <InputError message={errors.work_order_no} />
                </div>
                <div className="space-y-2">
                    <Label>Scheme Name: *</Label>
                    <Select
                        options={schemes.map((s: any) => ({ value: s.id, label: s.name }))}
                        value={schemes.find((s: any) => s.id === data.scheme_id) ? { value: data.scheme_id, label: schemes.find((s: any) => s.id === data.scheme_id).name } : null}
                        onChange={(o: any) => setData('scheme_id', o?.value ?? '')}
                        className="react-select-container"
                        classNamePrefix="react-select"
                    />
                    <InputError message={errors.scheme_id} />
                </div>
                <div className="space-y-2">
                    <Label>Project Type: *</Label>
                    <Select
                        options={projectTypes}
                        value={projectTypes.find((p: any) => p.value === data.project_type) ?? null}
                        onChange={(o: any) => setData('project_type', o?.value ?? '')}
                        className="react-select-container"
                        classNamePrefix="react-select"
                    />
                    <InputError message={errors.project_type} />
                </div>
                <div className="space-y-2">
                    <Label>Target Allocation / Agreement Date: *</Label>
                    <Input type="date" value={data.agreement_date} onChange={(e) => setData('agreement_date', e.target.value)} required />
                    <InputError message={errors.agreement_date} />
                </div>
                <div className="space-y-2">
                    <Label>Project Duration (From Date): *</Label>
                    <Input type="date" value={data.project_duration_from} onChange={(e) => setData('project_duration_from', e.target.value)} required />
                    <InputError message={errors.project_duration_from} />
                </div>
                <div className="space-y-2">
                    <Label>Project Duration (To Date): *</Label>
                    <Input type="date" value={data.project_duration_to} onChange={(e) => setData('project_duration_to', e.target.value)} required />
                    <InputError message={errors.project_duration_to} />
                </div>
                <div className="space-y-2">
                    <Label>Implementing Organisation Name: *</Label>
                    <Input value="Gujarat Skill Development Mission" readOnly className="bg-muted" />
                </div>
                <div className="space-y-2">
                    <Label>Assessment Body: *</Label>
                    <Select
                        options={assessmentBodies.map((a: any) => ({ value: a.id, label: a.name }))}
                        value={assessmentBodies.find((a: any) => a.id === data.assessment_body_id) ? { value: data.assessment_body_id, label: assessmentBodies.find((a: any) => a.id === data.assessment_body_id).name } : null}
                        onChange={(o: any) => setData('assessment_body_id', o?.value ?? '')}
                        className="react-select-container"
                        classNamePrefix="react-select"
                    />
                    <InputError message={errors.assessment_body_id} />
                </div>
            </div>
            
            <div className="flex justify-start gap-2 mt-6">
                <Button type="submit" disabled={processing}>
                    {isEdit ? 'Update Project Details' : 'Save & Continue'}
                </Button>
            </div>
        </form>
    );
}
