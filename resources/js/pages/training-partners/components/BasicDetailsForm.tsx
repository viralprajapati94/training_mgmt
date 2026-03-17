import { FormEvent } from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import Select from 'react-select';
import type { StateOption, DistrictOption, TalukaOption, CityOption } from '../types';

type Props = {
    partner?: any;
    states: StateOption[];
    districts: DistrictOption[];
    talukas: TalukaOption[];
    cities: CityOption[];
};

const statusOptions = [
    { value: true, label: 'Active' },
    { value: false, label: 'Inactive' },
];

export default function BasicDetailsForm({ partner, states, districts, talukas, cities }: Props) {
    const isEdit = Boolean(partner?.id);

    const { data, setData, post, put, processing, errors } = useForm({
        tp_id: partner?.tp_id ?? '',
        sip_id: partner?.sip_id ?? '',
        tp_name: partner?.tp_name ?? '',
        address: partner?.address ?? '',
        state_id: partner?.state_id ?? '',
        district_id: partner?.district_id ?? '',
        taluka_id: partner?.taluka_id ?? '',
        city_id: partner?.city_id ?? '',
        pin_code: partner?.pin_code ?? '',
        email: partner?.email ?? '',
        mobile: partner?.mobile ?? '',
        password: '',
        website: partner?.website ?? '',
        spoc_name: partner?.spoc_name ?? '',
        spoc_mobile: partner?.spoc_mobile ?? '',
        authorized_person_name: partner?.authorized_person_name ?? '',
        authorized_person_mobile: partner?.authorized_person_mobile ?? '',
        gst_number: partner?.bank_detail?.gst_number ?? '',
        pan_number: partner?.bank_detail?.pan_number ?? '',
        status: partner?.status ?? true,
    });

    const stateOptions = states.map((s) => ({ value: s.id, label: s.state }));
    const districtOptions = districts
        .filter((d) => !data.state_id || d.state_id === Number(data.state_id))
        .map((d) => ({ value: d.id, label: d.district }));
    const talukaOptions = talukas
        .filter((t) => !data.district_id || t.district_id === Number(data.district_id))
        .map((t) => ({ value: t.id, label: t.taluko }));
    const cityOptions = cities
        .filter((c) => !data.taluka_id || c.taluka_id === Number(data.taluka_id))
        .map((c) => ({ value: c.id, label: c.city }));

    const onSubmit = (e: FormEvent) => {
        e.preventDefault();
        
        if (isEdit) {
            put(`/admin/training-partners/${partner.id}/basic-details?next_tab=schemes`);
        } else {
            post('/admin/training-partners/basic-details');
        }
    };

    return (
        <form onSubmit={onSubmit} className="space-y-4 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Row 1 */}
                <div className="space-y-2">
                    <Label htmlFor="tp_id">TP ID</Label>
                    <Input id="tp_id" value={data.tp_id} onChange={(e) => setData('tp_id', e.target.value)} required />
                    <InputError message={errors.tp_id} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="sip_id">SIP ID</Label>
                    <Input id="sip_id" value={data.sip_id} onChange={(e) => setData('sip_id', e.target.value)} />
                    <InputError message={errors.sip_id} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="tp_name">TP Name</Label>
                    <Input id="tp_name" value={data.tp_name} onChange={(e) => setData('tp_name', e.target.value)} required />
                    <InputError message={errors.tp_name} />
                </div>

                {/* Row 2 */}
                <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input id="website" value={data.website} onChange={(e) => setData('website', e.target.value)} />
                    <InputError message={errors.website} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} required />
                    <InputError message={errors.email} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="mobile">Mobile</Label>
                    <Input id="mobile" value={data.mobile} onChange={(e) => setData('mobile', e.target.value)} required />
                    <InputError message={errors.mobile} />
                </div>

                {/* Row 3 */}
                <div className="space-y-2">
                    <Label htmlFor="state_id">State</Label>
                    <Select
                        inputId="state_id"
                        options={stateOptions}
                        value={stateOptions.find((o) => o.value === Number(data.state_id)) ?? null}
                        onChange={(option) => {
                            setData('state_id', option?.value ?? '');
                            setData('district_id', '');
                            setData('taluka_id', '');
                            setData('city_id', '');
                        }}
                        className="react-select-container"
                        classNamePrefix="react-select"
                        placeholder="Select state"
                    />
                    <InputError message={errors.state_id} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="district_id">District</Label>
                    <Select
                        inputId="district_id"
                        options={districtOptions}
                        value={districtOptions.find((o) => o.value === Number(data.district_id)) ?? null}
                        onChange={(option) => {
                            setData('district_id', option?.value ?? '');
                            setData('taluka_id', '');
                            setData('city_id', '');
                        }}
                        className="react-select-container"
                        classNamePrefix="react-select"
                        placeholder="Select district"
                    />
                    <InputError message={errors.district_id} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="taluka_id">Taluka</Label>
                    <Select
                        inputId="taluka_id"
                        options={talukaOptions}
                        value={talukaOptions.find((o) => o.value === Number(data.taluka_id)) ?? null}
                        onChange={(option) => {
                            setData('taluka_id', option?.value ?? '');
                            setData('city_id', '');
                        }}
                        className="react-select-container"
                        classNamePrefix="react-select"
                        placeholder="Select taluka"
                    />
                    <InputError message={errors.taluka_id} />
                </div>

                {/* Row 4 */}
                <div className="space-y-2">
                    <Label htmlFor="city_id">City</Label>
                    <Select
                        inputId="city_id"
                        options={cityOptions}
                        value={cityOptions.find((o) => o.value === Number(data.city_id)) ?? null}
                        onChange={(option) => setData('city_id', option?.value ?? '')}
                        className="react-select-container"
                        classNamePrefix="react-select"
                        placeholder="Select city"
                    />
                    <InputError message={errors.city_id} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="pin_code">Pin Code</Label>
                    <Input id="pin_code" value={data.pin_code} onChange={(e) => setData('pin_code', e.target.value)} />
                    <InputError message={errors.pin_code} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                        inputId="status"
                        options={statusOptions}
                        value={statusOptions.find((o) => o.value === data.status) ?? statusOptions[0]}
                        onChange={(option) => setData('status', option?.value ?? true)}
                        className="react-select-container"
                        classNamePrefix="react-select"
                    />
                    <InputError message={errors.status} />
                </div>

                {/* Row 5 */}
                <div className="space-y-2">
                    <Label htmlFor="spoc_name">SPOC Name</Label>
                    <Input id="spoc_name" value={data.spoc_name} onChange={(e) => setData('spoc_name', e.target.value)} />
                    <InputError message={errors.spoc_name} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="spoc_mobile">SPOC Mobile</Label>
                    <Input id="spoc_mobile" value={data.spoc_mobile} onChange={(e) => setData('spoc_mobile', e.target.value)} />
                    <InputError message={errors.spoc_mobile} />
                </div>
                <div className="space-y-2">
                    {/* Empty placeholder for alignment, or Address could go here but user wants Address to be col-span-3 */}
                </div>

                {/* Address Full Width */}
                <div className="space-y-2 md:col-span-3">
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" value={data.address} onChange={(e) => setData('address', e.target.value)} />
                    <InputError message={errors.address} />
                </div>

                {/* Row 6 */}
                <div className="space-y-2">
                    <Label htmlFor="authorized_person_name">Authorized Person Name</Label>
                    <Input
                        id="authorized_person_name"
                        value={data.authorized_person_name}
                        onChange={(e) => setData('authorized_person_name', e.target.value)}
                    />
                    <InputError message={errors.authorized_person_name} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="authorized_person_mobile">Authorized Person Mobile</Label>
                    <Input
                        id="authorized_person_mobile"
                        value={data.authorized_person_mobile}
                        onChange={(e) => setData('authorized_person_mobile', e.target.value)}
                    />
                    <InputError message={errors.authorized_person_mobile} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password">Password {isEdit && '(optional)'}</Label>
                    <Input id="password" type="password" value={data.password} onChange={(e) => setData('password', e.target.value)} required={!isEdit} />
                    <InputError message={errors.password} />
                </div>
            </div>

            {/* GST and PAN Section */}
            <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-4">Tax Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="gst_number">GST Number</Label>
                        <Input id="gst_number" value={data.gst_number} onChange={(e) => setData('gst_number', e.target.value)} />
                        <InputError message={errors.gst_number} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="pan_number">PAN Number</Label>
                        <Input id="pan_number" value={data.pan_number} onChange={(e) => setData('pan_number', e.target.value)} />
                        <InputError message={errors.pan_number} />
                    </div>
                </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
                <Button type="submit" disabled={processing}>
                    Save & Next
                </Button>
            </div>
        </form>
    );
}
