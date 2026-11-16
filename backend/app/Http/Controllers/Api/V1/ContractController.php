<?php

namespace App\Http\Controllers\Api\V1;

use App\Exports\ContractsExport;
use App\Http\Controllers\Controller;
use App\Http\Requests\Contract\StoreContractRequest;
use App\Http\Resources\ContractResource;
use App\Models\Contract;
use Illuminate\Http\JsonResponse;
use Maatwebsite\Excel\Facades\Excel;

class ContractController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(ContractResource::collection(Contract::query()->orderByDesc('start_year')->get()));
    }

    public function store(StoreContractRequest $request): JsonResponse
    {
        $contract = Contract::query()->create($request->validated());
        return response()->json(new ContractResource($contract), 201);
    }

    public function update(StoreContractRequest $request, Contract $contract): JsonResponse
    {
        $contract->update($request->validated());
        return response()->json(new ContractResource($contract));
    }

    public function destroy(Contract $contract): JsonResponse
    {
        $this->authorize('delete', $contract);
        $contract->delete();
        return response()->json(['message' => 'قرارداد حذف شد.']);
    }

    public function export()
    {
        return Excel::download(new ContractsExport(), 'pars-poolad-contracts.xlsx');
    }
}
