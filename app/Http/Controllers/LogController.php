<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\EmploymentType;
use App\Models\Office;
use App\Models\TimeLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LogController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->query('search');
        $offices = Office::all();
        $employmentTypes = EmploymentType::all();

        $employees = Employee::query()
            ->with(['office', 'employmentType'])
            ->when($search, fn($query) => $query->where('name', 'like', "%{$search}%"))
            ->when($request->query('office_id'), fn($query) => $query->where('office_id', $request->query('office_id')))
            ->when($request->query('employment_type_id'), fn($query) => $query->where('employment_type_id', $request->query('employment_type_id')))
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Logs/index', [
            'employees' => $employees,
            'offices' => $offices,
            'employmentTypes' => $employmentTypes,
            'filters' => ['search' => $search]

        ]);
    }

    public function show(Request $request, Employee $employee)
    {
        $employee->load(['office', 'employmentType']);

        // Get available years for the employee's time logs
        $availableYears = TimeLog::where('employee_id', $employee->id)
            ->selectRaw('DISTINCT YEAR(date_time) as year')
            ->orderBy('year', 'desc')
            ->pluck('year')
            ->toArray();

        // Get current year and month from request or use defaults
        $currentYear = $request->query('year', date('Y'));
        $currentMonth = $request->query('month', null);

        // Build query for time logs
        $timeLogsQuery = TimeLog::where('employee_id', $employee->id)
            ->when($currentYear, fn($query) => $query->whereYear('date_time', $currentYear))
            ->when($currentMonth, fn($query) => $query->whereMonth('date_time', $currentMonth))
            ->orderBy('date_time', 'desc');

        // Paginate results
        $timeLogs = $timeLogsQuery->paginate(15)->withQueryString();

        // Get available months for the selected year
        $availableMonths = TimeLog::where('employee_id', $employee->id)
            ->when($currentYear, fn($query) => $query->whereYear('date_time', $currentYear))
            ->selectRaw('DISTINCT MONTH(date_time) as month')
            ->orderBy('month', 'asc')
            ->pluck('month')
            ->toArray();

        return Inertia::render('Logs/show', [
            'employee' => $employee,
            'timeLogs' => $timeLogs,
            'filters' => [
                'year' => (int) $currentYear,
                'month' => $currentMonth ? (int) $currentMonth : null,
            ],
            'availableYears' => $availableYears,
            'availableMonths' => $availableMonths,
        ]);
    }
}
