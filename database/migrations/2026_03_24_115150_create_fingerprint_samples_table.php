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
        Schema::create('fingerprint_samples', function (Blueprint $table) {
            $table->id();
            $table->foreignId('fingeprint_id')->constrained()->onDelete('cascade');
            $table->integer('sample_index'); // 1, 2, 3, 4, 5
            $table->text('template'); // The FMD template
            $table->integer('quality')->default(0);
            $table->timestamps();

            // Ensure unique sample index per fingerprint
            $table->unique(['fingeprint_id', 'sample_index']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fingerprint_samples');
    }
};
