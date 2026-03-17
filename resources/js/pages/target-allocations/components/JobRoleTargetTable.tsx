import { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2 } from 'lucide-react';
import Select from 'react-select';
import InputError from '@/components/input-error';

// Custom styles for react-select to ensure proper z-index
const selectStyles = {
    menu: (provided: any) => ({
        ...provided,
        zIndex: 50,
    }),
    menuPortal: (provided: any) => ({
        ...provided,
        zIndex: 50,
    }),
};

export default function JobRoleTargetTable({ allocationId, jobRolesTargets, sectors, jobRoles }: any) {
    const { data, setData, post, processing, errors, reset } = useForm({
        sector_id: '',
        job_role_id: '',
        target: '',
        target_validity_months: '',
    });

    const [selectedJobRole, setSelectedJobRole] = useState<any>(null);

    const availableJobRoles = jobRoles.filter((jr: any) => data.sector_id && jr.sector_id === Number(data.sector_id));

    const handleJobRoleChange = (option: any) => {
        setData('job_role_id', option?.value ?? '');
        const role = jobRoles.find((jr: any) => jr.id === option?.value);
        setSelectedJobRole(role || null);
    };

    const submit = (e: any) => {
        e.preventDefault();
        post(`/tp/target-allocations/${allocationId}/add-job-role`, {
            onSuccess: () => {
                reset();
                setSelectedJobRole(null);
            },
        });
    };

    const removeJobRole = (jobRoleTargetId: number) => {
        if (confirm('Are you sure you want to remove this Job Role from the allocation?')) {
            router.delete(`/tp/target-allocations/${allocationId}/remove-job-role/${jobRoleTargetId}`);
        }
    };

    const totalTargets = jobRolesTargets.reduce((acc: number, curr: any) => acc + curr.target, 0);

    return (
        <div className="space-y-4 mt-8">
            <div className="border-b pb-2 mb-4">
                <h2 className="text-lg font-semibold text-primary">Add Sectors and Job Roles (As approved)</h2>
            </div>

            <div className="rounded-md border overflow-x-auto">
                <form onSubmit={submit}>
                    <table className="w-full text-sm text-left">
                        <thead className="bg-primary text-primary-foreground">
                            <tr>
                                <th className="px-2 py-2 font-medium w-48">Sector</th>
                                <th className="px-2 py-2 font-medium w-64">Job Role Name (Code)</th>
                                <th className="px-2 py-2 font-medium">QP Code</th>
                                <th className="px-2 py-2 font-medium">NSQF Level</th>
                                <th className="px-2 py-2 font-medium">Training Hours</th>
                                <th className="px-2 py-2 font-medium w-32">Target</th>
                                <th className="px-2 py-2 font-medium w-40">Target Validity (in Months)</th>
                                <th className="px-2 py-2 font-medium w-24">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {/* Input Row */}
                            <tr className="bg-muted/30">
                                <td className="p-2 align-top">
                                    <Select 
                                        options={sectors.map((s: any) => ({ value: s.id, label: s.name }))}
                                        value={sectors.find((s: any) => s.id === data.sector_id) ? { value: data.sector_id, label: sectors.find((s: any) => s.id === data.sector_id).name } : null}
                                        onChange={(o: any) => {
                                            setData('sector_id', o?.value ?? '');
                                            setData('job_role_id', '');
                                            setSelectedJobRole(null);
                                        }}
                                        className="react-select-container text-xs"
                                        classNamePrefix="react-select"
                                        placeholder="--Select--"
                                        styles={selectStyles}
                                        menuPortalTarget={document.body}
                                    />
                                    <InputError message={errors.sector_id} className="mt-1" />
                                </td>
                                <td className="p-2 align-top">
                                    <Select 
                                        options={availableJobRoles.map((jr: any) => ({ value: jr.id, label: jr.name }))}
                                        value={selectedJobRole ? { value: selectedJobRole.id, label: selectedJobRole.name } : null}
                                        onChange={handleJobRoleChange}
                                        className="react-select-container text-xs"
                                        classNamePrefix="react-select"
                                        placeholder="--Select--"
                                        isDisabled={!data.sector_id}
                                        styles={selectStyles}
                                        menuPortalTarget={document.body}
                                    />
                                    <InputError message={errors.job_role_id} className="mt-1" />
                                </td>
                                <td className="p-2 align-top">
                                    <Input value={selectedJobRole?.qp_code || ''} readOnly className="h-9 text-xs bg-muted" />
                                </td>
                                <td className="p-2 align-top">
                                    <Input value={selectedJobRole?.nsqf_level || ''} readOnly className="h-9 text-xs bg-muted" />
                                </td>
                                <td className="p-2 align-top">
                                    <Input value={selectedJobRole?.training_hours || ''} readOnly className="h-9 text-xs bg-muted" />
                                </td>
                                <td className="p-2 align-top">
                                    <Input 
                                        type="number" 
                                        value={data.target} 
                                        onChange={(e) => setData('target', e.target.value)} 
                                        className="h-9 text-xs" 
                                    />
                                    <InputError message={errors.target} className="mt-1" />
                                </td>
                                <td className="p-2 align-top">
                                    <Input 
                                        type="number" 
                                        min="1"
                                        max="120"
                                        value={data.target_validity_months} 
                                        onChange={(e) => setData('target_validity_months', e.target.value)} 
                                        className="h-9 text-xs"
                                    />
                                    <InputError message={errors.target_validity_months} className="mt-1" />
                                </td>
                                <td className="p-2 align-top">
                                    <Button type="submit" size="sm" disabled={processing || !data.job_role_id}>Add</Button>
                                </td>
                            </tr>
                            
                            {/* Existing Job Roles */}
                            {jobRolesTargets.map((jr: any) => (
                                <tr key={jr.id}>
                                    <td className="p-2 text-xs">{jr.sector?.name}</td>
                                    <td className="p-2 text-xs">{jr.job_role?.name}</td>
                                    <td className="p-2 text-xs">{jr.qp_code}</td>
                                    <td className="p-2 text-xs">{jr.nsqf_level}</td>
                                    <td className="p-2 text-xs">{jr.training_hours}</td>
                                    <td className="p-2 text-xs font-semibold">{jr.target}</td>
                                    <td className="p-2 text-xs">{jr.target_validity_months}</td>
                                    <td className="p-2 text-xs">
                                        <Button type="button" variant="ghost" size="icon" onClick={() => removeJobRole(jr.id)} className="text-destructive hover:text-destructive/90 hover:bg-destructive/10 h-8 w-8">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}

                            {/* Total Row */}
                            {jobRolesTargets.length > 0 && (
                                <tr className="bg-muted/50 font-semibold">
                                    <td colSpan={5} className="p-2 text-right text-xs">Total</td>
                                    <td className="p-2 text-xs">{totalTargets}</td>
                                    <td colSpan={2}></td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </form>
            </div>
        </div>
    );
}
