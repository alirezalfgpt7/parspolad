<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\License\StoreLicenseRequest;
use App\Http\Resources\LicenseResource;
use App\Models\License;
use Illuminate\Http\JsonResponse;

class LicenseController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(LicenseResource::collection(License::query()->orderBy('id')->get()));
    }

    public function adminIndex(): JsonResponse
    {
        return response()->json([
            'data' => LicenseResource::collection(License::query()->with('attachments')->orderBy('id')->get()),
        ]);
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
