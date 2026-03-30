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
        $employee = Employee::with('fingerprints', 'employmentType', 'shift', 'office')
            ->find($employee->id);
        $offices = Office::all();
        $employmentTypes = EmploymentType::all();
        $shifts = \App\Models\Shift::where('is_active', true)->get();

        return Inertia::render('Employee/Manage/index', [
            'offices' => $offices,
            'employmentTypes' => $employmentTypes,
            'shifts' => $shifts,
            'employee' => $employee
        ]);
    }

    public function update(Request $request, Employee $employee)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'office_id' => 'required|exists:offices,id',
            'employment_type_id' => 'required|exists:employment_types,id',
            'shift_id' => 'nullable|exists:shifts,id',
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

    public function bulkAssignShift(Request $request)
    {
        $request->validate([
            'employee_ids' => 'required|array|min:1',
            'employee_ids.*' => 'required|integer|exists:employees,id',
            'shift_id' => 'required|integer|exists:shifts,id',
        ]);

        $employeeIds = $request->input('employee_ids');
        $shiftId = $request->input('shift_id');

        // Update all selected employees with the new shift
        Employee::whereIn('id', $employeeIds)->update(['shift_id' => $shiftId]);

        $updatedCount = count($employeeIds);

        return response()->json([
            'success' => true,
            'message' => "Successfully assigned {$updatedCount} employee(s) to the selected shift",
            'updated_count' => $updatedCount,
        ]);
    }
}
