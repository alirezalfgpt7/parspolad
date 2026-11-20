<?php

use App\Services\ActivityLogRetentionService;
use Illuminate\Support\Facades\Artisan;

Artisan::command('portal:bootstrap', function (): void {
    $this->call('migrate', ['--force' => true]);
    $this->call('db:seed', ['--force' => true]);
    $this->info('Pars Poolad Aghaee database bootstrapped successfully.');
})->purpose('Migrate and seed the Pars Poolad Aghaee corporate portal database');

Artisan::command('activity-logs:prune', function (ActivityLogRetentionService $retention): void {
    $deleted = $retention->pruneExpired();
    $this->info("Deleted {$deleted} activity log entries older than {$retention->retentionMonths()} months.");
})->purpose('Delete activity logs older than the configured retention period');
