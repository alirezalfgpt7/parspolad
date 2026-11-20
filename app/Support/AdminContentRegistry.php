<?php

namespace App\Support;

use App\Models\Article;
use App\Models\ArticleCategory;
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
        'article-categories' => ArticleCategory::class,
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
        'article-categories' => 'pages.manage',
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
        'articles' => ['slug', 'title_fa', 'title_en', 'excerpt_fa', 'content_fa', 'article_category_id', 'cover_image', 'author_fa', 'published_at'],
        'article-categories' => ['slug', 'name_fa', 'name_en'],
        'pages' => ['slug', 'title_fa', 'title_en', 'content_fa'],
        'banners' => ['title_fa', 'title_en', 'image_url'],
        'kpis' => ['key', 'label_fa', 'label_en', 'value'],
        'notification-templates' => ['event_key', 'name_fa', 'channel', 'subject_fa'],
    ];

    public const RESOURCE_LABELS = [
        'categories' => ['fa' => 'دسته‌بندی پروژه‌ها', 'en' => 'Project categories'],
        'faqs' => ['fa' => 'پرسش‌های متداول', 'en' => 'FAQs'],
        'services' => ['fa' => 'خدمات', 'en' => 'Services'],
        'products' => ['fa' => 'محصولات', 'en' => 'Products'],
        'departments' => ['fa' => 'واحدهای سازمانی', 'en' => 'Departments'],
        'team' => ['fa' => 'اعضای تیم', 'en' => 'Team members'],
        'partners' => ['fa' => 'کارفرمایان و شرکا', 'en' => 'Clients & partners'],
        'articles' => ['fa' => 'اخبار و مقالات', 'en' => 'News & articles'],
        'article-categories' => ['fa' => 'دسته‌بندی اخبار و مقالات', 'en' => 'Article categories'],
        'pages' => ['fa' => 'صفحات', 'en' => 'Pages'],
        'banners' => ['fa' => 'بنرها', 'en' => 'Banners'],
        'kpis' => ['fa' => 'شاخص‌های آماری', 'en' => 'Performance indicators'],
        'notification-templates' => ['fa' => 'قالب‌های اعلان', 'en' => 'Notification templates'],
    ];

    private const RESOURCE_GUIDANCE = [
        'pages' => [
            'description_fa' => 'عنوان، زیرعنوان و متن معرفی صفحه‌های عمومی را ویرایش کنید؛ این بخش هدر اصلی سایت نیست.',
            'usage_fa' => 'در سربرگ معرفی صفحه‌ای با همان شناسهٔ یکتا (slug) نمایش داده می‌شود.',
            'public_path' => null,
            'related_admin_path' => null,
        ],
        'services' => [
            'description_fa' => 'شرح، تصویر، آیکن، ترتیب و اطلاعات فارسی/انگلیسی خدمات مهندسی.',
            'usage_fa' => 'در صفحهٔ خدمات و بخش خدمات مهندسی صفحهٔ اصلی نمایش داده می‌شود.',
            'public_path' => '/services',
            'related_admin_path' => null,
        ],
        'products' => [
            'description_fa' => 'اطلاعات دوزبانهٔ محصول، مدل، مشخصات فنی، تصویر و فایل کاتالوگ.',
            'usage_fa' => 'در فهرست عمومی محصولات و صفحهٔ جزئیات محصول استفاده می‌شود.',
            'public_path' => '/products',
            'related_admin_path' => null,
        ],
        'articles' => [
            'description_fa' => 'مدیریت کامل خبر یا مقاله شامل عنوان و متن دوزبانه، دسته‌بندی، نویسنده، کاور و تاریخ انتشار شمسی.',
            'usage_fa' => 'دسته‌ها را ابتدا در «دسته‌بندی اخبار و مقالات» تعریف کنید؛ خبرها در صفحهٔ اخبار و کارت‌های منتخب صفحهٔ اصلی دیده می‌شوند.',
            'public_path' => '/news',
            'related_admin_path' => '/admin/content-records?resource=article-categories',
        ],
        'article-categories' => [
            'description_fa' => 'دسته‌های دوزبانهٔ اخبار و مقالات را یک‌بار تعریف کنید و هنگام ساخت یا ویرایش مقاله از فهرست انتخاب کنید.',
            'usage_fa' => 'نام فارسی و انگلیسی دسته کنار هر خبر و مقاله در سایت نمایش داده می‌شود.',
            'public_path' => '/news',
            'related_admin_path' => null,
        ],
        'banners' => [
            'description_fa' => 'ساخت و ویرایش بنر فراخوان شامل عنوان، توضیح، تصویر و پیوند دکمه.',
            'usage_fa' => 'محل نمایش را از خانه، بالای فهرست پروژه‌ها یا پایین فهرست خدمات انتخاب کنید؛ بنر غیرفعال پنهان است.',
            'public_path' => '/',
            'related_admin_path' => null,
        ],
        'kpis' => [
            'description_fa' => 'هر رکورد یک شاخص است: برچسب و مقدار دوزبانه، آیکون، رنگ پس‌زمینه و ترتیب را تنظیم کنید.',
            'usage_fa' => 'کارت‌های شاخص در بخش عملکرد صفحهٔ اصلی نمایش داده می‌شوند؛ تیتر و پس‌زمینهٔ کلی در تنظیمات ظاهر صفحهٔ اصلی است.',
            'public_path' => '/',
            'related_admin_path' => '/admin/login-appearance',
        ],
        'categories' => [
            'description_fa' => 'دسته‌بندی پروژه‌ها و مشخصات دوزبانهٔ آن‌ها.',
            'usage_fa' => 'در فهرست و فیلتر پروژه‌های سایت استفاده می‌شود.',
            'public_path' => '/projects',
            'related_admin_path' => null,
        ],
        'faqs' => [
            'description_fa' => 'مدیریت پرسش‌ها و پاسخ‌های متداول، ترتیب و وضعیت انتشار.',
            'usage_fa' => 'در بخش پرسش‌های متداول سایت نمایش داده می‌شود.',
            'public_path' => '/faq',
            'related_admin_path' => null,
        ],
        'partners' => [
            'description_fa' => 'نام و لوگوی کارفرمایان و شرکای سازمان.',
            'usage_fa' => 'در اسلایدر شرکا و کارفرمایان سایت نمایش داده می‌شود.',
            'public_path' => '/',
            'related_admin_path' => null,
        ],
    ];

    private const FIELD_OPTIONS = [
        'banners.placement' => [
            ['value' => 'landing_mid', 'label_fa' => 'خانه · میان‌بخش‌ها', 'label_en' => 'Home · Mid-page'],
            ['value' => 'projects_top', 'label_fa' => 'پروژه‌ها · بالای فهرست', 'label_en' => 'Projects · Above list'],
            ['value' => 'services_bottom', 'label_fa' => 'خدمات · پایین فهرست', 'label_en' => 'Services · Below list'],
        ],
    ];

    private const FIELD_LABELS = [
        'id' => ['fa' => 'شناسه', 'en' => 'ID'],
        'slug' => ['fa' => 'شناسهٔ یکتا', 'en' => 'Slug'],
        'key' => ['fa' => 'کلید', 'en' => 'Key'],
        'event_key' => ['fa' => 'کلید رویداد', 'en' => 'Event key'],
        'url' => ['fa' => 'نشانی اینترنتی', 'en' => 'URL'],
        'image_url' => ['fa' => 'نشانی تصویر', 'en' => 'Image URL'],
        'logo_url' => ['fa' => 'نشانی لوگو', 'en' => 'Logo URL'],
        'file_url' => ['fa' => 'نشانی فایل', 'en' => 'File URL'],
        'document_url' => ['fa' => 'نشانی سند', 'en' => 'Document URL'],
        'attachment_url' => ['fa' => 'نشانی پیوست', 'en' => 'Attachment URL'],
        'website' => ['fa' => 'وب‌سایت', 'en' => 'Website'],
        'avatar_url' => ['fa' => 'نشانی تصویر نمایه', 'en' => 'Avatar URL'],
        'cover_image' => ['fa' => 'تصویر کاور', 'en' => 'Cover image'],
        'catalog_url' => ['fa' => 'نشانی کاتالوگ', 'en' => 'Catalog URL'],
        'canonical_url' => ['fa' => 'نشانی اصلی صفحه', 'en' => 'Canonical URL'],
        'meta_image' => ['fa' => 'تصویر اشتراک‌گذاری', 'en' => 'Social share image'],
        'cta_link' => ['fa' => 'پیوند دکمه', 'en' => 'Button link'],
        'name' => ['fa' => 'نام', 'en' => 'Name'],
        'title' => ['fa' => 'عنوان', 'en' => 'Title'],
        'subtitle' => ['fa' => 'زیرعنوان', 'en' => 'Subtitle'],
        'label' => ['fa' => 'برچسب', 'en' => 'Label'],
        'question' => ['fa' => 'پرسش', 'en' => 'Question'],
        'answer' => ['fa' => 'پاسخ', 'en' => 'Answer'],
        'description' => ['fa' => 'توضیحات', 'en' => 'Description'],
        'excerpt' => ['fa' => 'چکیده', 'en' => 'Excerpt'],
        'summary' => ['fa' => 'خلاصه', 'en' => 'Summary'],
        'content' => ['fa' => 'محتوا', 'en' => 'Content'],
        'body_html' => ['fa' => 'متن HTML ایمیل', 'en' => 'HTML email body'],
        'sms_text' => ['fa' => 'متن پیامک', 'en' => 'SMS text'],
        'meta_title' => ['fa' => 'عنوان سئو', 'en' => 'SEO title'],
        'meta_description' => ['fa' => 'توضیحات سئو', 'en' => 'SEO description'],
        'category' => ['fa' => 'دسته‌بندی', 'en' => 'Category'],
        'article_category_id' => ['fa' => 'دسته‌بندی مقاله', 'en' => 'Article category'],
        'client' => ['fa' => 'کارفرما', 'en' => 'Client'],
        'contract' => ['fa' => 'قرارداد', 'en' => 'Contract'],
        'location' => ['fa' => 'موقعیت', 'en' => 'Location'],
        'year' => ['fa' => 'سال', 'en' => 'Year'],
        'status' => ['fa' => 'وضعیت', 'en' => 'Status'],
        'standard' => ['fa' => 'استاندارد', 'en' => 'Standard'],
        'standards' => ['fa' => 'استانداردها', 'en' => 'Standards'],
        'image' => ['fa' => 'تصویر', 'en' => 'Image'],
        'logo' => ['fa' => 'لوگو', 'en' => 'Logo'],
        'cover' => ['fa' => 'تصویر کاور', 'en' => 'Cover image'],
        'author' => ['fa' => 'نویسنده', 'en' => 'Author'],
        'published' => ['fa' => 'زمان انتشار', 'en' => 'Published at'],
        'issuer' => ['fa' => 'صادرکننده', 'en' => 'Issuer'],
        'issue' => ['fa' => 'تاریخ صدور', 'en' => 'Issue date'],
        'expiry' => ['fa' => 'تاریخ انقضا', 'en' => 'Expiry date'],
        'code' => ['fa' => 'کد', 'en' => 'Code'],
        'document' => ['fa' => 'سند', 'en' => 'Document'],
        'requires_auth' => ['fa' => 'نیازمند دسترسی مجاز', 'en' => 'Requires authorization'],
        'link' => ['fa' => 'پیوند', 'en' => 'Link'],
        'cta' => ['fa' => 'دعوت به اقدام', 'en' => 'Call to action'],
        'cta_text' => ['fa' => 'متن دکمهٔ اقدام', 'en' => 'Call-to-action text'],
        'text' => ['fa' => 'متن', 'en' => 'Text'],
        'placement' => ['fa' => 'محل نمایش', 'en' => 'Placement'],
        'active' => ['fa' => 'فعال', 'en' => 'Active'],
        'is_active' => ['fa' => 'وضعیت انتشار', 'en' => 'Publishing status'],
        'is_featured' => ['fa' => 'پروژهٔ ویژه', 'en' => 'Featured item'],
        'sort_order' => ['fa' => 'ترتیب نمایش', 'en' => 'Sort order'],
        'start_year' => ['fa' => 'سال شروع', 'en' => 'Start year'],
        'end_year' => ['fa' => 'سال پایان', 'en' => 'End year'],
        'published_at' => ['fa' => 'زمان انتشار', 'en' => 'Published at'],
        'issue_date' => ['fa' => 'تاریخ صدور', 'en' => 'Issue date'],
        'expiry_date' => ['fa' => 'تاریخ انقضا', 'en' => 'Expiry date'],
        'value' => ['fa' => 'مقدار', 'en' => 'Value'],
        'suffix' => ['fa' => 'پسوند مقدار', 'en' => 'Value suffix'],
        'channel' => ['fa' => 'کانال ارسال', 'en' => 'Channel'],
        'subject' => ['fa' => 'موضوع', 'en' => 'Subject'],
        'icon' => ['fa' => 'آیکون', 'en' => 'Icon'],
        'sector' => ['fa' => 'حوزه فعالیت', 'en' => 'Sector'],
        'email' => ['fa' => 'ایمیل', 'en' => 'Email'],
        'phone' => ['fa' => 'تلفن', 'en' => 'Phone'],
        'experience_years' => ['fa' => 'سابقه (سال)', 'en' => 'Experience (years)'],
        'read_minutes' => ['fa' => 'زمان مطالعه (دقیقه)', 'en' => 'Reading time (minutes)'],
        'parent' => ['fa' => 'واحد بالادستی', 'en' => 'Parent department'],
        'head_name' => ['fa' => 'نام مسئول', 'en' => 'Manager name'],
        'head_title' => ['fa' => 'سمت مسئول', 'en' => 'Manager title'],
        'color' => ['fa' => 'رنگ', 'en' => 'Color'],
        'member_count' => ['fa' => 'تعداد اعضا', 'en' => 'Member count'],
        'department' => ['fa' => 'واحد سازمانی', 'en' => 'Department'],
        'role' => ['fa' => 'سمت', 'en' => 'Role'],
        'model_code' => ['fa' => 'کد مدل', 'en' => 'Model code'],
        'pressure_rating' => ['fa' => 'ردهٔ فشار', 'en' => 'Pressure rating'],
        'specs' => ['fa' => 'مشخصات فنی (فارسی)', 'en' => 'Specifications (Persian)'],
        'specs_en' => ['fa' => 'مشخصات فنی (انگلیسی)', 'en' => 'Specifications (English)'],
        'background_color' => ['fa' => 'رنگ پس‌زمینهٔ کارت', 'en' => 'Card background color'],
        'catalog' => ['fa' => 'کاتالوگ', 'en' => 'Catalog'],
        'metadata' => ['fa' => 'اطلاعات تکمیلی', 'en' => 'Metadata'],
        'seo' => ['fa' => 'تنظیمات سئو', 'en' => 'SEO settings'],
        'parent_id' => ['fa' => 'شناسهٔ واحد بالادستی', 'en' => 'Parent department ID'],
        'department_id' => ['fa' => 'شناسهٔ واحد سازمانی', 'en' => 'Department ID'],
    ];

    private const ENUM_LABELS = [
        'email' => ['fa' => 'ایمیل', 'en' => 'Email'],
        'sms' => ['fa' => 'پیامک', 'en' => 'SMS'],
        'in_app' => ['fa' => 'داخل سامانه', 'en' => 'In-app'],
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

    public static function resourceLabel(string $resource): array
    {
        return self::RESOURCE_LABELS[$resource] ?? ['fa' => $resource, 'en' => str_replace('-', ' ', $resource)];
    }

    public static function resourceGuidance(string $resource): array
    {
        return self::RESOURCE_GUIDANCE[$resource] ?? [
            'description_fa' => 'افزودن، جست‌وجو، ویرایش و حذف اطلاعات این بخش.',
            'usage_fa' => 'این اطلاعات در بخش مرتبط سایت و پنل مدیریت استفاده می‌شود.',
            'public_path' => null,
            'related_admin_path' => null,
        ];
    }

    public static function fieldOptions(string $resource, string $field): array
    {
        return self::FIELD_OPTIONS[$resource.'.'.$field] ?? [];
    }

    public static function fieldLabel(string $field): array
    {
        $language = null;
        $base = $field;

        if (str_ends_with($field, '_fa')) {
            $language = 'fa';
            $base = substr($field, 0, -3);
        } elseif (str_ends_with($field, '_en')) {
            $language = 'en';
            $base = substr($field, 0, -3);
        }

        $label = self::FIELD_LABELS[$base] ?? [
            'fa' => 'اطلاعات '.str_replace('_', ' ', $base),
            'en' => ucwords(str_replace('_', ' ', $base)),
        ];

        if ($language === 'fa') {
            return ['fa' => $label['fa'].' (فارسی)', 'en' => $label['en'].' (Persian)'];
        }
        if ($language === 'en') {
            return ['fa' => $label['fa'].' (انگلیسی)', 'en' => $label['en'].' (English)'];
        }

        return $label;
    }

    public static function enumLabel(string $value): array
    {
        return self::ENUM_LABELS[$value] ?? ['fa' => $value, 'en' => ucwords(str_replace('_', ' ', $value))];
    }
}
