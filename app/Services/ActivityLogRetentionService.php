<?php

namespace App\Services;

use App\Models\Setting;
use Spatie\Activitylog\Models\Activity;

class ActivityLogRetentionService
{
    private const DEFAULT_MONTHS = 12;

    private const ALLOWED_MONTHS = [1, 3, 6, 12];

    public function retentionMonths(): int
    {
        $value = Setting::query()
            ->where('group', 'logs')
            ->where('key', 'activity_logs_retention_months')
            ->value('value');
        $months = (int) $value;

        return in_array($months, self::ALLOWED_MONTHS, true) ? $months : self::DEFAULT_MONTHS;
    }

    public function pruneExpired(): int
    {
        return Activity::query()
            ->where('created_at', '<', now()->subMonths($this->retentionMonths()))
            ->delete();
    }
}
