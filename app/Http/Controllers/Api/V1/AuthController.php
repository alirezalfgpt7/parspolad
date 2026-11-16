<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\UserRoleEnum;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Resources\UserResource;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use PragmaRX\Google2FA\Google2FA;

class AuthController extends Controller
{
    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::query()->where('email', $request->string('email'))->first();

        if (! $user || ! Hash::check($request->string('password'), $user->password)) {
            return response()->json(['message' => 'ایمیل یا رمز عبور نادرست است.'], 422);
        }

        if (! $user->is_active) {
            return response()->json(['message' => 'حساب کاربری غیرفعال است.'], 403);
        }

        if ($user->two_factor_enabled) {
            $code = (string) $request->input('two_factor_code', '');
            if ($code === '') {
                return response()->json(['requires_2fa' => true, 'message' => 'کد تایید دوعاملی الزامی است.'], 200);
            }
            $valid = (new Google2FA)->verifyKey((string) $user->two_factor_secret, $code);
            if (! $valid) {
                return response()->json(['message' => 'کد تایید دوعاملی نامعتبر است.'], 422);
            }
        }

        $token = $user->createToken('portal-spa')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => new UserResource($user),
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json(['user' => new UserResource($request->user())]);
    }

    public function register(Request $request): JsonResponse
    {
        $registrationSetting = Setting::query()->where('key', 'allow_registration')->value('value');
        if ($registrationSetting !== null && ! filter_var($registrationSetting, FILTER_VALIDATE_BOOLEAN)) {
            return response()->json(['message' => 'ثبت‌نام عمومی در حال حاضر غیرفعال است.'], 403);
        }

        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['nullable', 'string', 'max:30'],
            'password' => ['required', 'string', Password::min(8)],
        ]);

        $user = User::query()->create([
            ...$data,
            'avatar' => '/storage/logos/logo-small.png',
            'password' => Hash::make($data['password']),
            'is_active' => true,
        ]);
        $user->assignRole(UserRoleEnum::CLIENT->value);
        $token = $user->createToken('portal-spa')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => new UserResource($user),
        ], 201);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();
        $data = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:120'],
            'phone' => ['sometimes', 'nullable', 'string', 'max:30'],
            'avatar' => ['sometimes', 'nullable', 'string', 'max:255'],
            'two_factor_enabled' => ['sometimes', 'boolean'],
            'current_password' => ['required_with:new_password', 'string'],
            'new_password' => ['sometimes', 'string', Password::min(8)],
        ]);

        if (isset($data['new_password'])) {
            abort_unless(
                isset($data['current_password']) && Hash::check($data['current_password'], $user->password),
                422,
                'رمز عبور فعلی صحیح نیست.',
            );
            $data['password'] = Hash::make($data['new_password']);
            unset($data['new_password'], $data['current_password']);
        } else {
            unset($data['current_password']);
        }

        $user->update($data);

        return response()->json(['user' => new UserResource($user->fresh())]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()?->currentAccessToken()?->delete();

        return response()->json(['message' => 'خروج با موفقیت انجام شد.']);
    }

    public function toggleTwoFactor(Request $request): JsonResponse
    {
        $user = $request->user();
        $enable = (bool) $request->boolean('enabled');
        $secret = $enable ? (new Google2FA)->generateSecretKey() : null;

        $user->update([
            'two_factor_enabled' => $enable,
            'two_factor_secret' => $secret,
        ]);

        return response()->json([
            'user' => new UserResource($user->fresh()),
            'two_factor_secret' => $secret,
        ]);
    }
}
