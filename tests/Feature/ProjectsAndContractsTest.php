<?php

use Database\Seeders\DatabaseSeeder;
use App\Enums\ProjectStatusEnum;
use App\Models\Article;
use App\Models\Banner;
use App\Models\Department;
use App\Models\Faq;
use App\Models\Kpi;
use App\Models\NotificationTemplate;
use App\Models\Page;
use App\Models\Partner;
use App\Models\Project;
use App\Models\Product;
use App\Models\ProjectCategory;
use App\Models\Service;
use App\Models\TeamMember;

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

    $this->getJson('/api/v1/projects?' . http_build_query([
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
    $this->getJson('/api/v1' . $path . '?per_page=1')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('meta.per_page', 1)
        ->assertJsonPath('meta.current_page', 1);
    }

    foreach (['/services', '/faqs'] as $path) {
    $this->getJson('/api/v1' . $path . '?per_page=1&page=2')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('meta.current_page', 2);
    }

    $product = Product::query()->firstOrFail();
    $this->getJson('/api/v1/products?category=' . urlencode($product->category_en) . '&per_page=1')
    ->assertOk()
    ->assertJsonFragment(['id' => $product->id]);
    $this->getJson('/api/v1/products/filters')
    ->assertOk()
    ->assertJsonFragment(['category_en' => $product->category_en]);
});

it('returns pagination metadata consistently for endpoints backed by raw Laravel paginators', function (): void {
    $article = Article::query()->firstOrFail();

    $this->getJson('/api/v1/articles/' . $article->slug . '/comments?per_page=1')
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

it('rejects public messages that fill the honeypot field', function (): void {
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
