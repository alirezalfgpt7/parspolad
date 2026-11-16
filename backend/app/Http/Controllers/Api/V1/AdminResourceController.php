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
use Illuminate\Support\Facades\Hash;
use Maatwebsite\Excel\Facades\Excel;
use Spatie\Activitylog\Models\Activity;

class AdminResourceController extends Controller
{
    public function users(): JsonResponse
    {
        return response()->json(UserResource::collection(User::query()->with('roles')->orderBy('id')->get()));
    }

    public function storeUser(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'unique:users,email'],
            'phone' => ['nullable', 'string', 'max:30'],
            'password' => ['required', 'string', 'min:8'],
            'role' => ['required', 'string', 'exists:roles,name'],
        ]);

        $user = User::query()->create([
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'password' => Hash::make($data['password']),
            'is_active' => true,
        ]);
        $user->assignRole($data['role']);

        return response()->json(new UserResource($user), 201);
    }

    public function messages(): JsonResponse
    {
        return response()->json(ContactMessage::query()->latest()->get());
    }

    public function updateMessageStatus(Request $request, ContactMessage $message): JsonResponse
    {
        $data = $request->validate([
            'status' => ['required', 'in:new,reviewed,replied'],
            'admin_note' => ['nullable', 'string'],
        ]);
        $message->update($data);
        return response()->json($message);
    }

    public function notifications(Request $request): JsonResponse
    {
        return response()->json(Notification::query()->latest()->limit(50)->get());
    }

    public function uploadMedia(Request $request): JsonResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'max:20480'],
            'folder' => ['nullable', 'string', 'max:60'],
        ]);

        $file = $request->file('file');
        $folder = $request->input('folder', 'uploads');
        $path = $file->store($folder, 'public');

        $record = MediaFile::query()->create([
            'name' => $file->getClientOriginalName(),
            'url' => '/storage/' . $path,
            'mime_type' => $file->getMimeType() ?? 'application/octet-stream',
            'extension' => strtolower($file->getClientOriginalExtension()),
            'size_bytes' => $file->getSize(),
            'folder' => $folder,
            'requires_auth' => $request->boolean('requires_auth', false),
        ]);

        return response()->json($record, 201);
    }

    public function activityLogs(): JsonResponse
    {
        return response()->json(Activity::query()->with('causer')->latest()->limit(200)->get());
    }

    public function exportLogs()
    {
        return Excel::download(new ActivityLogsExport(), 'pars-poolad-activity-logs.xlsx');
    }
}
