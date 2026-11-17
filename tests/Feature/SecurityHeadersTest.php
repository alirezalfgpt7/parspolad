<?php

it('adds baseline security headers to application responses', function (): void {
    $this->get('/up')
        ->assertOk()
        ->assertHeader('X-Content-Type-Options', 'nosniff')
        ->assertHeader('X-Frame-Options', 'DENY')
        ->assertHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
});

it('can enforce HTTPS without affecting local development by default', function (): void {
    config(['app.force_https' => true]);

    $this->get('/up')
        ->assertStatus(308)
        ->assertRedirect('https://localhost:8000/up');
});

it('sends HSTS only on HTTPS responses', function (): void {
    $this->get('https://localhost/up')
        ->assertOk()
        ->assertHeader('Strict-Transport-Security', 'max-age=31536000');
});

it('recognizes HTTPS terminated by an explicitly trusted proxy', function (): void {
    config(['app.trusted_proxies' => ['127.0.0.1']]);

    $this->withServerVariables(['REMOTE_ADDR' => '127.0.0.1'])
        ->withHeader('X-Forwarded-Proto', 'https')
        ->get('/up')
        ->assertOk()
        ->assertHeader('Strict-Transport-Security', 'max-age=31536000');
});
