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
use App\Models\Faq;
use App\Models\License;
use App\Models\Notification;
use App\Models\Page;
use App\Models\Partner;
use App\Models\Product;
use App\Models\Project;
use App\Models\Service;
use App\Models\TeamMember;
use App\Services\BootstrapService;
use App\Services\HomepageSectionsService;
use App\Services\SitemapService;
use App\Services\TicketService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PublicController extends Controller
{
    public function homepageSections(HomepageSectionsService $sections): JsonResponse
    {
        return response()->json(['data' => $sections->get()]);
    }

    public function bootstrap(BootstrapService $service, Request $request): JsonResponse
    {
        $data = $service->getPublicBootstrap($request);

        return response()->json($data + [
            'theme' => $data['theme_settings'],
            'presets' => $data['theme_presets'],
            'categories' => $data['project_categories'],
            'company' => $data['settings']['company'] ?? [],
            'map' => $data['settings']['map'] ?? [],
            'seo' => $data['settings']['seo'] ?? [],
            'site' => $data['settings']['site'] ?? [],
            'login' => $data['settings']['login'] ?? [],
            'appearance' => $data['settings']['appearance'] ?? [],
            'logos' => $data['settings']['logos'] ?? [],
            'pages_config' => $data['settings']['pages_config'] ?? [],
            'preloader' => $data['settings']['preloader'] ?? [],
            'is_authenticated' => $request->user('sanctum') !== null,
        ])->header('Cache-Control', 'no-store, private, max-age=0');
    }

    public function sitemap(SitemapService $sitemap): JsonResponse
    {
        return response()->json(['data' => $sitemap->entries()]);
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

    public function products(Request $request): JsonResponse
    {
        $perPage = min(max($request->integer('per_page', 9), 1), 100);
        $category = trim($request->string('category')->toString());
        $query = Product::query();
        if ($category !== '') {
            $query->where(fn ($sub) => $sub
                ->where('category_fa', $category)
                ->orWhere('category_en', $category));
        }

        return $this->paginatedResponse(
            $query->orderBy('id')->paginate($perPage)->withQueryString(),
        );
    }

    public function productFilters(): JsonResponse
    {
        return response()->json([
            'data' => Product::query()
                ->select('category_fa', 'category_en')
                ->distinct()
                ->orderBy('category_fa')
                ->get(),
        ]);
    }

    public function services(Request $request): JsonResponse
    {
        $perPage = min(max($request->integer('per_page', 8), 1), 100);

        return $this->paginatedResponse(
            Service::query()->orderBy('sort_order')->paginate($perPage)->withQueryString(),
        );
    }

    public function contracts(Request $request): JsonResponse
    {
        $perPage = min(max($request->integer('per_page', 8), 1), 100);

        return $this->paginatedResponse(
            Contract::query()->orderByDesc('start_year')->paginate($perPage)->withQueryString(),
        );
    }

    public function licenses(Request $request): JsonResponse
    {
        $perPage = min(max($request->integer('per_page', 8), 1), 100);

        return $this->paginatedResponse(
            License::query()->orderBy('id')->paginate($perPage)->withQueryString(),
        );
    }

    public function partners(Request $request): JsonResponse
    {
        $perPage = min(max($request->integer('per_page', 12), 1), 100);

        return $this->paginatedResponse(
            Partner::query()->where('is_active', true)->orderBy('id')->paginate($perPage)->withQueryString(),
        );
    }

    public function departments(): JsonResponse
    {
        return response()->json([
            'data' => [
                'departments' => Department::query()->with('children')->orderBy('sort_order')->orderBy('id')->get(),
                'team' => TeamMember::query()->with('department')->orderBy('sort_order')->orderBy('id')->get(),
            ],
        ]);
    }

    public function faqs(Request $request): JsonResponse
    {
        $perPage = min(max($request->integer('per_page', 20), 1), 100);

        return $this->paginatedResponse(
            Faq::query()->where('is_active', true)->orderBy('sort_order')->orderBy('id')->paginate($perPage)->withQueryString(),
        );
    }

    public function articles(Request $request): JsonResponse
    {
        $perPage = min(max($request->integer('per_page', 9), 1), 100);

        return $this->paginatedResponse(
            Article::query()->orderByDesc('published_at')->paginate($perPage)->withQueryString(),
        );
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
        $perPage = min(max($request->integer('per_page', 20), 1), 100);
        $notifications = Notification::query()
            ->where(fn ($query) => $query->whereNull('user_id')->orWhere('user_id', $userId))
            ->latest()
            ->paginate($perPage)
            ->withQueryString();

        return $this->paginatedResponse($notifications);
    }

    public function markNotificationRead(Request $request, Notification $notification): JsonResponse
    {
        abort_unless($notification->user_id === null || $notification->user_id === $request->user()->id, 404);
        $notification->update(['is_read' => true]);

        return response()->json(['ok' => true]);
    }

    public function submitContact(StoreContactMessageRequest $request, TicketService $tickets): JsonResponse
    {
        $data = $request->safe()->except(['captcha', 'captcha_key', 'website']);
        $message = $data['type'] === 'ticket'
            ? $tickets->open($data + ['status' => 'new'])
            : ContactMessage::query()->create($data + ['status' => 'new']);

        DispatchNotificationJob::dispatch(
            userId: 1,
            titleFa: 'پیام / درخواست استعلام جدید ثبت شد',
            titleEn: 'New Contact / RFQ Submission',
            bodyFa: "{$message->name} ({$message->phone}): {$message->subject}",
            bodyEn: "{$message->name}: {$message->subject}",
            channel: NotificationChannelEnum::IN_APP,
        );

        return response()->json([
            'message' => 'درخواست شما با موفقیت ثبت شد.',
            'data' => $message,
            'tracking_number' => $message->tracking_number,
        ], 201);
    }
}
