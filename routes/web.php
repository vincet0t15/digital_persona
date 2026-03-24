<?php

use App\Http\Controllers\BiometricController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\TimeClockController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

// Time Clock (Outside Dashboard - for employee login/logout)
Route::get('/time-clock', [TimeClockController::class, 'index'])->name('timeclock.index');
Route::post('/time-clock', [TimeClockController::class, 'clock'])->name('timeclock.clock');
Route::get('/time-clock/recent-logs', [TimeClockController::class, 'recentLogs'])->name('timeclock.recent');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');



    // Employee Registration with Biometric
    Route::get('/employees/create', [EmployeeController::class, 'create'])->name('employees.create');
    Route::post('/employees', [EmployeeController::class, 'store'])->name('employees.store');

    // Employee Identification
    Route::get('/employees/identify', function () {
        return Inertia::render('Bio/identify');
    })->name('employees.identify');

    // Biometric API endpoints
    Route::post('/biometric/identify', [BiometricController::class, 'identify'])->name('biometric.identify');
    Route::post('/biometric/check-duplicate', [BiometricController::class, 'checkDuplicate'])->name('biometric.check-duplicate');

    // Employee Management
    Route::get('/employees', [EmployeeController::class, 'index'])->name('employees.index');
    Route::get('/employees/{employee}/fingerprints', [EmployeeController::class, 'manageFingerprints'])->name('employees.fingerprints');
    Route::post('/employees/{employee}/fingerprints', [EmployeeController::class, 'storeFingerprints'])->name('employees.fingerprints.store');
    Route::delete('/employees/{employee}/fingerprints/{fingerprint}', [EmployeeController::class, 'deleteFingerprint'])->name('employees.fingerprints.delete');
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
