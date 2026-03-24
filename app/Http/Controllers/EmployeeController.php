<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\Fingeprint;
use App\Models\Office;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class EmployeeController extends Controller
{
    public function create()
    {
        $offices = Office::all();
        return Inertia::render('Bio/index', [
            'offices' => $offices,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'fingerprint_template' => 'required|string',
            'fingerprint_quality' => 'nullable|integer|min:0|max:100',
        ]);

        $pngBase64 = $request->input('fingerprint_template');
        $quality = $request->input('fingerprint_quality', 0);

        $fmdTemplate = $this->convertPngToFmd($pngBase64);


        if ($fmdTemplate === false) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to process fingerprint. Please try scanning again.',
            ], 400);
        }


        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'username' => 'required|string|max:255|unique:employees,username',
            'password' => 'required|string|min:6',
            'office_id' => 'required|integer|exists:offices,id',
            'photo' => 'nullable|image|max:2048',
        ]);

        // Handle photo upload
        $imagePath = null;
        if ($request->hasFile('photo')) {
            $imagePath = $request->file('photo')->store('employees', 'public');
        }

        // Create employee
        $employee = Employee::create([
            'name' => $validated['name'],
            'username' => $validated['username'],
            'password' => Hash::make($validated['password']),
            'office_id' => $validated['office_id'],
            'image' => $imagePath,
        ]);


        Fingeprint::create([
            'employee_id' => $employee->id,
            'finger_name' => 'Right Thumb',
            'fingerprint_template' => $fmdTemplate,
            'fingerprint_quality' => $quality,
            'reader_label' => 'Primary',
            'enrolled_from_ip' => $request->ip(),
        ]);

        return redirect()->back()->with('success', 'Employee registered successfully.');
    }

    private function convertPngToFmd(string $pngBase64): string|false
    {
        $tempDir = sys_get_temp_dir();
        $pngFile = $tempDir . DIRECTORY_SEPARATOR . 'fp_png_' . uniqid() . '.txt';

        file_put_contents($pngFile, $pngBase64);

        $matcherPath = storage_path('app/matcher/FingerprintMatcher.exe');


        if (!file_exists($matcherPath)) {
            $matcherPath = public_path('matcher/FingerprintMatcher.exe');
        }

        if (!file_exists($matcherPath)) {
            Log::error('FingerprintMatcher.exe not found');
            @unlink($pngFile);
            return false;
        }

        $cmd = '"' . $matcherPath . '" png2fmd "' . $pngFile . '" 2>&1';
        $output = shell_exec($cmd);

        @unlink($pngFile);

        if ($output === null) {
            return false;
        }

        $result = json_decode(trim($output), true);

        if ($result && isset($result['success']) && $result['success'] === true && isset($result['fmd'])) {
            return $result['fmd'];
        }

        Log::error('PNG to FMD conversion failed', ['output' => $output]);

        return false;
    }
}
