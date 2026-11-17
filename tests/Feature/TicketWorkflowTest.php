<?php

use App\Models\ContactMessage;
use App\Models\User;
use App\Services\TicketService;
use Database\Seeders\DatabaseSeeder;

beforeEach(fn () => $this->seed(DatabaseSeeder::class));

it('creates traceable ticket threads and requires both customer identity fields for lookup', function (): void {
    $ticket = app(TicketService::class)->open([
        'name' => 'Ticket Customer',
        'email' => 'customer@example.com',
        'phone' => '09120000000',
        'subject' => 'Technical support',
        'message' => 'Initial ticket message',
        'type' => 'ticket',
        'status' => 'new',
    ]);

    $query = http_build_query(['email' => $ticket->email, 'phone' => $ticket->phone]);
    $this->getJson('/api/v1/tickets/'.$ticket->tracking_number.'?'.$query)
        ->assertOk()
        ->assertJsonPath('data.tracking_number', $ticket->tracking_number)
        ->assertJsonPath('data.status', 'open')
        ->assertJsonCount(1, 'data.messages');

    $this->getJson('/api/v1/tickets/'.$ticket->tracking_number.'?'.http_build_query([
        'email' => 'other@example.com',
        'phone' => $ticket->phone,
    ]))->assertNotFound();
});

it('allows authorized admins to assign and track ticket changes and threaded replies', function (): void {
    $ticket = app(TicketService::class)->open([
        'name' => 'Ticket Customer',
        'email' => 'customer@example.com',
        'phone' => '09120000000',
        'subject' => 'Technical support',
        'message' => 'Initial ticket message',
        'type' => 'ticket',
        'status' => 'new',
    ]);
    $admin = User::query()->where('email', env('SUPER_ADMIN_EMAIL', 'admin@parspooladaghaei.ir'))->firstOrFail();
    $token = $this->postJson('/api/v1/auth/login', [
        'email' => $admin->email,
        'password' => env('SUPER_ADMIN_PASSWORD', 'ParsPolad@1404'),
    ])->assertOk()->json('token');

    $this->withToken($token)->putJson('/api/v1/admin/tickets/'.$ticket->id, [
        'ticket_status' => 'in_progress',
        'priority' => 'high',
        'assignee_id' => $admin->id,
    ])->assertOk();

    $this->withToken($token)->postJson('/api/v1/admin/tickets/'.$ticket->id.'/messages', [
        'message' => 'We are investigating the issue.',
    ])->assertCreated();

    $ticket->refresh();
    expect($ticket->ticket_status)->toBe('waiting_customer')
        ->and($ticket->priority)->toBe('high')
        ->and($ticket->assignee_id)->toBe($admin->id)
        ->and($ticket->ticketHistory()->count())->toBeGreaterThanOrEqual(4)
        ->and($ticket->ticketMessages()->count())->toBe(2);
});
