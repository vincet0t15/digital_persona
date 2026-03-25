<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\EmploymentType;
use App\Models\Office;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ManageEmployeeController extends Controller
{
    public function index(Request $request, Employee $employee)
    {
        $employee = Employee::with('fingerprints', 'employmentType', 'office')
            ->find($employee->id);
        $offices = Office::all();
        $employmentType = EmploymentType::all();

        return Inertia::render('Employee/Manage/index', [
            'offices' => $offices,
            'employmentTypes' => $employmentType,
            'employee' => $employee
        ]);
    }

    public function update(Request $request, Employee $employee)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'office_id' => 'required|exists:offices,id',
            'employment_type_id' => 'required|exists:employment_types,id',
            'is_active' => 'required|boolean',
            'photo' => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('photo')) {
            if ($employee->photo) {
                Storage::disk('public')->delete($employee->photo);
            }
            $employee->photo = $request->file('photo')->store('employees', 'public');
        }

        $employee->update($request->all());

        return redirect()->back()->with('success', 'Employee updated successfully');
    }
}
