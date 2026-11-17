<?php

use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Services\CaptchaChallengeService;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class)->in('Feature');

function loginPayloadWithCaptcha(TestCase $test, array $credentials = []): array
{
    $captcha = app(CaptchaChallengeService::class)->issue('letters');
    $svg = base64_decode(substr($captcha['img'], strlen('data:image/svg+xml;base64,')), true);
    preg_match_all('/<text\b[^>]*>(.*?)<\/text>/s', (string) $svg, $matches);
    $answer = implode('', array_map(
        fn (string $text): string => html_entity_decode($text, ENT_QUOTES | ENT_XML1, 'UTF-8'),
        $matches[1] ?? [],
    ));

    return array_replace([
        'email' => env('SUPER_ADMIN_EMAIL', 'admin@parspooladaghaei.ir'),
        'password' => env('SUPER_ADMIN_PASSWORD', 'ParsPolad@1404'),
        'captcha_key' => $captcha['key'],
        'captcha' => $answer,
    ], $credentials);
}
