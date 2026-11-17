<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use InvalidArgumentException;

class CaptchaChallengeService
{
    private const LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ';

    /**
     * @return array{key: string, img: string}
     */
    public function issue(string $kind = 'random'): array
    {
        if ($kind === 'random') {
            $kind = ['addition', 'subtraction', 'letters'][random_int(0, 2)];
        }

        [$prompt, $answer] = match ($kind) {
            'addition' => $this->addition(),
            'subtraction' => $this->subtraction(),
            'letters' => $this->letters(),
            default => throw new InvalidArgumentException('Unsupported CAPTCHA challenge type.'),
        };

        $key = Str::random(48);
        Cache::put(
            $this->cacheKey($key),
            $this->answerHash($answer),
            now()->addMinutes(2),
        );

        $svg = $this->renderSvg($prompt, $kind === 'letters');

        return [
            'key' => $key,
            'img' => 'data:image/svg+xml;base64,'.base64_encode($svg),
        ];
    }

    public function consume(?string $key, mixed $answer): bool
    {
        if (! is_string($key)
            || ! preg_match('/\A[A-Za-z0-9]{48}\z/', $key)
            || ! is_string($answer)
            || strlen($answer) > 20) {
            return false;
        }

        $expectedHash = Cache::pull($this->cacheKey($key));
        if (! is_string($expectedHash)) {
            return false;
        }

        $normalizedAnswer = strtr(strtolower(trim($answer)), [
            '۰' => '0', '۱' => '1', '۲' => '2', '۳' => '3', '۴' => '4',
            '۵' => '5', '۶' => '6', '۷' => '7', '۸' => '8', '۹' => '9',
            '٠' => '0', '١' => '1', '٢' => '2', '٣' => '3', '٤' => '4',
            '٥' => '5', '٦' => '6', '٧' => '7', '٨' => '8', '٩' => '9',
        ]);

        return hash_equals($expectedHash, $this->answerHash($normalizedAnswer));
    }

    /**
     * @return array{string, string}
     */
    private function addition(): array
    {
        $left = random_int(2, 19);
        $right = random_int(1, 9);

        return ["{$left} + {$right} = ?", (string) ($left + $right)];
    }

    /**
     * @return array{string, string}
     */
    private function subtraction(): array
    {
        $left = random_int(10, 30);
        $right = random_int(1, min(9, $left - 1));

        return ["{$left} - {$right} = ?", (string) ($left - $right)];
    }

    /**
     * @return array{string, string}
     */
    private function letters(): array
    {
        $answer = '';
        for ($index = 0; $index < 5; $index++) {
            $answer .= self::LETTERS[random_int(0, strlen(self::LETTERS) - 1)];
        }

        return [$answer, strtolower($answer)];
    }

    private function renderSvg(string $prompt, bool $individualLetters): string
    {
        $noise = '';
        for ($index = 0; $index < 6; $index++) {
            $x1 = random_int(0, 224);
            $y1 = random_int(0, 56);
            $x2 = random_int(0, 224);
            $y2 = random_int(0, 56);
            $noise .= "<path d=\"M{$x1} {$y1} L{$x2} {$y2}\"/>";
        }

        $text = htmlspecialchars($prompt, ENT_QUOTES | ENT_XML1, 'UTF-8');
        if ($individualLetters) {
            $letters = '';
            foreach (str_split($prompt) as $index => $letter) {
                $x = 42 + ($index * 35);
                $rotation = random_int(-12, 12);
                $safeLetter = htmlspecialchars($letter, ENT_QUOTES | ENT_XML1, 'UTF-8');
                $letters .= "<text x=\"{$x}\" y=\"36\" transform=\"rotate({$rotation} {$x} 28)\">{$safeLetter}</text>";
            }
            $textMarkup = $letters;
        } else {
            $textMarkup = "<text x=\"112\" y=\"36\" text-anchor=\"middle\" textLength=\"190\" lengthAdjust=\"spacingAndGlyphs\">{$text}</text>";
        }

        return <<<SVG
<svg xmlns="http://www.w3.org/2000/svg" width="224" height="56" viewBox="0 0 224 56">
  <rect width="224" height="56" rx="12" fill="#f1f5f9"/>
  <g fill="none" stroke="#64748b" stroke-opacity=".22" stroke-width="1">{$noise}</g>
  <g fill="#172554" font-family="Arial, sans-serif" font-size="21" font-weight="700">{$textMarkup}</g>
  <circle cx="15" cy="12" r="2" fill="#b91c1c" fill-opacity=".4"/>
  <circle cx="208" cy="44" r="2" fill="#b91c1c" fill-opacity=".4"/>
</svg>
SVG;
    }

    private function cacheKey(string $key): string
    {
        return 'captcha_mixed_'.hash('sha256', $key);
    }

    private function answerHash(string $answer): string
    {
        return hash_hmac('sha256', strtolower($answer), (string) config('app.key'));
    }
}
