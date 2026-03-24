<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\Fingeprint;
use App\Models\Office;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class BiometricController extends Controller
{
    public function register(Request $request)
    {
        $offices = Office::all();
        return Inertia::render('Bio/index', [
            'offices' => $offices,
        ]);
    }

    public function enroll(Request $request)
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


        $user = Auth::user();

        $fingerprint = Fingeprint::create([
            'user_id' => $user->id,
            'fingerprint_template' => $fmdTemplate,
            'fingerprint_quality' => $quality,
            'reader_label' => 'Primary',
            'enrolled_from_ip' => $request->ip(),
        ]);


        return response()->json([
            'success' => true,
            'message' => 'Fingerprint enrolled successfully!',
            'data' => [
                'id' => $fingerprint->id,
                'quality' => $quality,
            ],
        ]);
    }

    private function convertPngToFmd(string $pngBase64): string|false
    {
        $tempDir = sys_get_temp_dir();
        $pngFile = $tempDir . DIRECTORY_SEPARATOR . 'fp_png_' . uniqid() . '.txt';

        file_put_contents($pngFile, $pngBase64);

        // Check public/matcher/ folder first
        $matcherPath = public_path('matcher/FingerprintMatcher.exe');

        // Fallback to BIOMETRICPHP matcher if not found in public
        if (!file_exists($matcherPath)) {
            $matcherPath = 'c:\\laragon\\www\\BIOMETRICPHP\\matcher\\FingerprintMatcher.exe';
        }

        if (!file_exists($matcherPath)) {
            Log::error('FingerprintMatcher.exe not found at: ' . $matcherPath);
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
        $tempDir = sys_get_temp_dir();
        $capturedFile = $tempDir . DIRECTORY_SEPARATOR . 'fp_captured_' . uniqid() . '.txt';
        $galleryFile = $tempDir . DIRECTORY_SEPARATOR . 'fp_gallery_' . uniqid() . '.txt';

        file_put_contents($capturedFile, $capturedFmd);

        // Build gallery file
        $galleryLines = [];
        $indexToUserId = [];
        foreach ($galleryEntries as $idx => $entry) {
            $galleryLines[] = $idx . '|' . $entry['template'];
            $indexToUserId[$idx] = $entry['user_id'];
        }

        file_put_contents($galleryFile, implode("\n", $galleryLines));

        // Check public/matcher/ folder
        $matcherPath = public_path('matcher/FingerprintMatcher.exe');

        // Fallback to BIOMETRICPHP matcher if not found in public
        if (!file_exists($matcherPath)) {
            $matcherPath = 'c:\\laragon\\www\\BIOMETRICPHP\\matcher\\FingerprintMatcher.exe';
        }

        if (!file_exists($matcherPath)) {
            @unlink($capturedFile);
            @unlink($galleryFile);
            Log::error('FingerprintMatcher.exe not found at: ' . $matcherPath);
            return ['match' => false, 'message' => 'Matcher not found'];
        }

        $cmd = '"' . $matcherPath . '" identify "' . $capturedFile . '" "' . $galleryFile . '" 2>&1';
        $output = shell_exec($cmd);

        @unlink($capturedFile);
        @unlink($galleryFile);

        if ($output === null) {
            return ['match' => false, 'message' => 'Matcher execution failed'];
        }

        $result = json_decode(trim($output), true);

        if ($result === null) {
            return ['match' => false, 'message' => 'Invalid matcher response'];
        }

        if (isset($result['match']) && $result['match'] === true && isset($result['person_id'])) {
            $matchedIndex = intval($result['person_id']);
            $matchedUserId = $indexToUserId[$matchedIndex] ?? null;

            if ($matchedUserId) {
                return [
                    'match' => true,
                    'user_id' => $matchedUserId,
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
            return response()->json([
                'success' => false,
                'message' => 'Failed to process captured fingerprint. Please try again.',
            ], 400);
        }

        // Get all fingerprints from database
        $fingerprints = Fingeprint::with('employee')
            ->whereNotNull('fingerprint_template')
            ->where('fingerprint_template', '!=', '')
            ->get();

        // Build gallery entries
        $galleryEntries = [];
        $employeeMap = [];

        foreach ($fingerprints as $fingerprint) {
            $employeeMap[$fingerprint->employee_id] = $fingerprint->employee;
            if (!empty($fingerprint->fingerprint_template)) {
                $galleryEntries[] = [
                    'user_id' => $fingerprint->employee_id,
                    'template' => $fingerprint->fingerprint_template,
                ];
            }
        }

        if (count($galleryEntries) === 0) {
            return response()->json([
                'success' => true,
                'match' => false,
                'message' => 'No enrolled fingerprints found',
            ]);
        }

        // Run matcher
        $result = $this->matchFingerprint($capturedFmd, $galleryEntries);

        if ($result['match'] && isset($result['user_id'])) {
            $matchedEmployee = $employeeMap[$result['user_id']] ?? null;

            if ($matchedEmployee) {
                Log::info('Fingerprint identified', [
                    'employee_id' => $matchedEmployee->id,
                    'score' => $result['score'] ?? 0,
                ]);

                return response()->json([
                    'success' => true,
                    'match' => true,
                    'score' => $result['score'] ?? 0,
                    'data' => [
                        'id' => $matchedEmployee->id,
                        'name' => $matchedEmployee->name,
                    ],
                ]);
            }
        }

        Log::warning('Fingerprint identification failed', [
            'ip' => $request->ip(),
        ]);

        return response()->json([
            'success' => true,
            'match' => false,
            'message' => $result['message'] ?? 'No matching fingerprint found',
        ]);
    }
}
