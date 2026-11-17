<?php

use Database\Seeders\DatabaseSeeder;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Schema;

it('migrates the database cache and safely seeds portal content more than once', function (): void {
    expect(Schema::hasTable('cache'))->toBeTrue()
        ->and(Schema::hasTable('cache_locks'))->toBeTrue()
        ->and(Schema::hasTable('sessions'))->toBeTrue()
        ->and(Schema::hasTable('jobs'))->toBeTrue()
        ->and(Schema::hasTable('failed_jobs'))->toBeTrue();

    config(['cache.default' => 'database']);
    app('cache')->forgetDriver('database');
    Cache::store('database')->put('seeder-cache-check', 'ready', 60);
    expect(Cache::store('database')->get('seeder-cache-check'))->toBe('ready');

    $this->seed(DatabaseSeeder::class);
    $this->seed(DatabaseSeeder::class);

    $this->assertDatabaseCount('project_categories', 4);
    $this->assertDatabaseCount('projects', 6);
    $this->assertDatabaseCount('partners', 10);
    $this->assertDatabaseCount('slides', 3);
    $this->assertDatabaseHas('projects', ['slug' => 'nisoc-wellhead-150-liner-hanger']);
    $this->assertDatabaseHas('project_documents', [
        'file_url' => '/storage/documents/qc-equipment-list.pdf',
        'requires_auth' => false,
    ]);
    $this->assertDatabaseHas('contracts', [
        'contract_number' => 'BA-PO-011-PPA-L00',
        'document_url' => '/storage/documents/downhole-completed-projects.pdf',
        'requires_auth' => false,
    ]);
    $this->assertDatabaseHas('media_files', [
        'url' => '/storage/documents/qc-equipment-list.pdf',
        'requires_auth' => false,
    ]);
});
