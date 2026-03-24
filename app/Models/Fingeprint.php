<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Fingeprint extends Model
{
    protected $fillable = [
        'user_id',
        'fingerprint_template',
        'fingerprint_quality',
        'reader_label',
        'enrolled_from_ip',
    ];
}
