<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Employee extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'username',
        'password',
        'office_id',
        'image',
    ];

    public function fingerprints()
    {
        return $this->hasMany(Fingeprint::class);
    }

    public function office()
    {
        return $this->belongsTo(Office::class);
    }
}
