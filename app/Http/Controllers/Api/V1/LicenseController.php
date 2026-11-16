<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\License\StoreLicenseRequest;
use App\Http\Resources\LicenseResource;
use App\Models\License;
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

    public function store(StoreLicenseRequest $request): JsonResponse
    {
        $license = License::query()->create($request->validated());

        return response()->json(new LicenseResource($license), 201);
    }

    public function update(StoreLicenseRequest $request, License $license): JsonResponse
    {
        $license->update($request->validated());

        return response()->json(new LicenseResource($license));
    }

    public function destroy(License $license): JsonResponse
    {
        $this->authorize('manage', License::class);
        $license->delete();

        return response()->json(['message' => 'گواهینامه حذف شد.']);
    }
}
