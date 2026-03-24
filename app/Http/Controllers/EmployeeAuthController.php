<?php

namespace App\Http\Controllers;

use App\Models\Employee;
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
        return Inertia::render('Employee/login');
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

        return redirect()->intended(route('employee.dashboard'));
    }

    /**
     * Show the employee dashboard.
     */
    public function dashboard(): Response
    {
        return Inertia::render('employee/dashboard', [
            'employee' => Auth::guard('employee')->user(),
        ]);
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
