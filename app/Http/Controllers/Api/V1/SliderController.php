<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Slide\StoreSlideRequest;
use App\Http\Resources\SlideResource;
use App\Models\Slide;
use App\Models\Slider;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SliderController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(['data' => Slider::query()->with('slides')->get()]);
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
}
