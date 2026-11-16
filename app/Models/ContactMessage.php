<?php

namespace App\Models;

use App\Enums\ContactMessageStatusEnum;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ContactMessage extends Model
{
    use SoftDeletes;

    protected function casts(): array
    {
        return ['status' => ContactMessageStatusEnum::class];
    }

    protected $fillable = [
        'name',
        'email',
        'phone',
        'company',
        'subject',
        'message',
        'type',
        'attachment_url',
        'status',
        'admin_note',
    ];
}
