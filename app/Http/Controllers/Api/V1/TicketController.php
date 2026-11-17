<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Ticket\StoreTicketReplyRequest;
use App\Models\ContactMessage;
use App\Services\TicketService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TicketController extends Controller
{
    public function show(Request $request, string $trackingNumber): JsonResponse
    {
        $identity = $request->validate([
            'email' => ['required', 'email', 'max:160'],
            'phone' => ['required', 'string', 'max:30'],
        ]);
        $ticket = $this->findTicket($trackingNumber, $identity['email'], $identity['phone'])
            ->load(['ticketMessages' => fn ($query) => $query->where('is_internal', false)]);

        return response()->json(['data' => $this->publicData($ticket)]);
    }

    public function reply(StoreTicketReplyRequest $request, string $trackingNumber, TicketService $tickets): JsonResponse
    {
        $data = $request->validated();
        $ticket = $this->findTicket($trackingNumber, $data['email'], $data['phone']);
        $message = $tickets->reply($ticket, $data['message'], $ticket->name, null);

        return response()->json(['message' => 'پاسخ شما به تیکت افزوده شد.', 'data' => $message], 201);
    }

    public function adminIndex(Request $request): JsonResponse
    {
        $this->ensurePermission($request, 'messages.view');
        $perPage = min(max($request->integer('per_page', 20), 1), 100);
        $tickets = ContactMessage::query()->where('type', 'ticket')->with('assignee')->latest()->paginate($perPage);

        return $this->paginatedResponse($tickets);
    }

    public function adminShow(Request $request, ContactMessage $ticket): JsonResponse
    {
        $this->ensureTicket($request, $ticket);

        return response()->json(['data' => $ticket->load(['assignee', 'ticketMessages', 'ticketHistory'])]);
    }

    public function update(Request $request, ContactMessage $ticket, TicketService $tickets): JsonResponse
    {
        $this->ensureTicket($request, $ticket, 'messages.manage');
        $data = $request->validate([
            'ticket_status' => ['sometimes', 'required', 'in:open,in_progress,waiting_customer,resolved,closed'],
            'priority' => ['sometimes', 'required', 'in:low,normal,high,urgent'],
            'assignee_id' => ['sometimes', 'nullable', 'integer', 'exists:users,id'],
        ]);
        abort_if($data === [], 422, 'حداقل یک فیلد برای بروزرسانی ارسال کنید.');

        return response()->json(['data' => $tickets->update($ticket, $data, $request->user()->id)]);
    }

    public function adminReply(Request $request, ContactMessage $ticket, TicketService $tickets): JsonResponse
    {
        $this->ensureTicket($request, $ticket, 'messages.manage');
        $data = $request->validate([
            'message' => ['required', 'string', 'min:2', 'max:5000'],
            'is_internal' => ['sometimes', 'boolean'],
        ]);
        $message = $tickets->reply(
            $ticket,
            $data['message'],
            $request->user()->name,
            $request->user()->id,
            (bool) ($data['is_internal'] ?? false),
        );

        return response()->json(['data' => $message], 201);
    }

    private function findTicket(string $trackingNumber, string $email, string $phone): ContactMessage
    {
        return ContactMessage::query()
            ->where('type', 'ticket')
            ->where('tracking_number', strtoupper($trackingNumber))
            ->where('email', $email)
            ->where('phone', $phone)
            ->firstOrFail();
    }

    private function publicData(ContactMessage $ticket): array
    {
        return [
            'tracking_number' => $ticket->tracking_number,
            'subject' => $ticket->subject,
            'status' => $ticket->ticket_status,
            'priority' => $ticket->priority,
            'created_at' => $ticket->created_at,
            'messages' => $ticket->ticketMessages->map(fn ($message): array => [
                'author_name' => $message->author_name,
                'author_type' => $message->author_type,
                'body' => $message->body,
                'created_at' => $message->created_at,
            ]),
        ];
    }

    private function ensureTicket(Request $request, ContactMessage $ticket, string $permission = 'messages.view'): void
    {
        $this->ensurePermission($request, $permission);
        abort_unless($ticket->type === 'ticket', 404);
    }

    private function ensurePermission(Request $request, string $permission): void
    {
        abort_unless($request->user()?->can($permission), 403);
    }
}
