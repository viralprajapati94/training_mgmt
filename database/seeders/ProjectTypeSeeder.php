<?php

namespace Database\Seeders;

use App\Models\ProjectType;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ProjectTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $projectTypes = [
            ['type' => 'Govt Funded', 'status' => true],
            ['type' => 'CSR', 'status' => true],
            ['type' => 'Self Paid', 'status' => true],
            ['type' => 'Non-Govt', 'status' => true],
        ];

        foreach ($projectTypes as $projectType) {
            ProjectType::create($projectType);
        }
    }
}
