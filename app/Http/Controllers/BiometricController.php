<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\Fingeprint;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class BiometricController extends Controller
{
    private function getMatcherPath(): string|false
    {
        $paths = [
            public_path('matcher/FingerprintMatcher.exe'),
        ];

        foreach ($paths as $path) {
            if (file_exists($path)) {
                return $path;
            }
        }

        return false;
    }

    private function convertPngToFmd(string $pngBase64): string|false
    {
        $tempDir = sys_get_temp_dir();
        $pngFile = $tempDir . DIRECTORY_SEPARATOR . 'fp_png_' . uniqid() . '.txt';

        file_put_contents($pngFile, $pngBase64);

        $matcherPath = $this->getMatcherPath();

        if ($matcherPath === false) {
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

    private function matchFingerprint(string $capturedFmd, array $galleryEntries): array
    {
        $startTime = microtime(true);
        $tempDir = sys_get_temp_dir();
        $capturedFile = $tempDir . DIRECTORY_SEPARATOR . 'fp_captured_' . uniqid() . '.txt';
        $galleryFile = $tempDir . DIRECTORY_SEPARATOR . 'fp_gallery_' . uniqid() . '.txt';

        file_put_contents($capturedFile, $capturedFmd);

        $galleryLines = [];
        $indexToEmployeeId = [];
        foreach ($galleryEntries as $idx => $entry) {
            $galleryLines[] = $idx . '|' . $entry['template'];
            $indexToEmployeeId[$idx] = $entry['employee_id'];
        }

        file_put_contents($galleryFile, implode("\n", $galleryLines));

        $matcherPath = $this->getMatcherPath();

        if ($matcherPath === false) {
            @unlink($capturedFile);
            @unlink($galleryFile);
            Log::error('FingerprintMatcher.exe not found');
            return ['match' => false, 'message' => 'Matcher not found'];
        }

        $cmd = '"' . $matcherPath . '" identify "' . $capturedFile . '" "' . $galleryFile . '" 2>&1';
        $output = shell_exec($cmd);

        @unlink($capturedFile);
        @unlink($galleryFile);

        $executionTime = round((microtime(true) - $startTime) * 1000, 2);

        if ($output === null) {
            Log::warning('Fingerprint matcher execution failed', [
                'gallery_size' => count($galleryEntries),
                'execution_time_ms' => $executionTime,
            ]);
            return ['match' => false, 'message' => 'Matcher execution failed'];
        }

        $result = json_decode(trim($output), true);

        if ($result === null) {
            Log::warning('Invalid matcher response', [
                'gallery_size' => count($galleryEntries),
                'execution_time_ms' => $executionTime,
                'output' => $output,
            ]);
            return ['match' => false, 'message' => 'Invalid matcher response'];
        }

        Log::info('Fingerprint matching completed', [
            'gallery_size' => count($galleryEntries),
            'execution_time_ms' => $executionTime,
            'match' => $result['match'] ?? false,
        ]);

        if (isset($result['match']) && $result['match'] === true && isset($result['person_id'])) {
            $matchedIndex = intval($result['person_id']);
            $matchedEmployeeId = $indexToEmployeeId[$matchedIndex] ?? null;

            if ($matchedEmployeeId) {
                return [
                    'match' => true,
                    'employee_id' => $matchedEmployeeId,
                    'score' => $result['score'] ?? 0,
                ];
            }
        }

        return [
            'match' => false,
            'message' => $result['message'] ?? 'No match found',
        ];
    }

    /**
     * Check if fingerprint is already registered (for duplicate detection during enrollment)
     */
    public function checkDuplicate(Request $request)
    {

        $request->validate([
            'fingerprint_template' => 'required|string',
        ]);

        $capturedPng = $request->input('fingerprint_template');

        // Convert captured PNG to ANSI FMD
        $capturedFmd = $this->convertPngToFmd($capturedPng);

        if ($capturedFmd === false) {
            return redirect()->back()
                ->with('result', [
                    'success' => false,
                    'duplicate' => false,
                    'message' => 'Failed to process fingerprint.',
                ])
                ->with('error', 'Failed to process fingerprint. Please try again.');
        }

        // Get all fingerprints from database with samples
        $fingerprints = Fingeprint::with(['employee', 'samples'])
            ->whereNotNull('fingerprint_template')
            ->where('fingerprint_template', '!=', '')
            ->get();

        if (count($fingerprints) === 0) {
            return redirect()->back()->with('result', [
                'success' => true,
                'duplicate' => false,
                'message' => 'No fingerprints in database.',
            ]);
        }

        // Build gallery entries with all template samples for better matching
        $galleryEntries = [];
        $employeeMap = [];

        foreach ($fingerprints as $fingerprint) {
            $employeeMap[$fingerprint->employee_id] = $fingerprint->employee;
            // Add all template samples for matching
            $allTemplates = $fingerprint->getAllTemplates();
            foreach ($allTemplates as $template) {
                if (!empty($template)) {
                    $galleryEntries[] = [
                        'employee_id' => $fingerprint->employee_id,
                        'template' => $template,
                    ];
                }
            }
        }

        // Run matcher
        $result = $this->matchFingerprint($capturedFmd, $galleryEntries);

        if ($result['match'] && isset($result['employee_id'])) {
            $matchedEmployee = $employeeMap[$result['employee_id']] ?? null;

            if ($matchedEmployee) {
                Log::info('Duplicate fingerprint detected during enrollment', [
                    'employee_id' => $matchedEmployee->id,
                    'employee_name' => $matchedEmployee->name,
                ]);

                return redirect()->back()
                    ->with('result', [
                        'success' => true,
                        'duplicate' => true,
                        'employee' => [
                            'id' => $matchedEmployee->id,
                            'name' => $matchedEmployee->name,
                        ],
                        'message' => "This fingerprint is already registered to {$matchedEmployee->name}.",
                    ])
                    ->with('error', "This fingerprint is already registered to {$matchedEmployee->name}.");
            }
        }

        return redirect()->back()
            ->with('result', [
                'success' => true,
                'duplicate' => false,
                'message' => 'Fingerprint is not registered.',
            ])
            ->with('success', 'Fingerprint is unique and can be enrolled.');
    }

    /**
     * Identify an employee by fingerprint
     */
    public function identify(Request $request)
    {
        $request->validate([
            'fingerprint_template' => 'required|string',
        ]);

        $capturedPng = $request->input('fingerprint_template');

        // Convert captured PNG to ANSI FMD
        $capturedFmd = $this->convertPngToFmd($capturedPng);

        if ($capturedFmd === false) {
            return back()->with('result', [
                'success' => false,
                'match' => false,
                'message' => 'Failed to process captured fingerprint. Please try again.',
            ]);
        }

        // Get all fingerprints from database (cached for 60 seconds to improve performance)
        $fingerprints = cache()->remember('enrolled_fingerprints', 60, function () {
            return Fingeprint::with(['employee', 'samples'])
                ->whereNotNull('fingerprint_template')
                ->where('fingerprint_template', '!=', '')
                ->get();
        });

        // Build gallery entries with all template samples for better matching
        $galleryEntries = [];
        $employeeMap = [];

        foreach ($fingerprints as $fingerprint) {
            $employeeMap[$fingerprint->employee_id] = $fingerprint->employee;
            // Add all template samples for matching
            $allTemplates = $fingerprint->getAllTemplates();
            foreach ($allTemplates as $template) {
                if (!empty($template)) {
                    $galleryEntries[] = [
                        'employee_id' => $fingerprint->employee_id,
                        'template' => $template,
                    ];
                }
            }
        }


        if (count($galleryEntries) === 0) {
            return back()->with('result', [
                'success' => true,
                'match' => false,
                'message' => 'No enrolled fingerprints found',
            ]);
        }

        // Run matcher
        $result = $this->matchFingerprint($capturedFmd, $galleryEntries);

        if ($result['match'] && isset($result['employee_id'])) {
            $matchedEmployee = $employeeMap[$result['employee_id']] ?? null;

            if ($matchedEmployee) {
                Log::info('Fingerprint identified', [
                    'employee_id' => $matchedEmployee->id,
                    'score' => $result['score'] ?? 0,
                ]);


                return redirect()->back()->with('result', [
                    'success' => true,
                    'match' => true,
                    'score' => $result['score'] ?? 0,
                    'employee_data' => $matchedEmployee,
                ]);
            }
        }

        Log::warning('Fingerprint identification failed', [
            'ip' => $request->ip(),
        ]);

        return back()->with('result', [
            'success' => true,
            'match' => false,
            'message' => $result['message'] ?? 'No matching fingerprint found',
        ]);
    }
}
