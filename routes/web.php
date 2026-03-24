<?php

use App\Http\Controllers\BiometricController;
use App\Http\Controllers\EmployeeController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

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
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
