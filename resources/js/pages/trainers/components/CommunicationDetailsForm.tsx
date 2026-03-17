import { FormEvent, useEffect, useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import InputError from '@/components/input-error';
import Select from 'react-select';

type AddressData = {
    type: 'residential' | 'communication';
    address_line: string;
    city_id: string | number;
    taluka_id: string | number;
    district_id: string | number;
    state_id: string | number;
    pin_code: string;
    is_same_as_residential: boolean;
};

type Option = { value: number; label: string };

export default function CommunicationDetailsForm({ trainerId, initialData, onSuccess }: any) {
    const isEdit = Boolean(initialData && initialData.length > 0);

    const [states, setStates] = useState<Option[]>([]);
    
    // Address 0 (Residential) dropdown options
    const [resDistricts, setResDistricts] = useState<Option[]>([]);
    const [resTalukas, setResTalukas] = useState<Option[]>([]);
    const [resCities, setResCities] = useState<Option[]>([]);

    // Address 1 (Communication) dropdown options
    const [comDistricts, setComDistricts] = useState<Option[]>([]);
    const [comTalukas, setComTalukas] = useState<Option[]>([]);
    const [comCities, setComCities] = useState<Option[]>([]);

    useEffect(() => {
        fetch('/locations/states')
            .then(res => res.json())
            .then(data => setStates(data.map((s: any) => ({ value: s.id, label: s.state }))));
    }, []);

    const fetchLocations = async (type: 'district' | 'taluka' | 'city', parentId: number | string, setOptions: Function) => {
        if (!parentId) {
            setOptions([]);
            return;
        }
        
        let url = '';
        if (type === 'district') url = `/locations/districts?state_id=${parentId}`;
        if (type === 'taluka') url = `/locations/talukas?district_id=${parentId}`;
        if (type === 'city') url = `/locations/cities?taluka_id=${parentId}`;

        try {
            const res = await fetch(url);
            const data = await res.json();
            setOptions(data.map((item: any) => ({ 
                value: item.id, 
                label: item.district || item.taluko || item.city 
            })));
        } catch (error) {
            console.error('Failed to fetch locations:', error);
            setOptions([]);
        }
    };

    const getInitialAddress = (type: 'residential' | 'communication'): AddressData => {
        if (isEdit) {
            const address = initialData.find((a: any) => a.type === type);
            if (address) {
                return {
                    type,
                    address_line: address.address_line ?? '',
                    city_id: address.city_id ?? '',
                    taluka_id: address.taluka_id ?? '',
                    district_id: address.district_id ?? '',
                    state_id: address.state_id ?? '',
                    pin_code: address.pin_code ?? '',
                    is_same_as_residential: Boolean(address.is_same_as_residential),
                };
            }
        }
        
        return {
            type,
            address_line: '',
            city_id: '',
            taluka_id: '',
            district_id: '',
            state_id: '',
            pin_code: '',
            is_same_as_residential: type === 'communication' ? false : false,
        };
    };

    const [isSameAddress, setIsSameAddress] = useState<boolean>(
        isEdit ? Boolean(initialData?.find((a: any) => a.type === 'communication')?.is_same_as_residential) : false
    );

    const { data, setData, put, processing, errors } = useForm({
        addresses: [
            getInitialAddress('residential'),
            getInitialAddress('communication'),
        ],
    });

    // Fetch initial options if editing
    useEffect(() => {
        if (data.addresses[0].state_id) fetchLocations('district', data.addresses[0].state_id, setResDistricts);
        if (data.addresses[0].district_id) fetchLocations('taluka', data.addresses[0].district_id, setResTalukas);
        if (data.addresses[0].taluka_id) fetchLocations('city', data.addresses[0].taluka_id, setResCities);
        
        if (!isSameAddress) {
            if (data.addresses[1].state_id) fetchLocations('district', data.addresses[1].state_id, setComDistricts);
            if (data.addresses[1].district_id) fetchLocations('taluka', data.addresses[1].district_id, setComTalukas);
            if (data.addresses[1].taluka_id) fetchLocations('city', data.addresses[1].taluka_id, setComCities);
        }
    }, []);

    // Sync residential to communication if checkbox is checked
    useEffect(() => {
        if (isSameAddress) {
            const resData = data.addresses[0];
            setData('addresses', [
                resData,
                {
                    ...resData,
                    type: 'communication',
                    is_same_as_residential: true,
                },
            ]);
        }
    }, [isSameAddress, data.addresses[0]]);

    const handleAddressChange = (index: number, field: string, value: any) => {
        const newAddresses = [...data.addresses];
        newAddresses[index] = { ...newAddresses[index], [field]: value };
        
        // Handle cascading dropdowns
        if (field === 'state_id') {
            newAddresses[index].district_id = '';
            newAddresses[index].taluka_id = '';
            newAddresses[index].city_id = '';
            if (index === 0) {
                fetchLocations('district', value, setResDistricts);
                setResTalukas([]);
                setResCities([]);
            } else {
                fetchLocations('district', value, setComDistricts);
                setComTalukas([]);
                setComCities([]);
            }
        } else if (field === 'district_id') {
            newAddresses[index].taluka_id = '';
            newAddresses[index].city_id = '';
            if (index === 0) {
                fetchLocations('taluka', value, setResTalukas);
                setResCities([]);
            } else {
                fetchLocations('taluka', value, setComTalukas);
                setComCities([]);
            }
        } else if (field === 'taluka_id') {
            newAddresses[index].city_id = '';
            if (index === 0) {
                fetchLocations('city', value, setResCities);
            } else {
                fetchLocations('city', value, setComCities);
            }
        }

        if (index === 1 && field === 'is_same_as_residential') {
            setIsSameAddress(value);
            if (value) {
                const resData = newAddresses[0];
                newAddresses[1] = {
                    ...resData,
                    type: 'communication',
                    is_same_as_residential: true,
                };
            }
        }
        
        setData('addresses', newAddresses);
    };

    const onSubmit = (e: FormEvent) => {
        e.preventDefault();
        put(`/tp/trainers/${trainerId}`, {
            preserveScroll: true,
            onSuccess: () => onSuccess?.(),
        });
    };

    return (
        <form onSubmit={onSubmit} className="space-y-8 pt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Residential Address */}
                <div className="space-y-6">
                    <h3 className="text-lg font-medium border-b pb-2">Residential Address</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2 md:col-span-2">
                            <Label>Address Line *</Label>
                            <Input
                                value={data.addresses[0].address_line}
                                onChange={(e) => handleAddressChange(0, 'address_line', e.target.value)}
                                placeholder="Street, House No, Landmark"
                                required
                            />
                            <InputError message={errors['addresses.0.address_line' as keyof typeof errors]} />
                        </div>
                        
                        <div className="space-y-2">
                            <Label>State *</Label>
                            <Select
                                options={states}
                                value={states.find((s) => s.value === Number(data.addresses[0].state_id)) || null}
                                onChange={(val: any) => handleAddressChange(0, 'state_id', val?.value || '')}
                                placeholder="Select State"
                                className="react-select-container text-sm"
                                classNamePrefix="react-select"
                            />
                            <InputError message={errors['addresses.0.state_id' as keyof typeof errors]} />
                        </div>

                        <div className="space-y-2">
                            <Label>District *</Label>
                            <Select
                                options={resDistricts}
                                value={resDistricts.find((d) => d.value === Number(data.addresses[0].district_id)) || null}
                                onChange={(val: any) => handleAddressChange(0, 'district_id', val?.value || '')}
                                placeholder="Select District"
                                className="react-select-container text-sm"
                                classNamePrefix="react-select"
                                isDisabled={!data.addresses[0].state_id}
                            />
                            <InputError message={errors['addresses.0.district_id' as keyof typeof errors]} />
                        </div>

                        <div className="space-y-2">
                            <Label>Taluka *</Label>
                            <Select
                                options={resTalukas}
                                value={resTalukas.find((t) => t.value === Number(data.addresses[0].taluka_id)) || null}
                                onChange={(val: any) => handleAddressChange(0, 'taluka_id', val?.value || '')}
                                placeholder="Select Taluka"
                                className="react-select-container text-sm"
                                classNamePrefix="react-select"
                                isDisabled={!data.addresses[0].district_id}
                            />
                            <InputError message={errors['addresses.0.taluka_id' as keyof typeof errors]} />
                        </div>

                        <div className="space-y-2">
                            <Label>City/Village *</Label>
                            <Select
                                options={resCities}
                                value={resCities.find((c) => c.value === Number(data.addresses[0].city_id)) || null}
                                onChange={(val: any) => handleAddressChange(0, 'city_id', val?.value || '')}
                                placeholder="Select City"
                                className="react-select-container text-sm"
                                classNamePrefix="react-select"
                                isDisabled={!data.addresses[0].taluka_id}
                            />
                            <InputError message={errors['addresses.0.city_id' as keyof typeof errors]} />
                        </div>

                        <div className="space-y-2">
                            <Label>PIN Code *</Label>
                            <Input
                                value={data.addresses[0].pin_code}
                                onChange={(e) => handleAddressChange(0, 'pin_code', e.target.value.replace(/\D/g, '').slice(0, 6))}
                                placeholder="6 digit PIN code"
                                maxLength={6}
                                required
                            />
                            <InputError message={errors['addresses.0.pin_code' as keyof typeof errors]} />
                        </div>
                    </div>
                </div>

                {/* Communication Address */}
                <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-2 gap-2">
                        <h3 className="text-lg font-medium">Communication Address</h3>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="same_as_residential"
                                checked={isSameAddress}
                                onCheckedChange={(checked) => handleAddressChange(1, 'is_same_as_residential', checked)}
                            />
                            <Label htmlFor="same_as_residential" className="cursor-pointer font-normal text-sm">
                                Same as Residential
                            </Label>
                        </div>
                    </div>

                    {!isSameAddress ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2 md:col-span-2">
                                <Label>Address Line *</Label>
                                <Input
                                    value={data.addresses[1].address_line}
                                    onChange={(e) => handleAddressChange(1, 'address_line', e.target.value)}
                                    placeholder="Street, House No, Landmark"
                                    required={!isSameAddress}
                                />
                                <InputError message={errors['addresses.1.address_line' as keyof typeof errors]} />
                            </div>
                            
                            <div className="space-y-2">
                                <Label>State *</Label>
                                <Select
                                    options={states}
                                    value={states.find((s) => s.value === Number(data.addresses[1].state_id)) || null}
                                    onChange={(val: any) => handleAddressChange(1, 'state_id', val?.value || '')}
                                    placeholder="Select State"
                                    className="react-select-container text-sm"
                                    classNamePrefix="react-select"
                                />
                                <InputError message={errors['addresses.1.state_id' as keyof typeof errors]} />
                            </div>

                            <div className="space-y-2">
                                <Label>District *</Label>
                                <Select
                                    options={comDistricts}
                                    value={comDistricts.find((d) => d.value === Number(data.addresses[1].district_id)) || null}
                                    onChange={(val: any) => handleAddressChange(1, 'district_id', val?.value || '')}
                                    placeholder="Select District"
                                    className="react-select-container text-sm"
                                    classNamePrefix="react-select"
                                    isDisabled={!data.addresses[1].state_id}
                                />
                                <InputError message={errors['addresses.1.district_id' as keyof typeof errors]} />
                            </div>

                            <div className="space-y-2">
                                <Label>Taluka *</Label>
                                <Select
                                    options={comTalukas}
                                    value={comTalukas.find((t) => t.value === Number(data.addresses[1].taluka_id)) || null}
                                    onChange={(val: any) => handleAddressChange(1, 'taluka_id', val?.value || '')}
                                    placeholder="Select Taluka"
                                    className="react-select-container text-sm"
                                    classNamePrefix="react-select"
                                    isDisabled={!data.addresses[1].district_id}
                                />
                                <InputError message={errors['addresses.1.taluka_id' as keyof typeof errors]} />
                            </div>

                            <div className="space-y-2">
                                <Label>City/Village *</Label>
                                <Select
                                    options={comCities}
                                    value={comCities.find((c) => c.value === Number(data.addresses[1].city_id)) || null}
                                    onChange={(val: any) => handleAddressChange(1, 'city_id', val?.value || '')}
                                    placeholder="Select City"
                                    className="react-select-container text-sm"
                                    classNamePrefix="react-select"
                                    isDisabled={!data.addresses[1].taluka_id}
                                />
                                <InputError message={errors['addresses.1.city_id' as keyof typeof errors]} />
                            </div>

                            <div className="space-y-2">
                                <Label>PIN Code *</Label>
                                <Input
                                    value={data.addresses[1].pin_code}
                                    onChange={(e) => handleAddressChange(1, 'pin_code', e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    placeholder="6 digit PIN code"
                                    maxLength={6}
                                    required={!isSameAddress}
                                />
                                <InputError message={errors['addresses.1.pin_code' as keyof typeof errors]} />
                            </div>
                        </div>
                    ) : (
                        <div className="bg-muted/50 rounded-lg p-6 flex items-center justify-center h-[300px] border border-dashed">
                            <p className="text-muted-foreground text-sm flex items-center">
                                <Checkbox checked disabled className="mr-2" />
                                Using residential address
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex justify-end gap-2 mt-8 pt-4 border-t">
                <Button type="submit" disabled={processing}>
                    Save Trainer Details
                </Button>
            </div>
        </form>
    );
}
