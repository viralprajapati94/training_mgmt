<?php

namespace Database\Seeders;

use App\Models\AssessmentBody;
use Illuminate\Database\Seeder;

class AssessmentBodySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        AssessmentBody::firstOrCreate(['name' => 'SSC']);
        AssessmentBody::firstOrCreate(['name' => 'NCVT']);
    }
}
