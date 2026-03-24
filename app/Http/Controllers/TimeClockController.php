<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\Fingeprint;
use App\Models\TimeLog;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

use function Laravel\Prompts\error;

class TimeClockController extends Controller
{
    /**
     * Show the time clock page for fingerprint login/logout
     */
    public function index()
    {
        return Inertia::render('TimeClock/index');
    }

    /**
     * Process time in/out via fingerprint identification
     */
    public function clock(Request $request)
    {
        $request->validate([
            'fingerprint_template' => 'required|string',
        ]);

        $capturedPng = $request->input('fingerprint_template');
        $capturedFmd = $this->convertPngToFmd($capturedPng);

        if ($capturedFmd === false) {
            return redirect()->back()
                ->with('error', 'Failed to process fingerprint. Please try again.');
        }

        $fingerprints = Fingeprint::with('employee')
            ->whereNotNull('fingerprint_template')
            ->where('fingerprint_template', '!=', '')
            ->get();

        if (count($fingerprints) === 0) {
            return redirect()->back()
                ->with('error', 'No enrolled fingerprints found in the system.');
        }

        $galleryEntries = [];
        $employeeMap = [];

        foreach ($fingerprints as $fingerprint) {
            $employeeMap[$fingerprint->employee_id] = $fingerprint->employee;
            if (!empty($fingerprint->fingerprint_template)) {
                $galleryEntries[] = [
                    'employee_id' => $fingerprint->employee_id,
                    'template' => $fingerprint->fingerprint_template,
                ];
            }
        }

        $result = $this->matchFingerprint($capturedFmd, $galleryEntries);

        if ($result['match'] && isset($result['employee_id'])) {
            $matchedEmployee = $employeeMap[$result['employee_id']] ?? null;

            if ($matchedEmployee) {
                $lastLog = TimeLog::where('employee_id', $matchedEmployee->id)
                    ->orderBy('date_time', 'desc')
                    ->first();

                $logType = 'IN';
                if ($lastLog && $lastLog->log_type === 'IN') {
                    $logType = 'OUT';
                }

                try {
                    TimeLog::create([
                        'employee_id' => $matchedEmployee->id,
                        'date_time' => Carbon::now(),
                        'log_type' => $logType,
                    ]);
                } catch (\Exception $e) {
                    Log::error('Failed to save time log', [
                        'error' => $e->getMessage(),
                        'employee_id' => $matchedEmployee->id,
                    ]);
                    return redirect()->back()
                        ->with('error', 'Failed to save time log. Please try again.');
                }

                Log::info('Time clock recorded', [
                    'employee_id' => $matchedEmployee->id,
                    'employee_name' => $matchedEmployee->name,
                    'log_type' => $logType,
                ]);

                return redirect()->back()
                    ->with('success', "{$matchedEmployee->name} - Time {$logType} recorded successfully!")
                    ->with('clock_result', [
                        'employee' => [
                            'id' => $matchedEmployee->id,
                            'name' => $matchedEmployee->name,
                            'image' => $matchedEmployee->image,
                        ],
                        'log_type' => $logType,
                        'time' => Carbon::now()->format('h:i A'),
                    ]);
            }
        }

        return redirect()->back()
            ->with('error', 'No matching fingerprint found. Please register your fingerprint or try again.');
    }


    public function recentLogs()
    {
        $logs = TimeLog::with('employee')
            ->orderBy('date_time', 'desc')
            ->limit(20)
            ->get();

        return response()->json($logs);
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

    private function matchFingerprint(string $capturedFmd, array $galleryEntries): array
    {
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

        $matcherPath = storage_path('app/matcher/FingerprintMatcher.exe');

        if (!file_exists($matcherPath)) {
            $matcherPath = public_path('matcher/FingerprintMatcher.exe');
        }

        if (!file_exists($matcherPath)) {
            @unlink($capturedFile);
            @unlink($galleryFile);

            return [
                'match' => false,
                'message' => 'Matcher not found',
            ];
        }

        $cmd = '"' . $matcherPath . '" identify "' . $capturedFile . '" "' . $galleryFile . '" 2>&1';
        $output = shell_exec($cmd);

        @unlink($capturedFile);
        @unlink($galleryFile);

        if ($output === null) {
            return [
                'match' => false,
                'message' => 'Matcher execution failed',
            ];
        }

        $result = json_decode(trim($output), true);

        if ($result === null) {
            return [
                'match' => false,
                'message' => 'Invalid matcher response',
            ];
        }

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
}
