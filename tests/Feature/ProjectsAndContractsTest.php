<?php

use App\Enums\ProjectStatusEnum;
use App\Models\Article;
use App\Models\Banner;
use App\Models\Contract;
use App\Models\Department;
use App\Models\Faq;
use App\Models\Kpi;
use App\Models\NotificationTemplate;
use App\Models\Page;
use App\Models\Partner;
use App\Models\Product;
use App\Models\Project;
use App\Models\ProjectCategory;
use App\Models\Service;
use App\Models\TeamMember;
use Database\Seeders\DatabaseSeeder;

beforeEach(fn () => $this->seed(DatabaseSeeder::class));

it('lists and searches projects and blocks unauthorized project creation', function (): void {
    $this->getJson('/api/v1/projects?q=سرچاهی')
        ->assertOk()
        ->assertJsonCount(2, 'data')
        ->assertJsonPath('meta.last_page', 1)
        ->assertJsonFragment(['slug' => 'nisoc-surface-safety-valve-wellhead']);

    $this->postJson('/api/v1/admin/projects', [
        'title_fa' => 'Unauthorized',
    ])->assertUnauthorized();
});

it('filters projects in both languages and exposes complete filter metadata', function (): void {
    $project = Project::query()->firstOrFail();

    $this->getJson('/api/v1/projects?'.http_build_query([
        'client' => $project->client_name_en,
        'location' => $project->location_en,
        'contract_type' => $project->contract_type_en,
        'status' => $project->status->value,
        'year' => $project->year,
        'category_id' => $project->category_id,
        'q' => $project->contract_number,
    ]))->assertOk()
        ->assertJsonFragment(['id' => $project->id]);

    $this->getJson('/api/v1/projects/filters')
        ->assertOk()
        ->assertJsonFragment(['slug' => $project->category->slug])
        ->assertJsonFragment(['client_name_en' => $project->client_name_en])
        ->assertJsonFragment(['location_en' => $project->location_en])
        ->assertJsonFragment(['contract_type_en' => $project->contract_type_en]);
});

it('creates model factories with their required aggregate relations', function (): void {
    $project = Project::factory()->create();

    expect($project->category)->not->toBeNull()
        ->and($project->category_id)->toBe($project->category->id)
        ->and(Faq::factory()->create()->exists)->toBeTrue()
        ->and(Service::factory()->create()->exists)->toBeTrue()
        ->and(Product::factory()->create()->exists)->toBeTrue()
        ->and(Article::factory()->create()->exists)->toBeTrue()
        ->and(Partner::factory()->create()->exists)->toBeTrue()
        ->and(Department::factory()->create()->exists)->toBeTrue()
        ->and(TeamMember::factory()->create()->exists)->toBeTrue()
        ->and(Page::factory()->create()->exists)->toBeTrue()
        ->and(Banner::factory()->create()->exists)->toBeTrue()
        ->and(Kpi::factory()->create()->exists)->toBeTrue()
        ->and(NotificationTemplate::factory()->create()->exists)->toBeTrue();
});

it('paginates the administrative project list', function (): void {
    $token = $this->postJson('/api/v1/auth/login', loginPayloadWithCaptcha($this))
        ->assertOk()->json('token');

    $this->withToken($token)->getJson('/api/v1/admin/projects?per_page=1')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('meta.per_page', 1)
        ->assertJsonPath('meta.current_page', 1);
});

it('sorts administrative projects by an allowed field and direction', function (): void {
    $token = $this->postJson('/api/v1/auth/login', loginPayloadWithCaptcha($this))
        ->assertOk()->json('token');
    $first = Project::factory()->create(['title_fa' => 'SortUnique-A']);
    $second = Project::factory()->create(['title_fa' => 'SortUnique-B']);

    $this->withToken($token)
        ->getJson('/api/v1/admin/projects?q=SortUnique&sort_by=title_fa&sort_order=asc')
        ->assertOk()
        ->assertJsonPath('data.0.id', $first->id)
        ->assertJsonPath('data.1.id', $second->id);
});

