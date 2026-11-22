<?php

namespace App\Http\Controllers\Api\V1;

use App\Exports\ContractsExport;
use App\Http\Controllers\Controller;
use App\Http\Requests\Contract\StoreContractRequest;
use App\Http\Resources\AdminContractListResource;
use App\Http\Resources\ContractResource;
use App\Models\Contract;
use App\Services\PrivateMediaStorageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Maatwebsite\Excel\Facades\Excel;

class ContractController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $perPage = min(max($request->integer('per_page', 8), 1), 100);

        return ContractResource::collection(
            Contract::query()->orderByDesc('start_year')->paginate($perPage)->withQueryString(),
        );
    }

    public function adminIndex(Request $request): AnonymousResourceCollection
    {
        $filters = $request->validate([
            'q' => ['sometimes', 'nullable', 'string', 'max:120'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:50'],
            'page' => ['sometimes', 'integer', 'min:1'],
            'sort_by' => ['sometimes', 'in:start_year,contract_number,title_fa,client_fa,amount_billion_irr,status'],
            'sort_dir' => ['sometimes', 'in:asc,desc'],
        ]);
        $query = Contract::query();
        $search = trim((string) ($filters['q'] ?? ''));
        if ($search !== '') {
            $query->where(fn ($sub) => $sub
                ->where('contract_number', 'like', "%{$search}%")
                ->orWhere('title_fa', 'like', "%{$search}%")
                ->orWhere('title_en', 'like', "%{$search}%")
                ->orWhere('client_fa', 'like', "%{$search}%")
                ->orWhere('client_en', 'like', "%{$search}%"));
        }

        return AdminContractListResource::collection(
            $query
                ->orderBy($filters['sort_by'] ?? 'start_year', $filters['sort_dir'] ?? 'desc')
                ->orderByDesc('id')
                ->paginate((int) ($filters['per_page'] ?? 10))
                ->withQueryString(),
        );
    }

    public function adminShow(Contract $contract): ContractResource
    {
        return new ContractResource($contract);
    }

    public function store(StoreContractRequest $request, PrivateMediaStorageService $storage): JsonResponse
    {
        $data = $request->validated();
        if (array_key_exists('document_url', $data)) {
            $data['document_url'] = $storage->protectUrl($data['document_url'], (bool) ($data['requires_auth'] ?? false));
        }
        $contract = Contract::query()->create($data);

        return response()->json(new ContractResource($contract), 201);
    }

    public function update(StoreContractRequest $request, Contract $contract, PrivateMediaStorageService $storage): JsonResponse
    {
        $data = $request->validated();
        $requiresAuth = (bool) ($data['requires_auth'] ?? $contract->requires_auth);
        $documentUrl = array_key_exists('document_url', $data) ? $data['document_url'] : $contract->document_url;
        if (array_key_exists('document_url', $data) || array_key_exists('requires_auth', $data)) {
            $data['document_url'] = $storage->protectUrl($documentUrl, $requiresAuth);
        }
        $contract->update($data);

        return response()->json(new ContractResource($contract));
    }

    public function destroy(Contract $contract): JsonResponse
    {
        $this->authorize('delete', $contract);
        $contract->delete();

        return response()->json(['message' => 'قرارداد حذف شد.']);
    }

    public function export(Request $request)
    {
        abort_unless($request->user()?->can('reports.export'), 403);

        return Excel::download(new ContractsExport, 'pars-poolad-contracts.xlsx');
    }
}
