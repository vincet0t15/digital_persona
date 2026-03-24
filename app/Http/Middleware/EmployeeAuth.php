<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EmployeeAuth
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Check if employee is logged in
        if (! auth('employee')->check()) {
            return redirect()->route('employee.login');
        }

        // Check if employee account is active
        $employee = Auth::guard('employee')->user();
        if (! $employee->is_active) {
            Auth::guard('employee')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect()->route('employee.login')->with('error', 'Your account has been deactivated. Please contact your administrator.');
        }

        return $next($request);
    }
}
