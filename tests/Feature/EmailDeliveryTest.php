<?php

use App\Models\EmailSetting;
use App\Models\User;
use App\Enums\NotificationChannelEnum;
use App\Jobs\DispatchNotificationJob;
use App\Services\SmtpEmailService;
use App\Services\SmsDispatcherService;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Mail\Mailer;
use Illuminate\Mail\Message;
use Illuminate\Support\Facades\Mail;
use Mockery;

it('sends using the encrypted SMTP settings and configured sender', function (): void {
    EmailSetting::query()->create([
        'smtp_host' => 'smtp.example.test',
        'smtp_port' => 587,
        'smtp_user' => 'mailer@example.test',
        'smtp_password_encrypted' => 'smtp-secret',
        'from_address' => 'no-reply@example.test',
        'from_name' => 'Pars Polad',
    ]);

    $mailer = Mockery::mock(Mailer::class);
    $message = Mockery::mock(Message::class);
    $message->shouldReceive('from')->once()->with('no-reply@example.test', 'Pars Polad')->andReturnSelf();
    $message->shouldReceive('to')->once()->with('recipient@example.test')->andReturnSelf();
    $message->shouldReceive('subject')->once()->with('Test subject')->andReturnSelf();
    $mailer->shouldReceive('raw')
        ->once()
        ->with('Test body', Mockery::on(function (Closure $callback) use ($message): bool {
            $callback($message);

            return true;
        }));

    Mail::shouldReceive('build')
        ->once()
        ->with(Mockery::on(fn (array $config): bool =>
            $config['transport'] === 'smtp'
                && $config['host'] === 'smtp.example.test'
                && $config['port'] === 587
                && $config['username'] === 'mailer@example.test'
                && $config['password'] === 'smtp-secret'
                && $config['scheme'] === 'smtp'
        ))
        ->andReturn($mailer);

    app(SmtpEmailService::class)->send('recipient@example.test', 'Test subject', 'Test body');
});

it('does not send when SMTP settings are incomplete', function (): void {
    Mail::shouldReceive('build')->never();

    expect(fn () => app(SmtpEmailService::class)->send('recipient@example.test', 'Test', 'Body'))
        ->toThrow(Symfony\Component\HttpKernel\Exception\HttpException::class);
});

it('routes email notifications through the configured SMTP service', function (): void {
    $user = User::factory()->create(['email' => 'recipient@example.test']);
    $email = Mockery::mock(SmtpEmailService::class);
    $email->shouldReceive('send')
        ->once()
        ->with('recipient@example.test', 'اطلاعیه سامانه پارس پولاد آقایی', 'Notification body');

    (new DispatchNotificationJob(
        $user->id,
        'عنوان',
        'Title',
        'Notification body',
        'Notification body',
        NotificationChannelEnum::EMAIL,
    ))->handle(app(SmsDispatcherService::class), $email);
});

it('allows a settings manager to send a validated SMTP test email', function (): void {
    $this->seed(DatabaseSeeder::class);
    $admin = User::role('super_admin')->firstOrFail();
    $email = Mockery::mock(SmtpEmailService::class);
    $email->shouldReceive('send')
        ->once()
        ->with('recipient@example.test', 'آزمون تنظیمات ایمیل پارس پولاد آقایی', 'این پیام برای بررسی اتصال SMTP ارسال شده است.');
    $this->app->instance(SmtpEmailService::class, $email);

    $this->actingAs($admin, 'sanctum')
        ->postJson('/api/v1/admin/settings/email/test', ['to' => 'recipient@example.test'])
        ->assertOk()
        ->assertJsonPath('message', 'ایمیل آزمایشی با موفقیت ارسال شد.');
});
