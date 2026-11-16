<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use PragmaRX\Google2FA\Google2FA;

class AuthController extends Controller
{
    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::query()->where('email', $request->string('email'))->first();

        if (!$user || !Hash::check($request->string('password'), $user->password)) {
            return response()->json(['message' => 'ایمیل یا رمز عبور نادرست است.'], 422);
        }

        if (!$user->is_active) {
            return response()->json(['message' => 'حساب کاربری غیرفعال است.'], 403);
        }

        if ($user->two_factor_enabled) {
            $code = (string) $request->input('two_factor_code', '');
            if ($code === '') {
                return response()->json(['requires_2fa' => true, 'message' => 'کد تایید دوعاملی الزامی است.'], 200);
            }
            $valid = (new Google2FA())->verifyKey((string) $user->two_factor_secret, $code);
            if (!$valid) {
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

    public function logout(Request $request): JsonResponse
    {
        $request->user()?->currentAccessToken()?->delete();
        return response()->json(['message' => 'خروج با موفقیت انجام شد.']);
    }

    public function toggleTwoFactor(Request $request): JsonResponse
    {
        $user = $request->user();
        $enable = (bool) $request->boolean('enabled');
        $secret = $enable ? (new Google2FA())->generateSecretKey() : null;

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
