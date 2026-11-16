<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\NotificationChannelEnum;
use App\Http\Controllers\Controller;
use App\Http\Requests\Contact\StoreContactMessageRequest;
use App\Jobs\DispatchNotificationJob;
use App\Models\ContactMessage;
use App\Models\Page;
use App\Models\Project;
use App\Services\BootstrapService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PublicController extends Controller
{
    public function bootstrap(BootstrapService $service): JsonResponse
    {
        return response()->json($service->getPublicBootstrap());
    }

    public function search(Request $request): JsonResponse
    {
        $q = trim((string) $request->query('q', ''));
        if ($q === '') {
            return response()->json(['projects' => [], 'pages' => []]);
        }

        $projects = Project::query()
            ->with('category')
            ->where('title_fa', 'like', "%{$q}%")
            ->orWhere('client_name_fa', 'like', "%{$q}%")
            ->orWhere('contract_number', 'like', "%{$q}%")
            ->limit(15)
            ->get();

        $pages = Page::query()
            ->where('title_fa', 'like', "%{$q}%")
            ->orWhere('content_fa', 'like', "%{$q}%")
            ->limit(10)
            ->get();

        return response()->json(compact('projects', 'pages'));
    }

    public function submitContact(StoreContactMessageRequest $request): JsonResponse
    {
        $message = ContactMessage::query()->create($request->validated() + ['status' => 'new']);

        DispatchNotificationJob::dispatch(
            userId: 1,
            titleFa: 'پیام / درخواست استعلام جدید ثبت شد',
            titleEn: 'New Contact / RFQ Submission',
            bodyFa: "{$message->name} ({$message->phone}): {$message->subject}",
            bodyEn: "{$message->name}: {$message->subject}",
            channel: NotificationChannelEnum::IN_APP,
        );

        return response()->json(['message' => 'درخواست شما با موفقیت ثبت شد.', 'data' => $message], 201);
    }
}
