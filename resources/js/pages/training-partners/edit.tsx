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
    ExistingDocument,
} from './types';

const breadcrumbs = (id: number): BreadcrumbItem[] => [
    { title: 'Training Partners', href: '/admin/training-partners' },
    { title: 'Edit', href: `/admin/training-partners/${id}/edit` },
];

type Props = {
    partner: any;
    states: StateOption[];
    districts: DistrictOption[];
    talukas: TalukaOption[];
    cities: CityOption[];
    schemes: SchemeOption[];
    documents: DocumentOption[];
};

export default function TrainingPartnersEdit({ partner, states, districts, talukas, cities, schemes, documents }: Props) {
    const existingDocuments: ExistingDocument[] = (partner.documents || []).map((doc: any) => ({
        document_master_id: doc.document_master_id,
        original_name: doc.original_name,
        file_path: doc.file_path,
    }));

    const defaultTab = new URLSearchParams(window.location.search).get('tab') || 'basic';

    return (
        <AppLayout breadcrumbs={breadcrumbs(partner.id)}>
            <Head title="Edit Training Partner" />
            <Card>
                <CardContent className="space-y-6 pt-6">
                    <div>
                        <h1 className="text-xl font-semibold">Edit Training Partner</h1>
                        <p className="text-sm text-muted-foreground">Update details across tabs. Each tab saves independently.</p>
                    </div>

                    <Tabs defaultValue={defaultTab} className="w-full">
                        <TabsList className="grid grid-cols-4 w-full">
                            <TabsTrigger value="basic">Basic Details</TabsTrigger>
                            <TabsTrigger value="schemes">Scheme Mapping</TabsTrigger>
                            <TabsTrigger value="bank">Bank Details</TabsTrigger>
                            <TabsTrigger value="documents">Documents</TabsTrigger>
                        </TabsList>

                        <TabsContent value="basic" className="w-full">
                            <BasicDetailsForm
                                partner={partner}
                                states={states}
                                districts={districts}
                                talukas={talukas}
                                cities={cities}
                            />
                        </TabsContent>

                        <TabsContent value="schemes" className="w-full">
                            <SchemeMappingTab
                                partnerId={partner.id}
                                initialSchemes={partner.schemes}
                                states={states}
                                schemes={schemes}
                            />
                        </TabsContent>

                        <TabsContent value="bank" className="w-full">
                            <BankDetailsTab
                                partnerId={partner.id}
                                initialData={partner.bank_detail}
                            />
                        </TabsContent>

                        <TabsContent value="documents" className="w-full">
                            <DocumentsTab
                                partnerId={partner.id}
                                documents={documents}
                                existingDocuments={existingDocuments}
                            />
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </AppLayout>
    );
}
