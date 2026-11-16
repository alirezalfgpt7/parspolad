<?php

namespace App\Http\Controllers\Api\V1;

use App\Exports\ProjectsExport;
use App\Http\Controllers\Controller;
use App\Http\Requests\Project\StoreProjectRequest;
use App\Http\Requests\Project\UpdateProjectRequest;
use App\Http\Resources\ProjectResource;
use App\Models\Project;
use App\Models\ProjectCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Str;
use Maatwebsite\Excel\Facades\Excel;

class ProjectController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Project::query()->with('category');

        if ($request->filled('category_id')) {
            $query->where('category_id', (int) $request->input('category_id'));
        } elseif ($request->filled('category')) {
            $query->whereHas('category', fn ($category) => $category->where('slug', $request->input('category')));
        }
        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }
        if ($request->filled('year')) {
            $query->where('year', (int) $request->input('year'));
        }
        if ($request->filled('client')) {
            $client = $request->string('client')->toString();
            $query->where(fn ($sub) => $sub
                ->where('client_name_fa', $client)
                ->orWhere('client_name_en', $client));
        }
        if ($request->filled('location')) {
            $location = $request->string('location')->toString();
            $query->where(fn ($sub) => $sub
                ->where('location_fa', $location)
                ->orWhere('location_en', $location));
        }
        if ($request->filled('contract_type')) {
            $contractType = $request->string('contract_type')->toString();
            $query->where(fn ($sub) => $sub
                ->where('contract_type_fa', $contractType)
                ->orWhere('contract_type_en', $contractType));
        }
        if ($request->filled('q')) {
            $search = trim($request->string('q')->toString());
            $query->where(fn ($sub) => $sub
                ->where('title_fa', 'like', "%{$search}%")
                ->orWhere('title_en', 'like', "%{$search}%")
                ->orWhere('client_name_fa', 'like', "%{$search}%")
                ->orWhere('client_name_en', 'like', "%{$search}%")
                ->orWhere('contract_number', 'like', "%{$search}%"));
        }

        $perPage = min(max($request->integer('per_page', 15), 1), 100);

        return ProjectResource::collection(
            $query->orderByDesc('year')->paginate($perPage)->withQueryString(),
        );
    }

    public function filters(): JsonResponse
    {
        return response()->json([
            'data' => [
                'categories' => ProjectCategory::query()
                    ->whereHas('projects')
                    ->orderBy('name_fa')
                    ->get(['id', 'slug', 'name_fa', 'name_en']),
                'years' => Project::query()->select('year')->distinct()->orderByDesc('year')->pluck('year'),
                'clients' => Project::query()
                    ->select('client_name_fa', 'client_name_en')
                    ->where(fn ($query) => $query
                        ->whereNotNull('client_name_fa')
                        ->where('client_name_fa', '<>', '')
                        ->orWhere(fn ($sub) => $sub
                            ->whereNotNull('client_name_en')
                            ->where('client_name_en', '<>', '')))
                    ->distinct()
                    ->orderBy('client_name_fa')
                    ->get(),
                'locations' => Project::query()
                    ->select('location_fa', 'location_en')
                    ->where(fn ($query) => $query
                        ->whereNotNull('location_fa')
                        ->where('location_fa', '<>', '')
                        ->orWhere(fn ($sub) => $sub
                            ->whereNotNull('location_en')
                            ->where('location_en', '<>', '')))
                    ->distinct()
                    ->orderBy('location_fa')
                    ->get(),
                'contract_types' => Project::query()
                    ->select('contract_type_fa', 'contract_type_en')
                    ->where(fn ($query) => $query
                        ->whereNotNull('contract_type_fa')
                        ->where('contract_type_fa', '<>', '')
                        ->orWhere(fn ($sub) => $sub
                            ->whereNotNull('contract_type_en')
                            ->where('contract_type_en', '<>', '')))
                    ->distinct()
                    ->orderBy('contract_type_fa')
                    ->get(),
            ],
        ]);
    }

    public function adminIndex(Request $request): AnonymousResourceCollection
    {
        $perPage = min(max($request->integer('per_page', 8), 1), 100);

        return ProjectResource::collection(
            Project::query()->with('category')->orderByDesc('year')->paginate($perPage)->withQueryString(),
        );
    }

    public function show(string $slug): JsonResponse
    {
        $project = Project::query()->with(['category', 'images', 'videos', 'documents'])->where('slug', $slug)->firstOrFail();

        return response()->json(new ProjectResource($project));
    }

    public function store(StoreProjectRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['slug'] = $data['slug'] ?? Str::slug($data['title_en']).'-'.time();
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

    public function export(Request $request)
    {
        abort_unless($request->user()?->can('reports.export'), 403);

        return Excel::download(new ProjectsExport, 'pars-poolad-projects.xlsx');
    }
}
