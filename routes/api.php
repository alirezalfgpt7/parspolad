<?php

use App\Http\Controllers\Api\V1\AdminContentController;
use App\Http\Controllers\Api\V1\AdminResourceController;
use App\Http\Controllers\Api\V1\ArticleCommentController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\CaptchaChallengeController;
use App\Http\Controllers\Api\V1\ContractController;
use App\Http\Controllers\Api\V1\LicenseController;
use App\Http\Controllers\Api\V1\LiveChatController;
use App\Http\Controllers\Api\V1\MediaDownloadController;
use App\Http\Controllers\Api\V1\ProjectController;
use App\Http\Controllers\Api\V1\PublicController;
use App\Http\Controllers\Api\V1\SettingsController;
use App\Http\Controllers\Api\V1\SliderController;
use App\Http\Controllers\Api\V1\ThemeController;
use App\Http\Controllers\Api\V1\TicketController;
use App\Http\Controllers\Api\V1\VisitAnalyticsController;
use App\Http\Middleware\MaintenanceMode;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->middleware(MaintenanceMode::class)->group(function (): void {
    // Public API endpoints
    Route::get('/bootstrap', [PublicController::class, 'bootstrap']);
    Route::get('/homepage-sections', [PublicController::class, 'homepageSections']);
    Route::get('/sitemap', [PublicController::class, 'sitemap']);
    Route::get('/search', [PublicController::class, 'search']);
    Route::post('/contact', [PublicController::class, 'submitContact'])->middleware('throttle:5,1');
    Route::get('/tickets/{trackingNumber}', [TicketController::class, 'show'])->middleware('throttle:10,1');
    Route::post('/tickets/{trackingNumber}/messages', [TicketController::class, 'reply'])->middleware('throttle:5,1');
    Route::post('/page-views', [VisitAnalyticsController::class, 'record'])->middleware('throttle:120,1');
    Route::post('/live-chat/conversations', [LiveChatController::class, 'start'])->middleware('throttle:5,1');
    Route::get('/live-chat/conversations/{conversation}/messages', [LiveChatController::class, 'visitorMessages'])
        ->middleware('throttle:120,1')
        ->whereNumber('conversation');
    Route::post('/live-chat/conversations/{conversation}/messages', [LiveChatController::class, 'visitorReply'])
        ->middleware('throttle:20,1')
        ->whereNumber('conversation');
    Route::get('/projects', [ProjectController::class, 'index']);
    Route::get('/projects/filters', [ProjectController::class, 'filters']);
    Route::get('/projects/{slug}', [ProjectController::class, 'show']);
    Route::get('/products/filters', [PublicController::class, 'productFilters']);
    Route::get('/products', [PublicController::class, 'products']);
    Route::get('/services', [PublicController::class, 'services']);
    Route::get('/contracts', [ContractController::class, 'index']);
    Route::get('/licenses', [LicenseController::class, 'index']);
    Route::get('/partners', [PublicController::class, 'partners']);
    Route::get('/departments', [PublicController::class, 'departments']);
    Route::get('/faqs', [PublicController::class, 'faqs']);
    Route::get('/articles', [PublicController::class, 'articles']);
    Route::get('/articles/{slug}/comments', [ArticleCommentController::class, 'publicIndex'])->middleware('throttle:60,1');
    Route::post('/articles/{slug}/comments', [ArticleCommentController::class, 'store'])->middleware('throttle:3,1');
    Route::get('/articles/{slug}', [PublicController::class, 'article']);
    Route::get('/pages/{slug}', [PublicController::class, 'page']);
    Route::get('/sliders', [SliderController::class, 'index']);
    Route::get('/media/{media}/download', MediaDownloadController::class)->name('media.download');
    Route::get('/theme', [ThemeController::class, 'show']);

    // Authentication
    Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:20,1');
    Route::post('/auth/register', [AuthController::class, 'register'])->middleware('throttle:5,1');
    Route::get('/captcha/challenge', CaptchaChallengeController::class)->middleware('throttle:60,1');

    // Protected API routes (Laravel Sanctum)
    Route::middleware('auth:sanctum')->group(function (): void {
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::post('/auth/2fa', [AuthController::class, 'toggleTwoFactor']);
        Route::put('/auth/profile', [AuthController::class, 'updateProfile']);
        Route::get('/notifications', [PublicController::class, 'notifications']);
        Route::post('/notifications/{notification}/read', [PublicController::class, 'markNotificationRead']);

        // Admin CMS & Management
        Route::prefix('admin')->group(function (): void {
            Route::get('/dashboard', [AdminContentController::class, 'dashboard'])->middleware('permission:dashboard.view');
            Route::get('/analytics', [VisitAnalyticsController::class, 'analytics'])->middleware('permission:analytics.view');
            Route::get('/projects', [ProjectController::class, 'adminIndex'])->middleware('permission:projects.view');
            Route::get('/projects/{project}', [ProjectController::class, 'adminShow'])
                ->whereNumber('project')
                ->middleware('permission:projects.view');
            Route::get('/contracts', [ContractController::class, 'adminIndex'])->middleware('permission:contracts.view');
            Route::get('/contracts/{contract}', [ContractController::class, 'adminShow'])
                ->whereNumber('contract')
                ->middleware('permission:contracts.view');
            Route::get('/licenses', [LicenseController::class, 'adminIndex'])->middleware('permission:licenses.view');
            Route::get('/licenses/{license}', [LicenseController::class, 'adminShow'])
                ->whereNumber('license')
                ->middleware('permission:licenses.view');
            Route::get('/themes', [ThemeController::class, 'show'])->middleware('permission:themes.manage');
            Route::put('/themes', [ThemeController::class, 'update']);
            Route::get('/sliders', [AdminContentController::class, 'sliders'])->middleware('permission:slider.manage');
            Route::post('/sliders', [SliderController::class, 'store']);
            Route::put('/sliders/{slider}', [SliderController::class, 'update']);
            Route::delete('/sliders/{slider}', [SliderController::class, 'destroy']);
            Route::put('/sliders/{slider}/slides', [AdminContentController::class, 'updateSlides']);
            Route::get('/menus', [AdminContentController::class, 'menus'])->middleware('permission:menus.manage');
            Route::put('/menus/{menu}', [AdminContentController::class, 'updateMenu']);
            Route::get('/settings', [SettingsController::class, 'show'])->middleware('permission:settings.manage');
            Route::get('/media', [AdminResourceController::class, 'media'])->middleware('permission:media.manage');
            Route::put('/media/{media}', [AdminResourceController::class, 'updateMedia']);
            Route::delete('/media/{media}', [AdminResourceController::class, 'destroyMedia']);
            Route::get('/backup/tables', [AdminContentController::class, 'backupTables'])
                ->middleware('role:super_admin');
            Route::get('/backup', [AdminContentController::class, 'backup'])
                ->middleware('role:super_admin');
            Route::post('/backup/inspect', [AdminContentController::class, 'inspectBackup'])
                ->middleware('role:super_admin');
            Route::post('/restore', [AdminContentController::class, 'restoreBackup'])
                ->middleware('role:super_admin');
            Route::get('/reports/export/{entity}', [AdminContentController::class, 'exportReport'])
                ->middleware('permission:reports.export');

            Route::put('/theme', [ThemeController::class, 'update']);
            Route::post('/theme/presets', [ThemeController::class, 'storePreset'])->middleware('permission:themes.manage');
            Route::post('/themes/presets', [ThemeController::class, 'storePreset'])->middleware('permission:themes.manage');

            Route::post('/sliders/slides', [SliderController::class, 'storeSlide']);
            Route::put('/sliders/slides/{slide}', [SliderController::class, 'updateSlide']);
            Route::post('/sliders/reorder', [SliderController::class, 'reorder'])->middleware('permission:slider.manage');
            Route::delete('/sliders/slides/{slide}', [SliderController::class, 'destroySlide'])
                ->middleware('permission:slider.manage');

            Route::post('/projects', [ProjectController::class, 'store']);
            Route::put('/projects/{project}', [ProjectController::class, 'update']);
            Route::delete('/projects/{project}', [ProjectController::class, 'destroy']);
            Route::get('/projects-export', [ProjectController::class, 'export'])->middleware('permission:reports.export');

            Route::post('/contracts', [ContractController::class, 'store']);
            Route::put('/contracts/{contract}', [ContractController::class, 'update']);
            Route::delete('/contracts/{contract}', [ContractController::class, 'destroy']);
            Route::get('/contracts-export', [ContractController::class, 'export'])->middleware('permission:reports.export');

            Route::post('/licenses', [LicenseController::class, 'store']);
            Route::put('/licenses/{license}', [LicenseController::class, 'update']);
            Route::delete('/licenses/{license}', [LicenseController::class, 'destroy']);

            Route::put('/settings', [SettingsController::class, 'updateGeneral']);
            Route::put('/settings/email', [SettingsController::class, 'updateEmail']);
            Route::post('/settings/email/test', [SettingsController::class, 'testEmail']);
            Route::put('/settings/sms', [SettingsController::class, 'updateSms']);
            Route::post('/settings/sms/test', [SettingsController::class, 'testSms']);

            Route::get('/users', [AdminResourceController::class, 'users'])->middleware('permission:users.view');
            Route::post('/users', [AdminResourceController::class, 'storeUser']);
            Route::put('/users/{user}', [AdminResourceController::class, 'updateUser']);
            Route::delete('/users/{user}', [AdminResourceController::class, 'destroyUser']);
            Route::post('/roles', [AdminResourceController::class, 'storeRole']);
            Route::put('/roles/{role}', [AdminResourceController::class, 'updateRole']);
            Route::delete('/roles/{role}', [AdminResourceController::class, 'destroyRole']);
            Route::get('/messages', [AdminResourceController::class, 'messages'])->middleware('permission:messages.view');
            Route::post('/activity-logs/prune', [AdminResourceController::class, 'pruneActivityLogs']);
            Route::delete('/activity-logs', [AdminResourceController::class, 'resetActivityLogs']);
            Route::get('/live-chat/conversations', [LiveChatController::class, 'adminIndex'])->middleware('permission:messages.view');
            Route::get('/live-chat/conversations/{conversation}/messages', [LiveChatController::class, 'adminMessages'])
                ->middleware('permission:messages.view')
                ->whereNumber('conversation');
            Route::post('/live-chat/conversations/{conversation}/messages', [LiveChatController::class, 'adminReply'])
                ->middleware('permission:messages.manage')
                ->whereNumber('conversation');
            Route::put('/live-chat/conversations/{conversation}', [LiveChatController::class, 'updateStatus'])
                ->middleware('permission:messages.manage')
                ->whereNumber('conversation');
            Route::get('/tickets', [TicketController::class, 'adminIndex'])->middleware('permission:messages.view');
            Route::get('/tickets/{ticket}', [TicketController::class, 'adminShow'])->middleware('permission:messages.view');
            Route::put('/tickets/{ticket}', [TicketController::class, 'update'])->middleware('permission:messages.manage');
            Route::post('/tickets/{ticket}/messages', [TicketController::class, 'adminReply'])->middleware('permission:messages.manage');
            Route::put('/messages/{message}', [AdminResourceController::class, 'updateMessageStatus']);
            Route::delete('/messages/{message}', [AdminResourceController::class, 'destroyMessage']);
            Route::get('/comments', [ArticleCommentController::class, 'adminIndex'])->middleware('permission:comments.manage');
            Route::put('/comments/{comment}', [ArticleCommentController::class, 'updateStatus'])->middleware('permission:comments.manage');
            Route::delete('/comments/{comment}', [ArticleCommentController::class, 'destroy'])->middleware('permission:comments.manage');
            Route::get('/notifications', [AdminResourceController::class, 'notifications'])
                ->middleware('permission:notifications.view');
            Route::post('/media/upload', [AdminResourceController::class, 'uploadMedia']);
            Route::get('/activity-logs', [AdminResourceController::class, 'activityLogs'])
                ->middleware('permission:logs.view');
            Route::get('/activity-logs-export', [AdminResourceController::class, 'exportLogs'])
                ->middleware('permission:reports.export');

            Route::get('/content-resources', [AdminContentController::class, 'resources']);
            Route::get('/content-schema/{resource}', [AdminContentController::class, 'schema'])
                ->where('resource', 'categories|faqs|services|products|departments|team|partners|articles|article-categories|pages|banners|kpis|notification-templates');
            Route::get('/{resource}', [AdminContentController::class, 'index'])
                ->where('resource', 'categories|faqs|services|products|departments|team|partners|articles|article-categories|pages|banners|kpis|notification-templates');
            Route::post('/{resource}', [AdminContentController::class, 'store'])
                ->where('resource', 'categories|faqs|services|products|departments|team|partners|articles|article-categories|pages|banners|kpis|notification-templates');
            Route::put('/{resource}/{id}', [AdminContentController::class, 'update'])
                ->where('resource', 'categories|faqs|services|products|departments|team|partners|articles|article-categories|pages|banners|kpis|notification-templates')
                ->whereNumber('id');
            Route::delete('/{resource}/{id}', [AdminContentController::class, 'destroy'])
                ->where('resource', 'categories|faqs|services|products|departments|team|partners|articles|article-categories|pages|banners|kpis|notification-templates')
                ->whereNumber('id');
        });
    });
});
