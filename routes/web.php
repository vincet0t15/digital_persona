<?php

use App\Http\Controllers\BiometricController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');


    // Biometric
    Route::prefix('biometric')->group(function () {
        Route::get('/register', [BiometricController::class, 'register'])->name('biometric.register');
    });
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
