<?php

use Database\Seeders\DatabaseSeeder;

beforeEach(fn () => $this->seed(DatabaseSeeder::class));

it('aggregates public page views by day and month without tracking visitor identifiers', function (): void {
    $this->postJson('/api/v1/page-views', ['path' => '/contact'])->assertAccepted();
    $this->postJson('/api/v1/page-views', ['path' => '/contact'])->assertAccepted();
    $this->postJson('/api/v1/page-views', ['path' => '/news'])->assertAccepted();

    $token = $this->postJson('/api/v1/auth/login', loginPayloadWithCaptcha($this))
        ->assertOk()->json('token');
    $date = today()->toDateString();

    $this->withToken($token)->getJson("/api/v1/admin/analytics?from={$date}&to={$date}")
        ->assertOk()
        ->assertJsonPath('range.total', 3)
        ->assertJsonPath('range.daily.0.date', $date)
        ->assertJsonPath('daily.0.views', 3)
        ->assertJsonPath('monthly.0.views', 3);

    $this->withToken($token)->getJson("/api/v1/admin/analytics?from={$date}")
        ->assertUnprocessable()
        ->assertJsonValidationErrors('to');
});

it('rejects absolute or invalid page paths from the public analytics endpoint', function (): void {
    $this->postJson('/api/v1/page-views', ['path' => '//example.test/contact'])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('path');
});
