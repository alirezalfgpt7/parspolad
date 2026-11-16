<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\NotificationChannelEnum;
use App\Http\Controllers\Controller;
use App\Http\Requests\Contact\StoreContactMessageRequest;
use App\Jobs\DispatchNotificationJob;
use App\Models\Article;
use App\Models\ContactMessage;
use App\Models\Contract;
use App\Models\Department;
use App\Models\License;
use App\Models\Notification;
use App\Models\Page;
use App\Models\Partner;
use App\Models\Product;
use App\Models\Project;
use App\Models\Service;
use App\Models\TeamMember;
use App\Services\BootstrapService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PublicController extends Controller
{
    public function bootstrap(BootstrapService $service, Request $request): JsonResponse
    {
        $data = $service->getPublicBootstrap();

        return response()->json($data + [
            'theme' => $data['theme_settings'],
            'presets' => $data['theme_presets'],
            'categories' => $data['project_categories'],
            'company' => $data['settings']['company'] ?? [],
            'map' => $data['settings']['map'] ?? [],
            'seo' => $data['settings']['seo'] ?? [],
            'site' => $data['settings']['site'] ?? [],
            'is_authenticated' => $request->user('sanctum') !== null,
        ]);
    }

    public function search(Request $request): JsonResponse
    {
        $q = trim((string) $request->query('q', ''));
        if ($q === '') {
            return response()->json([
                'projects' => [],
                'products' => [],
                'services' => [],
                'articles' => [],
                'licenses' => [],
                'pages' => [],
            ]);
        }

        $projects = Project::query()
            ->with('category')
            ->where(fn ($query) => $query
                ->where('title_fa', 'like', "%{$q}%")
                ->orWhere('title_en', 'like', "%{$q}%")
                ->orWhere('client_name_fa', 'like', "%{$q}%")
                ->orWhere('contract_number', 'like', "%{$q}%"))
            ->limit(15)
            ->get();

        $products = Product::query()
            ->where(fn ($query) => $query
                ->where('name_fa', 'like', "%{$q}%")
                ->orWhere('name_en', 'like', "%{$q}%")
                ->orWhere('model_code', 'like', "%{$q}%"))
            ->limit(15)
            ->get();
        $services = Service::query()
            ->where('title_fa', 'like', "%{$q}%")
            ->orWhere('title_en', 'like', "%{$q}%")
            ->limit(15)
            ->get();
        $articles = Article::query()
            ->where('title_fa', 'like', "%{$q}%")
            ->orWhere('title_en', 'like', "%{$q}%")
            ->limit(15)
            ->get();
        $licenses = License::query()
            ->where('title_fa', 'like', "%{$q}%")
            ->orWhere('title_en', 'like', "%{$q}%")
            ->orWhere('code', 'like', "%{$q}%")
            ->limit(15)
            ->get();
        $pages = Page::query()
            ->where(fn ($query) => $query
                ->where('title_fa', 'like', "%{$q}%")
                ->orWhere('content_fa', 'like', "%{$q}%"))
            ->limit(10)
            ->get();

        return response()->json(compact('projects', 'products', 'services', 'articles', 'licenses', 'pages'));
    }

    public function products(): JsonResponse
    {
        return response()->json(['data' => Product::query()->orderBy('id')->get()]);
    }

    public function services(): JsonResponse
    {
        return response()->json(['data' => Service::query()->orderBy('sort_order')->get()]);
    }

    public function contracts(): JsonResponse
    {
        return response()->json(['data' => Contract::query()->with('documents')->orderByDesc('start_year')->get()]);
    }

    public function licenses(): JsonResponse
    {
        return response()->json(['data' => License::query()->with('attachments')->orderBy('id')->get()]);
    }

    public function partners(): JsonResponse
    {
        return response()->json(['data' => Partner::query()->where('is_active', true)->orderBy('id')->get()]);
    }

    public function departments(): JsonResponse
    {
        return response()->json([
            'data' => [
                'departments' => Department::query()->with('children')->orderBy('id')->get(),
                'team' => TeamMember::query()->with('department')->orderBy('id')->get(),
            ],
        ]);
    }

    public function articles(): JsonResponse
    {
        return response()->json(['data' => Article::query()->orderByDesc('published_at')->get()]);
    }

    public function article(string $slug): JsonResponse
    {
        $article = Article::query()->where('slug', $slug)->firstOrFail();

        return response()->json(['data' => $article]);
    }

    public function page(string $slug): JsonResponse
    {
        $page = Page::query()->where('slug', $slug)->firstOrFail();

        return response()->json(['data' => $page]);
    }

    public function notifications(Request $request): JsonResponse
    {
        $userId = $request->user()->id;
        $notifications = Notification::query()
            ->where(fn ($query) => $query->whereNull('user_id')->orWhere('user_id', $userId))
            ->latest()
            ->get();

        return response()->json(['data' => $notifications]);
    }

    public function markNotificationRead(Request $request, Notification $notification): JsonResponse
    {
        abort_unless($notification->user_id === null || $notification->user_id === $request->user()->id, 404);
        $notification->update(['is_read' => true]);

        return response()->json(['ok' => true]);
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
