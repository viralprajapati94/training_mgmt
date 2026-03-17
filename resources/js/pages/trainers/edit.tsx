import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
import type { BreadcrumbItem } from '@/types/navigation';
import BasicDetailsForm from './components/BasicDetailsForm';
import CommunicationDetailsForm from './components/CommunicationDetailsForm';

export default function TrainerEdit({ trainer, trainingCenters }: any) {
    const [activeTab, setActiveTab] = useState(
        new URLSearchParams(window.location.search).get('tab') || 'basic'
    );

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Trainers', href: '/tp/trainers' },
        { title: 'Edit Trainer', href: `/tp/trainers/${trainer.id}/edit` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Trainer" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Edit Trainer</h1>
                    <p className="text-sm text-muted-foreground">
                        Update trainer details below.
                    </p>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <Tabs defaultValue="basic" value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                                <TabsTrigger value="basic">Basic Details</TabsTrigger>
                                <TabsTrigger value="communication">
                                    Communication
                                </TabsTrigger>
                            </TabsList>
                            <div className="mt-6">
                                <TabsContent value="basic" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                                    <BasicDetailsForm
                                        trainer={trainer}
                                        trainingCenters={trainingCenters}
                                        onSuccess={() => setActiveTab('communication')}
                                    />
                                </TabsContent>

                                <TabsContent value="communication" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                                    <CommunicationDetailsForm
                                        trainerId={trainer.id}
                                        initialData={trainer.addresses}
                                        onSuccess={() => {
                                            window.location.href = '/tp/trainers';
                                        }}
                                    />
                                </TabsContent>
                            </div>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
