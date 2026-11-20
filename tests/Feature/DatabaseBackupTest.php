<?php

use App\Models\Service;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;

beforeEach(fn () => $this->seed(DatabaseSeeder::class));

it('exports all or selected application tables in a versioned JSON backup', function (): void {
    $token = $this->postJson('/api/v1/auth/login', loginPayloadWithCaptcha($this))
        ->assertOk()->json('token');

    $this->withToken($token)
        ->getJson('/api/v1/admin/backup/tables')
        ->assertOk()
        ->assertJsonFragment(['name' => 'services', 'label_fa' => 'خدمات']);

    $response = $this->withToken($token)
        ->get('/api/v1/admin/backup?tables%5B%5D=services')
        ->assertOk();
    $backup = json_decode($response->streamedContent(), true, 512, JSON_THROW_ON_ERROR);

    expect($backup['format'])->toBe('parspolad.database-backup')
        ->and($backup['scope'])->toBe('selected')
        ->and(array_keys($backup['tables']))->toBe(['services']);

    $fullResponse = $this->withToken($token)->get('/api/v1/admin/backup')->assertOk();
    $fullBackup = json_decode($fullResponse->streamedContent(), true, 512, JSON_THROW_ON_ERROR);

    expect($fullBackup['scope'])->toBe('complete')
        ->and(isset($fullBackup['tables']['users']))->toBeTrue()
        ->and(isset($fullBackup['tables']['permissions']))->toBeTrue()
        ->and(isset($fullBackup['tables']['personal_access_tokens']))->toBeFalse();
});

it('replaces selected tables from a valid backup and invalidates login tokens', function (): void {
    $token = $this->postJson('/api/v1/auth/login', loginPayloadWithCaptcha($this))
        ->assertOk()->json('token');

    Service::query()->create([
        'slug' => 'old-service',
        'title_fa' => 'خدمت قدیمی',
        'title_en' => 'Old service',
        'summary_fa' => 'خلاصه',
        'image_url' => '/old.png',
    ]);

    $now = now()->toDateTimeString();
    $backup = [
        'format' => 'parspolad.database-backup',
        'version' => 1,
        'created_at' => now()->toIso8601String(),
        'tables' => [
            'services' => [[
                'id' => 9876,
                'slug' => 'restored-service',
                'title_fa' => 'خدمت بازیابی‌شده',
                'title_en' => 'Restored service',
                'summary_fa' => 'خلاصه',
                'summary_en' => null,
                'description_fa' => null,
                'description_en' => null,
                'icon' => 'Settings',
                'image_url' => '/restored.png',
                'sort_order' => 1,
                'created_at' => $now,
                'updated_at' => $now,
                'deleted_at' => null,
            ]],
        ],
    ];

    $this->withToken($token)
        ->post('/api/v1/admin/backup/inspect', [
            'file' => UploadedFile::fake()->createWithContent('backup.json', json_encode($backup, JSON_THROW_ON_ERROR)),
        ])
        ->assertOk()
        ->assertJsonPath('data.complete', false)
        ->assertJsonPath('data.tables.0.restorable', true);

    $this->withToken($token)
        ->post('/api/v1/admin/restore', [
            'file' => UploadedFile::fake()->createWithContent('backup.json', json_encode($backup, JSON_THROW_ON_ERROR)),
            'tables' => ['services'],
        ])
        ->assertOk()
        ->assertJsonPath('requires_relogin', true)
        ->assertJsonPath('restored_tables.0.name', 'services');

    expect(Service::query()->where('slug', 'old-service')->exists())->toBeFalse()
        ->and(Service::query()->where('slug', 'restored-service')->exists())->toBeTrue()
        ->and(DB::table('personal_access_tokens')->count())->toBe(0);
});

it('denies backup access to non-super-admins', function (): void {
    $editor = User::factory()->create();
    $editor->assignRole('editor');
    $token = $editor->createToken('database-backup-test')->plainTextToken;

    $this->withToken($token)
        ->getJson('/api/v1/admin/backup/tables')
        ->assertForbidden();
});

it('rejects invalid restore files', function (): void {
    $adminToken = $this->postJson('/api/v1/auth/login', loginPayloadWithCaptcha($this))
        ->assertOk()->json('token');

    $this->withToken($adminToken)
        ->withHeaders(['Accept' => 'application/json'])
        ->post('/api/v1/admin/backup/inspect', [
            'file' => UploadedFile::fake()->createWithContent('backup.json', '{"not":"a backup"}'),
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('file');
});
