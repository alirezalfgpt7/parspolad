<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class VisitAnalyticsController extends Controller
{
    public function record(Request $request): JsonResponse
    {
        $data = $request->validate([
            'path' => ['required', 'string', 'max:255', 'regex:~^/(?!/)[^?#]*$~u'],
        ]);
        $now = now();

        DB::table('site_daily_page_views')->upsert(
            [[
                'view_date' => today()->toDateString(),
                'path' => $data['path'],
                'views' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ]],
            ['view_date', 'path'],
            ['views' => DB::raw('views + 1')],
        );

        return response()->json(['ok' => true], 202);
    }

    public function analytics(Request $request): JsonResponse
    {
        $filters = $request->validate([
            'from' => ['nullable', 'required_with:to', 'date_format:Y-m-d'],
            'to' => ['nullable', 'required_with:from', 'date_format:Y-m-d', 'after_or_equal:from'],
        ]);
        $today = CarbonImmutable::today();
        $from = isset($filters['from'])
            ? CarbonImmutable::createFromFormat('!Y-m-d', $filters['from'])
            : $today->subDays(6);
        $to = isset($filters['to'])
            ? CarbonImmutable::createFromFormat('!Y-m-d', $filters['to'])
            : $today;

        if ($from->diffInDays($to) > 365) {
            throw ValidationException::withMessages([
                'from' => 'بازه گزارش نباید بیشتر از ۳۶۶ روز باشد.',
            ]);
        }

        $daily = $this->aggregateDaily($today->subDays(29), $today);
        $monthlyDaily = $this->aggregateDaily($today->startOfMonth()->subMonths(11), $today);
        $monthly = collect($monthlyDaily)
            ->groupBy(fn (array $row): string => substr($row['date'], 0, 7))
            ->map(fn ($rows, string $month): array => [
                'month' => $month,
                'views' => (int) $rows->sum('views'),
            ])
            ->values();
        $rangeDaily = $this->aggregateDaily($from, $to);

        return response()->json([
            'daily' => $daily,
            'monthly' => $monthly,
            'range' => [
                'from' => $from->toDateString(),
                'to' => $to->toDateString(),
                'total' => (int) collect($rangeDaily)->sum('views'),
                'daily' => $rangeDaily,
            ],
        ]);
    }

    private function aggregateDaily(CarbonImmutable $from, CarbonImmutable $to): array
    {
        return DB::table('site_daily_page_views')
            ->selectRaw('view_date as date, SUM(views) as views')
            ->whereBetween('view_date', [$from->toDateString(), $to->toDateString()])
            ->groupBy('view_date')
            ->orderBy('view_date')
            ->get()
            ->map(fn (object $row): array => [
                'date' => (string) $row->date,
                'views' => (int) $row->views,
            ])
            ->all();
    }
}
