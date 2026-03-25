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
        Schema::create('employees', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('username')->unique();
            $table->string('password');
            $table->foreignId('office_id')->constrained('offices')->cascadeOnUpdate()->cascadeOnDelete();
            $table->foreignId('employment_type_id')->constrained('employment_types')->cascadeOnUpdate()->cascadeOnDelete();
            $table->string('image')->nullable();
            $table->softDeletes();

            $table->index('office_id');
            $table->index('name');
            $table->index('username');
            $table->index('employment_type_id');
            $table->timestamp('email_verified_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employees');
    }
};
