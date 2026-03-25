<?php

namespace App\Http\Controllers;

use App\Models\Shift;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ShiftController extends Controller
{
    public function index()
    {
        $shifts = Shift::withCount('employmentTypes')
            ->orderBy('name')
            ->get();

        return Inertia::render('Shifts/index', [
            'shifts' => $shifts,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:shifts,name',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'break_start' => 'nullable|date_format:H:i|before:break_end',
            'break_end' => 'nullable|date_format:H:i|after:break_start',
            'grace_minutes' => 'required|integer|min:0|max:60',
            'is_active' => 'boolean',
        ]);

        Shift::create($validated);

        return redirect()->back()->with('success', 'Shift created successfully.');
    }

    public function update(Request $request, Shift $shift)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:shifts,name,' . $shift->id,
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'break_start' => 'nullable|date_format:H:i|before:break_end',
            'break_end' => 'nullable|date_format:H:i|after:break_start',
            'grace_minutes' => 'required|integer|min:0|max:60',
            'is_active' => 'boolean',
        ]);

        $shift->update($validated);

        return redirect()->back()->with('success', 'Shift updated successfully.');
    }

    public function destroy(Shift $shift)
    {
        // Check if shift is being used by any employment type
        if ($shift->employmentTypes()->exists()) {
            return redirect()->back()->with('error', 'Cannot delete shift. It is currently assigned to one or more employment types.');
        }

        $shift->delete();

        return redirect()->back()->with('success', 'Shift deleted successfully.');
    }
}
