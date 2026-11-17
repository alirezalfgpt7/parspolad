<?php

namespace App\Http\Requests\Auth;

use App\Rules\CaptchaAnswer;
use Illuminate\Foundation\Http\FormRequest;

class LoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email' => ['required', 'email'],
            'password' => ['required', 'string', 'min:6'],
            'two_factor_code' => ['nullable', 'string', 'size:6'],
            'website' => ['prohibited'],
            'captcha_key' => ['required', 'string', 'max:80'],
            'captcha' => ['bail', 'required', 'string', 'max:20', new CaptchaAnswer($this->input('captcha_key'))],
        ];
    }
}
