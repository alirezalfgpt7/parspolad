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
use Illuminate\Support\Arr;
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
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Maatwebsite\Excel\Facades\Excel;
use Spatie\Activitylog\Models\Activity;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class AdminContentController extends Controller
{
    public function index(Request $request, string $resource): JsonResponse
    {
        $this->ensureResourcePermission($request, $resource);
        $modelClass = AdminContentRegistry::modelClass($resource);
        $query = $modelClass::query();

        if ($resource === 'articles') {
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
        $item = $modelClass::query()->create($request->safe()->only($model->getFillable()));

        return response()->json(['data' => (new AdminContentRecordResource($item))->resolve($request)], 201);
    }

    public function update(UpdateAdminContentRecordRequest $request, string $resource, int $id): JsonResponse
    {
        $modelClass = AdminContentRegistry::modelClass($resource);
        $model = new $modelClass;
        $item = $modelClass::query()->findOrFail($id);
        $item->update($request->safe()->only($model->getFillable()));

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

    private function ensureResourcePermission(Request $request, string $resource, string $ability = 'viewAny'): void
    {
        $modelClass = AdminContentRegistry::modelClass($resource);
        $this->authorize($ability, [$modelClass, $resource]);
    }

    private function ensurePermission(Request $request, string $permission): void
    {
        abort_unless($request->user()?->can($permission), 403);
    }

    private function modelFor(string $resource): string
    {
        return AdminContentRegistry::modelClass($resource);
    }
}
