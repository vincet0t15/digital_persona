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
        Schema::table('fingeprints', function (Blueprint $table) {
            $table->text('template_sample_2')->nullable()->after('fingerprint_template');
            $table->text('template_sample_3')->nullable()->after('template_sample_2');
            $table->text('template_sample_4')->nullable()->after('template_sample_3');
            $table->text('template_sample_5')->nullable()->after('template_sample_4');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('fingeprints', function (Blueprint $table) {
            $table->dropColumn(['template_sample_2', 'template_sample_3', 'template_sample_4', 'template_sample_5']);
        });
    }
};
