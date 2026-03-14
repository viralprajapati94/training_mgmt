import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent } from '@/components/ui/card';
import TrainingCenterForm from './components/TrainingCenterForm';
import type { BreadcrumbItem } from '@/types/navigation';
import type { StateOption, DistrictOption, TalukaOption, CityOption } from './types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Training Centers', href: '/tp/training-centers' },
    { title: 'Create', href: '/tp/training-centers/create' },
];

type Props = {
    states: StateOption[];
    districts: DistrictOption[];
    talukas: TalukaOption[];
    cities: CityOption[];
};

export default function TrainingCenterCreate({ states, districts, talukas, cities }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Add Training Center" />
            <Card>
                <CardContent className="space-y-6 pt-6">
                    <div>
                        <h1 className="text-xl font-semibold">Add Training Center</h1>
                        <p className="text-sm text-muted-foreground">Fill out the details to create a new Training Center.</p>
                    </div>

                    <TrainingCenterForm
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
