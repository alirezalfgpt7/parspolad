<?php

namespace App\Exports;

use App\Models\Contract;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class ContractsExport implements FromCollection, WithHeadings, WithMapping
{
    public function collection()
    {
        return Contract::query()->orderByDesc('start_year')->get();
    }

    public function headings(): array
    {
        return ['شماره قرارداد', 'عنوان', 'کارفرما', 'مبلغ (میلیارد ریال)', 'سال شروع', 'سال پایان', 'وضعیت'];
    }

    public function map($contract): array
    {
        return [
            $contract->contract_number,
            $contract->title_fa,
            $contract->client_fa,
            $contract->amount_billion_irr,
            $contract->start_year,
            $contract->end_year ?? 'جاری',
            $contract->status->labelFa(),
        ];
    }
}
