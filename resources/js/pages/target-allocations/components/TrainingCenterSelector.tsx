import { useState, useMemo } from 'react';
import { useForm, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';
import InputError from '@/components/input-error';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

export default function TrainingCenterSelector({ allocationId, centers, trainingCenters }: any) {
    const [isOpen, setIsOpen] = useState(false);
    
    const { data, setData, post, processing, errors, reset } = useForm({
        training_center_id: '',
        proposed_target: '',
        target_validity_months: '',
    });

    // Remove already added centers from modal options
    const availableCenters = useMemo(() => {
        const addedIds = centers.map((c: any) => c.training_center_id);
        return trainingCenters.filter((tc: any) => !addedIds.includes(tc.id));
    }, [centers, trainingCenters]);

    const submit = (e: any) => {
        e.preventDefault();
        post(`/tp/target-allocations/${allocationId}/add-center`, {
            onSuccess: () => {
                setIsOpen(false);
                reset();
            }
        });
    };

    const removeCenter = (centerId: number) => {
        if (confirm('Are you sure you want to remove this Training Center from the allocation?')) {
            router.delete(`/tp/target-allocations/${allocationId}/remove-center/${centerId}`);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center border-b pb-2 mb-4">
                <h2 className="text-lg font-semibold text-primary">Add Training Centres (Only Affiliated & Accredited Centres)</h2>
                
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm"><Plus className="w-4 h-4 mr-1" /> ADD</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-5xl">
                        <DialogHeader>
                            <DialogTitle className="bg-primary text-primary-foreground p-3 rounded-t-md">
                                Select A & A Training Centres from the list
                            </DialogTitle>
                        </DialogHeader>
                        
                        <div className="py-2">
                            <form onSubmit={submit} className="space-y-6">
                                <div className="max-h-[300px] overflow-y-auto rounded-md border">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-muted text-muted-foreground sticky top-0 shadow-sm">
                                            <tr>
                                                <th className="px-3 py-2 w-10">Select</th>
                                                <th className="px-3 py-2 font-medium">TC ID</th>
                                                <th className="px-3 py-2 font-medium">TC Name</th>
                                                <th className="px-3 py-2 font-medium">State</th>
                                                <th className="px-3 py-2 font-medium">District</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {availableCenters.length === 0 ? (
                                                <tr>
                                                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                                                        No available Training Centers found.
                                                    </td>
                                                </tr>
                                            ) : (
                                                availableCenters.map((c: any) => (
                                                    <tr key={c.id} className={`hover:bg-muted/50 cursor-pointer ${Number(data.training_center_id) === c.id ? 'bg-primary/5' : ''}`} onClick={() => setData('training_center_id', c.id.toString())}>
                                                        <td className="px-3 py-2 text-center">
                                                            <input 
                                                                type="radio" 
                                                                name="training_center_id"
                                                                value={c.id}
                                                                checked={Number(data.training_center_id) === c.id}
                                                                onChange={(e) => setData('training_center_id', e.target.value)}
                                                                className="w-4 h-4 text-primary"
                                                            />
                                                        </td>
                                                        <td className="px-3 py-2">{c.tc_id}</td>
                                                        <td className="px-3 py-2 font-medium">{c.name}</td>
                                                        <td className="px-3 py-2">{c.state?.state}</td>
                                                        <td className="px-3 py-2">{c.district?.district}</td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                <InputError message={errors.training_center_id} />
                                
                                <div className="grid grid-cols-2 gap-6 bg-muted/30 p-4 rounded-md border">
                                    <div className="space-y-2">
                                        <Label>Total Proposed Target of TC</Label>
                                        <Input 
                                            type="number" 
                                            min="1"
                                            value={data.proposed_target} 
                                            onChange={(e) => setData('proposed_target', e.target.value)} 
                                            required 
                                        />
                                        <InputError message={errors.proposed_target} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Target Validity (in Months)</Label>
                                        <Input 
                                            type="number" 
                                            min="1"
                                            max="120"
                                            value={data.target_validity_months} 
                                            onChange={(e) => setData('target_validity_months', e.target.value)} 
                                            required 
                                        />
                                        <InputError message={errors.target_validity_months} />
                                    </div>
                                </div>
                                
                                <div className="flex justify-end gap-2 pt-2 border-t mt-4">
                                    <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>CANCEL</Button>
                                    <Button type="submit" disabled={processing || !data.training_center_id}>OK</Button>
                                </div>
                            </form>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="rounded-md border overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-primary text-primary-foreground">
                        <tr>
                            <th className="px-3 py-2 font-medium">TC ID</th>
                            <th className="px-3 py-2 font-medium">Training Centre Name</th>
                            <th className="px-3 py-2 font-medium">State</th>
                            <th className="px-3 py-2 font-medium">District</th>
                            <th className="px-3 py-2 font-medium">Total Proposed Target of TC</th>
                            <th className="px-3 py-2 font-medium">Target Validity (in Months)</th>
                            <th className="px-3 py-2 font-medium w-16">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {centers.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                                    No Training Centers added yet.
                                </td>
                            </tr>
                        ) : (
                            centers.map((c: any) => (
                                <tr key={c.id}>
                                    <td className="px-3 py-2">{c.training_center?.tc_id}</td>
                                    <td className="px-3 py-2">{c.training_center?.name}</td>
                                    <td className="px-3 py-2">{c.training_center?.state?.state}</td>
                                    <td className="px-3 py-2">{c.training_center?.district?.district}</td>
                                    <td className="px-3 py-2 font-semibold">{c.proposed_target}</td>
                                    <td className="px-3 py-2">{c.target_validity_months}</td>
                                    <td className="px-3 py-2">
                                        <Button variant="ghost" size="icon" onClick={() => removeCenter(c.id)} className="text-destructive hover:text-destructive/90 hover:bg-destructive/10">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
