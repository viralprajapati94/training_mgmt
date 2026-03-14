import { Link, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, MapPin, Mail, Phone, Edit, Trash } from 'lucide-react';
import { FormEvent } from 'react';
import type { BreadcrumbItem } from '@/types/navigation';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Training Centers', href: '/tp/training-centers' },
];

export default function TrainingCentersIndex({ trainingCenters, filters }: any) {
    const { data, setData, get } = useForm({
        search: filters?.search || '',
    });

    const onSearch = (e: FormEvent) => {
        e.preventDefault();
        get('/tp/training-centers', { preserveState: true });
    };

    const deleteTC = (id: number) => {
        if (confirm('Are you sure you want to delete this Training Center?')) {
            router.delete(`/tp/training-centers/${id}`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h1 className="text-2xl font-bold">Training Centers</h1>
                    <Button asChild>
                        <Link href="/tp/training-centers/create">
                            <Plus className="mr-2 h-4 w-4" /> Add Training Center
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader className="pb-3">
                        <form onSubmit={onSearch} className="flex max-w-sm w-full space-x-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Search by Name, TC ID or Email"
                                    className="pl-9"
                                    value={data.search}
                                    onChange={(e) => setData('search', e.target.value)}
                                />
                            </div>
                            <Button type="submit" variant="secondary">Search</Button>
                        </form>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-muted text-muted-foreground">
                                    <tr>
                                        <th className="px-4 py-3 font-medium">TC ID</th>
                                        <th className="px-4 py-3 font-medium">Center Name</th>
                                        <th className="px-4 py-3 font-medium">Contact Details</th>
                                        <th className="px-4 py-3 font-medium">Location</th>
                                        <th className="px-4 py-3 font-medium">Status</th>
                                        <th className="px-4 py-3 font-medium text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {trainingCenters.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                                                No Training Centers found.
                                            </td>
                                        </tr>
                                    ) : (
                                        trainingCenters.data.map((tc: any) => (
                                            <tr key={tc.id} className="bg-background">
                                                <td className="px-4 py-3 font-medium">{tc.tc_id}</td>
                                                <td className="px-4 py-3">
                                                    <div className="font-medium">{tc.name}</div>
                                                    {tc.spoc_name && <div className="text-xs text-muted-foreground">SPOC: {tc.spoc_name}</div>}
                                                </td>
                                                <td className="px-4 py-3 space-y-1">
                                                    <div className="flex items-center text-xs">
                                                        <Mail className="mr-1.5 h-3 w-3 text-muted-foreground" />
                                                        {tc.email}
                                                    </div>
                                                    <div className="flex items-center text-xs">
                                                        <Phone className="mr-1.5 h-3 w-3 text-muted-foreground" />
                                                        {tc.mobile}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center text-xs">
                                                        <MapPin className="mr-1.5 h-3 w-3 text-muted-foreground shrink-0" />
                                                        <span className="line-clamp-1">{tc.district?.district || 'N/A'}, {tc.state?.state || 'N/A'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${tc.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                        {tc.status ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="outline" size="icon" asChild>
                                                            <Link href={`/tp/training-centers/${tc.id}/edit`}>
                                                                <Edit className="h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                        <Button variant="outline" size="icon" className="text-red-500 hover:text-red-700" onClick={() => deleteTC(tc.id)}>
                                                            <Trash className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Basic Pagination */}
                        {trainingCenters.links?.length > 3 && (
                            <div className="flex items-center justify-center space-x-1 mt-4">
                                {trainingCenters.links.map((link: any, k: number) => (
                                    <Link
                                        key={k}
                                        href={link.url || '#'}
                                        className={`px-3 py-1 text-sm border rounded ${
                                            link.active ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-muted'
                                        } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
