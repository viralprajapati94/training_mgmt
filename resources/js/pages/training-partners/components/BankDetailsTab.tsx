import { FormEvent } from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import Select from 'react-select';

type Props = {
    partnerId: number;
    initialData?: any;
};

const accountTypeOptions = [
    { value: 'savings', label: 'Savings' },
    { value: 'current', label: 'Current' },
];

export default function BankDetailsTab({ partnerId, initialData = {} }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        bank_detail: {
            bank_name: initialData?.bank_name ?? '',
            branch_name: initialData?.branch_name ?? '',
            account_holder_name: initialData?.account_holder_name ?? '',
            account_number: initialData?.account_number ?? '',
            ifsc_code: initialData?.ifsc_code ?? '',
            account_type: initialData?.account_type ?? '',
            tan_number: initialData?.tan_number ?? '',
            cin_number: initialData?.cin_number ?? '',
            msme_number: initialData?.msme_number ?? '',
            udyam_number: initialData?.udyam_number ?? '',
            financial_year_1: initialData?.financial_year_1 ?? '',
            financial_turnover_1: initialData?.financial_turnover_1 ?? '',
            financial_year_2: initialData?.financial_year_2 ?? '',
            financial_turnover_2: initialData?.financial_turnover_2 ?? '',
            financial_year_3: initialData?.financial_year_3 ?? '',
            financial_turnover_3: initialData?.financial_turnover_3 ?? '',
        },
    });

    const onSubmit = (e: FormEvent) => {
        e.preventDefault();
        put(`/admin/training-partners/${partnerId}/bank-details?next_tab=documents`, {
            preserveScroll: true,
        });
    };

    return (
        <form onSubmit={onSubmit} className="space-y-3 pt-4">
            <div className="grid gap-3 md:grid-cols-3">
                <div className="space-y-2">
                    <Label htmlFor="bank_name">Bank Name</Label>
                    <Input id="bank_name" value={data.bank_detail.bank_name} onChange={(e) => setData('bank_detail', { ...data.bank_detail, bank_name: e.target.value })} />
                    <InputError message={errors['bank_detail.bank_name' as keyof typeof errors]} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="branch_name">Branch Name</Label>
                    <Input id="branch_name" value={data.bank_detail.branch_name} onChange={(e) => setData('bank_detail', { ...data.bank_detail, branch_name: e.target.value })} />
                    <InputError message={errors['bank_detail.branch_name' as keyof typeof errors]} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="account_holder_name">Account Holder Name</Label>
                    <Input
                        id="account_holder_name"
                        value={data.bank_detail.account_holder_name}
                        onChange={(e) => setData('bank_detail', { ...data.bank_detail, account_holder_name: e.target.value })}
                    />
                    <InputError message={errors['bank_detail.account_holder_name' as keyof typeof errors]} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="account_number">Account Number</Label>
                    <Input
                        id="account_number"
                        value={data.bank_detail.account_number}
                        onChange={(e) => setData('bank_detail', { ...data.bank_detail, account_number: e.target.value })}
                    />
                    <InputError message={errors['bank_detail.account_number' as keyof typeof errors]} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="ifsc_code">IFSC Code</Label>
                    <Input id="ifsc_code" value={data.bank_detail.ifsc_code} onChange={(e) => setData('bank_detail', { ...data.bank_detail, ifsc_code: e.target.value })} />
                    <InputError message={errors['bank_detail.ifsc_code' as keyof typeof errors]} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="account_type">Account Type</Label>
                    <Select
                        inputId="account_type"
                        options={accountTypeOptions}
                        value={accountTypeOptions.find((o) => o.value === data.bank_detail.account_type) ?? null}
                        onChange={(option) => setData('bank_detail', { ...data.bank_detail, account_type: option?.value ?? '' })}
                        className="react-select-container"
                        classNamePrefix="react-select"
                        placeholder="Select type"
                        isClearable
                    />
                    <InputError message={errors['bank_detail.account_type' as keyof typeof errors]} />
                </div>                

                {/* Financial Years Section */}
                <div className="space-y-2 md:col-span-3">
                    <h3 className="text-lg font-medium mb-4">Last 3 Financial Years</h3>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Financial Year 1</Label>
                                <Input
                                    value={data.bank_detail.financial_year_1}
                                    onChange={(e) => setData('bank_detail', { ...data.bank_detail, financial_year_1: e.target.value })}
                                    placeholder="YYYY-YY"
                                />
                                <InputError message={errors['bank_detail.financial_year_1' as keyof typeof errors]} />
                            </div>
                            <div className="space-y-2">
                                <Label>Turn Over</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={data.bank_detail.financial_turnover_1 as any}
                                    onChange={(e) => setData('bank_detail', { ...data.bank_detail, financial_turnover_1: e.target.value })}
                                    placeholder="Enter turnover amount"
                                />
                                <InputError message={errors['bank_detail.financial_turnover_1' as keyof typeof errors]} />
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Financial Year 2</Label>
                                <Input
                                    value={data.bank_detail.financial_year_2}
                                    onChange={(e) => setData('bank_detail', { ...data.bank_detail, financial_year_2: e.target.value })}
                                    placeholder="YYYY-YY"
                                />
                                <InputError message={errors['bank_detail.financial_year_2' as keyof typeof errors]} />
                            </div>
                            <div className="space-y-2">
                                <Label>Turn Over</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={data.bank_detail.financial_turnover_2 as any}
                                    onChange={(e) => setData('bank_detail', { ...data.bank_detail, financial_turnover_2: e.target.value })}
                                    placeholder="Enter turnover amount"
                                />
                                <InputError message={errors['bank_detail.financial_turnover_2' as keyof typeof errors]} />
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Financial Year 3</Label>
                                <Input
                                    value={data.bank_detail.financial_year_3}
                                    onChange={(e) => setData('bank_detail', { ...data.bank_detail, financial_year_3: e.target.value })}
                                    placeholder="YYYY-YY"
                                />
                                <InputError message={errors['bank_detail.financial_year_3' as keyof typeof errors]} />
                            </div>
                            <div className="space-y-2">
                                <Label>Turn Over</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={data.bank_detail.financial_turnover_3 as any}
                                    onChange={(e) => setData('bank_detail', { ...data.bank_detail, financial_turnover_3: e.target.value })}
                                    placeholder="Enter turnover amount"
                                />
                                <InputError message={errors['bank_detail.financial_turnover_3' as keyof typeof errors]} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
                <Button type="submit" disabled={processing}>
                    Save Bank Details
                </Button>
            </div>
        </form>
    );
}
