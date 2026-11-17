<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\License\StoreLicenseRequest;
use App\Http\Resources\LicenseResource;
use App\Models\License;
use App\Services\PrivateMediaStorageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class LicenseController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $perPage = min(max($request->integer('per_page', 8), 1), 100);

        return LicenseResource::collection(
            License::query()->orderBy('id')->paginate($perPage)->withQueryString(),
        );
    }

    public function adminIndex(Request $request): AnonymousResourceCollection
    {
        $perPage = min(max($request->integer('per_page', 8), 1), 100);

        return LicenseResource::collection(
            License::query()->orderBy('id')->paginate($perPage)->withQueryString(),
        );
    }

    public function store(StoreLicenseRequest $request, PrivateMediaStorageService $storage): JsonResponse
    {
        $data = $request->validated();
        if (array_key_exists('document_url', $data)) {
            $data['document_url'] = $storage->protectUrl($data['document_url'], (bool) ($data['requires_auth'] ?? false));
        }
        $license = License::query()->create($data);

        return response()->json(new LicenseResource($license), 201);
    }

    public function update(StoreLicenseRequest $request, License $license, PrivateMediaStorageService $storage): JsonResponse
    {
        $data = $request->validated();
        $requiresAuth = (bool) ($data['requires_auth'] ?? $license->requires_auth);
        $documentUrl = array_key_exists('document_url', $data) ? $data['document_url'] : $license->document_url;
        if (array_key_exists('document_url', $data) || array_key_exists('requires_auth', $data)) {
            $data['document_url'] = $storage->protectUrl($documentUrl, $requiresAuth);
        }
        $license->update($data);

        return response()->json(new LicenseResource($license));
    }

    public function destroy(License $license): JsonResponse
    {
        $this->authorize('manage', License::class);
        $license->delete();

        return response()->json(['message' => 'گواهینامه حذف شد.']);
    }
}
