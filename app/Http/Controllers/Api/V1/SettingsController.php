<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\EmailSetting;
use App\Models\Setting;
use App\Models\SmsProviderSetting;
use App\Services\SmtpEmailService;
use App\Services\SmsDispatcherService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Validation\Rule;

class SettingsController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $this->ensurePermission($request, 'settings.manage');
        $settings = Setting::query()->whereIn('group', ['company', 'map', 'seo', 'site'])->get();
        $groups = [];
        foreach ($settings as $setting) {
            $decoded = json_decode((string) $setting->value, true);
            $groups[$setting->group][$setting->key] = json_last_error() === JSON_ERROR_NONE
                ? $decoded
                : $setting->value;
        }

        $email = EmailSetting::query()->first();
        $sms = SmsProviderSetting::query()->first();

        return response()->json([
            'data' => $groups + [
                'email' => [
                    'smtp_host' => $email?->smtp_host ?? '',
                    'smtp_port' => $email?->smtp_port ?? 587,
                    'smtp_user' => $email?->smtp_user ?? '',
                    'smtp_password_enc' => filled($email?->smtp_password_encrypted) ? '********' : '',
                    'from_address' => $email?->from_address ?? '',
                    'from_name' => $email?->from_name ?? '',
                ],
                'sms' => [
                    'provider' => $sms?->provider ?? 'kavenegar',
                    'sender_line' => $sms?->sender_line ?? '',
                    'enabled' => $sms?->enabled ?? false,
                    'api_key_enc' => filled($sms?->api_key_encrypted) ? '********' : '',
                ],
            ],
        ]);
    }

    public function updateGeneral(Request $request): JsonResponse
    {
        $this->ensurePermission($request, 'settings.manage');
        $payload = $request->validate([
            'company' => ['sometimes', 'array'],
            'map' => ['sometimes', 'array'],
            'seo' => ['sometimes', 'array'],
            'site' => ['sometimes', 'array'],
            'seo.site_title' => ['sometimes', 'string', 'max:255'],
            'seo.site_title_en' => ['sometimes', 'nullable', 'string', 'max:255'],
            'seo.meta_description' => ['sometimes', 'string', 'max:500'],
            'seo.meta_description_en' => ['sometimes', 'nullable', 'string', 'max:500'],
            'seo.keywords' => ['sometimes', 'nullable', 'string', 'max:1000'],
            'seo.keywords_en' => ['sometimes', 'nullable', 'string', 'max:1000'],
            'seo.meta_image' => ['sometimes', 'nullable', 'string', 'max:500'],
            'seo.robots' => ['sometimes', Rule::in(['index,follow', 'noindex,follow', 'noindex,nofollow'])],
            'site.info_bar_enabled' => ['sometimes', 'boolean'],
            'site.info_bar_phone' => ['sometimes', 'nullable', 'string', 'max:40'],
            'email' => ['sometimes', 'array'],
            'email.smtp_host' => ['sometimes', 'string', 'max:255'],
            'email.smtp_port' => ['sometimes', 'integer', 'between:1,65535'],
            'email.smtp_user' => ['sometimes', 'nullable', 'string', 'max:255'],
            'email.smtp_password_plain' => ['sometimes', 'nullable', 'string', 'max:4096'],
            'email.from_address' => ['sometimes', 'nullable', 'email', 'max:255'],
            'email.from_name' => ['sometimes', 'nullable', 'string', 'max:255'],
            'sms' => ['sometimes', 'array'],
            'sms.provider' => ['sometimes', 'in:kavenegar,smsir,melipayamak'],
            'sms.sender_line' => ['sometimes', 'nullable', 'string', 'max:40'],
            'sms.enabled' => ['sometimes', 'boolean'],
            'sms.api_key_plain' => ['sometimes', 'nullable', 'string'],
        ]);

        foreach (Arr::only($payload, ['company', 'map', 'seo', 'site']) as $group => $entries) {
            foreach ($entries as $key => $value) {
                Setting::query()->updateOrCreate(
                    ['key' => $key],
                    [
                        'group' => $group,
                        'value' => is_bool($value)
                            ? ($value ? 'true' : 'false')
                            : (is_scalar($value) ? (string) $value : json_encode($value, JSON_THROW_ON_ERROR)),
                    ],
                );
            }
        }

        if (isset($payload['email'])) {
            $this->saveEmailSettings($payload['email']);
        }

        if (isset($payload['sms'])) {
            $this->saveSmsSettings($payload['sms']);
        }

        return response()->json(['ok' => true, 'message' => 'تنظیمات با موفقیت ذخیره شد.']);
    }

    public function updateEmail(Request $request): JsonResponse
    {
        $this->ensurePermission($request, 'settings.manage');
        $data = $request->validate([
            'smtp_host' => ['required', 'string', 'max:255'],
            'smtp_port' => ['required', 'integer', 'between:1,65535'],
            'smtp_user' => ['nullable', 'string', 'max:255'],
            'smtp_password' => ['nullable', 'string', 'max:4096'],
            'from_address' => ['required', 'email', 'max:255'],
            'from_name' => ['required', 'string', 'max:255'],
        ]);

        $this->saveEmailSettings([
            ...$data,
            'smtp_password_plain' => $data['smtp_password'] ?? null,
        ]);

        return response()->json(['message' => 'تنظیمات ایمیل با رمزنگاری AES ذخیره شد.']);
    }

    public function updateSms(Request $request): JsonResponse
    {
        $this->ensurePermission($request, 'settings.manage');
        $data = $request->validate([
            'provider' => ['required', 'in:kavenegar,smsir,melipayamak'],
            'api_key' => ['nullable', 'string'],
            'sender_line' => ['nullable', 'string'],
            'enabled' => ['required', 'boolean'],
        ]);

        $this->saveSmsSettings([
            ...$data,
            'api_key_plain' => $data['api_key'] ?? null,
        ]);

        return response()->json(['message' => 'تنظیمات پیامک با موفقیت ذخیره شد.']);
    }

    public function testSms(Request $request, SmsDispatcherService $sms): JsonResponse
    {
        $this->ensurePermission($request, 'settings.manage');
        $data = $request->validate(['phone' => ['required', 'string'], 'message' => ['required', 'string']]);

        return response()->json($sms->send($data['phone'], $data['message']));
    }

    public function testEmail(Request $request, SmtpEmailService $email): JsonResponse
    {
        $this->ensurePermission($request, 'settings.manage');
        $data = $request->validate(['to' => ['required', 'email', 'max:255']]);

        $email->send($data['to'], 'آزمون تنظیمات ایمیل پارس پولاد آقایی', 'این پیام برای بررسی اتصال SMTP ارسال شده است.');

        return response()->json(['message' => 'ایمیل آزمایشی با موفقیت ارسال شد.']);
    }

    private function ensurePermission(Request $request, string $permission): void
    {
        abort_unless($request->user()?->can($permission), 403);
    }

    private function saveEmailSettings(array $data): void
    {
        $setting = EmailSetting::query()->firstOrNew([]);
        $setting->fill([
            'smtp_host' => $data['smtp_host'] ?? $setting->smtp_host ?? '',
            'smtp_port' => $data['smtp_port'] ?? $setting->smtp_port ?? 587,
            'smtp_user' => $data['smtp_user'] ?? $setting->smtp_user,
            'from_address' => $data['from_address'] ?? $setting->from_address ?? '',
            'from_name' => $data['from_name'] ?? $setting->from_name ?? '',
        ]);
        if (! empty($data['smtp_password_plain'])) {
            $setting->smtp_password_encrypted = $data['smtp_password_plain'];
        }
        $setting->save();
    }

    private function saveSmsSettings(array $data): void
    {
        $setting = SmsProviderSetting::query()->firstOrNew([]);
        $setting->fill([
            'provider' => $data['provider'] ?? $setting->provider ?? 'kavenegar',
            'sender_line' => $data['sender_line'] ?? $setting->sender_line ?? '',
            'enabled' => $data['enabled'] ?? $setting->enabled ?? false,
        ]);
        if (! empty($data['api_key_plain'])) {
            $setting->api_key_encrypted = $data['api_key_plain'];
        }
        $setting->save();
    }
}
