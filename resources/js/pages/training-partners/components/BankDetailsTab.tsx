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
            gst_number: initialData?.gst_number ?? '',
            pan_number: initialData?.pan_number ?? '',
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
        <form onSubmit={onSubmit} className="space-y-4 pt-4">
            <div className="grid gap-4 md:grid-cols-2">
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
                <div className="space-y-2">
                    <Label htmlFor="gst_number">GST Number</Label>
                    <Input id="gst_number" value={data.bank_detail.gst_number} onChange={(e) => setData('bank_detail', { ...data.bank_detail, gst_number: e.target.value })} />
                    <InputError message={errors['bank_detail.gst_number' as keyof typeof errors]} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="pan_number">PAN Number</Label>
                    <Input id="pan_number" value={data.bank_detail.pan_number} onChange={(e) => setData('bank_detail', { ...data.bank_detail, pan_number: e.target.value })} />
                    <InputError message={errors['bank_detail.pan_number' as keyof typeof errors]} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="tan_number">TAN Number</Label>
                    <Input id="tan_number" value={data.bank_detail.tan_number} onChange={(e) => setData('bank_detail', { ...data.bank_detail, tan_number: e.target.value })} />
                    <InputError message={errors['bank_detail.tan_number' as keyof typeof errors]} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="cin_number">CIN Number</Label>
                    <Input id="cin_number" value={data.bank_detail.cin_number} onChange={(e) => setData('bank_detail', { ...data.bank_detail, cin_number: e.target.value })} />
                    <InputError message={errors['bank_detail.cin_number' as keyof typeof errors]} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="msme_number">MSME Number</Label>
                    <Input id="msme_number" value={data.bank_detail.msme_number} onChange={(e) => setData('bank_detail', { ...data.bank_detail, msme_number: e.target.value })} />
                    <InputError message={errors['bank_detail.msme_number' as keyof typeof errors]} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="udyam_number">Udyam Number</Label>
                    <Input id="udyam_number" value={data.bank_detail.udyam_number} onChange={(e) => setData('bank_detail', { ...data.bank_detail, udyam_number: e.target.value })} />
                    <InputError message={errors['bank_detail.udyam_number' as keyof typeof errors]} />
                </div>

                {/* Financials */}
                <div className="space-y-2">
                    <Label>Financial Year 1</Label>
                    <div className="flex gap-2">
                        <Input
                            value={data.bank_detail.financial_year_1}
                            onChange={(e) => setData('bank_detail', { ...data.bank_detail, financial_year_1: e.target.value })}
                            placeholder="YYYY-YY"
                            className="w-1/2"
                        />
                        <Input
                            type="number"
                            step="0.01"
                            value={data.bank_detail.financial_turnover_1 as any}
                            onChange={(e) => setData('bank_detail', { ...data.bank_detail, financial_turnover_1: e.target.value })}
                            placeholder="Turnover"
                            className="w-1/2"
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label>Financial Year 2</Label>
                    <div className="flex gap-2">
                        <Input
                            value={data.bank_detail.financial_year_2}
                            onChange={(e) => setData('bank_detail', { ...data.bank_detail, financial_year_2: e.target.value })}
                            placeholder="YYYY-YY"
                            className="w-1/2"
                        />
                        <Input
                            type="number"
                            step="0.01"
                            value={data.bank_detail.financial_turnover_2 as any}
                            onChange={(e) => setData('bank_detail', { ...data.bank_detail, financial_turnover_2: e.target.value })}
                            placeholder="Turnover"
                            className="w-1/2"
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label>Financial Year 3</Label>
                    <div className="flex gap-2">
                        <Input
                            value={data.bank_detail.financial_year_3}
                            onChange={(e) => setData('bank_detail', { ...data.bank_detail, financial_year_3: e.target.value })}
                            placeholder="YYYY-YY"
                            className="w-1/2"
                        />
                        <Input
                            type="number"
                            step="0.01"
                            value={data.bank_detail.financial_turnover_3 as any}
                            onChange={(e) => setData('bank_detail', { ...data.bank_detail, financial_turnover_3: e.target.value })}
                            placeholder="Turnover"
                            className="w-1/2"
                        />
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
