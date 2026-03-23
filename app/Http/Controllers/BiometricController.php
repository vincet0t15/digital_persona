<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class BiometricController extends Controller
{
    public function register()
    {
        return Inertia::render('Bio/index');
    }
}
