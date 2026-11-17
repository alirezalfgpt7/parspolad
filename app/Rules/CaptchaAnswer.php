<?php

namespace App\Rules;

use App\Services\CaptchaChallengeService;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class CaptchaAnswer implements ValidationRule
{
    public function __construct(private readonly ?string $key)
    {
    }

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! app(CaptchaChallengeService::class)->consume($this->key, $value)) {
            $fail('کد امنیتی واردشده معتبر نیست یا زمان آن به پایان رسیده است.');
        }
    }
}
