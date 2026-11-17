<?php

namespace App\Services;

use App\Models\EmailSetting;
use Illuminate\Support\Facades\Mail;

class SmtpEmailService
{
    public function send(string $recipient, string $subject, string $body): void
    {
        $setting = EmailSetting::query()->first();

        abort_unless(
            $setting
                && filled($setting->smtp_host)
                && filled($setting->from_address)
                && filled($setting->from_name),
            422,
            'تنظیمات SMTP و فرستنده ایمیل کامل نشده است.',
        );

        Mail::build([
            'transport' => 'smtp',
            'host' => $setting->smtp_host,
            'port' => $setting->smtp_port,
            'username' => filled($setting->smtp_user) ? $setting->smtp_user : null,
            'password' => $setting->smtp_password_encrypted,
            'scheme' => $setting->smtp_port === 465 ? 'smtps' : 'smtp',
            'timeout' => 15,
        ])->raw($body, static function ($message) use ($recipient, $subject, $setting): void {
            $message->from($setting->from_address, $setting->from_name)
                ->to($recipient)
                ->subject($subject);
        });
    }
}
