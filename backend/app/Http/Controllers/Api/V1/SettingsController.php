<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\EmailSetting;
use App\Models\Setting;
use App\Models\SmsProviderSetting;
use App\Services\SmsDispatcherService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettingsController extends Controller
{
    public function updateGeneral(Request $request): JsonResponse
    {
        $payload = $request->validate([
            'company' => ['sometimes', 'array'],
            'map' => ['sometimes', 'array'],
            'seo' => ['sometimes', 'array'],
            'site' => ['sometimes', 'array'],
        ]);

        foreach ($payload as $group => $entries) {
            foreach ($entries as $key => $value) {
                Setting::query()->updateOrCreate(
                    ['key' => $key],
                    ['group' => $group, 'value' => is_scalar($value) ? (string) $value : json_encode($value)]
                );
            }
        }

        return response()->json(['message' => 'تنظیمات با موفقیت ذخیره شد.']);
    }

    public function updateEmail(Request $request): JsonResponse
    {
        $data = $request->validate([
            'smtp_host' => ['required', 'string'],
            'smtp_port' => ['required', 'integer'],
            'smtp_user' => ['nullable', 'string'],
            'smtp_password' => ['nullable', 'string'],
            'from_address' => ['required', 'email'],
            'from_name' => ['required', 'string'],
        ]);

        $setting = EmailSetting::query()->firstOrNew([]);
        $setting->fill([
            'smtp_host' => $data['smtp_host'],
            'smtp_port' => $data['smtp_port'],
            'smtp_user' => $data['smtp_user'] ?? null,
            'from_address' => $data['from_address'],
            'from_name' => $data['from_name'],
        ]);
        if (!empty($data['smtp_password'])) {
            $setting->smtp_password_encrypted = $data['smtp_password'];
        }
        $setting->save();

        return response()->json(['message' => 'تنظیمات ایمیل با رمزنگاری AES ذخیره شد.']);
    }

    public function updateSms(Request $request): JsonResponse
    {
        $data = $request->validate([
            'provider' => ['required', 'in:kavenegar,smsir,melipayamak'],
            'api_key' => ['nullable', 'string'],
            'sender_line' => ['nullable', 'string'],
            'enabled' => ['required', 'boolean'],
        ]);

        $sms = SmsProviderSetting::query()->firstOrNew([]);
        $sms->fill([
            'provider' => $data['provider'],
            'sender_line' => $data['sender_line'] ?? '',
            'enabled' => $data['enabled'],
        ]);
        if (!empty($data['api_key'])) {
            $sms->api_key_encrypted = $data['api_key'];
        }
        $sms->save();

        return response()->json(['message' => 'تنظیمات پیامک با موفقیت ذخیره شد.']);
    }

    public function testSms(Request $request, SmsDispatcherService $sms): JsonResponse
    {
        $data = $request->validate(['phone' => ['required', 'string'], 'message' => ['required', 'string']]);
        return response()->json($sms->send($data['phone'], $data['message']));
    }
}
