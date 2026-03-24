<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\Fingeprint;
use App\Models\Office;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class EmployeeController extends Controller
{
    public function create()
    {
        $offices = Office::all();
        return Inertia::render('Bio/index', [
            'offices' => $offices,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'username' => 'required|string|max:255|unique:employees,username',
            'password' => 'required|string|min:6',
            'office_id' => 'required|integer|exists:offices,id',
            'photo' => 'nullable|image|max:2048',
            'fingerprint_template' => 'nullable|string',
            'fingerprint_quality' => 'nullable|integer|min:0|max:100',
            'finger_name' => 'nullable|string|max:50',
        ]);

        // Handle photo upload
        $imagePath = null;
        if ($request->hasFile('photo')) {
            $imagePath = $request->file('photo')->store('employees', 'public');
        }

        // Create employee
        $employee = Employee::create([
            'name' => $validated['name'],
            'username' => $validated['username'],
            'password' => Hash::make($validated['password']),
            'office_id' => $validated['office_id'],
            'image' => $imagePath,
        ]);

        // Create fingerprint if template provided
        if (!empty($validated['fingerprint_template'])) {
            Fingeprint::create([
                'employee_id' => $employee->id,
                'finger_name' => $validated['finger_name'] ?? 'Right Thumb',
                'fingerprint_template' => $validated['fingerprint_template'],
                'fingerprint_quality' => $validated['fingerprint_quality'] ?? 0,
                'reader_label' => 'Primary',
                'enrolled_from_ip' => $request->ip(),
            ]);
        }

        return redirect()->route('dashboard')->with('success', 'Employee registered successfully.');
    }
}
