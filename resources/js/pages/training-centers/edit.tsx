import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent } from '@/components/ui/card';
import TrainingCenterForm from './components/TrainingCenterForm';
import type { BreadcrumbItem } from '@/types/navigation';
import type { StateOption, DistrictOption, TalukaOption, CityOption } from './types';

const breadcrumbs = (id: number): BreadcrumbItem[] => [
    { title: 'Training Centers', href: '/tp/training-centers' },
    { title: 'Edit', href: `/tp/training-centers/${id}/edit` },
];

type Props = {
    trainingCenter: any;
    states: StateOption[];
    districts: DistrictOption[];
    talukas: TalukaOption[];
    cities: CityOption[];
};

export default function TrainingCenterEdit({ trainingCenter, states, districts, talukas, cities }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs(trainingCenter.id)}>
            <Head title="Edit Training Center" />
            <Card>
                <CardContent className="space-y-6 pt-6">
                    <div>
                        <h1 className="text-xl font-semibold">Edit Training Center</h1>
                        <p className="text-sm text-muted-foreground">Update the training center details.</p>
                    </div>

                    <TrainingCenterForm
                        tc={trainingCenter}
                        states={states}
                        districts={districts}
                        talukas={talukas}
                        cities={cities}
                    />
                </CardContent>
            </Card>
        </AppLayout>
    );
}
