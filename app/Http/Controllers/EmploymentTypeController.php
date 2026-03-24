<?php

namespace App\Http\Controllers;

use App\Models\EmploymentType;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EmploymentTypeController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->query('search');


        $employmentTypes = EmploymentType::query()
            ->when($search, function ($query) use ($search) {
                $query->where('name', 'like', '%' . $search . '%');
            })
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('EmploymentType/index', [
            'employmentTypes' => $employmentTypes,
            'filters' => ['search' => $search]
        ]);
    }
}
