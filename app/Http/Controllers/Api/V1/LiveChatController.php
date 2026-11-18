<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\LiveChatConversation;
use App\Models\LiveChatMessage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class LiveChatController extends Controller
{
    public function start(Request $request): JsonResponse
    {
        $data = $request->validate([
            'customer_name' => ['nullable', 'string', 'max:120'],
        ]);
        $visitorToken = Str::random(64);

        $conversation = DB::transaction(function () use ($data, $visitorToken): LiveChatConversation {
            $conversation = LiveChatConversation::query()->create([
                'visitor_token_hash' => hash('sha256', $visitorToken),
                'customer_name' => filled($data['customer_name'] ?? null)
                    ? trim($data['customer_name'])
                    : 'مهمان',
                'status' => 'open',
                'last_message_at' => now(),
            ]);

            $conversation->messages()->create([
                'sender_type' => 'system',
                'body' => 'سلام! به پشتیبانی آنلاین پارس پولاد خوش آمدید. پیام خود را بنویسید تا کارشناسان ما پاسخ دهند.',
            ]);

            return $conversation;
        });

        return response()->json([
            'data' => [
                'conversation' => $this->conversationData($conversation),
                'visitor_token' => $visitorToken,
                'messages' => $conversation->messages()->oldest()->get()->map(
                    fn (LiveChatMessage $message): array => $this->messageData($message),
                ),
            ],
        ], 201)->header('Cache-Control', 'no-store, private');
    }

    public function visitorMessages(Request $request, LiveChatConversation $conversation): JsonResponse
    {
        $this->authorizeVisitor($request, $conversation);
        $conversation->forceFill(['unread_by_customer' => 0])->save();

        return response()->json([
            'data' => [
                'conversation' => $this->conversationData($conversation),
                'messages' => $conversation->messages()->oldest()->get()->map(
                    fn (LiveChatMessage $message): array => $this->messageData($message),
                ),
            ],
        ])->header('Cache-Control', 'no-store, private');
    }

    public function visitorReply(Request $request, LiveChatConversation $conversation): JsonResponse
    {
        $this->authorizeVisitor($request, $conversation);
        abort_if($conversation->status === 'closed', 409, 'این گفتگو بسته شده است.');

        $data = $request->validate([
            'body' => ['required', 'string', 'max:2000'],
        ]);
        $body = trim($data['body']);
        abort_if($body === '', 422, 'متن پیام نمی‌تواند خالی باشد.');

        $message = DB::transaction(function () use ($conversation, $body): LiveChatMessage {
            $message = $conversation->messages()->create([
                'sender_type' => 'customer',
                'body' => $body,
            ]);
            $conversation->increment('unread_by_admin');
            $conversation->update(['last_message_at' => $message->created_at]);

            return $message;
        });

        return response()->json(['data' => $this->messageData($message)], 201)
            ->header('Cache-Control', 'no-store, private');
    }

    public function adminIndex(Request $request): JsonResponse
    {
        $status = $request->query('status');
        abort_if($status !== null && ! in_array($status, ['open', 'closed'], true), 422, 'وضعیت گفتگو معتبر نیست.');

        $conversations = LiveChatConversation::query()
            ->with('latestMessage')
            ->when($status, fn ($query) => $query->where('status', $status))
            ->when($request->filled('q'), function ($query) use ($request): void {
                $query->where('customer_name', 'like', '%'.trim($request->string('q')->toString()).'%');
            })
            ->orderByDesc('last_message_at')
            ->limit(100)
            ->get()
            ->map(fn (LiveChatConversation $conversation): array => $this->conversationData($conversation));

        return response()->json(['data' => $conversations])
            ->header('Cache-Control', 'no-store, private');
    }

    public function adminMessages(LiveChatConversation $conversation): JsonResponse
    {
        $conversation->update(['unread_by_admin' => 0]);

        return response()->json([
            'data' => [
                'conversation' => $this->conversationData($conversation),
                'messages' => $conversation->messages()->oldest()->get()->map(
                    fn (LiveChatMessage $message): array => $this->messageData($message),
                ),
            ],
        ])->header('Cache-Control', 'no-store, private');
    }

    public function adminReply(Request $request, LiveChatConversation $conversation): JsonResponse
    {
        abort_if($conversation->status === 'closed', 409, 'برای پاسخ‌گویی ابتدا گفتگو را باز کنید.');
        $data = $request->validate([
            'body' => ['required', 'string', 'max:2000'],
        ]);
        $body = trim($data['body']);
        abort_if($body === '', 422, 'متن پیام نمی‌تواند خالی باشد.');

        $message = DB::transaction(function () use ($conversation, $body, $request): LiveChatMessage {
            $message = $conversation->messages()->create([
                'sender_id' => $request->user()->id,
                'sender_type' => 'agent',
                'body' => $body,
            ]);
            $conversation->increment('unread_by_customer');
            $conversation->update(['last_message_at' => $message->created_at]);

            return $message;
        });

        return response()->json(['data' => $this->messageData($message)], 201)
            ->header('Cache-Control', 'no-store, private');
    }

    public function updateStatus(Request $request, LiveChatConversation $conversation): JsonResponse
    {
        $data = $request->validate([
            'status' => ['required', 'in:open,closed'],
        ]);

        $conversation->update([
            'status' => $data['status'],
            'closed_at' => $data['status'] === 'closed' ? now() : null,
        ]);

        return response()->json(['data' => $this->conversationData($conversation->load('latestMessage'))])
            ->header('Cache-Control', 'no-store, private');
    }

    private function authorizeVisitor(Request $request, LiveChatConversation $conversation): void
    {
        $token = $request->header('X-Chat-Token');
        abort_unless(
            is_string($token)
                && preg_match('/\A[A-Za-z0-9]{64}\z/', $token) === 1
                && hash_equals($conversation->visitor_token_hash, hash('sha256', $token)),
            404,
        );
    }

    /**
     * @return array<string, mixed>
     */
    private function conversationData(LiveChatConversation $conversation): array
    {
        return [
            'id' => $conversation->id,
            'customer_name' => $conversation->customer_name,
            'status' => $conversation->status,
            'unread_by_admin' => $conversation->unread_by_admin,
            'unread_by_customer' => $conversation->unread_by_customer,
            'last_message' => $conversation->latestMessage?->body,
            'last_message_at' => $conversation->last_message_at,
            'created_at' => $conversation->created_at,
            'closed_at' => $conversation->closed_at,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function messageData(LiveChatMessage $message): array
    {
        return [
            'id' => $message->id,
            'sender_type' => $message->sender_type,
            'sender_name' => $message->sender?->name,
            'body' => $message->body,
            'created_at' => $message->created_at,
        ];
    }
}
