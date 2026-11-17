<?php

use App\Services\CaptchaChallengeService;
use App\Models\Setting;

function captchaPrompt(array $challenge): string
{
    $svg = base64_decode(substr($challenge['img'], strlen('data:image/svg+xml;base64,')), true);
    preg_match_all('/<text\b[^>]*>(.*?)<\/text>/s', (string) $svg, $matches);

    return implode('', array_map(
        fn (string $text): string => html_entity_decode($text, ENT_QUOTES | ENT_XML1, 'UTF-8'),
        $matches[1] ?? [],
    ));
}

it('issues addition, subtraction, and letter challenges that are single use', function (): void {
    $service = app(CaptchaChallengeService::class);

    foreach (['addition', 'subtraction', 'letters'] as $kind) {
        $challenge = $service->issue($kind);
        $prompt = captchaPrompt($challenge);

        expect(array_keys($challenge))->toBe(['key', 'img']);
        expect($challenge['img'])->toStartWith('data:image/svg+xml;base64,');

        if ($kind === 'addition') {
            preg_match('/^(\d+) \+ (\d+) = \?$/', $prompt, $operands);
            $answer = (string) ((int) $operands[1] + (int) $operands[2]);
        } elseif ($kind === 'subtraction') {
            preg_match('/^(\d+) - (\d+) = \?$/', $prompt, $operands);
            expect((int) $operands[1])->toBeGreaterThan((int) $operands[2]);
            $answer = (string) ((int) $operands[1] - (int) $operands[2]);
        } else {
            expect($prompt)->toMatch('/^[A-HJ-NP-Z]{5}$/');
            $answer = $prompt;
        }

        expect($service->consume($challenge['key'], $answer))->toBeTrue()
            ->and($service->consume($challenge['key'], $answer))->toBeFalse();
    }
});

it('serves mixed captcha images without caching the response', function (): void {
    $this->getJson('/api/v1/captcha/challenge')
        ->assertOk()
        ->assertHeader('Cache-Control', 'no-store, private')
        ->assertJsonStructure(['key', 'img'])
        ->assertJsonMissingPath('answer');
});

it('keeps the login captcha available during maintenance mode', function (): void {
    Setting::query()->updateOrCreate(
        ['key' => 'maintenance_mode'],
        ['group' => 'site', 'value' => 'true'],
    );

    $this->getJson('/api/v1/captcha/challenge')
        ->assertOk()
        ->assertJsonStructure(['key', 'img']);
});
