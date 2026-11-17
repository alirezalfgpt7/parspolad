<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Slide\StoreSlideRequest;
use App\Http\Resources\SlideResource;
use App\Models\Slide;
use App\Models\Slider;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class SliderController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'data' => Slider::query()
                ->where('is_active', true)
                ->with(['slides' => fn ($query) => $query->where('is_active', true)])
                ->orderBy('id')
                ->get(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $this->ensurePermission($request);
        $data = $request->validate([
            'key' => ['required', 'string', 'max:60', 'regex:/^[a-z0-9_-]+$/', Rule::unique('sliders', 'key')],
            'title_fa' => ['required', 'string', 'max:255'],
            'title_en' => ['required', 'string', 'max:255'],
            'page_slug' => ['required', 'string', 'max:80', 'regex:/^[a-z0-9-]+$/'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $slider = Slider::query()->create($data)->load('slides');

        return response()->json(['data' => $slider], 201);
    }

    public function update(Request $request, Slider $slider): JsonResponse
    {
        $this->ensurePermission($request);
        $data = $request->validate([
            'key' => ['sometimes', 'required', 'string', 'max:60', 'regex:/^[a-z0-9_-]+$/', Rule::unique('sliders', 'key')->ignore($slider->id)],
            'title_fa' => ['sometimes', 'required', 'string', 'max:255'],
            'title_en' => ['sometimes', 'required', 'string', 'max:255'],
            'page_slug' => ['sometimes', 'required', 'string', 'max:80', 'regex:/^[a-z0-9-]+$/'],
            'is_active' => ['sometimes', 'boolean'],
        ]);
        $slider->update($data);

        return response()->json(['data' => $slider->fresh()]);
    }

    public function destroy(Request $request, Slider $slider): JsonResponse
    {
        $this->ensurePermission($request);
        $slider->delete();

        return response()->json(['ok' => true]);
    }

    public function storeSlide(StoreSlideRequest $request): JsonResponse
    {
        $slide = Slide::query()->create($request->validated());

        return response()->json(new SlideResource($slide), 201);
    }

    public function updateSlide(StoreSlideRequest $request, Slide $slide): JsonResponse
    {
        $slide->update($request->validated());

        return response()->json(new SlideResource($slide));
    }

    public function reorder(Request $request): JsonResponse
    {
        $orderedIds = $request->validate(['slide_ids' => ['required', 'array']])['slide_ids'];
        foreach ($orderedIds as $index => $slideId) {
            Slide::query()->whereKey((int) $slideId)->update(['sort_order' => $index + 1]);
        }

        return response()->json(['message' => 'ترتیب اسلایدها بروزرسانی شد.']);
    }

    public function destroySlide(Slide $slide): JsonResponse
    {
        $slide->delete();

        return response()->json(['message' => 'اسلاید حذف شد.']);
    }

    private function ensurePermission(Request $request): void
    {
        abort_unless($request->user()?->can('slider.manage'), 403);
    }
}
