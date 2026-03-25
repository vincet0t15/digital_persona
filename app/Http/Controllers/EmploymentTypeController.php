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

    public function store(Request $request)
    {

        $request->validate([
            'name' => 'required|max:255|unique:employment_types',
            'description' => 'nullable|max:255',
        ]);

        EmploymentType::create($request->all());

        return redirect()->back()->with('success', 'Employment type created successfully.');
    }
}
