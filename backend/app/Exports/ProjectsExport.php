<?php

namespace App\Exports;

use App\Models\Project;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class ProjectsExport implements FromCollection, WithHeadings, WithMapping
{
    public function collection()
    {
        return Project::query()->with('category')->orderByDesc('year')->get();
    }

    public function headings(): array
    {
        return ['ID', 'عنوان پروژه', 'دسته‌بندی', 'کارفرما', 'شماره قرارداد', 'سال', 'وضعیت', 'موقعیت'];
    }

    public function map($project): array
    {
        return [
            $project->id,
            $project->title_fa,
            $project->category?->name_fa ?? '',
            $project->client_name_fa,
            $project->contract_number,
            $project->year,
            $project->status->labelFa(),
            $project->location_fa,
        ];
    }
}
