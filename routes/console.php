<?php

use Illuminate\Support\Facades\Artisan;

Artisan::command('portal:bootstrap', function (): void {
    $this->call('migrate', ['--force' => true]);
    $this->call('db:seed', ['--force' => true]);
    $this->info('Pars Poolad Aghaee database bootstrapped successfully.');
})->purpose('Migrate and seed the Pars Poolad Aghaee corporate portal database');
