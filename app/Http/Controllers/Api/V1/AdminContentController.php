<?php

namespace App\Http\Controllers\Api\V1;

use App\Exports\ActivityLogsExport;
use App\Exports\ContractsExport;
use App\Exports\ProjectsExport;
use App\Enums\SlideEffectEnum;
use App\Enums\SlideTextAnimationEnum;
use App\Http\Controllers\Controller;
use App\Http\Requests\AdminContent\StoreAdminContentRecordRequest;
use App\Http\Requests\AdminContent\UpdateAdminContentRecordRequest;
use App\Http\Resources\AdminContentRecordResource;
use App\Support\AdminContentRegistry;
use App\Services\DatabaseBackupService;
use Illuminate\Support\Arr;
use App\Models\Article;
use App\Models\ArticleCategory;
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
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Maatwebsite\Excel\Facades\Excel;
use Spatie\Activitylog\Models\Activity;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class AdminContentController extends Controller
{
    public function resources(Request $request): JsonResponse
    {
        $resources = collect(AdminContentRegistry::MODELS)
            ->filter(fn (string $modelClass, string $resource): bool =>
                $request->user()?->can(AdminContentRegistry::permission($resource)) ?? false
            )
            ->map(function (string $modelClass, string $resource): array {
                return [
                    'key' => $resource,
                    'label_fa' => AdminContentRegistry::resourceLabel($resource)['fa'],
                    'label_en' => AdminContentRegistry::resourceLabel($resource)['en'],
                    ...AdminContentRegistry::resourceGuidance($resource),
                    'count' => $modelClass::query()->count(),
                ];
            })
            ->values();

        return response()->json(['data' => $resources]);
    }

    public function index(Request $request, string $resource): JsonResponse
    {
        $this->ensureResourcePermission($request, $resource);
        $modelClass = AdminContentRegistry::modelClass($resource);
        $query = $modelClass::query();
        $data = $request->validate([
            'search' => ['sometimes', 'nullable', 'string', 'max:120'],
            'sort_by' => ['sometimes', 'nullable', 'string', 'max:64'],
            'sort_order' => ['sometimes', 'nullable', Rule::in(['asc', 'desc'])],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
        ]);

        if (($search = trim((string) ($data['search'] ?? ''))) !== '') {
            $model = new $modelClass;
            $schema = $model->getConnection()->getSchemaBuilder();
            $searchableFields = collect($model->getFillable())
                ->filter(function (string $field) use ($model, $schema): bool {
                    $type = strtolower($schema->getColumnType($model->getTable(), $field));

                    return str_contains($type, 'char') || str_contains($type, 'text');
                })
                ->values();

            if ($searchableFields->isNotEmpty()) {
                $query->where(function ($nested) use ($searchableFields, $search): void {
                    foreach ($searchableFields as $field) {
                        $nested->orWhere($field, 'like', '%'.$search.'%');
                    }
                });
            }
        }

        $sortBy = $data['sort_by'] ?? null;
        if ($sortBy !== null && $sortBy !== '') {
            abort_unless($sortBy === 'id' || in_array($sortBy, (new $modelClass)->getFillable(), true), 422, 'ستون مرتب‌سازی معتبر نیست.');
            $query->orderBy($sortBy, $data['sort_order'] ?? 'asc');
        } elseif ($resource === 'articles') {
            $query->orderByDesc('published_at');
        } elseif (in_array($resource, ['kpis', 'faqs', 'departments', 'team'], true)) {
            $query->orderBy('sort_order');
            if ($resource === 'departments' || $resource === 'team') {
                $query->orderBy('id');
            }
        } else {
            $query->orderBy('id');
        }

        $perPage = min(max($request->integer('per_page', 20), 1), 100);

        return AdminContentRecordResource::collection(
            $query->paginate($perPage)->withQueryString(),
        )->response();
    }

    public function schema(Request $request, string $resource): JsonResponse
    {
        $this->ensureResourcePermission($request, $resource);
        $model = new (AdminContentRegistry::modelClass($resource));
        $schema = $model->getConnection()->getSchemaBuilder();
        $columns = collect($schema->getColumns($model->getTable()))->keyBy('name');
        $uniqueFields = collect($schema->getIndexes($model->getTable()))
            ->filter(fn (array $index): bool => (bool) ($index['unique'] ?? false))
            ->flatMap(fn (array $index): array => $index['columns'] ?? [])
            ->all();
        $fields = [];

        foreach ($model->getFillable() as $field) {
            if ($resource === 'articles' && in_array($field, ['category_fa', 'category_en'], true)) {
                continue;
            }

            $cast = $model->getCasts()[$field] ?? null;
            $column = $columns->get($field, []);
            $columnType = $column['type_name'] ?? $column['type'] ?? $schema->getColumnType($model->getTable(), $field);
            $columnTypeLower = strtolower((string) $columnType);
            $fieldOptions = AdminContentRegistry::fieldOptions($resource, $field);
            if ($resource === 'articles' && $field === 'article_category_id') {
                $fieldOptions = ArticleCategory::query()
                    ->orderBy('name_fa')
                    ->get(['id', 'name_fa', 'name_en'])
                    ->map(fn (ArticleCategory $category): array => [
                        'value' => (string) $category->id,
                        'label_fa' => $category->name_fa,
                        'label_en' => $category->name_en,
                    ])
                    ->all();
            }
            $type = match (true) {
                $resource === 'articles' && $field === 'article_category_id' => 'select',
                $fieldOptions !== [] => 'select',
                is_string($cast) && enum_exists($cast) => 'select',
                in_array($cast, ['boolean', 'bool'], true) => 'boolean',
                in_array($cast, ['array', 'json', 'object', 'collection'], true) => 'json',
                in_array($cast, ['integer', 'int', 'float', 'double', 'decimal'], true) => 'number',
                in_array($columnType, ['boolean', 'bool'], true) => 'boolean',
                in_array($columnType, ['json', 'jsonb'], true) => 'json',
                preg_match('/int|decimal|numeric|float|double/', $columnTypeLower) === 1 => 'number',
                $field === 'published_at' => 'jalali-date',
                str_contains($columnTypeLower, 'datetime') || str_contains($columnTypeLower, 'timestamp') => 'datetime',
                str_contains($columnTypeLower, 'date') => 'date',
                str_contains($field, 'color') => 'color',
                in_array($field, ['content_fa', 'content_en'], true) => 'richtext',
                str_contains($columnTypeLower, 'text') => 'textarea',
                default => 'string',
            };

            $options = $fieldOptions;
            if ($resource === 'banners' && $field === 'placement') {
                $knownValues = array_column($options, 'value');
                foreach (DB::table($model->getTable())->distinct()->pluck($field)->filter() as $existingValue) {
                    $existingValue = (string) $existingValue;
                    if (! in_array($existingValue, $knownValues, true)) {
                        $options[] = [
                            'value' => $existingValue,
                            'label_fa' => 'موقعیت موجود: '.$existingValue,
                            'label_en' => 'Existing placement: '.$existingValue,
                        ];
                    }
                }
            }
            if ($type === 'select' && $options === [] && is_string($cast) && enum_exists($cast)) {
                $options = array_map(function ($case): array {
                    $value = $case instanceof \BackedEnum ? (string) $case->value : $case->name;
                    $label = AdminContentRegistry::enumLabel($value);

                    return ['value' => $value, 'label_fa' => $label['fa'], 'label_en' => $label['en']];
                }, $cast::cases());
            }

            $fields[] = [
                'name' => $field,
                'label_fa' => AdminContentRegistry::fieldLabel($field)['fa'],
                'label_en' => AdminContentRegistry::fieldLabel($field)['en'],
                'type' => $type,
                'options' => $options,
                'unique' => in_array($field, $uniqueFields, true),
                'required' => in_array($field, AdminContentRegistry::requiredFields($resource), true)
                    || (($column['nullable'] ?? true) === false && ($column['default'] ?? null) === null),
            ];
        }

        return response()->json(['data' => ['resource' => $resource, 'fields' => $fields]]);
    }

    public function store(StoreAdminContentRecordRequest $request, string $resource): JsonResponse
    {
        $modelClass = AdminContentRegistry::modelClass($resource);
        $model = new $modelClass;
        $data = $request->safe()->only($model->getFillable());
        $this->applyArticleCategory($resource, $data);
        $item = $modelClass::query()->create($data);

        return response()->json(['data' => (new AdminContentRecordResource($item))->resolve($request)], 201);
    }

    public function update(UpdateAdminContentRecordRequest $request, string $resource, int $id): JsonResponse
    {
        $modelClass = AdminContentRegistry::modelClass($resource);
        $model = new $modelClass;
        $item = $modelClass::query()->findOrFail($id);
        $data = $request->safe()->only($model->getFillable());
        $this->applyArticleCategory($resource, $data);
        $item->update($data);

        return response()->json([
            'data' => (new AdminContentRecordResource($item->fresh()))->resolve($request),
        ]);
    }

    public function destroy(Request $request, string $resource, int $id): JsonResponse
    {
        $this->ensureResourcePermission($request, $resource, 'delete');
        $modelClass = AdminContentRegistry::modelClass($resource);
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
        $data = $request->validate([
            'slides' => ['required', 'array'],
            'slides.*' => ['required', 'array'],
            'slides.*.id' => [
                'sometimes',
                'integer',
                Rule::exists('slides', 'id')->where('slider_id', $slider->id),
            ],
            'slides.*.title_fa' => ['required', 'string', 'max:255'],
            'slides.*.title_en' => ['required', 'string', 'max:255'],
            'slides.*.subtitle_fa' => ['nullable', 'string', 'max:500'],
            'slides.*.subtitle_en' => ['nullable', 'string', 'max:500'],
            'slides.*.cta_text_fa' => ['nullable', 'string', 'max:120'],
            'slides.*.cta_text_en' => ['nullable', 'string', 'max:120'],
            'slides.*.cta_link' => [
                'nullable',
                'string',
                'max:255',
                static function ($attribute, $value, $fail): void {
                    if (!str_starts_with($value, '/') || str_starts_with($value, '//')) {
                        $fail('پیوند اسلاید باید یک مسیر داخلی معتبر باشد.');
                    }
                },
            ],
            'slides.*.media_type' => ['required', 'in:image,video'],
            'slides.*.desktop_media' => ['required', 'string', 'max:255'],
            'slides.*.mobile_media' => ['nullable', 'string', 'max:255'],
            'slides.*.text_position' => ['required', 'in:right,center,left'],
            'slides.*.text_color' => ['required', 'string', 'max:20'],
            'slides.*.button_color' => ['required', 'string', 'max:20'],
            'slides.*.overlay_gradient' => ['nullable', 'string', 'max:255'],
            'slides.*.duration_ms' => ['required', 'integer', 'min:3000', 'max:30000'],
            'slides.*.effect' => ['required', new \Illuminate\Validation\Rules\Enum(SlideEffectEnum::class)],
            'slides.*.text_animation' => ['required', new \Illuminate\Validation\Rules\Enum(SlideTextAnimationEnum::class)],
            'slides.*.particles_enabled' => ['required', 'boolean'],
            'slides.*.sort_order' => ['required', 'integer', 'min:0'],
            'slides.*.is_active' => ['required', 'boolean'],
        ]);
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
        $data = $request->validate([
            'items' => ['required', 'array'],
            'items.*.icon' => ['nullable', 'string', 'max:60'],
            'items.*.children' => ['sometimes', 'array'],
            'items.*.children.*' => ['array'],
            'items.*.children.*.icon' => ['nullable', 'string', 'max:60'],
        ]);
        $items = $request->input('items');

        DB::transaction(function () use ($items, $menu): void {
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

            $sync($items);
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

    public function backupTables(Request $request, DatabaseBackupService $backups): JsonResponse
    {
        $this->ensureSuperAdmin($request);

        return response()->json(['data' => $backups->catalog()]);
    }

    public function backup(Request $request, DatabaseBackupService $backups)
    {
        $this->ensureSuperAdmin($request);
        $data = $request->validate([
            'tables' => ['sometimes', 'array', 'min:1'],
            'tables.*' => ['required', 'string', 'distinct'],
        ]);
        $tables = $backups->selectedTables($data['tables'] ?? null);
        $isComplete = count($tables) === count($backups->tableNames());
        $createdAt = now()->toIso8601String();
        $filename = 'parspolad-backup-'.now()->format('Ymd-His').'.json';

        return response()->streamDownload(function () use ($tables, $isComplete, $createdAt): void {
            echo '{"format":"'.DatabaseBackupService::FORMAT.'","version":'.DatabaseBackupService::VERSION;
            echo ',"scope":"'.($isComplete ? 'complete' : 'selected').'"';
            echo ',"created_at":'.json_encode($createdAt, JSON_THROW_ON_ERROR);
            echo ',"tables":{';

            foreach ($tables as $index => $table) {
                if ($index > 0) {
                    echo ',';
                }
                echo json_encode($table, JSON_THROW_ON_ERROR).':[';
                $firstRow = true;
                foreach (DB::table($table)->cursor() as $row) {
                    if (! $firstRow) {
                        echo ',';
                    }
                    echo json_encode(
                        $row,
                        JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_INVALID_UTF8_SUBSTITUTE | JSON_THROW_ON_ERROR,
                    );
                    $firstRow = false;
                }
                echo ']';
            }

            echo '}}';
        }, $filename, ['Content-Type' => 'application/json; charset=utf-8']);
    }

    public function inspectBackup(Request $request, DatabaseBackupService $backups): JsonResponse
    {
        $this->ensureSuperAdmin($request);
        $file = $this->validatedBackupFile($request);

        return response()->json(['data' => $backups->inspect($backups->readBackup($file))]);
    }

    public function restoreBackup(Request $request, DatabaseBackupService $backups): JsonResponse
    {
        $this->ensureSuperAdmin($request);
        $data = $request->validate([
            'file' => ['required', 'file', 'max:102400'],
            'tables' => ['required', 'array', 'min:1', 'max:100'],
            'tables.*' => ['required', 'string', 'distinct'],
        ]);
        $file = $this->assertJsonBackup($data['file']);
        $backup = $backups->readBackup($file);
        $restored = $backups->restore($backup, $data['tables']);

        return response()->json([
            'ok' => true,
            'restored_tables' => $restored,
            'requires_relogin' => true,
        ]);
    }

    private function validatedBackupFile(Request $request): \Illuminate\Http\UploadedFile
    {
        $data = $request->validate([
            'file' => ['required', 'file', 'max:102400'],
        ]);

        return $this->assertJsonBackup($data['file']);
    }

    private function assertJsonBackup(\Illuminate\Http\UploadedFile $file): \Illuminate\Http\UploadedFile
    {
        if (strtolower($file->getClientOriginalExtension()) !== 'json') {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'file' => 'فقط فایل JSON پشتیبان پارس‌پولاد پذیرفته می‌شود.',
            ]);
        }

        return $file;
    }

    private function ensureResourcePermission(Request $request, string $resource, string $ability = 'viewAny'): void
    {
        $modelClass = AdminContentRegistry::modelClass($resource);
        $this->authorize($ability, [$modelClass, $resource]);
    }

    private function applyArticleCategory(string $resource, array &$data): void
    {
        if ($resource !== 'articles' || ! array_key_exists('article_category_id', $data) || $data['article_category_id'] === null) {
            return;
        }

        $category = ArticleCategory::query()->findOrFail($data['article_category_id']);
        $data['category_fa'] = $category->name_fa;
        $data['category_en'] = $category->name_en;
    }

    private function ensurePermission(Request $request, string $permission): void
    {
        abort_unless($request->user()?->can($permission), 403);
    }

    private function ensureSuperAdmin(Request $request): void
    {
        abort_unless($request->user()?->hasRole('super_admin'), 403);
    }

    private function modelFor(string $resource): string
    {
        return AdminContentRegistry::modelClass($resource);
    }
}
