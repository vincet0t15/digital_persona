<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Support\Facades\Storage;

class Employee extends Authenticatable
{
    use SoftDeletes;

    protected $guard = 'employee';

    protected $fillable = [
        'name',
        'username',
        'password',
        'office_id',
        'image',
        'is_active',
        'is_admin',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
            'is_active' => 'boolean',
            'is_admin' => 'boolean',
        ];
    }

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
