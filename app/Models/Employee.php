<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

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

    public function getImagePathAttribute($value)
    {
        return $value ? Storage::url($value) : null;
    }
}
