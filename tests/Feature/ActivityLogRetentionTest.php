<?php

use App\Models\Setting;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Spatie\Activitylog\Models\Activity;

beforeEach(fn () => $this->seed(DatabaseSeeder::class));

it('prunes activity logs using the configured retention period', function (): void {
    $login = $this->postJson('/api/v1/auth/login', loginPayloadWithCaptcha($this));
    $login->assertOk();
    $token = $login->json('token');

    $this->withToken($token)
        ->putJson('/api/v1/admin/settings', [
            'logs' => ['activity_logs_retention_months' => 3],
        ])
        ->assertOk();

    $expired = Activity::query()->create([
        'description' => 'expired test event',
        'created_at' => now()->subMonths(4),
        'updated_at' => now()->subMonths(4),
    ]);
    $recent = Activity::query()->create([
        'description' => 'recent test event',
    ]);

    $this->withToken($token)
        ->postJson('/api/v1/admin/activity-logs/prune')
        ->assertOk()
        ->assertJsonPath('deleted', 1)
        ->assertJsonPath('retention_months', 3);

    expect(Activity::query()->find($expired->id))->toBeNull()
        ->and(Activity::query()->find($recent->id))->not->toBeNull();
});

it('does not allow non-super-admins to reset activity logs', function (): void {
    $editor = User::factory()->create();
    $editor->assignRole('editor');
    $token = $editor->createToken('activity-log-retention-test')->plainTextToken;

    $this->withToken($token)
        ->deleteJson('/api/v1/admin/activity-logs')
        ->assertForbidden();
});

it('rejects unsupported activity log retention periods', function (): void {
    $login = $this->postJson('/api/v1/auth/login', loginPayloadWithCaptcha($this));
    $login->assertOk();

    $this->withToken($login->json('token'))
        ->putJson('/api/v1/admin/settings', [
            'logs' => ['activity_logs_retention_months' => 2],
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('logs.activity_logs_retention_months');

    expect(Setting::query()
        ->where('group', 'logs')
        ->where('key', 'activity_logs_retention_months')
        ->exists())->toBeFalse();
});
