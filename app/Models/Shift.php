<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Shift extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'start_time',
        'end_time',
        'break_start',
        'break_end',
        'grace_minutes',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'start_time' => 'datetime:H:i:s',
            'end_time' => 'datetime:H:i:s',
            'break_start' => 'datetime:H:i:s',
            'break_end' => 'datetime:H:i:s',
            'is_active' => 'boolean',
        ];
    }

    public function employmentTypes()
    {
        return $this->hasMany(EmploymentType::class);
    }

    public function employees()
    {
        return $this->hasMany(Employee::class);
    }

    protected function getBaselineStartTime(\DateTime $time): \DateTime
    {
        $shiftStart = \DateTime::createFromFormat('H:i:s', $this->start_time->format('H:i:s'));
        $checkTime = \DateTime::createFromFormat('H:i:s', $time->format('H:i:s'));

        // If break_end is set (e.g. lunch break ends at 13:00), and the check-in
        // time is in the afternoon block, treat break_end as the start for lateness.
        if ($this->break_end) {
            $breakEnd = \DateTime::createFromFormat('H:i:s', $this->break_end->format('H:i:s'));

            if ($checkTime >= $breakEnd) {
                return $breakEnd;
            }
        }

        // Otherwise use the normal shift start time (e.g. 08:00)
        return $shiftStart;
    }

    /**
     * Check if a given time is late for this shift.
     */
    public function isLate(\DateTime $time): bool
    {
        $baselineStart = $this->getBaselineStartTime($time);
        $gracePeriod = clone $baselineStart;
        $gracePeriod->modify("+{$this->grace_minutes} minutes");

        $checkTime = \DateTime::createFromFormat('H:i:s', $time->format('H:i:s'));

        return $checkTime > $gracePeriod;
    }

    /**
     * Calculate late minutes for a given time.
     */
    public function calculateLateMinutes(\DateTime $time): int
    {
        $baselineStart = $this->getBaselineStartTime($time);
        $gracePeriod = clone $baselineStart;
        $gracePeriod->modify("+{$this->grace_minutes} minutes");

        $checkTime = \DateTime::createFromFormat('H:i:s', $time->format('H:i:s'));

        if ($checkTime <= $gracePeriod) {
            return 0;
        }

        $diff = $checkTime->diff($baselineStart);
        $minutes = ($diff->h * 60) + $diff->i;

        // Subtract grace period
        return max(0, $minutes - $this->grace_minutes);
    }

    /**
     * Check if a given time is undertime (early out).
     */
    public function isUndertime(\DateTime $time): bool
    {
        $shiftEnd = \DateTime::createFromFormat('H:i:s', $this->end_time->format('H:i:s'));
        $checkTime = \DateTime::createFromFormat('H:i:s', $time->format('H:i:s'));

        return $checkTime < $shiftEnd;
    }

    /**
     * Calculate undertime minutes for a given time.
     */
    public function calculateUndertimeMinutes(\DateTime $time): int
    {
        $shiftEnd = \DateTime::createFromFormat('H:i:s', $this->end_time->format('H:i:s'));
        $checkTime = \DateTime::createFromFormat('H:i:s', $time->format('H:i:s'));

        if ($checkTime >= $shiftEnd) {
            return 0;
        }

        $diff = $shiftEnd->diff($checkTime);
        return ($diff->h * 60) + $diff->i;
    }

    /**
     * Get total work hours (excluding break).
     */
    public function getTotalWorkHours(): float
    {
        $start = \DateTime::createFromFormat('H:i:s', $this->start_time->format('H:i:s'));
        $end = \DateTime::createFromFormat('H:i:s', $this->end_time->format('H:i:s'));

        $diff = $start->diff($end);
        $totalMinutes = ($diff->h * 60) + $diff->i;

        // Subtract break time if set
        if ($this->break_start && $this->break_end) {
            $breakStart = \DateTime::createFromFormat('H:i:s', $this->break_start->format('H:i:s'));
            $breakEnd = \DateTime::createFromFormat('H:i:s', $this->break_end->format('H:i:s'));
            $breakDiff = $breakStart->diff($breakEnd);
            $totalMinutes -= ($breakDiff->h * 60) + $breakDiff->i;
        }

        return round($totalMinutes / 60, 2);
    }
}
