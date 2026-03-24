<?php

namespace App\Http\Requests\Auth;

use App\Models\User;
use Illuminate\Auth\Events\Lockout;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class LoginRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'username' => ['required', 'string'],
            'password' => ['required', 'string'],
        ];
    }

    /**
     * Attempt to authenticate the request's credentials.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function authenticate(): void
    {
        $this->ensureIsNotRateLimited();

        $username = $this->input('username');
        $password = $this->input('password');

        Log::info('Login attempt', ['username' => $username]);

        // First, check if user exists at all
        $user = User::where('username', $username)->first();

        // If user doesn't exist
        if (! $user) {
            RateLimiter::hit($this->throttleKey());
            Log::info('Login failed - user not found', ['username' => $username]);

            throw ValidationException::withMessages([
                'username' => __('auth.failed'),
            ]);
        }

        // Check if user is active
        if (! $user->is_active) {
            RateLimiter::hit($this->throttleKey());
            Log::info('Login failed - account inactive', ['username' => $username, 'user_id' => $user->id]);

            throw ValidationException::withMessages([
                'username' => 'This account has been deactivated. Please contact your administrator.',
            ]);
        }

        // Check password
        if (! Hash::check($password, $user->password)) {
            RateLimiter::hit($this->throttleKey());
            Log::info('Login failed - wrong password', ['username' => $username]);

            throw ValidationException::withMessages([
                'username' => __('auth.failed'),
            ]);
        }

        // Log the user in
        Auth::login($user, $this->boolean('remember'));

        Log::info('Login success', ['username' => $username, 'user_id' => $user->id]);

        RateLimiter::clear($this->throttleKey());
    }

    /**
     * Ensure the login request is not rate limited.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function ensureIsNotRateLimited(): void
    {
        if (! RateLimiter::tooManyAttempts($this->throttleKey(), 5)) {
            return;
        }

        event(new Lockout($this));

        $seconds = RateLimiter::availableIn($this->throttleKey());

        throw ValidationException::withMessages([
            'username' => __('auth.throttle', [
                'seconds' => $seconds,
                'minutes' => ceil($seconds / 60),
            ]),
        ]);
    }

    /**
     * Get the rate limiting throttle key for the request.
     */
    public function throttleKey(): string
    {
        return Str::transliterate(Str::lower($this->input('username')) . '|' . $this->ip());
    }
}
