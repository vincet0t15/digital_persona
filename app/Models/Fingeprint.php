<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

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
}
