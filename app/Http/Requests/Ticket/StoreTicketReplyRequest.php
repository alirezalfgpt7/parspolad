<?php

namespace App\Http\Requests\Ticket;

use Illuminate\Foundation\Http\FormRequest;

class StoreTicketReplyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email' => ['required', 'email', 'max:160'],
            'phone' => ['required', 'string', 'max:30'],
            'message' => ['required', 'string', 'min:5', 'max:5000'],
            'captcha_key' => ['required', 'string', 'max:512'],
            'captcha' => ['required', 'string', 'max:20', 'captcha_api:'.$this->input('captcha_key').',public'],
            'website' => ['prohibited'],
        ];
    }
}
