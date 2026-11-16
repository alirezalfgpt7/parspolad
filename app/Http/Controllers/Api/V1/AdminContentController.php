<?php

namespace App\Http\Controllers\Api\V1;

use App\Exports\ActivityLogsExport;
use App\Exports\ContractsExport;
use App\Exports\ProjectsExport;
use App\Http\Controllers\Controller;
use Illuminate\Database\Eloquent\Model;
use App\Models\Article;
use App\Models\Banner;
use App\Models\ContactMessage;
use App\Models\Contract;
use App\Models\Department;
use App\Models\Faq;
use App\Models\Kpi;
use App\Models\License;
use App\Models\Menu;
use App\Models\MenuItem;
use App\Models\Notification;
use App\Models\NotificationTemplate;
use App\Models\Page;
use App\Models\Partner;
use App\Models\Product;
use App\Models\Project;
use App\Models\ProjectCategory;
use App\Models\Service;
use App\Models\Slide;
use App\Models\Slider;
use App\Models\TeamMember;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Maatwebsite\Excel\Facades\Excel;
use Spatie\Activitylog\Models\Activity;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class AdminContentController extends Controller
{
    private const COLLECTIONS = [
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

    private const PERMISSIONS = [
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

    private const REQUIRED_FIELDS = [
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

    public function index(Request $request, string $resource): JsonResponse
    {
        $this->ensureResourcePermission($request, $resource);
        $modelClass = $this->modelFor($resource);
        $query = $modelClass::query();

        if ($resource === 'articles') {
            $query->orderByDesc('published_at');
        } elseif ($resource === 'kpis' || $resource === 'faqs') {
            $query->orderBy('sort_order');
        } else {
            $query->orderBy('id');
        }

        return response()->json(['data' => $query->get()]);
    }

    public function schema(Request $request, string $resource): JsonResponse
    {
        $this->ensureResourcePermission($request, $resource);
        $model = new ($this->modelFor($resource));
        $schema = $model->getConnection()->getSchemaBuilder();
        $columns = collect($schema->getColumns($model->getTable()))->keyBy('name');
        $fields = [];

        foreach ($model->getFillable() as $field) {
            $cast = $model->getCasts()[$field] ?? null;
            $column = $columns->get($field, []);
            $columnType = $column['type_name'] ?? $column['type'] ?? $schema->getColumnType($model->getTable(), $field);
            $type = match (true) {
                in_array($cast, ['boolean', 'bool'], true) => 'boolean',
                in_array($cast, ['array', 'json', 'object', 'collection'], true) => 'json',
                in_array($cast, ['integer', 'int', 'float', 'double', 'decimal'], true) => 'number',
                in_array($columnType, ['boolean', 'bool'], true) => 'boolean',
                in_array($columnType, ['json', 'jsonb'], true) => 'json',
                preg_match('/int|decimal|numeric|float|double/', $columnType) === 1 => 'number',
                str_contains($columnType, 'text') => 'textarea',
                default => 'string',
            };

            $fields[] = [
                'name' => $field,
                'type' => $type,
                'required' => in_array($field, self::REQUIRED_FIELDS[$resource], true)
                    || (($column['nullable'] ?? true) === false && ($column['default'] ?? null) === null),
            ];
        }

        return response()->json(['data' => ['resource' => $resource, 'fields' => $fields]]);
    }

    public function store(Request $request, string $resource): JsonResponse
    {
        $this->ensureResourcePermission($request, $resource);
        $modelClass = $this->modelFor($resource);
        $model = new $modelClass;
        $request->validate($this->validationRules($resource, $model));
        $item = $modelClass::query()->create(Arr::only($request->all(), $model->getFillable()));

        return response()->json(['data' => $item], 201);
    }

    public function update(Request $request, string $resource, int $id): JsonResponse
    {
        $this->ensureResourcePermission($request, $resource);
        $modelClass = $this->modelFor($resource);
        $model = new $modelClass;
        $item = $modelClass::query()->findOrFail($id);
        $request->validate($this->validationRules($resource, $model, $id));
        $item->update(Arr::only($request->all(), $model->getFillable()));

        return response()->json(['data' => $item->fresh()]);
    }

    public function destroy(Request $request, string $resource, int $id): JsonResponse
    {
        $this->ensureResourcePermission($request, $resource);
        $modelClass = $this->modelFor($resource);
        $item = $modelClass::query()->findOrFail($id);

        if ($resource === 'categories' && $item->projects()->exists()) {
            abort(409, 'ابتدا پروژه‌های وابسته به این دسته را منتقل یا حذف کنید.');
        }

        if ($resource === 'departments' && ($item->children()->exists() || $item->members()->exists())) {
            abort(409, 'ابتدا زیرواحدها و اعضای وابسته به این واحد را منتقل یا حذف کنید.');
        }

        $item->delete();

        return response()->json(['ok' => true]);
    }

    public function dashboard(Request $request): JsonResponse
    {
        $this->ensurePermission($request, 'dashboard.view');
        $byCategory = ProjectCategory::query()
            ->withCount('projects')
            ->get()
            ->map(fn (ProjectCategory $category): array => [
                'name' => $category->name_fa,
                'color' => $category->color,
                'count' => $category->projects_count,
            ]);

        $recentMessages = ContactMessage::query()->latest()->limit(5)->get();
        $recentLogs = Activity::query()->latest()->limit(8)->get()->map(fn (Activity $activity): array => [
            'user_name' => $activity->causer?->name ?? 'سامانه',
            'action' => $activity->description,
            'subject_type' => $activity->subject_type,
            'subject_label' => $activity->subject?->title_fa ?? $activity->subject?->name ?? '',
            'ip_address' => $activity->properties['ip_address'] ?? '',
            'created_at' => $activity->created_at,
        ]);

        return response()->json([
            'stats' => [
                'projects_count' => Project::query()->count(),
                'contracts_count' => Contract::query()->count(),
                'contracts_total_billion_irr' => Contract::query()->sum('amount_billion_irr'),
                'licenses_count' => License::query()->count(),
                'new_messages_count' => ContactMessage::query()->where('status', 'new')->count(),
                'users_count' => User::query()->count(),
            ],
            'charts' => ['byCategory' => $byCategory, 'byYear' => []],
            'recent_messages' => $recentMessages,
            'recent_logs' => $recentLogs,
            'notifications' => Notification::query()->latest()->limit(6)->get(),
        ]);
    }

    public function sliders(Request $request): JsonResponse
    {
        $this->ensurePermission($request, 'slider.manage');

        return response()->json(['data' => Slider::query()->with('slides')->orderBy('id')->get()]);
    }

    public function updateSlides(Request $request, Slider $slider): JsonResponse
    {
        $this->ensurePermission($request, 'slider.manage');
        $data = $request->validate(['slides' => ['required', 'array']]);
        $fillable = (new Slide)->getFillable();

        DB::transaction(function () use ($data, $fillable, $slider): void {
            $retainedIds = [];

            foreach ($data['slides'] as $index => $slideData) {
                $slide = null;
                if (isset($slideData['id'])) {
                    $slide = $slider->slides()->whereKey($slideData['id'])->first();
                }

                $attributes = Arr::only($slideData, $fillable);
                $attributes['sort_order'] = $index + 1;
                $attributes['slider_id'] = $slider->id;

                if ($slide) {
                    $slide->update($attributes);
                } else {
                    $slide = $slider->slides()->create($attributes);
                }
                $retainedIds[] = $slide->id;
            }

            $slider->slides()->whereNotIn('id', $retainedIds)->delete();
        });

        return response()->json(['data' => $slider->fresh()->load('slides')]);
    }

    public function menus(Request $request): JsonResponse
    {
        $this->ensurePermission($request, 'menus.manage');

        return response()->json(['data' => Menu::query()->with('items.children')->orderBy('id')->get()]);
    }

    public function updateMenu(Request $request, Menu $menu): JsonResponse
    {
        $this->ensurePermission($request, 'menus.manage');
        $data = $request->validate(['items' => ['required', 'array']]);

        DB::transaction(function () use ($data, $menu): void {
            $retainedIds = [];
            $sync = function (array $items, ?int $parentId = null) use (&$sync, &$retainedIds, $menu): void {
                foreach ($items as $itemData) {
                    $item = isset($itemData['id'])
                        ? MenuItem::query()->where('menu_id', $menu->id)->find($itemData['id'])
                        : null;
                    $attributes = Arr::only($itemData, (new MenuItem)->getFillable());
                    unset($attributes['id'], $attributes['children']);
                    $attributes['menu_id'] = $menu->id;
                    $attributes['parent_id'] = $parentId;

                    if ($item) {
                        $item->update($attributes);
                    } else {
                        $item = MenuItem::query()->create($attributes);
                    }

                    $retainedIds[] = $item->id;
                    $sync($itemData['children'] ?? [], $item->id);
                }
            };

            $sync($data['items']);
            $query = MenuItem::query()->where('menu_id', $menu->id);
            if ($retainedIds === []) {
                $query->delete();
            } else {
                $query->whereNotIn('id', $retainedIds)->delete();
            }
        });

        return response()->json(['data' => $menu->fresh()->load('items.children')]);
    }

    public function exportReport(Request $request, string $entity): BinaryFileResponse
    {
        $this->ensurePermission($request, 'reports.export');

        return match ($entity) {
            'projects' => Excel::download(new ProjectsExport, 'parspolad-projects.xlsx'),
            'contracts' => Excel::download(new ContractsExport, 'parspolad-contracts.xlsx'),
            'logs' => Excel::download(new ActivityLogsExport, 'parspolad-activity-logs.xlsx'),
            default => abort(404, 'گزارش درخواستی یافت نشد.'),
        };
    }

    public function backup(Request $request): JsonResponse
    {
        $this->ensurePermission($request, 'settings.manage');
        $tables = [
            'settings',
            'theme_presets',
            'theme_settings',
            'sliders',
            'slides',
            'menus',
            'menu_items',
            'project_categories',
            'projects',
            'project_images',
            'project_videos',
            'project_documents',
            'contracts',
            'contract_documents',
            'licenses',
            'license_attachments',
            'services',
            'products',
            'departments',
            'team_members',
            'partners',
            'articles',
            'pages',
            'banners',
            'kpis',
            'contact_messages',
            'notifications',
            'notification_templates',
            'media_files',
            'activity_log',
        ];
        $data = [];
        foreach ($tables as $table) {
            $data[$table] = DB::table($table)->get();
        }
        $data['users'] = DB::table('users')
            ->select(['id', 'name', 'email', 'phone', 'avatar', 'is_active', 'created_at', 'updated_at'])
            ->get();

        return response()->json(['data' => $data], 200, [
            'Content-Disposition' => 'attachment; filename="parspolad-backup.json"',
        ]);
    }

    private function ensureResourcePermission(Request $request, string $resource): void
    {
        abort_unless(isset(self::PERMISSIONS[$resource]), 404);
        $this->ensurePermission($request, self::PERMISSIONS[$resource]);
    }

    private function ensurePermission(Request $request, string $permission): void
    {
        abort_unless($request->user()?->can($permission), 403);
    }

    private function validationRules(string $resource, Model $model, ?int $ignoreId = null): array
    {
        if ($resource === 'faqs') {
            return [
                'question_fa' => [$ignoreId === null ? 'required' : 'sometimes', 'string', 'max:500'],
                'answer_fa' => [$ignoreId === null ? 'required' : 'sometimes', 'string', 'max:10000'],
                'sort_order' => ['sometimes', 'integer', 'min:0'],
                'is_active' => ['sometimes', 'boolean'],
            ];
        }

        $requiredFields = self::REQUIRED_FIELDS[$resource];
        $columns = collect($model->getConnection()->getSchemaBuilder()->getColumns($model->getTable()))->keyBy('name');
        $uniqueFields = match ($resource) {
            'categories', 'services', 'products', 'articles', 'pages' => ['slug'],
            'kpis' => ['key'],
            'notification-templates' => ['event_key'],
            default => [],
        };
        $rules = [];

        foreach ($model->getFillable() as $field) {
            $column = $columns->get($field, []);
            $cast = $model->getCasts()[$field] ?? null;
            $columnType = strtolower((string) ($column['type_name'] ?? $column['type'] ?? ''));
            $isRequired = in_array($field, $requiredFields, true)
                || (($column['nullable'] ?? true) === false && ($column['default'] ?? null) === null);
            $fieldRules = $ignoreId === null
                ? [$isRequired ? 'required' : 'sometimes']
                : ($isRequired ? ['sometimes', 'required'] : ['sometimes']);

            if (! $isRequired) {
                $fieldRules[] = 'nullable';
            }

            if (in_array($cast, ['boolean', 'bool'], true) || in_array($columnType, ['boolean', 'bool'], true)) {
                $fieldRules[] = 'boolean';
            } elseif (in_array($cast, ['array', 'json', 'object', 'collection'], true) || in_array($columnType, ['json', 'jsonb'], true)) {
                $fieldRules[] = 'array';
            } elseif (in_array($cast, ['integer', 'int'], true) || preg_match('/int/', $columnType) === 1) {
                $fieldRules[] = 'integer';
            } elseif (preg_match('/decimal|numeric|float|double/', $columnType) === 1) {
                $fieldRules[] = 'numeric';
            } elseif (in_array($cast, ['float', 'double', 'decimal'], true)) {
                $fieldRules[] = 'numeric';
            } else {
                $fieldRules[] = 'string';
                $fieldRules[] = 'max:10000';
            }

            if (in_array($field, $uniqueFields, true)) {
                $unique = Rule::unique($model->getTable(), $field);
                if ($ignoreId !== null) {
                    $unique->ignore($ignoreId);
                }
                if (isset($columns['deleted_at'])) {
                    $unique->withoutTrashed();
                }
                $fieldRules[] = $unique;
            }

            $rules[$field] = $fieldRules;
        }

        return $rules;
    }

    private function modelFor(string $resource): string
    {
        abort_unless(isset(self::COLLECTIONS[$resource]), 404);

        return self::COLLECTIONS[$resource];
    }
}
