<?php

namespace App\Http\Controllers;

use App\Models\Office;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BiometricController extends Controller
{
    public function register()
    {
        $offices = Office::all();
        return Inertia::render('Bio/index', [
            'offices' => $offices,
        ]);
    }
}
