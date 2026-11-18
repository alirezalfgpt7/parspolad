<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreArticleCommentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'author_name' => ['required', 'string', 'max:120'],
            'body' => ['required', 'string', 'min:10', 'max:2000'],
            'parent_id' => ['nullable', 'integer'],
            'website' => ['prohibited'],
            'captcha_key' => ['required', 'string', 'max:512'],
            'captcha' => ['required', 'string', 'max:20', 'captcha_api:'.$this->input('captcha_key').',public'],
        ];
    }
}
