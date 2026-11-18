<?php

namespace App\Http\Controllers\Api\V1;

use App\Exports\ActivityLogsExport;
use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\ContactMessage;
use App\Models\MediaFile;
use App\Models\Notification;
use App\Models\User;
use App\Services\PrivateDownloadUrl;
use App\Services\PrivateMediaStorageService;
use App\Services\MediaContentValidator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Maatwebsite\Excel\Facades\Excel;
use Spatie\Activitylog\Models\Activity;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class AdminResourceController extends Controller
{
    public function users(Request $request): JsonResponse
    {
        $this->ensurePermission($request, 'users.view');
        $perPage = min(max($request->integer('per_page', 8), 1), 100);
        $users = User::query()->with(['roles.permissions'])->orderBy('id')->paginate($perPage);
        $userRows = $users->getCollection()
            ->map(fn (User $user): array => (new UserResource($user))->resolve())
            ->values();
        $roleUserCounts = DB::table('model_has_roles')
            ->where('model_type', (new User)->getMorphClass())
            ->select('role_id')
            ->selectRaw('COUNT(*) as aggregate')
            ->groupBy('role_id')
            ->pluck('aggregate', 'role_id');
        $roles = Role::query()->with('permissions')->orderBy('id')->get()
            ->map(fn (Role $role): array => [
                'id' => $role->id,
                'name' => $this->frontendRoleName($role->name),
                'label_fa' => $role->label_fa,
                'label_en' => $role->label_en,
                'permissions' => $role->permissions->pluck('name')->values(),
                'users_count' => (int) ($roleUserCounts[$role->id] ?? 0),
            ]);
        $permissions = Permission::query()
            ->where('guard_name', 'web')
            ->orderBy('name')
            ->pluck('name')
            ->values();

        return response()->json([
            'users' => $userRows,
            'users_meta' => [
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
            ],
            'roles' => $roles,
            'permissions' => $permissions,
        ]);
    }

    public function storeUser(Request $request): JsonResponse
    {
        $this->ensurePermission($request, 'users.manage');
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'unique:users,email'],
            'phone' => ['nullable', 'string', 'max:30'],
            'password' => ['required', 'string', 'min:8'],
            'role' => ['required', 'string'],
        ]);
        $roleName = $this->storedRoleName($data['role']);
        abort_unless(Role::query()->where('name', $roleName)->where('guard_name', 'web')->exists(), 422, 'نقش انتخاب‌شده معتبر نیست.');

        $user = User::query()->create([
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'password' => Hash::make($data['password']),
            'is_active' => true,
        ]);
        $user->assignRole($roleName);

        return response()->json(new UserResource($user), 201);
    }

    public function updateUser(Request $request, User $user): JsonResponse
    {
        $this->ensurePermission($request, 'users.manage');
        abort_unless(! $user->hasRole('super_admin') || $request->user()->hasRole('super_admin'), 403);
        $data = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:120'],
            'email' => ['sometimes', 'required', 'email', Rule::unique('users', 'email')->ignore($user->id)],
            'phone' => ['sometimes', 'nullable', 'string', 'max:30'],
            'password' => ['sometimes', 'required', 'string', 'min:8'],
            'role' => ['sometimes', 'string'],
            'is_active' => ['sometimes', 'boolean'],
        ]);
        abort_if($user->is($request->user()) && array_key_exists('is_active', $data) && ! $data['is_active'], 422, 'حساب کاربری خودتان را نمی‌توانید غیرفعال کنید.');
        if (array_key_exists('is_active', $data) && ! $data['is_active'] && $user->hasRole('super_admin')) {
            abort_if(User::role('super_admin')->where('is_active', true)->count() <= 1, 409, 'آخرین حساب سوپر ادمین را نمی‌توان غیرفعال کرد.');
        }

        if (isset($data['role'])) {
            $roleName = $this->storedRoleName($data['role']);
            $role = Role::query()->where('name', $roleName)->where('guard_name', 'web')->firstOrFail();
            if ($user->hasRole('super_admin') && $roleName !== 'super_admin') {
                abort_if($user->is($request->user()), 422, 'حساب سوپر ادمین خودتان را نمی‌توانید تنزل دهید.');
                abort_if(User::role('super_admin')->count() <= 1, 409, 'آخرین حساب سوپر ادمین را نمی‌توان تنزل داد.');
            }
            $user->syncRoles([$role]);
            unset($data['role']);
        }

        if (isset($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        }
        $user->update($data);
        if (array_key_exists('is_active', $data) && ! $data['is_active']) {
            $user->tokens()->delete();
        }

        return response()->json(['data' => new UserResource($user->fresh())]);
    }

    public function destroyUser(Request $request, User $user): JsonResponse
    {
        $this->ensurePermission($request, 'users.manage');
        abort_if($user->is($request->user()), 422, 'نمی‌توانید حساب کاربری خودتان را حذف کنید.');
        abort_if($user->hasRole('super_admin'), 403, 'حساب سوپر ادمین قابل حذف نیست.');
        $user->tokens()->delete();
        $user->delete();

        return response()->json(['ok' => true]);
    }

    public function storeRole(Request $request): JsonResponse
    {
        $this->ensurePermission($request, 'users.manage');
        $data = $request->validate([
            'name' => ['required', 'string', 'max:64', 'regex:/^[a-z][a-z0-9_-]*$/', Rule::unique('roles', 'name')->where('guard_name', 'web')],
            'label_fa' => ['required', 'string', 'max:120'],
            'label_en' => ['required', 'string', 'max:120'],
            'permissions' => ['required', 'array'],
            'permissions.*' => ['string', Rule::exists('permissions', 'name')->where('guard_name', 'web')],
        ]);
        abort_if(in_array($data['name'], [
            'super_admin', 'admin', 'editor', 'project_manager', 'client',
            'super-admin', 'content-manager', 'operator', 'user',
        ], true), 422, 'نام این نقش برای نقش‌های سیستمی رزرو شده است.');

        $role = Role::query()->create([
            'name' => $data['name'],
            'guard_name' => 'web',
            'label_fa' => $data['label_fa'],
            'label_en' => $data['label_en'],
        ]);
        $role->syncPermissions($data['permissions']);

        return response()->json([
            'data' => [
                'id' => $role->id,
                'name' => $role->name,
                'label_fa' => $role->label_fa,
                'label_en' => $role->label_en,
                'permissions' => $role->permissions()->pluck('name')->values(),
            ],
        ], 201);
    }

    public function updateRole(Request $request, Role $role): JsonResponse
    {
        $this->ensurePermission($request, 'users.manage');
        abort_unless($role->guard_name === 'web', 404);
        abort_unless($role->name !== 'super_admin', 403);
        $data = $request->validate([
            'label_fa' => ['sometimes', 'required', 'string', 'max:120'],
            'label_en' => ['sometimes', 'required', 'string', 'max:120'],
            'permissions' => ['sometimes', 'required', 'array'],
            'permissions.*' => ['string', Rule::exists('permissions', 'name')->where('guard_name', 'web')],
        ]);
        abort_if($data === [], 422, 'حداقل یک فیلد برای بروزرسانی ارسال کنید.');
        foreach (Arr::only($data, ['label_fa', 'label_en']) as $field => $value) {
            $role->{$field} = $value;
        }
        $role->save();
        if (array_key_exists('permissions', $data)) {
            $role->syncPermissions($data['permissions']);
        }

        return response()->json([
            'data' => [
                'id' => $role->id,
                'name' => $this->frontendRoleName($role->name),
                'label_fa' => $role->label_fa,
                'label_en' => $role->label_en,
                'permissions' => $role->permissions()->pluck('name')->values(),
                'users_count' => DB::table('model_has_roles')
                    ->where('role_id', $role->id)
                    ->where('model_type', (new User)->getMorphClass())
                    ->count(),
            ],
        ]);
    }

    public function destroyRole(Request $request, Role $role): JsonResponse
    {
        $this->ensurePermission($request, 'users.manage');
        abort_unless($role->guard_name === 'web', 404);
        abort_if(in_array($role->name, [
            'super_admin', 'admin', 'editor', 'project_manager', 'client',
            'super-admin', 'content-manager', 'operator', 'user',
        ], true), 403, 'نقش سیستمی قابل حذف نیست.');
        abort_if(
            DB::table('model_has_roles')
                ->where('role_id', $role->id)
                ->where('model_type', (new User)->getMorphClass())
                ->exists(),
            409,
            'ابتدا کاربران این نقش را به نقش دیگری منتقل کنید.',
        );
        $role->delete();

        return response()->json(['ok' => true]);
    }

    public function messages(Request $request): JsonResponse
    {
        $this->ensurePermission($request, 'messages.view');

        $perPage = min(max($request->integer('per_page', 8), 1), 100);

        return $this->paginatedResponse(ContactMessage::query()->latest()->paginate($perPage)->withQueryString());
    }

    public function updateMessageStatus(Request $request, ContactMessage $message): JsonResponse
    {
        $this->ensurePermission($request, 'messages.manage');
        $data = $request->validate([
            'status' => ['required', 'in:new,reviewed,replied'],
            'admin_note' => ['nullable', 'string'],
        ]);
        $message->update($data);

        return response()->json($message);
    }

    public function destroyMessage(Request $request, ContactMessage $message): JsonResponse
    {
        $this->ensurePermission($request, 'messages.manage');
        $message->delete();

        return response()->json(['ok' => true]);
    }

    public function notifications(Request $request): JsonResponse
    {
        $this->ensurePermission($request, 'notifications.view');

        $perPage = min(max($request->integer('per_page', 20), 1), 100);

        return $this->paginatedResponse(Notification::query()->latest()->paginate($perPage)->withQueryString());
    }

    public function media(Request $request, PrivateDownloadUrl $downloadUrls): JsonResponse
    {
        $this->ensurePermission($request, 'media.manage');

        $perPage = min(max($request->integer('per_page', 12), 1), 100);

        $media = MediaFile::query()->latest()->paginate($perPage)->withQueryString();
        $media->getCollection()->each(function (MediaFile $file) use ($downloadUrls, $request): void {
            $file->url = $downloadUrls->resolve($file->url, (bool) $file->requires_auth, $request);
        });

        return $this->paginatedResponse($media);
    }

    public function updateMedia(Request $request, MediaFile $media, PrivateMediaStorageService $storage): JsonResponse
    {
        $this->ensurePermission($request, 'media.manage');
        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'requires_auth' => ['sometimes', 'boolean'],
            'alt_text' => ['sometimes', 'nullable', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string', 'max:5000'],
        ]);
        if (array_key_exists('requires_auth', $data)) {
            $storage->setVisibility($media, (bool) $data['requires_auth']);
            unset($data['requires_auth']);
        }
        $media->update($data);

        return response()->json(['data' => $media->fresh()]);
    }

    public function destroyMedia(Request $request, MediaFile $media): JsonResponse
    {
        $this->ensurePermission($request, 'media.manage');
        $media->delete();

        return response()->json(['ok' => true]);
    }

    public function uploadMedia(
        Request $request,
        PrivateMediaStorageService $storage,
        MediaContentValidator $contentValidator,
    ): JsonResponse
    {
        $this->ensurePermission($request, 'media.manage');
        $request->validate([
            'file' => ['required_without:content_base64', 'file', 'max:25600'],
            'filename' => ['required_with:content_base64', 'string', 'max:255'],
            'content_base64' => ['required_without:file', 'string', 'max:35000000'],
            'folder' => ['nullable', 'string', 'max:60'],
            'requires_auth' => ['sometimes', 'boolean'],
        ]);

        $file = $request->file('file');
        $filename = $file?->getClientOriginalName() ?? $request->string('filename')->toString();
        $filename = basename(str_replace('\\', '/', $filename));

        $content = $file?->get();
        if ($content === null) {
            $encoded = preg_replace('/^data:[^;]+;base64,/', '', $request->string('content_base64')->toString());
            $content = base64_decode($encoded, true);
            abort_unless($content !== false, 422, 'محتوای فایل معتبر نیست.');
        }
        abort_unless(is_string($content), 422, 'خواندن فایل بارگذاری‌شده ناموفق بود.');
        $mimeType = $contentValidator->validate($filename, $content);

        $record = $storage->store(
            (string) $request->input('folder', 'uploads'),
            $filename,
            $content,
            $mimeType,
            $request->boolean('requires_auth'),
        );

        return response()->json(['data' => $record], 201);
    }

    public function activityLogs(Request $request): JsonResponse
    {
        $this->ensurePermission($request, 'logs.view');
        $perPage = min(max($request->integer('per_page', 50), 1), 100);
        $logs = Activity::query()->with(['causer', 'subject'])->latest()->paginate($perPage);
        $rows = $logs->getCollection()
            ->map(fn (Activity $activity): array => [
                'id' => $activity->id,
                'user_name' => $activity->causer?->name ?? 'سامانه',
                'action' => $activity->description,
                'subject_type' => class_basename($activity->subject_type ?? ''),
                'subject_label' => $activity->subject?->title_fa ?? $activity->subject?->name ?? '',
                'ip_address' => $activity->properties['ip_address'] ?? '',
                'created_at' => $activity->created_at,
            ])->values();

        return response()->json([
            'data' => $rows,
            'meta' => [
                'current_page' => $logs->currentPage(),
                'last_page' => $logs->lastPage(),
                'per_page' => $logs->perPage(),
                'total' => $logs->total(),
            ],
        ]);
    }

    public function exportLogs(Request $request)
    {
        $this->ensurePermission($request, 'reports.export');

        return Excel::download(new ActivityLogsExport, 'pars-poolad-activity-logs.xlsx');
    }

    private function ensurePermission(Request $request, string $permission): void
    {
        abort_unless($request->user()?->can($permission), 403);
    }

    private function frontendRoleName(string $role): string
    {
        return [
            'super_admin' => 'super-admin',
            'editor' => 'content-manager',
            'project_manager' => 'operator',
            'client' => 'user',
        ][$role] ?? $role;
    }

    private function storedRoleName(string $role): string
    {
        return [
            'super-admin' => 'super_admin',
            'content-manager' => 'editor',
            'operator' => 'project_manager',
            'user' => 'client',
        ][$role] ?? $role;
    }
}
