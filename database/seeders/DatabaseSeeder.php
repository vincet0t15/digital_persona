<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {

        User::create([
            'name' => 'ZYRUS VINCE B. FAMINI',
            'username' => 'admin',
            'password' => Hash::make('admin123'),
            'is_admin' => true,
            'is_active' => true,
        ]);
        $this->call(OfficeSeeder::class);
    }
}
