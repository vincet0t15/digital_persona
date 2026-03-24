<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class TimeLog extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'employee_id',
        'date_time',
        'log_type',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }
}
