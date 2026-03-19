import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
import type { BreadcrumbItem } from '@/types/navigation';
import BasicDetailsForm from './components/BasicDetailsForm';
import CommunicationDetailsForm from './components/CommunicationDetailsForm';
import QualificationsForm from './components/QualificationsForm';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Trainers', href: '/tp/trainers' },
    { title: 'Create Trainer', href: '/tp/trainers/create' },
];

export default function TrainerCreate({ trainingCenters }: any) {
    const [activeTab, setActiveTab] = useState('basic');
    const [trainerId, setTrainerId] = useState<number | null>(null);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Trainer" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Add New Trainer</h1>
                    <p className="text-sm text-muted-foreground">
                        Fill in the trainer details. The form is divided into sections.
                    </p>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <Tabs defaultValue="basic" value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid w-full grid-cols-3 lg:w-[600px]">
                                <TabsTrigger value="basic">Basic Details</TabsTrigger>
                                <TabsTrigger value="communication" disabled={!trainerId}>
                                    Communication
                                </TabsTrigger>
                                <TabsTrigger value="qualifications" disabled={!trainerId}>
                                    Qualifications
                                </TabsTrigger>
                            </TabsList>
                            <div className="mt-6">
                                <TabsContent value="basic" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                                    <BasicDetailsForm
                                        trainingCenters={trainingCenters}
                                        onSuccess={(id: number) => {
                                            setTrainerId(id);
                                            setActiveTab('communication');
                                        }}
                                    />
                                </TabsContent>

                                <TabsContent value="communication" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                                    {trainerId && (
                                        <CommunicationDetailsForm
                                            trainerId={trainerId}
                                            onSuccess={() => {
                                                setActiveTab('qualifications');
                                            }}
                                        />
                                    )}
                                </TabsContent>

                                <TabsContent value="qualifications" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                                    {trainerId && (
                                        <QualificationsForm
                                            trainerId={trainerId}
                                            onSuccess={() => {
                                                window.location.href = '/tp/trainers';
                                            }}
                                        />
                                    )}
                                </TabsContent>
                            </div>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
