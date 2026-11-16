<?php

namespace App\Http\Controllers\Api\V1;

use App\Exports\ActivityLogsExport;
use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\ContactMessage;
use App\Models\MediaFile;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Maatwebsite\Excel\Facades\Excel;
use Spatie\Activitylog\Models\Activity;
use Spatie\Permission\Models\Role;

class AdminResourceController extends Controller
{
    public function users(Request $request): JsonResponse
    {
        $this->ensurePermission($request, 'users.view');
        $users = User::query()->with(['roles.permissions'])->orderBy('id')->get()
            ->map(fn (User $user): array => (new UserResource($user))->resolve());
        $roles = Role::query()->with('permissions')->orderBy('id')->get()
            ->map(fn (Role $role): array => [
                'id' => $role->id,
                'name' => $this->frontendRoleName($role->name),
                'label_fa' => $role->label_fa,
                'label_en' => $role->label_en,
                'permissions' => $role->permissions->pluck('name')->values(),
            ]);

        return response()->json(['users' => $users, 'roles' => $roles]);
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
        abort_unless(Role::query()->where('name', $roleName)->exists(), 422, 'نقش انتخاب‌شده معتبر نیست.');

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
            'role' => ['sometimes', 'string'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        if (isset($data['role'])) {
            $roleName = $this->storedRoleName($data['role']);
            $role = Role::query()->where('name', $roleName)->firstOrFail();
            $user->syncRoles([$role]);
            unset($data['role']);
        }

        $user->update($data);

        return response()->json(['data' => new UserResource($user->fresh())]);
    }

    public function updateRole(Request $request, Role $role): JsonResponse
    {
        $this->ensurePermission($request, 'users.manage');
        abort_unless($role->name !== 'super_admin', 403);
        $data = $request->validate([
            'permissions' => ['required', 'array'],
            'permissions.*' => ['string', 'exists:permissions,name'],
        ]);
        $role->syncPermissions($data['permissions']);

        return response()->json([
            'data' => [
                'id' => $role->id,
                'name' => $this->frontendRoleName($role->name),
                'label_fa' => $role->label_fa,
                'label_en' => $role->label_en,
                'permissions' => $role->permissions()->pluck('name')->values(),
            ],
        ]);
    }

    public function messages(Request $request): JsonResponse
    {
        $this->ensurePermission($request, 'messages.view');

        return response()->json(['data' => ContactMessage::query()->latest()->get()]);
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

        return response()->json(['data' => Notification::query()->latest()->limit(50)->get()]);
    }

    public function media(Request $request): JsonResponse
    {
        $this->ensurePermission($request, 'media.manage');

        return response()->json(['data' => MediaFile::query()->latest()->get()]);
    }

    public function updateMedia(Request $request, MediaFile $media): JsonResponse
    {
        $this->ensurePermission($request, 'media.manage');
        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'requires_auth' => ['sometimes', 'boolean'],
        ]);
        $media->update($data);

        return response()->json(['data' => $media->fresh()]);
    }

    public function destroyMedia(Request $request, MediaFile $media): JsonResponse
    {
        $this->ensurePermission($request, 'media.manage');
        $media->delete();

        return response()->json(['ok' => true]);
    }

    public function uploadMedia(Request $request): JsonResponse
    {
        $this->ensurePermission($request, 'media.manage');
        $request->validate([
            'file' => ['required_without:content_base64', 'file', 'max:25600'],
            'filename' => ['required_with:content_base64', 'string', 'max:255'],
            'content_base64' => ['required_without:file', 'string'],
            'folder' => ['nullable', 'string', 'max:60'],
        ]);

        $file = $request->file('file');
        $filename = $file?->getClientOriginalName() ?? $request->string('filename')->toString();
        $extension = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
        $allowedExtensions = ['pdf', 'docx', 'xlsx', 'dwg', 'zip', 'mp4', 'webm', 'jpg', 'jpeg', 'png', 'webp', 'svg'];
        abort_unless(in_array($extension, $allowedExtensions, true), 422, 'فرمت فایل مجاز نیست.');

        $content = $file?->get();
        if ($content === null) {
            $encoded = preg_replace('/^data:[^;]+;base64,/', '', $request->string('content_base64')->toString());
            $content = base64_decode($encoded, true);
            abort_unless($content !== false, 422, 'محتوای فایل معتبر نیست.');
        }
        abort_unless(strlen($content) <= 25 * 1024 * 1024, 422, 'حداکثر حجم مجاز فایل ۲۵ مگابایت است.');

        $folder = preg_replace('/[^A-Za-z0-9_-]/', '', (string) $request->input('folder', 'uploads')) ?: 'uploads';
        $safeName = Str::uuid().'.'.$extension;
        $directory = public_path('storage/'.$folder);
        File::ensureDirectoryExists($directory);
        $path = $directory.DIRECTORY_SEPARATOR.$safeName;
        abort_unless(file_put_contents($path, $content) !== false, 500, 'ذخیره فایل انجام نشد.');

        $record = MediaFile::query()->create([
            'name' => $filename,
            'url' => '/storage/'.$folder.'/'.$safeName,
            'mime_type' => $file?->getMimeType() ?? match ($extension) {
                'pdf' => 'application/pdf',
                'jpg', 'jpeg' => 'image/jpeg',
                'png' => 'image/png',
                'webp' => 'image/webp',
                default => 'application/octet-stream',
            },
            'extension' => $extension,
            'size_bytes' => strlen($content),
            'folder' => $folder,
            'requires_auth' => $request->boolean('requires_auth', false),
        ]);

        return response()->json(['data' => $record], 201);
    }

    public function activityLogs(Request $request): JsonResponse
    {
        $this->ensurePermission($request, 'logs.view');
        $logs = Activity::query()->with(['causer', 'subject'])->latest()->limit(200)->get()
            ->map(fn (Activity $activity): array => [
                'id' => $activity->id,
                'user_name' => $activity->causer?->name ?? 'سامانه',
                'action' => $activity->description,
                'subject_type' => class_basename($activity->subject_type ?? ''),
                'subject_label' => $activity->subject?->title_fa ?? $activity->subject?->name ?? '',
                'ip_address' => $activity->properties['ip_address'] ?? '',
                'created_at' => $activity->created_at,
            ]);

        return response()->json(['data' => $logs]);
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
