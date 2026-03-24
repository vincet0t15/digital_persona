<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Add username field
            $table->string('username')->unique()->after('name');

            // Add is_admin and is_active fields
            $table->boolean('is_admin')->default(false)->after('password');
            $table->boolean('is_active')->default(true)->after('is_admin');

            // Make email nullable (optional field)
            $table->string('email')->nullable()->change();
            $table->timestamp('email_verified_at')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Drop new fields
            $table->dropColumn(['username', 'is_admin', 'is_active']);

            // Restore email as required
            $table->string('email')->nullable(false)->change();
        });
    }
};