it('searches administrative projects by category and returns a lean paginated row', function (): void {
    $token = $this->postJson('/api/v1/auth/login', loginPayloadWithCaptcha($this))
        ->assertOk()->json('token');
    $category = ProjectCategory::query()->create([
        'slug' => 'admin-search-category',
        'name_fa' => 'دسته فنی ویژه جست‌وجو',
        'name_en' => 'Unique search category',
        'icon' => 'Layers',
        'color' => '#123456',
    ]);
    $project = Project::factory()->create([
        'category_id' => $category->id,
        'title_fa' => 'پروژه با شرح طولانی',
        'description_fa' => str_repeat('شرح فنی ', 100),
    ]);

    $this->withToken($token)
        ->getJson('/api/v1/admin/projects?q='.urlencode($category->name_fa).'&per_page=1')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.id', $project->id)
        ->assertJsonPath('data.0.category.name_fa', $category->name_fa)
        ->assertJsonPath('meta.per_page', 1)
        ->assertJsonPath('meta.total', 1)
        ->assertJsonMissingPath('data.0.description_fa');

    $this->withToken($token)
        ->getJson('/api/v1/admin/projects/'.$project->id)
        ->assertOk()
        ->assertJsonPath('data.id', $project->id)
        ->assertJsonPath('data.description_fa', $project->description_fa);
});

it('returns live project status totals without contract value on the dashboard', function (): void {
    Project::factory()->count(2)->create(['status' => ProjectStatusEnum::IN_PROGRESS->value]);

    $token = $this->postJson('/api/v1/auth/login', loginPayloadWithCaptcha($this))
        ->assertOk()
        ->json('token');
    $response = $this->withToken($token)->getJson('/api/v1/admin/dashboard')
        ->assertOk()
        ->assertJsonMissingPath('stats.contracts_total_billion_irr');

    foreach (ProjectStatusEnum::cases() as $index => $status) {
        $response->assertJsonPath("charts.byStatus.{$index}.name", $status->labelFa())
            ->assertJsonPath(
                "charts.byStatus.{$index}.count",
                Project::query()->where('status', $status->value)->count(),
            );
    }
});

it('paginates public catalog, services, FAQs and news and returns complete product filter options', function (): void {
    Service::factory()->count(2)->create();
    Faq::factory()->count(2)->create();

    foreach (['/products', '/services', '/contracts', '/licenses', '/partners', '/faqs', '/articles'] as $path) {
        $this->getJson('/api/v1'.$path.'?per_page=1')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('meta.per_page', 1)
            ->assertJsonPath('meta.current_page', 1);
    }

    foreach (['/services', '/faqs'] as $path) {
        $this->getJson('/api/v1'.$path.'?per_page=1&page=2')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('meta.current_page', 2);
    }

    $product = Product::query()->firstOrFail();
    $this->getJson('/api/v1/products?category='.urlencode($product->category_en).'&per_page=1')
        ->assertOk()
        ->assertJsonFragment(['id' => $product->id]);
    $this->getJson('/api/v1/products/filters')
        ->assertOk()
        ->assertJsonFragment(['category_en' => $product->category_en]);
});

it('searches and sorts public contracts in the database before pagination', function (): void {
    $first = Contract::factory()->create(['contract_number' => 'PublicSortUnique-A']);
    Contract::factory()->create(['contract_number' => 'PublicSortUnique-B']);

    $this->getJson('/api/v1/contracts?q=PublicSortUnique&sort_by=contract_number&sort_dir=asc&per_page=1')
        ->assertOk()
        ->assertJsonPath('data.0.id', $first->id)
        ->assertJsonPath('meta.total', 2)
        ->assertJsonPath('meta.per_page', 1);
});

it('returns pagination metadata consistently for endpoints backed by raw Laravel paginators', function (): void {
    $article = Article::query()->firstOrFail();

    $this->getJson('/api/v1/articles/'.$article->slug.'/comments?per_page=1')
        ->assertOk()
        ->assertJsonStructure(['data', 'meta' => ['current_page', 'last_page', 'per_page', 'total']])
        ->assertJsonMissingPath('last_page');

    $token = $this->postJson('/api/v1/auth/login', loginPayloadWithCaptcha($this))
        ->assertOk()->json('token');

    $this->withToken($token)->getJson('/api/v1/notifications?per_page=1')
        ->assertOk()
        ->assertJsonStructure(['data', 'meta' => ['current_page', 'last_page', 'per_page', 'total']]);

    foreach ([
        '/api/v1/admin/comments?per_page=1',
        '/api/v1/admin/messages?per_page=1',
        '/api/v1/admin/notifications?per_page=1',
        '/api/v1/admin/media?per_page=1',
    ] as $path) {
        $this->withToken($token)->getJson($path)
            ->assertOk()
            ->assertJsonStructure(['data', 'meta' => ['current_page', 'last_page', 'per_page', 'total']]);
    }
});

