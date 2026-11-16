<?php

namespace App\Exports;

use Spatie\Activitylog\Models\Activity;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class ActivityLogsExport implements FromCollection, WithHeadings, WithMapping
{
    public function collection()
    {
        return Activity::query()->with('causer')->latest()->limit(500)->get();
    }

    public function headings(): array
    {
        return ['ID', 'کاربر', 'شرح رویداد', 'موضوع', 'IP', 'تاریخ ثبت'];
    }

    public function map($log): array
    {
        return [
            $log->id,
            $log->causer?->email ?? 'system',
            $log->description,
            class_basename((string) $log->subject_type),
            $log->properties['ip_address'] ?? '-',
            optional($log->created_at)->toDateTimeString(),
        ];
    }
}
