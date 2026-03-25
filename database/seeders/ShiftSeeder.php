<?php

namespace Database\Seeders;

use App\Models\Shift;
use Illuminate\Database\Seeder;

class ShiftSeeder extends Seeder
{
    public function run(): void
    {
        $shifts = [
            [
                'name' => 'Regular Shift (8AM - 5PM)',
                'start_time' => '08:00:00',
                'end_time' => '17:00:00',
                'break_start' => '12:00:00',
                'break_end' => '13:00:00',
                'grace_minutes' => 15,
                'is_active' => true,
            ],
            [
                'name' => 'Morning Shift (6AM - 2PM)',
                'start_time' => '06:00:00',
                'end_time' => '14:00:00',
                'break_start' => '10:00:00',
                'break_end' => '10:30:00',
                'grace_minutes' => 10,
                'is_active' => true,
            ],
            [
                'name' => 'Night Shift (10PM - 6AM)',
                'start_time' => '22:00:00',
                'end_time' => '06:00:00',
                'break_start' => '02:00:00',
                'break_end' => '02:30:00',
                'grace_minutes' => 10,
                'is_active' => true,
            ],
        ];

        foreach ($shifts as $shift) {
            Shift::firstOrCreate(['name' => $shift['name']], $shift);
        }
    }
}
