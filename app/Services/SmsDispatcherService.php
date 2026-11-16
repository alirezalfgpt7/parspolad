<?php

namespace App\Services;

use App\Enums\SmsProviderEnum;
use App\Models\SmsProviderSetting;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SmsDispatcherService
{
    public function send(string $receptor, string $message): array
    {
        $settings = SmsProviderSetting::query()->first();

        if (!$settings || !$settings->enabled || empty($settings->api_key_encrypted)) {
            Log::info('SMS dispatch skipped: provider disabled or key unset', ['receptor' => $receptor]);
            return ['sent' => false, 'reason' => 'provider_disabled'];
        }

        $apiKey = $settings->api_key_encrypted;
        $provider = $settings->provider ?? SmsProviderEnum::KAVENEGAR;

        return match ($provider) {
            SmsProviderEnum::KAVENEGAR => $this->dispatchKavenegar($apiKey, $settings->sender_line ?? '', $receptor, $message),
            SmsProviderEnum::SMSIR => $this->dispatchSmsIr($apiKey, $settings->sender_line ?? '', $receptor, $message),
            SmsProviderEnum::MELIPAYAMAK => $this->dispatchMelipayamak($apiKey, $settings->sender_line ?? '', $receptor, $message),
        };
    }

    private function dispatchKavenegar(string $apiKey, string $sender, string $receptor, string $message): array
    {
        $response = Http::timeout(10)->asForm()->post(
            "https://api.kavenegar.com/v1/{$apiKey}/sms/send.json",
            ['receptor' => $receptor, 'sender' => $sender, 'message' => $message]
        );
        return ['sent' => $response->successful(), 'provider' => 'kavenegar', 'status' => $response->status()];
    }

    private function dispatchSmsIr(string $apiKey, string $sender, string $receptor, string $message): array
    {
        $response = Http::timeout(10)->withHeaders(['x-api-key' => $apiKey])->post(
            'https://api.sms.ir/v1/send/likeToLike',
            ['lineNumber' => $sender, 'messageTexts' => [$message], 'mobiles' => [$receptor]]
        );
        return ['sent' => $response->successful(), 'provider' => 'smsir', 'status' => $response->status()];
    }

    private function dispatchMelipayamak(string $apiKey, string $sender, string $receptor, string $message): array
    {
        $response = Http::timeout(10)->post("https://console.melipayamak.com/api/send/simple/{$apiKey}", [
            'from' => $sender,
            'to' => $receptor,
            'text' => $message,
        ]);
        return ['sent' => $response->successful(), 'provider' => 'melipayamak', 'status' => $response->status()];
    }
}
