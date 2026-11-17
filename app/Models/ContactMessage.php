<?php

namespace App\Models;

use App\Enums\ContactMessageStatusEnum;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
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
        'tracking_number',
        'ticket_status',
        'priority',
        'assignee_id',
    ];

    public function ticketMessages(): HasMany
    {
        return $this->hasMany(TicketMessage::class)->orderBy('created_at');
    }

    public function ticketHistory(): HasMany
    {
        return $this->hasMany(TicketHistory::class)->latest();
    }

    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assignee_id');
    }
}
