<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Seed an administrator account.
     *
     * Override the credentials via the ADMIN_EMAIL / ADMIN_PASSWORD / ADMIN_NAME
     * environment variables; otherwise sensible local defaults are used.
     */
    public function run(): void
    {

        $user = User::updateOrCreate(
            ['email' => 'admin@nullyptoai.online'],
            [
                'name' => 'Admin',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ],
        );

        $user->is_admin = true;
        $user->save();

        $this->command->info("Admin user ready: {$email} / {$password}");
    }
}
