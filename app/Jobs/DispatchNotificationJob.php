<?php

namespace App\Jobs;

use App\Enums\NotificationChannelEnum;
use App\Models\Notification;
use App\Models\User;
use App\Services\SmtpEmailService;
use App\Services\SmsDispatcherService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class DispatchNotificationJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public readonly ?int $userId,
        public readonly string $titleFa,
        public readonly string $titleEn,
        public readonly string $bodyFa,
        public readonly string $bodyEn,
        public readonly NotificationChannelEnum $channel,
    ) {}

    public function handle(SmsDispatcherService $sms, SmtpEmailService $email): void
    {
        Notification::query()->create([
            'user_id' => $this->userId,
            'title_fa' => $this->titleFa,
            'title_en' => $this->titleEn,
            'body_fa' => $this->bodyFa,
            'body_en' => $this->bodyEn,
            'channel' => $this->channel,
            'is_read' => false,
        ]);

        if (!$this->userId) {
            return;
        }
        $user = User::query()->find($this->userId);
        if (!$user) {
            return;
        }

        if ($this->channel === NotificationChannelEnum::SMS && $user->phone) {
            $sms->send($user->phone, "{$this->titleFa}\n{$this->bodyFa}");
        }

        if ($this->channel === NotificationChannelEnum::EMAIL && $user->email) {
            $email->send($user->email, 'اطلاعیه سامانه پارس پولاد آقایی', $this->bodyFa);
        }
    }
}
