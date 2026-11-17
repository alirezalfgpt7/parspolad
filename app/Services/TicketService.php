<?php

namespace App\Services;

use App\Models\ContactMessage;
use App\Models\TicketHistory;
use App\Models\TicketMessage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class TicketService
{
    public function open(array $data): ContactMessage
    {
        return DB::transaction(function () use ($data): ContactMessage {
            do {
                $trackingNumber = 'PPA-'.strtoupper(Str::random(8));
            } while (ContactMessage::query()->where('tracking_number', $trackingNumber)->exists());

            $ticket = ContactMessage::query()->create($data + [
                'tracking_number' => $trackingNumber,
                'ticket_status' => 'open',
                'priority' => 'normal',
            ]);
            $ticket->ticketMessages()->create([
                'author_name' => $ticket->name,
                'author_type' => 'customer',
                'body' => $ticket->message,
            ]);
            $ticket->ticketHistory()->create([
                'action' => 'opened',
                'new_value' => ['status' => 'open', 'priority' => 'normal'],
            ]);

            return $ticket->load('ticketMessages');
        });
    }

    public function reply(ContactMessage $ticket, string $body, string $authorName, ?int $userId, bool $isInternal = false): TicketMessage
    {
        return DB::transaction(function () use ($ticket, $body, $authorName, $userId, $isInternal): TicketMessage {
            $message = $ticket->ticketMessages()->create([
                'user_id' => $userId,
                'author_name' => $authorName,
                'author_type' => $userId === null ? 'customer' : 'staff',
                'body' => $body,
                'is_internal' => $isInternal,
            ]);

            if ($isInternal) {
                $ticket->ticketHistory()->create([
                    'user_id' => $userId,
                    'action' => 'internal_note_added',
                    'new_value' => ['message_id' => $message->id],
                ]);
            } else {
                $previousStatus = $ticket->ticket_status;
                $ticket->update([
                    'ticket_status' => $userId === null ? 'in_progress' : 'waiting_customer',
                    'status' => $userId === null ? 'reviewed' : 'replied',
                ]);
                $ticket->ticketHistory()->create([
                    'user_id' => $userId,
                    'action' => 'message_added',
                    'old_value' => ['status' => $previousStatus],
                    'new_value' => ['status' => $ticket->ticket_status, 'author_type' => $userId === null ? 'customer' : 'staff'],
                ]);
            }

            return $message;
        });
    }

    public function update(ContactMessage $ticket, array $data, ?int $userId): ContactMessage
    {
        return DB::transaction(function () use ($ticket, $data, $userId): ContactMessage {
            foreach (['ticket_status', 'priority', 'assignee_id'] as $field) {
                if (! array_key_exists($field, $data) || $ticket->{$field} == $data[$field]) {
                    continue;
                }

                $ticket->ticketHistory()->create([
                    'user_id' => $userId,
                    'action' => $field.'_changed',
                    'old_value' => [$field => $ticket->{$field}],
                    'new_value' => [$field => $data[$field]],
                ]);
            }

            $ticket->update($data);

            return $ticket->fresh(['assignee', 'ticketHistory']);
        });
    }
}
