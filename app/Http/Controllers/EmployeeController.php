<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\EmploymentType;
use App\Models\Fingeprint;
use App\Models\Office;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class EmployeeController extends Controller
{
    public function create()
    {
        $offices = Office::all();
        $employmentTypes = EmploymentType::where('status', true)->get();

        return Inertia::render('Employee/create', [
            'offices' => $offices,
            'employmentTypes' => $employmentTypes,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'office_id' => 'required|integer|exists:offices,id',
            'photo' => 'nullable|image|max:2048',
            'fingerprints_json' => 'required|string',
        ]);

        $fingerprints = json_decode($request->input('fingerprints_json'), true);

        if (empty($fingerprints) || !is_array($fingerprints)) {
            return redirect()->back()
                ->with('error', 'Invalid fingerprints data. Please add at least one fingerprint.');
        }


        $randomCredentials = $this->generateRandomCredentials();


        $imagePath = null;
        if ($request->hasFile('photo')) {
            $imagePath = $request->file('photo')->store('employees', 'public');
        }


        $employee = Employee::create([
            'name' => $validated['name'],
            'username' => $randomCredentials,
            'password' => Hash::make($randomCredentials),
            'office_id' => $validated['office_id'],
            'image' => $imagePath,
            'must_change_password' => true,
        ]);


        $enrolledCount = 0;

        foreach ($fingerprints as $fingerprintData) {
            $quality = $fingerprintData['quality'] ?? 0;
            $fingerName = $fingerprintData['finger_name'];
            $samples = $fingerprintData['samples'] ?? [];


            $fmdTemplates = [];
            foreach ($samples as $sample) {
                $fmd = $this->convertPngToFmd($sample['template']);
                if ($fmd !== false) {
                    $fmdTemplates[] = $fmd;
                }
            }


            if (count($fmdTemplates) > 0) {

                $fingerprint = Fingeprint::create([
                    'employee_id' => $employee->id,
                    'finger_name' => $fingerName,
                    'fingerprint_template' => $fmdTemplates[0],
                    'fingerprint_quality' => $quality,
                    'reader_label' => 'Primary',
                    'enrolled_from_ip' => $request->ip(),
                ]);


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
            $employee->delete();
            return redirect()->back()
                ->with('error', 'Failed to process fingerprints. Please try scanning again.');
        }


        cache()->forget('enrolled_fingerprints');

        return redirect()->route('employees.index')
            ->with('success', "Employee registered successfully with {$enrolledCount} fingerprint(s). Username & Password: {$randomCredentials}");
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


    public function manageFingerprints(Employee $employee)
    {
        $employee->load('fingerprints');
        $offices = Office::all();

        return Inertia::render('Employee/fingerprints', [
            'employee' => $employee,
            'offices' => $offices,
        ]);
    }


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


        cache()->forget('enrolled_fingerprints');

        return redirect()->route('employees.fingerprints', $employee)
            ->with('success', "{$enrolledCount} fingerprint(s) added successfully.");
    }


    public function deleteFingerprint(Employee $employee, Fingeprint $fingerprint)
    {

        if ($fingerprint->employee_id !== $employee->id) {
            return redirect()->back()
                ->with('error', 'Fingerprint does not belong to this employee.');
        }

        $fingerprint->delete();


        cache()->forget('enrolled_fingerprints');

        return redirect()->route('employees.fingerprints', $employee)
            ->with('success', 'Fingerprint deleted successfully.');
    }


    private function generateRandomCredentials(): string
    {
        return substr(str_shuffle('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'), 0, 8);
    }
}
