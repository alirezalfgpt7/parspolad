<?php

namespace App\Support;

use App\Models\Article;
use App\Models\Banner;
use App\Models\Department;
use App\Models\Faq;
use App\Models\Kpi;
use App\Models\NotificationTemplate;
use App\Models\Page;
use App\Models\Partner;
use App\Models\Product;
use App\Models\ProjectCategory;
use App\Models\Service;
use App\Models\TeamMember;

class AdminContentRegistry
{
    public const MODELS = [
        'categories' => ProjectCategory::class,
        'faqs' => Faq::class,
        'services' => Service::class,
        'products' => Product::class,
        'departments' => Department::class,
        'team' => TeamMember::class,
        'partners' => Partner::class,
        'articles' => Article::class,
        'pages' => Page::class,
        'banners' => Banner::class,
        'kpis' => Kpi::class,
        'notification-templates' => NotificationTemplate::class,
    ];

    public const PERMISSIONS = [
        'categories' => 'projects.manage',
        'faqs' => 'pages.manage',
        'services' => 'pages.manage',
        'products' => 'pages.manage',
        'departments' => 'pages.manage',
        'team' => 'pages.manage',
        'partners' => 'pages.manage',
        'articles' => 'pages.manage',
        'pages' => 'pages.manage',
        'banners' => 'pages.manage',
        'kpis' => 'pages.manage',
        'notification-templates' => 'settings.manage',
    ];

    public const REQUIRED_FIELDS = [
        'categories' => ['slug', 'name_fa', 'name_en'],
        'faqs' => ['question_fa', 'answer_fa'],
        'services' => ['slug', 'title_fa', 'title_en', 'summary_fa', 'image_url'],
        'products' => ['slug', 'name_fa', 'name_en', 'category_fa', 'category_en', 'model_code', 'standard', 'summary_fa', 'image_url'],
        'departments' => ['name_fa', 'name_en', 'head_name_fa', 'head_name_en', 'head_title_fa', 'head_title_en'],
        'team' => ['department_id', 'name_fa', 'name_en', 'role_fa', 'role_en'],
        'partners' => ['name_fa', 'name_en', 'logo_url'],
        'articles' => ['slug', 'title_fa', 'title_en', 'excerpt_fa', 'content_fa', 'category_fa', 'category_en', 'cover_image', 'author_fa', 'published_at'],
        'pages' => ['slug', 'title_fa', 'title_en', 'content_fa'],
        'banners' => ['title_fa', 'title_en', 'image_url'],
        'kpis' => ['key', 'label_fa', 'label_en', 'value'],
        'notification-templates' => ['event_key', 'name_fa', 'channel', 'subject_fa'],
    ];

    public static function modelClass(string $resource): string
    {
        abort_unless(isset(self::MODELS[$resource]), 404);

        return self::MODELS[$resource];
    }

    public static function permission(string $resource): string
    {
        abort_unless(isset(self::PERMISSIONS[$resource]), 404);

        return self::PERMISSIONS[$resource];
    }

    public static function requiredFields(string $resource): array
    {
        abort_unless(isset(self::REQUIRED_FIELDS[$resource]), 404);

        return self::REQUIRED_FIELDS[$resource];
    }
}
