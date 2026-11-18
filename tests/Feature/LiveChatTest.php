<?php

use App\Models\LiveChatConversation;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;

beforeEach(fn () => $this->seed(DatabaseSeeder::class));

it('allows visitors with their private token to send and read messages but blocks other visitors', function (): void {
    $start = $this->postJson('/api/v1/live-chat/conversations', [
        'customer_name' => '  Visitor Name  ',
    ])->assertCreated()
        ->assertHeader('Cache-Control', 'no-store, private')
        ->assertJsonStructure(['data' => ['conversation' => ['id', 'status'], 'visitor_token', 'messages']]);

    $conversationId = $start->json('data.conversation.id');
    $visitorToken = $start->json('data.visitor_token');
    $conversation = LiveChatConversation::query()->findOrFail($conversationId);

    expect($conversation->customer_name)->toBe('Visitor Name')
        ->and($conversation->visitor_token_hash)->not->toBe($visitorToken)
        ->and(strlen($visitorToken))->toBe(64);

    $this->getJson("/api/v1/live-chat/conversations/{$conversationId}/messages", [
        'X-Chat-Token' => str_repeat('x', 64),
    ])->assertNotFound();

    $this->postJson("/api/v1/live-chat/conversations/{$conversationId}/messages", [
        'body' => '  I need assistance with a project.  ',
    ], ['X-Chat-Token' => $visitorToken])
        ->assertCreated()
        ->assertJsonPath('data.body', 'I need assistance with a project.');

    $this->getJson("/api/v1/live-chat/conversations/{$conversationId}/messages", [
        'X-Chat-Token' => $visitorToken,
    ])->assertOk()
        ->assertJsonCount(2, 'data.messages')
        ->assertJsonPath('data.conversation.unread_by_customer', 0);

    expect($conversation->fresh()->unread_by_admin)->toBe(1);
});

it('requires admin permissions to read and manage conversations', function (): void {
    $start = $this->postJson('/api/v1/live-chat/conversations')->assertCreated();
    $conversationId = $start->json('data.conversation.id');
    $admin = User::query()->where('email', env('SUPER_ADMIN_EMAIL', 'admin@parspooladaghaei.ir'))->firstOrFail();
    $token = $this->postJson('/api/v1/auth/login', loginPayloadWithCaptcha($this, [
        'email' => $admin->email,
    ]))->assertOk()->json('token');

    $this->getJson('/api/v1/admin/live-chat/conversations')->assertUnauthorized();

    $this->withToken($token)->getJson('/api/v1/admin/live-chat/conversations?status=open')
        ->assertOk()
        ->assertJsonPath('data.0.id', $conversationId);

    $this->withToken($token)->postJson("/api/v1/admin/live-chat/conversations/{$conversationId}/messages", [
        'body' => 'Our team will be happy to help.',
    ])->assertCreated()
        ->assertJsonPath('data.sender_type', 'agent');

    $this->withToken($token)->putJson("/api/v1/admin/live-chat/conversations/{$conversationId}", [
        'status' => 'closed',
    ])->assertOk()
        ->assertJsonPath('data.status', 'closed');

    $this->postJson("/api/v1/live-chat/conversations/{$conversationId}/messages", [
        'body' => 'I have one more question.',
    ], ['X-Chat-Token' => $start->json('data.visitor_token')])->assertStatus(409);
});
