import { FormEvent } from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Select from 'react-select';
import { Trash2 } from 'lucide-react';
import type { SchemeEntry, StateOption, SchemeOption } from '../types';

type Props = {
    partnerId: number;
    initialSchemes?: SchemeEntry[];
    states: StateOption[];
    schemes: SchemeOption[];
};

export default function SchemeMappingTab({ partnerId, initialSchemes = [], states, schemes }: Props) {
    console.log('schemes', schemes);
    console.log('initialSchemesss', initialSchemes);
    const { data, setData, post, processing } = useForm({
        schemes: initialSchemes.length > 0 ? initialSchemes : [
            { state_id: null, scheme_id: null, approval_date: '', expiry_date: null }
        ],
    });

    const stateOptions = states.map((s) => ({ value: s.id, label: s.state }));
    const schemeOptions = schemes.map((s) => ({ value: s.id, label: s.name }));

    const addScheme = () => {
        setData('schemes', [    
            ...data.schemes,
            { state_id: null, scheme_id: null, approval_date: '', expiry_date: null },
        ]);
    };

    const updateScheme = (idx: number, updated: Partial<SchemeEntry>) => {
        const next = [...data.schemes];
        next[idx] = { ...next[idx], ...updated };
        setData('schemes', next);
    };

    const removeScheme = (idx: number) => {
        const next = data.schemes.filter((_, i) => i !== idx);
        setData('schemes', next);
    };

    const onSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(`/admin/training-partners/${partnerId}/scheme-mapping?next_tab=bank`, {
            preserveScroll: true,
        });
    };

    const formatDateForInput = (date: string | null) => {
        if (!date) return '';
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    return (
        <form onSubmit={onSubmit} className="space-y-4 pt-4">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h3 className="font-semibold text-lg">Scheme Mapping</h3>
                    <p className="text-sm text-muted-foreground">Map training partner to specific schemes and states.</p>
                </div>
                <Button type="button" onClick={addScheme} variant="outline">
                    Add Row
                </Button>
            </div>

            <div className="border rounded-md overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-muted text-muted-foreground">
                        <tr>
                            <th className="px-4 py-3 font-medium">State</th>
                            <th className="px-4 py-3 font-medium">Scheme <span className="text-red-500">*</span></th>
                            <th className="px-4 py-3 font-medium">Approval Date <span className="text-red-500">*</span></th>
                            <th className="px-4 py-3 font-medium">Expiry Date</th>
                            <th className="px-4 py-3 font-medium text-center w-[80px]">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {data.schemes.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                                    No scheme mappings added. Click "Add Row" to start.
                                </td>
                            </tr>
                        )}
                        {data.schemes.map((scheme, idx) => (
                            <tr key={idx} className="bg-background">
                                <td className="px-4 py-2 align-top min-w-[200px]">
                                    <Select
                                        options={stateOptions}
                                        value={stateOptions.find((o) => o.value === scheme.state_id) ?? null}
                                        onChange={(option) => updateScheme(idx, { state_id: option?.value ?? null })}
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                        placeholder="Select state"
                                        isClearable
                                        menuPortalTarget={document.body}
                                    />
                                </td>
                                <td className="px-4 py-2 align-top min-w-[200px]">
                                    <Select
                                        options={schemeOptions}
                                        value={schemeOptions.find((o) => o.value === scheme.scheme_id) ?? null}
                                        onChange={(option) => updateScheme(idx, { scheme_id: option?.value ?? null })}
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                        placeholder="Select scheme"
                                        menuPortalTarget={document.body}
                                    />
                                </td>
                                <td className="px-4 py-2 align-top">
                                    <Input
                                        type="date"
                                        value={formatDateForInput(scheme.approval_date)}
                                        onChange={(e) => updateScheme(idx, { approval_date: e.target.value })}
                                        required
                                    />
                                </td>
                                <td className="px-4 py-2 align-top">
                                    <Input
                                        type="date"
                                        value={formatDateForInput(scheme.expiry_date || '')}
                                        onChange={(e) => updateScheme(idx, { expiry_date: e.target.value || null })}
                                    />
                                </td>
                                <td className="px-4 py-2 align-top text-center">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeScheme(idx)}
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-end gap-2 mt-4">
                <Button type="submit" disabled={processing || data.schemes.length === 0}>
                    Save & Next
                </Button>
            </div>
        </form>
    );
}
