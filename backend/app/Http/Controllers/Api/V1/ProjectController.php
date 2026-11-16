<?php

namespace App\Http\Controllers\Api\V1;

use App\Exports\ProjectsExport;
use App\Http\Controllers\Controller;
use App\Http\Requests\Project\StoreProjectRequest;
use App\Http\Requests\Project\UpdateProjectRequest;
use App\Http\Resources\ProjectResource;
use App\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Maatwebsite\Excel\Facades\Excel;

class ProjectController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Project::query()->with(['category', 'images', 'videos', 'documents']);

        if ($request->filled('category_id')) {
            $query->where('category_id', (int) $request->input('category_id'));
        }
        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }
        if ($request->filled('year')) {
            $query->where('year', (int) $request->input('year'));
        }
        if ($request->filled('q')) {
            $q = $request->string('q');
            $query->where(fn ($sub) => $sub->where('title_fa', 'like', "%{$q}%")->orWhere('client_name_fa', 'like', "%{$q}%"));
        }

        return response()->json(ProjectResource::collection($query->orderByDesc('year')->get()));
    }

    public function show(string $slug): JsonResponse
    {
        $project = Project::query()->with(['category', 'images', 'videos', 'documents'])->where('slug', $slug)->firstOrFail();
        return response()->json(new ProjectResource($project));
    }

    public function store(StoreProjectRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['slug'] = $data['slug'] ?? Str::slug($data['title_en']) . '-' . time();
        $project = Project::query()->create($data);
        return response()->json(new ProjectResource($project->load(['category', 'images', 'videos', 'documents'])), 201);
    }

    public function update(UpdateProjectRequest $request, Project $project): JsonResponse
    {
        $project->update($request->validated());
        return response()->json(new ProjectResource($project->fresh(['category', 'images', 'videos', 'documents'])));
    }

    public function destroy(Project $project): JsonResponse
    {
        $this->authorize('delete', $project);
        $project->delete();
        return response()->json(['message' => 'پروژه حذف شد.']);
    }

    public function export()
    {
        return Excel::download(new ProjectsExport(), 'pars-poolad-projects.xlsx');
    }
}
