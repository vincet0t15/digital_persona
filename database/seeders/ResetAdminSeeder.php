<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class ResetAdminSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::where('username', 'admin')->first();

        if ($user) {
            $user->password = Hash::make('admin123');
            $user->is_active = true;
            $user->is_admin = true;
            $user->save();
            echo "Admin user updated successfully.\n";
        } else {
            User::create([
                'name' => 'Admin',
                'username' => 'admin',
                'password' => Hash::make('admin123'),
                'is_admin' => true,
                'is_active' => true,
            ]);
            echo "Admin user created successfully.\n";
        }
    }
}