it('allows authenticated super admin to create projects and submit RFQ messages', function (): void {
    config([
        'captcha.public.math' => false,
        'captcha.public.characters' => ['a'],
        'captcha.public.length' => 1,
    ]);
    $captcha = $this->getJson('/captcha/api/public')
        ->assertOk()
        ->assertJsonStructure(['key', 'img'])
        ->json();

    $rfqMessage = [
        'name' => 'مهندس رضایی',
        'email' => 'rezaei@nisoc.ir',
        'phone' => '09161234567',
        'company' => 'NISOC',
        'subject' => 'استعلام قیمت گیت ولو سرچاهی',
        'message' => 'درخواست پیش‌فاکتور ۱۰ دستگاه گیت ولو ۳ اینچ ۱۰۰۰۰ PSI',
        'type' => 'rfq',
        'website' => '',
    ];

    $this->withServerVariables(['REMOTE_ADDR' => '198.51.100.'.random_int(1, 254)]);
    $this->postJson('/api/v1/contact', $rfqMessage + [
        'captcha_key' => $captcha['key'],
        'captcha' => 'wrong',
    ])->assertUnprocessable()->assertJsonValidationErrors('captcha');

    $captcha = $this->getJson('/captcha/api/public')->assertOk()->json();
    $this->postJson('/api/v1/contact', $rfqMessage + [
        'captcha_key' => $captcha['key'],
        'captcha' => 'a',
    ])->assertCreated();

    $token = $this->postJson('/api/v1/auth/login', loginPayloadWithCaptcha($this))->json('token');
    $categoryId = ProjectCategory::query()->firstOrFail()->id;

    $this->withToken($token)->postJson('/api/v1/admin/projects', [
        'title_fa' => 'تأمین اسپول سرچاهی میدان منصوری',
        'title_en' => 'Mansouri Field Wellhead Spools',
        'category_id' => $categoryId,
        'client_name_fa' => 'شرکت ملی مناطق نفت‌خیز جنوب',
        'client_name_en' => 'NISOC',
        'contract_number' => 'PPA-1404-99',
        'year' => 1404,
        'status' => 'in_progress',
        'summary_fa' => 'ساخت بر اساس استاندارد API 6A',
        'cover_image' => '/storage/products/christmas-tree.jpg',
        'is_featured' => true,
    ])->assertCreated();
});

it('creates, edits, and returns project gallery images, videos, and documents', function (): void {
    $token = $this->postJson('/api/v1/auth/login', loginPayloadWithCaptcha($this))
        ->assertOk()
        ->json('token');
    $categoryId = ProjectCategory::query()->firstOrFail()->id;

    $created = $this->withToken($token)->postJson('/api/v1/admin/projects', [
        'slug' => 'project-media-editor-test',
        'title_fa' => 'پروژهٔ دارای رسانه',
        'title_en' => 'Project with media',
        'category_id' => $categoryId,
        'client_name_fa' => 'کارفرمای آزمایشی',
        'client_name_en' => 'Test client',
        'contract_number' => 'PPA-TEST-MEDIA-1',
        'year' => 1404,
        'status' => 'in_progress',
        'summary_fa' => 'خلاصه پروژه',
        'cover_image' => '/storage/projects/cover.jpg',
        'images' => ['/storage/projects/gallery-1.jpg'],
        'videos' => ['/storage/videos/project-1.mp4'],
        'documents' => [[
            'title_fa' => 'مشخصات فنی',
            'title_en' => 'Technical specifications',
            'file_url' => '/storage/projects/specifications.pdf',
            'file_type' => 'PDF',
            'requires_auth' => false,
        ]],
    ])->assertCreated()
        ->assertJsonPath('images.0', '/storage/projects/gallery-1.jpg')
        ->assertJsonPath('videos.0', '/storage/videos/project-1.mp4')
        ->assertJsonPath('documents.0.title_en', 'Technical specifications');

    $projectId = $created->json('id');
    $this->withToken($token)->putJson("/api/v1/admin/projects/{$projectId}", [
        'videos' => ['/storage/videos/project-2.webm'],
        'images' => [],
        'documents' => [],
    ])->assertOk()
        ->assertJsonPath('images', [])
        ->assertJsonPath('videos.0', '/storage/videos/project-2.webm')
        ->assertJsonPath('documents', []);

    $this->withToken($token)->getJson("/api/v1/admin/projects/{$projectId}")
        ->assertOk()
        ->assertJsonPath('data.videos.0', '/storage/videos/project-2.webm');
});

it('rejects public messages that fill the honeypot field', function (): void {
    $this->withServerVariables(['REMOTE_ADDR' => '198.51.100.'.random_int(1, 254)]);
    $this->postJson('/api/v1/contact', [
        'name' => 'Automated sender',
        'email' => 'bot@example.test',
        'phone' => '09120000000',
        'subject' => 'Spam submission',
        'message' => 'Automated form submission',
        'type' => 'contact',
        'website' => 'https://spam.example.test',
    ])->assertUnprocessable()
        ->assertJsonValidationErrors('website');
});
