<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\EmploymentType;
use App\Models\Office;
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
}
