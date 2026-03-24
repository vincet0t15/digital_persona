<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Fingeprint extends Model
{
    protected $fillable = [
        'employee_id',
        'finger_name',
        'fingerprint_template',
        'fingerprint_quality',
        'reader_label',
        'enrolled_from_ip',
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function samples(): HasMany
    {
        return $this->hasMany(FingerprintSample::class, 'fingeprint_id');
    }

    /**
     * Get all templates including main template and all samples for matching
     */
    public function getAllTemplates(): array
    {
        $templates = [$this->fingerprint_template];

        foreach ($this->samples as $sample) {
            $templates[] = $sample->template;
        }

        return $templates;
    }
}
