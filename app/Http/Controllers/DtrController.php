<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\TimeLog;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DtrController extends Controller
{
    /**
     * Show employee's own DTR with month filter
     */
    public function myDtr(Request $request)
    {
        /** @var Employee $employee */
        $employee = Auth::guard('employee')->user();

        // Get available years from employee's time logs
        $availableYears = TimeLog::where('employee_id', $employee->id)
            ->selectRaw('DISTINCT YEAR(date_time) as year')
            ->orderBy('year', 'desc')
            ->pluck('year')
            ->toArray();

        if (empty($availableYears)) {
            $availableYears = [now()->year];
        }

        // Get current year and month from request or use defaults
        $currentYear = (int) ($request->input('year') ?? now()->year);
        $currentMonth = (int) ($request->input('month') ?? now()->month);

        $dateFrom = Carbon::createFromDate($currentYear, $currentMonth, 1)->startOfDay();
        $dateTo = $dateFrom->copy()->endOfMonth()->endOfDay();

        // Load employee with time logs for the selected month
        $employee->load([
            'timeLogs' => function ($query) use ($dateFrom, $dateTo) {
                $query->whereBetween('date_time', [$dateFrom, $dateTo])
                    ->orderBy('date_time');
            },
            'shift',
            'office',
        ]);

        // Get available months for the selected year
        $availableMonths = TimeLog::where('employee_id', $employee->id)
            ->whereYear('date_time', $currentYear)
            ->selectRaw('DISTINCT MONTH(date_time) as month')
            ->orderBy('month', 'asc')
            ->pluck('month')
            ->toArray();

        // Build DTR records for the month
        $start = Carbon::createFromDate($currentYear, $currentMonth, 1);
        $end = $start->copy()->endOfMonth();
        $forTheMonthOf = $start->format('F') . ' 1-' . $end->format('d, Y');

        $daysInMonth = collect();
        for ($date = $start->copy(); $date->lte($end); $date->addDay()) {
            $daysInMonth->push($date->toDateString());
        }

        // Group logs by date
        $logsByDate = $employee->timeLogs
            ->groupBy(function ($log) {
                return Carbon::parse($log->date_time)->toDateString();
            });

        $records = [];
        $allLogs = collect();

        foreach ($daysInMonth as $dateStr) {
            $date = Carbon::parse($dateStr);
            $dayLogs = $logsByDate[$dateStr] ?? collect();

            $sortedLogs = $dayLogs->sortBy('date_time')->values();
            $pairs = [];
            $currentIn = null;

            foreach ($sortedLogs as $log) {
                if ($log->log_type === 'IN') {
                    if ($currentIn === null) {
                        $currentIn = $log;
                    } else {
                        continue;
                    }
                } else {
                    if ($currentIn !== null) {
                        if (Carbon::parse($log->date_time)->gt(Carbon::parse($currentIn->date_time))) {
                            $pairs[] = ['in' => $currentIn, 'out' => $log];
                            $currentIn = null;
                        } else {
                            $pairs[] = ['in' => $currentIn, 'out' => null];
                            $pairs[] = ['in' => null, 'out' => $log];
                            $currentIn = null;
                        }
                    } else {
                        $pairs[] = ['in' => null, 'out' => $log];
                    }
                }
            }

            if ($currentIn !== null) {
                $pairs[] = ['in' => $currentIn, 'out' => null];
            }

            $amIn = $amOut = $pmIn = $pmOut = null;
            $amInCandidates = [];
            $amOutCandidates = [];
            $pmInCandidates = [];
            $pmOutCandidates = [];

            foreach ($pairs as $pair) {
                $inTime = $pair['in'] ? Carbon::parse($pair['in']->date_time) : null;
                $outTime = $pair['out'] ? Carbon::parse($pair['out']->date_time) : null;

                if ($inTime) {
                    if ($inTime->hour < 12) {
                        $amInCandidates[] = $inTime;
                    } else {
                        $pmInCandidates[] = $inTime;
                    }
                }

                if ($outTime) {
                    if ($outTime->hour < 13) {
                        $amOutCandidates[] = $outTime;
                    } else {
                        $pmOutCandidates[] = $outTime;
                    }
                }
            }

            if (count($amInCandidates)) {
                $amIn = collect($amInCandidates)->min();
            }

            if (count($amOutCandidates)) {
                if ($amIn) {
                    $validAmOuts = collect($amOutCandidates)->filter(function (Carbon $t) use ($amIn) {
                        return $t->gte($amIn);
                    });
                    if ($validAmOuts->count()) {
                        $amOut = $validAmOuts->max();
                    }
                } else {
                    $amOut = collect($amOutCandidates)->max();
                }
            }

            if (count($pmInCandidates)) {
                if ($amOut) {
                    $validPmIns = collect($pmInCandidates)->filter(function (Carbon $t) use ($amOut) {
                        return $t->gt($amOut);
                    });
                    if ($validPmIns->count()) {
                        $pmIn = $validPmIns->min();
                    }
                } else {
                    $pmIn = collect($pmInCandidates)->min();
                }
            }

            if (count($pmOutCandidates)) {
                if ($pmIn) {
                    $validPmOuts = collect($pmOutCandidates)->filter(function (Carbon $t) use ($pmIn) {
                        return $t->gte($pmIn);
                    });
                    if ($validPmOuts->count()) {
                        $pmOut = $validPmOuts->max();
                    }
                } else {
                    $pmOut = collect($pmOutCandidates)->max();
                }
            }

            // Compute late minutes
            $lateMinutes = 0;
            if (!in_array($date->dayOfWeek, [Carbon::SATURDAY, Carbon::SUNDAY]) && $dayLogs->count() > 0) {
                $shift = $employee->shift;

                if ($shift && $shift->start_time) {
                    $startTime = Carbon::parse($shift->start_time->format('H:i:s'));
                } else {
                    $startTime = Carbon::createFromTime(8, 0, 0);
                }
                $standardAMIn = $date->copy()->setTime($startTime->hour, $startTime->minute);

                if ($shift && $shift->break_end) {
                    $breakEndTime = Carbon::parse($shift->break_end->format('H:i:s'));
                    $standardPMIn = $date->copy()->setTime($breakEndTime->hour, $breakEndTime->minute);
                } else {
                    $standardPMIn = $date->copy()->setTime(13, 0);
                }

                $hasAMLog = $dayLogs->first(function ($log) {
                    return Carbon::parse($log->date_time)->hour < 13;
                }) !== null;

                $hasPMLog = $dayLogs->first(function ($log) {
                    return Carbon::parse($log->date_time)->hour >= 13;
                }) !== null;

                if ($hasAMLog && $amIn) {
                    $amInCopy = $amIn->copy()->seconds(0)->startOfMinute();
                    if ($amInCopy->greaterThan($standardAMIn)) {
                        $lateMinutes += $standardAMIn->diffInMinutes($amInCopy);
                    }
                }

                if ($hasPMLog && $pmIn) {
                    $pmInCopy = $pmIn->copy()->seconds(0)->startOfMinute();
                    if ($pmInCopy->greaterThan($standardPMIn)) {
                        $lateMinutes += $standardPMIn->diffInMinutes($pmInCopy);
                    }
                }
            }

            // Calculate total hours worked for the day
            $totalHoursWorked = 0;
            foreach ($pairs as $pair) {
                if ($pair['in'] && $pair['out']) {
                    $inTime = Carbon::parse($pair['in']->date_time);
                    $outTime = Carbon::parse($pair['out']->date_time);
                    $hoursWorked = $inTime->diffInMinutes($outTime) / 60;
                    $totalHoursWorked += $hoursWorked;
                }
            }
            $shift = $employee->shift;
            // Subtract break time if applicable
            if ($shift && $shift->break_start && $shift->break_end && $totalHoursWorked > 0) {
                $breakStart = Carbon::parse($shift->break_start->format('H:i:s'));
                $breakEnd = Carbon::parse($shift->break_end->format('H:i:s'));
                $breakMinutes = $breakStart->diffInMinutes($breakEnd);
                $breakHours = $breakMinutes / 60;

                // Only subtract break if the employee actually worked during break time
                $hasBreakLog = false;
                foreach ($pairs as $pair) {
                    if ($pair['in'] && $pair['out']) {
                        $inTime = Carbon::parse($pair['in']->date_time);
                        $outTime = Carbon::parse($pair['out']->date_time);
                        if ($inTime->lte($breakEnd) && $outTime->gte($breakStart)) {
                            $hasBreakLog = true;
                            break;
                        }
                    }
                }

                if ($hasBreakLog) {
                    $totalHoursWorked = max(0, $totalHoursWorked - $breakHours);
                }
            }

            $logs = $dayLogs->map(function ($log) {
                return [
                    'datetime' => $log->date_time,
                    'type' => $log->log_type === 'IN' ? 'in' : 'out',
                ];
            })->values();

            $records[] = [
                'date' => $dateStr,
                'am_in' => $amIn ? $amIn->format('g:i') : '',
                'am_out' => $amOut ? $amOut->format('g:i') : '',
                'pm_in' => $pmIn ? $pmIn->format('g:i') : '',
                'pm_out' => $pmOut ? $pmOut->format('g:i') : '',
                'late_minutes' => (int) round($lateMinutes),
                'total_hours' => round($totalHoursWorked, 2),
                'logs' => $logs,
            ];

            $allLogs = $allLogs->merge($logs);
        }

        $totalIn = $allLogs->where('type', 'in')->count();
        $totalOut = $allLogs->where('type', 'out')->count();



        $flexiTime = [
            'time_in' => $shift && $shift->start_time ? $shift->start_time->format('H:i:s') : '08:00:00',
            'time_out' => $shift && $shift->end_time ? $shift->end_time->format('H:i:s') : '17:00:00',
        ];

        $dtrData = [
            'id' => $employee->id,
            'student_id' => (string) $employee->id,
            'student_name' => $employee->name,
            'records' => $records,
            'forTheMonthOf' => $forTheMonthOf,
            'totalIn' => $totalIn,
            'totalOut' => $totalOut,
            'flexiTime' => $flexiTime,
            'nightShift' => false,
        ];

        return Inertia::render('Employee/DTR', [
            'dtr' => $dtrData,
            'filters' => [
                'year' => $currentYear,
                'month' => $currentMonth,
            ],
            'availableYears' => $availableYears,
            'availableMonths' => $availableMonths,
            'employee' => [
                'id' => $employee->id,
                'name' => $employee->name,
                'office' => $employee->office?->name,
                'shift' => $shift ? [
                    'name' => $shift->name,
                    'start_time' => $shift->start_time?->format('H:i'),
                    'end_time' => $shift->end_time?->format('H:i'),
                ] : null,
            ],
        ]);
    }

    /**
     * Print employee's own DTR (accessible to employees)
     */
    public function printMyDtr(Request $request)
    {
        /** @var Employee $employee */
        $employee = Auth::guard('employee')->user();

        $year = (int) ($request->input('year') ?? now()->year);
        $month = (int) ($request->input('month') ?? now()->month);

        $dateFrom = Carbon::createFromDate($year, $month, 1)->startOfDay();
        $dateTo = $dateFrom->copy()->endOfMonth()->endOfDay();

        // Load employee with time logs for that month
        $employee->load([
            'timeLogs' => function ($query) use ($dateFrom, $dateTo) {
                $query->whereBetween('date_time', [$dateFrom, $dateTo])
                    ->orderBy('date_time');
            },
            'shift',
        ]);

        $start = Carbon::createFromDate($year, $month, 1);
        $end = $start->copy()->endOfMonth();
        $forTheMonthOf = $start->format('F') . ' 1-' . $end->format('d, Y');

        $daysInMonth = collect();
        for ($date = $start->copy(); $date->lte($end); $date->addDay()) {
            $daysInMonth->push($date->toDateString());
        }

        // Group logs by date
        $logsByDate = $employee->timeLogs
            ->groupBy(function ($log) {
                return Carbon::parse($log->date_time)->toDateString();
            });

        $records = [];
        $allLogs = collect();

        foreach ($daysInMonth as $dateStr) {
            $date = Carbon::parse($dateStr);
            $dayLogs = $logsByDate[$dateStr] ?? collect();

            $sortedLogs = $dayLogs->sortBy('date_time')->values();
            $pairs = [];
            $currentIn = null;

            foreach ($sortedLogs as $log) {
                if ($log->log_type === 'IN') {
                    if ($currentIn === null) {
                        $currentIn = $log;
                    } else {
                        continue;
                    }
                } else {
                    if ($currentIn !== null) {
                        if (Carbon::parse($log->date_time)->gt(Carbon::parse($currentIn->date_time))) {
                            $pairs[] = ['in' => $currentIn, 'out' => $log];
                            $currentIn = null;
                        } else {
                            $pairs[] = ['in' => $currentIn, 'out' => null];
                            $pairs[] = ['in' => null, 'out' => $log];
                            $currentIn = null;
                        }
                    } else {
                        $pairs[] = ['in' => null, 'out' => $log];
                    }
                }
            }

            if ($currentIn !== null) {
                $pairs[] = ['in' => $currentIn, 'out' => null];
            }

            $amIn = $amOut = $pmIn = $pmOut = null;
            $amInCandidates = [];
            $amOutCandidates = [];
            $pmInCandidates = [];
            $pmOutCandidates = [];

            foreach ($pairs as $pair) {
                $inTime = $pair['in'] ? Carbon::parse($pair['in']->date_time) : null;
                $outTime = $pair['out'] ? Carbon::parse($pair['out']->date_time) : null;

                if ($inTime) {
                    if ($inTime->hour < 12) {
                        $amInCandidates[] = $inTime;
                    } else {
                        $pmInCandidates[] = $inTime;
                    }
                }

                if ($outTime) {
                    if ($outTime->hour < 13) {
                        $amOutCandidates[] = $outTime;
                    } else {
                        $pmOutCandidates[] = $outTime;
                    }
                }
            }

            if (count($amInCandidates)) {
                $amIn = collect($amInCandidates)->min();
            }

            if (count($amOutCandidates)) {
                if ($amIn) {
                    $validAmOuts = collect($amOutCandidates)->filter(function (Carbon $t) use ($amIn) {
                        return $t->gte($amIn);
                    });
                    if ($validAmOuts->count()) {
                        $amOut = $validAmOuts->max();
                    }
                } else {
                    $amOut = collect($amOutCandidates)->max();
                }
            }

            if (count($pmInCandidates)) {
                if ($amOut) {
                    $validPmIns = collect($pmInCandidates)->filter(function (Carbon $t) use ($amOut) {
                        return $t->gt($amOut);
                    });
                    if ($validPmIns->count()) {
                        $pmIn = $validPmIns->min();
                    }
                } else {
                    $pmIn = collect($pmInCandidates)->min();
                }
            }

            if (count($pmOutCandidates)) {
                if ($pmIn) {
                    $validPmOuts = collect($pmOutCandidates)->filter(function (Carbon $t) use ($pmIn) {
                        return $t->gte($pmIn);
                    });
                    if ($validPmOuts->count()) {
                        $pmOut = $validPmOuts->max();
                    }
                } else {
                    $pmOut = collect($pmOutCandidates)->max();
                }
            }

            // Compute late minutes
            $lateMinutes = 0;
            if (!in_array($date->dayOfWeek, [Carbon::SATURDAY, Carbon::SUNDAY]) && $dayLogs->count() > 0) {
                $shift = $employee->shift;

                if ($shift && $shift->start_time) {
                    $startTime = Carbon::parse($shift->start_time->format('H:i:s'));
                } else {
                    $startTime = Carbon::createFromTime(8, 0, 0);
                }
                $standardAMIn = $date->copy()->setTime($startTime->hour, $startTime->minute);

                if ($shift && $shift->break_end) {
                    $breakEndTime = Carbon::parse($shift->break_end->format('H:i:s'));
                    $standardPMIn = $date->copy()->setTime($breakEndTime->hour, $breakEndTime->minute);
                } else {
                    $standardPMIn = $date->copy()->setTime(13, 0);
                }

                $hasAMLog = $dayLogs->first(function ($log) {
                    return Carbon::parse($log->date_time)->hour < 13;
                }) !== null;

                $hasPMLog = $dayLogs->first(function ($log) {
                    return Carbon::parse($log->date_time)->hour >= 13;
                }) !== null;

                if ($hasAMLog && $amIn) {
                    $amInCopy = $amIn->copy()->seconds(0)->startOfMinute();
                    if ($amInCopy->greaterThan($standardAMIn)) {
                        $lateMinutes += $standardAMIn->diffInMinutes($amInCopy);
                    }
                }

                if ($hasPMLog && $pmIn) {
                    $pmInCopy = $pmIn->copy()->seconds(0)->startOfMinute();
                    if ($pmInCopy->greaterThan($standardPMIn)) {
                        $lateMinutes += $standardPMIn->diffInMinutes($pmInCopy);
                    }
                }
            }

            // Calculate total hours worked for the day
            $totalHoursWorked = 0;
            foreach ($pairs as $pair) {
                if ($pair['in'] && $pair['out']) {
                    $inTime = Carbon::parse($pair['in']->date_time);
                    $outTime = Carbon::parse($pair['out']->date_time);
                    $hoursWorked = $inTime->diffInMinutes($outTime) / 60;
                    $totalHoursWorked += $hoursWorked;
                }
            }
            $shift = $employee->shift;
            // Subtract break time if applicable
            if ($shift && $shift->break_start && $shift->break_end && $totalHoursWorked > 0) {
                $breakStart = Carbon::parse($shift->break_start->format('H:i:s'));
                $breakEnd = Carbon::parse($shift->break_end->format('H:i:s'));
                $breakMinutes = $breakStart->diffInMinutes($breakEnd);
                $breakHours = $breakMinutes / 60;

                // Only subtract break if the employee actually worked during break time
                $hasBreakLog = false;
                foreach ($pairs as $pair) {
                    if ($pair['in'] && $pair['out']) {
                        $inTime = Carbon::parse($pair['in']->date_time);
                        $outTime = Carbon::parse($pair['out']->date_time);
                        if ($inTime->lte($breakEnd) && $outTime->gte($breakStart)) {
                            $hasBreakLog = true;
                            break;
                        }
                    }
                }

                if ($hasBreakLog) {
                    $totalHoursWorked = max(0, $totalHoursWorked - $breakHours);
                }
            }

            $logs = $dayLogs->map(function ($log) {
                return [
                    'datetime' => $log->date_time,
                    'type' => $log->log_type === 'IN' ? 'in' : 'out',
                ];
            })->values();

            $records[] = [
                'date' => $dateStr,
                'am_in' => $amIn ? $amIn->format('g:i') : '',
                'am_out' => $amOut ? $amOut->format('g:i') : '',
                'pm_in' => $pmIn ? $pmIn->format('g:i') : '',
                'pm_out' => $pmOut ? $pmOut->format('g:i') : '',
                'late_minutes' => (int) round($lateMinutes),
                'total_hours' => round($totalHoursWorked, 2),
                'logs' => $logs,
            ];

            $allLogs = $allLogs->merge($logs);
        }

        $totalIn = $allLogs->where('type', 'in')->count();
        $totalOut = $allLogs->where('type', 'out')->count();


        $flexiTime = [
            'time_in' => $shift && $shift->start_time ? $shift->start_time->format('H:i:s') : '08:00:00',
            'time_out' => $shift && $shift->end_time ? $shift->end_time->format('H:i:s') : '17:00:00',
        ];

        $dtrData = [
            'id' => $employee->id,
            'student_id' => (string) $employee->id,
            'student_name' => $employee->name,
            'records' => $records,
            'forTheMonthOf' => $forTheMonthOf,
            'totalIn' => $totalIn,
            'totalOut' => $totalOut,
            'previousLogs' => [],
            'PrevForTheMonth' => '',
            'PrevTotalIn' => 0,
            'PreveTotalOut' => 0,
            'flexiTime' => $flexiTime,
            'nightShift' => false,
        ];

        return Inertia::render('DTR/DTR', [
            'dtr' => [$dtrData],
        ]);
    }

    public function print(Request $request)
    {
        $year = (int) ($request->input('year') ?? now()->year);
        $month = (int) ($request->input('month') ?? now()->month);

        $dateFrom = Carbon::createFromDate($year, $month, 1)->startOfDay();
        $dateTo = $dateFrom->copy()->endOfMonth()->endOfDay();

        $employeeIds = $request->input('employee_ids');

        // Convert to array if it's a single string value
        if (is_string($employeeIds)) {
            $employeeIds = [$employeeIds];
        } elseif (!is_array($employeeIds)) {
            $employeeIds = [];
        }

        $employeesQuery = Employee::with([
            'timeLogs' => function ($query) use ($dateFrom, $dateTo) {
                $query->whereBetween('date_time', [$dateFrom, $dateTo])
                    ->orderBy('date_time');
            },
            'shift',
        ]);

        if (!empty($employeeIds)) {
            $employeesQuery->whereIn('id', $employeeIds);
        }

        $employees = $employeesQuery->get();

        $start = Carbon::createFromDate($year, $month, 1);
        $end = $start->copy()->endOfMonth();
        $forTheMonthOf = $start->format('F') . ' 1-' . $end->format('d, Y');

        $daysInMonth = collect();
        for ($date = $start->copy(); $date->lte($end); $date->addDay()) {
            $daysInMonth->push($date->toDateString());
        }

        $allRecords = [];

        foreach ($employees as $employee) {
            $logsByDate = $employee->timeLogs
                ->groupBy(function ($log) {
                    return Carbon::parse($log->date_time)->toDateString();
                });

            $records = [];
            $allLogs = collect();

            foreach ($daysInMonth as $dateStr) {
                $date = Carbon::parse($dateStr);
                $dayLogs = $logsByDate[$dateStr] ?? collect();

                $sortedLogs = $dayLogs->sortBy('date_time')->values();
                $pairs = [];
                $currentIn = null;

                foreach ($sortedLogs as $log) {
                    if ($log->log_type === 'IN') {
                        if ($currentIn === null) {
                            $currentIn = $log;
                        } else {
                            continue;
                        }
                    } else {
                        if ($currentIn !== null) {
                            if (Carbon::parse($log->date_time)->gt(Carbon::parse($currentIn->date_time))) {
                                $pairs[] = ['in' => $currentIn, 'out' => $log];
                                $currentIn = null;
                            } else {
                                $pairs[] = ['in' => $currentIn, 'out' => null];
                                $pairs[] = ['in' => null, 'out' => $log];
                                $currentIn = null;
                            }
                        } else {
                            $pairs[] = ['in' => null, 'out' => $log];
                        }
                    }
                }

                if ($currentIn !== null) {
                    $pairs[] = ['in' => $currentIn, 'out' => null];
                }

                $amIn = $amOut = $pmIn = $pmOut = null;
                $amInCandidates = [];
                $amOutCandidates = [];
                $pmInCandidates = [];
                $pmOutCandidates = [];

                foreach ($pairs as $pair) {
                    $inTime = $pair['in'] ? Carbon::parse($pair['in']->date_time) : null;
                    $outTime = $pair['out'] ? Carbon::parse($pair['out']->date_time) : null;

                    if ($inTime) {
                        if ($inTime->hour < 12) {
                            $amInCandidates[] = $inTime;
                        } else {
                            $pmInCandidates[] = $inTime;
                        }
                    }

                    if ($outTime) {
                        if ($outTime->hour < 13) {
                            $amOutCandidates[] = $outTime;
                        } else {
                            $pmOutCandidates[] = $outTime;
                        }
                    }
                }

                if (count($amInCandidates)) {
                    $amIn = collect($amInCandidates)->min();
                }

                if (count($amOutCandidates)) {
                    if ($amIn) {
                        $validAmOuts = collect($amOutCandidates)->filter(function (Carbon $t) use ($amIn) {
                            return $t->gte($amIn);
                        });
                        if ($validAmOuts->count()) {
                            $amOut = $validAmOuts->max();
                        }
                    } else {
                        $amOut = collect($amOutCandidates)->max();
                    }
                }

                if (count($pmInCandidates)) {
                    if ($amOut) {
                        $validPmIns = collect($pmInCandidates)->filter(function (Carbon $t) use ($amOut) {
                            return $t->gt($amOut);
                        });
                        if ($validPmIns->count()) {
                            $pmIn = $validPmIns->min();
                        }
                    } else {
                        $pmIn = collect($pmInCandidates)->min();
                    }
                }

                if (count($pmOutCandidates)) {
                    if ($pmIn) {
                        $validPmOuts = collect($pmOutCandidates)->filter(function (Carbon $t) use ($pmIn) {
                            return $t->gte($pmIn);
                        });
                        if ($validPmOuts->count()) {
                            $pmOut = $validPmOuts->max();
                        }
                    } else {
                        $pmOut = collect($pmOutCandidates)->max();
                    }
                }

                // Compute late only for weekdays and only if there are logs for the day
                $lateMinutes = 0;

                if (!in_array($date->dayOfWeek, [Carbon::SATURDAY, Carbon::SUNDAY]) && $dayLogs->count() > 0) {
                    $shift = $employee->shift;

                    if ($shift && $shift->start_time) {
                        $startTime = Carbon::parse($shift->start_time->format('H:i:s'));
                    } else {
                        $startTime = Carbon::createFromTime(8, 0, 0);
                    }
                    $standardAMIn = $date->copy()->setTime($startTime->hour, $startTime->minute);

                    if ($shift && $shift->break_end) {
                        $breakEndTime = Carbon::parse($shift->break_end->format('H:i:s'));
                        $standardPMIn = $date->copy()->setTime($breakEndTime->hour, $breakEndTime->minute);
                    } else {
                        $standardPMIn = $date->copy()->setTime(13, 0);
                    }

                    $hasAMLog = $dayLogs->first(function ($log) {
                        return Carbon::parse($log->date_time)->hour < 13;
                    }) !== null;

                    $hasPMLog = $dayLogs->first(function ($log) {
                        return Carbon::parse($log->date_time)->hour >= 13;
                    }) !== null;

                    // Check AM late
                    if ($hasAMLog && $amIn) {
                        $amInCopy = $amIn->copy()->seconds(0)->startOfMinute();
                        if ($amInCopy->greaterThan($standardAMIn)) {
                            $lateMinutes += $standardAMIn->diffInMinutes($amInCopy);
                        }
                    }

                    // Check PM late
                    if ($hasPMLog && $pmIn) {
                        $pmInCopy = $pmIn->copy()->seconds(0)->startOfMinute();
                        if ($pmInCopy->greaterThan($standardPMIn)) {
                            $lateMinutes += $standardPMIn->diffInMinutes($pmInCopy);
                        }
                    }
                }

                $logs = $dayLogs->map(function ($log) {
                    return [
                        'datetime' => $log->date_time,
                        'type' => $log->log_type === 'IN' ? 'in' : 'out',
                    ];
                })->values();

                $hasUnmatched = collect($pairs)->contains(function ($pair) {
                    return !$pair['in'] || !$pair['out'];
                });

                $records[] = [
                    'date' => $dateStr,
                    'am_in' => $amIn ? $amIn->format('g:i') : '',
                    'am_out' => $amOut ? $amOut->format('g:i') : '',
                    'pm_in' => $pmIn ? $pmIn->format('g:i') : '',
                    'pm_out' => $pmOut ? $pmOut->format('g:i') : '',
                    'late_minutes' => (int) round($lateMinutes),
                    'logs' => $logs,
                    'hasUnmatched' => $hasUnmatched,
                ];

                $allLogs = $allLogs->merge($logs);
            }

            $totalIn = $allLogs->where('type', 'in')->count();
            $totalOut = $allLogs->where('type', 'out')->count();

            $shift = $employee->shift;

            $flexiTime = [
                'time_in' => $shift && $shift->start_time ? $shift->start_time->format('H:i:s') : '08:00:00',
                'time_out' => $shift && $shift->end_time ? $shift->end_time->format('H:i:s') : '17:00:00',
            ];

            $allRecords[] = [
                'id' => $employee->id,
                'student_id' => (string) $employee->id,
                'student_name' => $employee->name,
                'records' => $records,
                'forTheMonthOf' => $forTheMonthOf,
                'totalIn' => $totalIn,
                'totalOut' => $totalOut,
                'previousLogs' => [],
                'PrevForTheMonth' => '',
                'PrevTotalIn' => 0,
                'PreveTotalOut' => 0,
                'flexiTime' => $flexiTime,
                'nightShift' => false,
            ];
        }

        return Inertia::render('DTR/DTR', [
            'dtr' => $allRecords,
        ]);
    }
}
