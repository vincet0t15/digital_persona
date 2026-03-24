<?php

use App\Models\FingerprintSample;
use App\Models\Fingeprint;
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
        // Migrate existing data from old columns to new table
        $fingerprints = Fingeprint::all();

        foreach ($fingerprints as $fingerprint) {
            // Sample 2
            if (!empty($fingerprint->template_sample_2)) {
                FingerprintSample::create([
                    'fingeprint_id' => $fingerprint->id,
                    'sample_index' => 2,
                    'template' => $fingerprint->template_sample_2,
                    'quality' => $fingerprint->fingerprint_quality,
                ]);
            }
            // Sample 3
            if (!empty($fingerprint->template_sample_3)) {
                FingerprintSample::create([
                    'fingeprint_id' => $fingerprint->id,
                    'sample_index' => 3,
                    'template' => $fingerprint->template_sample_3,
                    'quality' => $fingerprint->fingerprint_quality,
                ]);
            }
            // Sample 4
            if (!empty($fingerprint->template_sample_4)) {
                FingerprintSample::create([
                    'fingeprint_id' => $fingerprint->id,
                    'sample_index' => 4,
                    'template' => $fingerprint->template_sample_4,
                    'quality' => $fingerprint->fingerprint_quality,
                ]);
            }
            // Sample 5
            if (!empty($fingerprint->template_sample_5)) {
                FingerprintSample::create([
                    'fingeprint_id' => $fingerprint->id,
                    'sample_index' => 5,
                    'template' => $fingerprint->template_sample_5,
                    'quality' => $fingerprint->fingerprint_quality,
                ]);
            }
        }

        // Drop old columns
        Schema::table('fingeprints', function (Blueprint $table) {
            $table->dropColumn(['template_sample_2', 'template_sample_3', 'template_sample_4', 'template_sample_5']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Add columns back
        Schema::table('fingeprints', function (Blueprint $table) {
            $table->text('template_sample_2')->nullable()->after('fingerprint_template');
            $table->text('template_sample_3')->nullable()->after('template_sample_2');
            $table->text('template_sample_4')->nullable()->after('template_sample_3');
            $table->text('template_sample_5')->nullable()->after('template_sample_4');
        });

        // Migrate data back (simplified - just clears the samples table)
        FingerprintSample::truncate();
    }
};
