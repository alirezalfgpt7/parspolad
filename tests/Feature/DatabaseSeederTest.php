<?php

use App\Models\Contract;
use App\Models\MachineryAsset;
use App\Models\Page;
use App\Models\Product;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Database\Seeders\SourceCatalogSeeder;
use Database\Seeders\SourceDocumentsSeeder;
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
    $this->assertDatabaseCount('products', 37);
    $this->assertDatabaseCount('contracts', 140);
    $this->assertDatabaseCount('machinery_assets', 40);
    $this->assertDatabaseCount('partners', 10);
    $this->assertDatabaseCount('slides', 3);
    $this->assertDatabaseHas('projects', ['slug' => 'nisoc-wellhead-150-liner-hanger']);
    $this->assertDatabaseHas('products', ['slug' => 'ppa-lh001', 'model_code' => 'PPA/LH001']);
    $this->assertDatabaseHas('products', ['slug' => 'ppa-p003', 'model_code' => 'PPA/P003']);
    $this->assertDatabaseHas('contracts', ['contract_number' => '792667', 'start_year' => 1400]);
    $this->assertDatabaseHas('contracts', ['contract_number' => '9831082', 'start_year' => 1398]);
    $this->assertDatabaseHas('contracts', ['contract_number' => '0305014', 'start_year' => null]);
    $this->assertDatabaseHas('contracts', ['contract_number' => 'PECO-03-PO-SJ-464']);
    $this->assertDatabaseHas('project_documents', [
        'file_url' => '/storage/documents/qc-equipment-list.pdf',
        'requires_auth' => false,
    ]);
    $this->assertDatabaseHas('contracts', [
        'contract_number' => 'BA-PO-011-PPA-L00',
        'document_url' => '/storage/documents/downhole-completed-projects.pdf',
        'requires_auth' => false,
    ]);
    $this->assertDatabaseHas('machinery_assets', [
        'source_key' => 'site-machinery-01',
        'asset_code' => 'PPA-R-1',
        'serial_number' => '9945',
    ]);
    $this->assertDatabaseHas('machinery_assets', [
        'source_key' => 'site-machinery-36',
        'asset_code' => null,
        'serial_number' => null,
    ]);
    $aboutContent = Page::query()->where('slug', 'about')->value('content_fa');
    $this->assertStringContainsString('اهداف کیفی ثبت‌شده در سند سال ۱۴۰۰', $aboutContent);
    $this->assertDatabaseHas('media_files', [
        'url' => '/storage/documents/qc-equipment-list.pdf',
        'requires_auth' => false,
    ]);
});

it('does not overwrite existing records when adding source catalog data', function (): void {
    $this->seed(DatabaseSeeder::class);

    Product::query()->where('slug', 'ppa-lh001')->update(['name_fa' => 'عنوان ویرایش‌شده']);
    Contract::query()->where('contract_number', '792667')->update(['title_fa' => 'عنوان قرارداد ویرایش‌شده']);

    $this->seed(SourceCatalogSeeder::class);

    $this->assertDatabaseHas('products', [
        'slug' => 'ppa-lh001',
        'name_fa' => 'عنوان ویرایش‌شده',
    ]);
    $this->assertDatabaseHas('contracts', [
        'contract_number' => '792667',
        'title_fa' => 'عنوان قرارداد ویرایش‌شده',
    ]);
});

it('keeps optional machinery records editable without requiring source-missing fields', function (): void {
    $this->seed(DatabaseSeeder::class);
    $admin = User::query()->firstOrFail();

    $this->actingAs($admin, 'sanctum')
        ->getJson('/api/v1/admin/content-schema/machinery')
        ->assertOk()
        ->assertJsonFragment(['name' => 'serial_number', 'required' => false])
        ->assertJsonFragment(['name' => 'asset_code', 'required' => false]);

    $this->actingAs($admin, 'sanctum')
        ->postJson('/api/v1/admin/machinery', [])
        ->assertCreated();

    $this->getJson('/api/v1/machinery')
        ->assertOk()
        ->assertJsonCount(40, 'data')
        ->assertJsonFragment(['asset_code' => 'PPA-R-1', 'serial_number' => '9945']);

    MachineryAsset::query()->where('source_key', 'site-machinery-01')->update(['serial_number' => 'MANUALLY-UPDATED']);
    $this->seed(SourceDocumentsSeeder::class);

    $this->assertDatabaseHas('machinery_assets', [
        'source_key' => 'site-machinery-01',
        'serial_number' => 'MANUALLY-UPDATED',
    ]);
});

it('allows contract records to keep an unknown start year blank', function (): void {
    $this->seed(DatabaseSeeder::class);
    $admin = User::query()->firstOrFail();

    $this->actingAs($admin, 'sanctum')
        ->postJson('/api/v1/admin/contracts', [
            'contract_number' => 'SOURCE-YEAR-UNKNOWN',
            'title_fa' => 'قرارداد با سال نامشخص',
            'title_en' => 'Contract with Unknown Year',
            'client_fa' => 'کارفرمای منبع',
            'client_en' => 'Source Client',
            'amount_billion_irr' => 0,
            'start_year' => null,
            'status' => 'archived',
        ])
        ->assertCreated();

    $this->assertDatabaseHas('contracts', [
        'contract_number' => 'SOURCE-YEAR-UNKNOWN',
        'start_year' => null,
    ]);
});
