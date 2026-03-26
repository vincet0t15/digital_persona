<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\TimeLog;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class EmployeeAuthController extends Controller
{
    /**
     * Show the employee login page.
     */
    public function showLogin(): Response
    {
        return Inertia::render('authEmployee/login');
    }

    /**
     * Handle employee login.
     */
    public function login(Request $request): RedirectResponse
    {
        $request->validate([
            'username' => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);

        $employee = Employee::where('username', $request->input('username'))
            ->where('is_active', true)
            ->first();

        if (! $employee || ! Hash::check($request->input('password'), $employee->password)) {
            throw ValidationException::withMessages([
                'username' => __('auth.failed'),
            ]);
        }

        Auth::guard('employee')->login($employee, $request->boolean('remember'));

        $request->session()->regenerate();

        // Check if employee must change password (first login)
        if ($employee->must_change_password) {
            return redirect()->route('employee.change-password')
                ->with('info', 'Please change your username and password before continuing.');
        }

        return redirect()->intended(route('employee.dashboard'));
    }

    /**
     * Show the employee dashboard.
     */
    public function dashboard(): Response
    {
        /** @var Employee $employee */
        $employee = Auth::guard('employee')->user();
        $employee->load('office');

        $recentLogs = TimeLog::where('employee_id', $employee->id)
            ->orderBy('date_time', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($log) {
                return [
                    'id' => $log->id,
                    'log_type' => $log->log_type,
                    'time' => \Carbon\Carbon::parse($log->date_time)->format('h:i A'),
                    'date' => \Carbon\Carbon::parse($log->date_time)->format('M d'),
                ];
            });

        return Inertia::render('Employee/dashboard', [
            'employee' => $employee,
            'recentLogs' => $recentLogs,
        ]);
    }

    /**
     * Show the change password form (for first login).
     */
    public function showChangePassword(): Response|RedirectResponse
    {
        /** @var Employee $employee */
        $employee = Auth::guard('employee')->user();

        // If already changed password, redirect to dashboard
        if (! $employee->must_change_password) {
            return redirect()->route('employee.dashboard');
        }

        return Inertia::render('authEmployee/change-password', [
            'employee' => $employee,
        ]);
    }

    /**
     * Update username and password (first login).
     */
    public function changePassword(Request $request): RedirectResponse
    {
        /** @var Employee $employee */
        $employee = Auth::guard('employee')->user();

        // If already changed password, redirect to dashboard
        if (! $employee->must_change_password) {
            return redirect()->route('employee.dashboard');
        }

        $validated = $request->validate([
            'username' => ['required', 'string', 'max:255', 'unique:employees,username,' . $employee->id],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $employee->fill([
            'username' => $validated['username'],
            'password' => Hash::make($validated['password']),
            'must_change_password' => false,
        ])->save();

        return redirect()->route('employee.dashboard')
            ->with('success', 'Your username and password have been updated successfully.');
    }

    /**
     * Logout the employee.
     */
    public function logout(Request $request): RedirectResponse
    {
        Auth::guard('employee')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('employee.login');
    }
}
