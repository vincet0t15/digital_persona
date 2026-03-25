<?php

namespace App\Http\Controllers;

use App\Models\EmploymentType;
use App\Models\Shift;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EmploymentTypeController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->query('search');

        $employmentTypes = EmploymentType::query()
            ->with('shift')
            ->when($search, function ($query) use ($search) {
                $query->where('name', 'like', '%' . $search . '%');
            })
            ->paginate(10)
            ->withQueryString();

        $shifts = Shift::where('is_active', true)->get();

        return Inertia::render('EmploymentType/index', [
            'employmentTypes' => $employmentTypes,
            'shifts' => $shifts,
            'filters' => ['search' => $search]
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|max:255|unique:employment_types',
            'description' => 'nullable|max:255',
            'shift_id' => 'nullable|exists:shifts,id',
        ]);

        EmploymentType::create($request->all());

        return redirect()->back()->with('success', 'Employment type created successfully.');
    }

    public function destroy(EmploymentType $employmentType)
    {
        $employmentType->delete();

        return redirect()->back()->with('success', 'Employment type deleted successfully.');
    }

    public function update(Request $request, EmploymentType $employmentType)
    {
        $request->validate([
            'name' => 'required|max:255|unique:employment_types,name,' . $employmentType->id,
            'description' => 'nullable|max:255',
            'shift_id' => 'nullable|exists:shifts,id',
        ]);

        $employmentType->update($request->all());

        return redirect()->back()->with('success', 'Employment type updated successfully.');
    }
}
