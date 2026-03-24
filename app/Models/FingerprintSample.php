<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FingerprintSample extends Model
{
    protected $fillable = [
        'fingeprint_id',
        'sample_index',
        'template',
        'quality',
    ];

    public function fingerprint(): BelongsTo
    {
        return $this->belongsTo(Fingeprint::class, 'fingeprint_id');
    }
}
