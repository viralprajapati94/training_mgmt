import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BasicDetailsForm from './components/BasicDetailsForm';
import SchemeMappingTab from './components/SchemeMappingTab';
import BankDetailsTab from './components/BankDetailsTab';
import DocumentsTab from './components/DocumentsTab';
import type { BreadcrumbItem } from '@/types/navigation';
import type {
    StateOption,
    DistrictOption,
    TalukaOption,
    CityOption,
    SchemeOption,
    DocumentOption,
} from './types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Training Partners', href: '/admin/training-partners' },
    { title: 'Create', href: '/admin/training-partners/create' },
];

type Props = {
    states: StateOption[];
    districts: DistrictOption[];
    talukas: TalukaOption[];
    cities: CityOption[];
    schemes: SchemeOption[];
    documents: DocumentOption[];
};

export default function TrainingPartnersCreate({ states, districts, talukas, cities, schemes, documents }: Props) {
    // In create mode, we only allow Basic Details tab. Once saved, it redirects to edit mode.
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Add Training Partner" />
            <Card>
                <CardContent className="space-y-6 pt-6">
                    <div>
                        <h1 className="text-xl font-semibold">Add Training Partner</h1>
                        <p className="text-sm text-muted-foreground">Fill basic details first to create the record.</p>
                    </div>

                    <Tabs defaultValue="basic" className="w-full">
                        <TabsList className="grid grid-cols-4 w-full">
                            <TabsTrigger value="basic">Basic Details</TabsTrigger>
                            <TabsTrigger value="schemes" disabled>Scheme Mapping</TabsTrigger>
                            <TabsTrigger value="bank" disabled>Bank Details</TabsTrigger>
                            <TabsTrigger value="documents" disabled>Documents</TabsTrigger>
                        </TabsList>
                        
                        <p className="text-xs text-muted-foreground mt-2">
                            Fill required Basic Details to unlock other tabs.
                        </p>

                        <TabsContent value="basic" className="w-full">
                            <BasicDetailsForm
                                states={states}
                                districts={districts}
                                talukas={talukas}
                                cities={cities}
                            />
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </AppLayout>
    );
}
