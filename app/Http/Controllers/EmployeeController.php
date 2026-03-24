<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\Fingeprint;
use App\Models\Office;
use Illuminate\Support\Facades\Cache;
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
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'username' => 'required|string|max:255|unique:employees,username',
            'password' => 'required|string|min:6',
            'office_id' => 'required|integer|exists:offices,id',
            'photo' => 'nullable|image|max:2048',
            'fingerprints_json' => 'required|string',
        ]);

        $fingerprints = json_decode($request->input('fingerprints_json'), true);

        if (empty($fingerprints) || !is_array($fingerprints)) {
            return redirect()->back()
                ->with('error', 'Invalid fingerprints data. Please add at least one fingerprint.');
        }

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

        // Process and save all fingerprints with multiple samples
        $enrolledCount = 0;

        foreach ($fingerprints as $fingerprintData) {
            $quality = $fingerprintData['quality'] ?? 0;
            $fingerName = $fingerprintData['finger_name'];
            $samples = $fingerprintData['samples'] ?? [];

            // Convert all samples to FMD templates
            $fmdTemplates = [];
            foreach ($samples as $sample) {
                $fmd = $this->convertPngToFmd($sample['template']);
                if ($fmd !== false) {
                    $fmdTemplates[] = $fmd;
                }
            }

            // Only save if we have at least one valid template
            if (count($fmdTemplates) > 0) {
                // Create main fingerprint record with first template
                $fingerprint = Fingeprint::create([
                    'employee_id' => $employee->id,
                    'finger_name' => $fingerName,
                    'fingerprint_template' => $fmdTemplates[0],
                    'fingerprint_quality' => $quality,
                    'reader_label' => 'Primary',
                    'enrolled_from_ip' => $request->ip(),
                ]);

                // Save additional samples in separate table
                for ($i = 1; $i < count($fmdTemplates); $i++) {
                    $fingerprint->samples()->create([
                        'sample_index' => $i + 1,
                        'template' => $fmdTemplates[$i],
                        'quality' => $quality,
                    ]);
                }

                $enrolledCount++;
            }
        }

        if ($enrolledCount === 0) {
            // Rollback employee creation if no fingerprints were saved
            $employee->delete();
            return redirect()->back()
                ->with('error', 'Failed to process fingerprints. Please try scanning again.');
        }

        // Clear the fingerprint cache so new enrollments are available immediately
        cache()->forget('enrolled_fingerprints');

        return redirect()->route('employees.index')
            ->with('success', "Employee registered successfully with {$enrolledCount} fingerprint(s).");
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

    public function index(Request $request)
    {
        $search = $request->query('search');
        $officeId = $request->query('office_id');
        $offices = Office::all();
        $employees = Employee::query()
            ->with('office')
            ->with('fingerprints')
            ->when($search, function ($query) use ($search) {
                $query->where('name', 'like', '%' . $search . '%')
                    ->orWhere('username', 'like', '%' . $search . '%');
            })
            ->when($officeId, function ($query) use ($officeId) {
                $query->where('office_id', $officeId);
            })
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Employee/index', [
            'employees' => $employees,
            'filters' => [
                'search' => $search,
                'office_id' => $request->query('office_id') ?? null,
            ],
            'offices' => $offices,
        ]);
    }

    /**
     * Show fingerprint management page for an employee
     */
    public function manageFingerprints(Employee $employee)
    {
        $employee->load('fingerprints');
        $offices = Office::all();

        return Inertia::render('Employee/fingerprints', [
            'employee' => $employee,
            'offices' => $offices,
        ]);
    }

    /**
     * Store additional fingerprints for an employee
     */
    public function storeFingerprints(Request $request, Employee $employee)
    {
        $request->validate([
            'fingerprints_json' => 'required|string',
        ]);

        $fingerprints = json_decode($request->input('fingerprints_json'), true);

        if (empty($fingerprints) || !is_array($fingerprints)) {
            return redirect()->back()
                ->with('error', 'Invalid fingerprints data. Please add at least one fingerprint.');
        }

        // Process and save all fingerprints
        $enrolledCount = 0;

        foreach ($fingerprints as $fingerprintData) {
            $pngBase64 = $fingerprintData['template'];
            $quality = $fingerprintData['quality'] ?? 0;
            $fingerName = $fingerprintData['finger_name'];

            $fmdTemplate = $this->convertPngToFmd($pngBase64);

            if ($fmdTemplate !== false) {
                Fingeprint::create([
                    'employee_id' => $employee->id,
                    'finger_name' => $fingerName,
                    'fingerprint_template' => $fmdTemplate,
                    'fingerprint_quality' => $quality,
                    'reader_label' => 'Primary',
                    'enrolled_from_ip' => $request->ip(),
                ]);
                $enrolledCount++;
            }
        }

        if ($enrolledCount === 0) {
            return redirect()->back()
                ->with('error', 'Failed to process fingerprints. Please try scanning again.');
        }

        // Clear the fingerprint cache
        cache()->forget('enrolled_fingerprints');

        return redirect()->route('employees.fingerprints', $employee)
            ->with('success', "{$enrolledCount} fingerprint(s) added successfully.");
    }

    /**
     * Delete a fingerprint
     */
    public function deleteFingerprint(Employee $employee, Fingeprint $fingerprint)
    {
        // Ensure the fingerprint belongs to the employee
        if ($fingerprint->employee_id !== $employee->id) {
            return redirect()->back()
                ->with('error', 'Fingerprint does not belong to this employee.');
        }

        $fingerprint->delete();

        // Clear the fingerprint cache
        cache()->forget('enrolled_fingerprints');

        return redirect()->route('employees.fingerprints', $employee)
            ->with('success', 'Fingerprint deleted successfully.');
    }
}
