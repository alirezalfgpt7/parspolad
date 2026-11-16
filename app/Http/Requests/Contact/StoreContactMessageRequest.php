<?php

namespace App\Http\Requests\Contact;

use Illuminate\Foundation\Http\FormRequest;

class StoreContactMessageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:160'],
            'phone' => ['required', 'string', 'max:30'],
            'company' => ['nullable', 'string', 'max:160'],
            'subject' => ['required', 'string', 'max:255'],
            'message' => ['required', 'string', 'min:5'],
            'type' => ['required', 'in:contact,rfq,ticket'],
            'attachment_url' => ['nullable', 'string', 'max:255'],
            'website' => ['prohibited'],
            'captcha_key' => ['required', 'string', 'max:512'],
            'captcha' => ['required', 'string', 'max:20', 'captcha_api:'.$this->input('captcha_key').',public'],
        ];
    }
}
