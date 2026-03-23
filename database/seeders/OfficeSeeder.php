<?php

namespace Database\Seeders;

use App\Models\Office;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class OfficeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $offices = [
            [
                'name' => 'OFFICE OF THE MUNICIPAL MAYOR',
                'code' => 'MO',
            ],
            [
                'name' => 'OFFICE OF THE MUNICIPAL BUDGET',
                'code' => 'MBO',
            ],
            [
                'name' => 'OFFICE OF THE HUMAN RESOURCE MANAGEMENT',
                'code' => 'HRMO',
            ],
            [
                'name' => 'OFFICE OF THE SANGUNIANG BAYAN',
                'code' => 'SBO',
            ],
            [
                'name' => 'OFFICE OF THE MUNICIPAL PLANNING AND DEVELOPMENT',
                'code' => 'MPDO',
            ],
            [
                'name' => 'OFFICE OF THE MUNICIPAL ENGINEERING',
                'code' => 'MEO',
            ],
            [
                'name' => 'OFFICE OF THE MUNICIPAL TOURISM',
                'code' => 'OMT',
            ],
            [
                'name' => 'OFFICE OF THE MUNICIPAL TREASURY',
                'code' => 'MTO',
            ],
            [
                'name' => 'OFFICE OF THE MUNICIPAL ACCOUNTING',
                'code' => 'MACCO',
            ],
            [
                'name' => 'OFFICE OF THE MUNICIPAL COOPERATIVE AND DEVELOPMENT',
                'code' => 'MCDO',
            ],
            [
                'name' => 'OFFICE OF THE MUNICIPAL GENERAL SERVICES',
                'code' => 'GSO',
            ],
            [
                'name' => 'OFFICE OF THE MUNICIPAL ENVIRONMENT AND NATURAL RESOURCES',
                'code' => 'MERNRO',
            ],
            [
                'name' => 'OFFICE OF THE MUNICIPAL ASSESSOR',
                'code' => 'MASSO',
            ],
            [
                'name' => 'OFFICE OF THE MUNICIPAL ECONOMIC ENTERPRISE DEVELOPMENT',
                'code' => 'MEEDO',
            ],
            [
                'name' => 'OFFICE OF THE MUNICIPAL HEALTH',
                'code' => 'RHU',
            ],
            [
                'name' => 'OFFICE OF THE MUNICIPAL AGRICULTURE',
                'code' => 'MAO',
            ],
            [
                'name' => 'OFFICE OF THE MUNICIPAL SOCIAL WELFARE AND DEVELOPMENT',
                'code' => 'MSWDO',
            ],
            [
                'name' => 'OFFICE OF THE MUNICIPAL DISASTER RISK REDUCTION AND MANAGEMENT',
                'code' => 'MDRRMO',
            ],

        ];

        Office::insert($offices);
    }
}
