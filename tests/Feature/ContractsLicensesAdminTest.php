<?php

use App\Models\Contract;
use App\Models\License;
use Database\Seeders\DatabaseSeeder;

beforeEach(fn () => $this->seed(DatabaseSeeder::class));

it('searches and paginates lean contract rows while loading full details on demand', function (): void {
    $token = $this->postJson('/api/v1/auth/login', loginPayloadWithCaptcha($this))
        ->assertOk()->json('token');
    $contract = Contract::query()->firstOrFail();

    $this->withToken($token)
        ->getJson('/api/v1/admin/contracts?q='.urlencode($contract->contract_number).'&per_page=1')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.id', $contract->id)
        ->assertJsonPath('meta.per_page', 1)
        ->assertJsonMissingPath('data.0.scope_fa');

    $this->withToken($token)
        ->getJson('/api/v1/admin/contracts/'.$contract->id)
        ->assertOk()
        ->assertJsonPath('data.id', $contract->id)
        ->assertJsonStructure(['data' => ['title_en', 'client_en', 'scope_fa', 'document_url']]);
});

it('searches and paginates lean license rows while loading full details on demand', function (): void {
    $token = $this->postJson('/api/v1/auth/login', loginPayloadWithCaptcha($this))
        ->assertOk()->json('token');
    $license = License::query()->firstOrFail();

    $this->withToken($token)
        ->getJson('/api/v1/admin/licenses?q='.urlencode($license->code).'&per_page=1')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.id', $license->id)
        ->assertJsonPath('meta.per_page', 1)
        ->assertJsonMissingPath('data.0.image_url')
        ->assertJsonMissingPath('data.0.document_url');

    $this->withToken($token)
        ->getJson('/api/v1/admin/licenses/'.$license->id)
        ->assertOk()
        ->assertJsonPath('data.id', $license->id)
        ->assertJsonStructure(['data' => ['title_en', 'issuer_en', 'image_url', 'document_url']]);
});
