<?php

use Database\Seeders\DatabaseSeeder;

beforeEach(fn () => $this->seed(DatabaseSeeder::class));

it('validates slide duration and media updates without clearing existing slides', function (): void {
    $token = $this->postJson('/api/v1/auth/login', loginPayloadWithCaptcha($this))
        ->assertOk()
        ->json('token');

    $slider = $this->withToken($token)->getJson('/api/v1/admin/sliders')
        ->assertOk()
        ->json('data.0');
    $slides = $slider['slides'];
    $existingCount = count($slides);

    $invalidSlides = $slides;
    $invalidSlides[0]['duration_ms'] = 2000;

    $this->withToken($token)->putJson("/api/v1/admin/sliders/{$slider['id']}/slides", [
        'slides' => $invalidSlides,
    ])->assertUnprocessable()
        ->assertJsonValidationErrors('slides.0.duration_ms');

    $slides[0]['mobile_media'] = '/storage/hero/mobile-only.jpg';
    $saved = $this->withToken($token)->putJson("/api/v1/admin/sliders/{$slider['id']}/slides", [
        'slides' => $slides,
    ])->assertOk()
        ->assertJsonPath('data.slides.0.mobile_media', '/storage/hero/mobile-only.jpg')
        ->json('data.slides');

    expect(count($saved))->toBe($existingCount);
});
