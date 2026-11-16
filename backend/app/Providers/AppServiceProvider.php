<?php

namespace App\Providers;

use App\Models\Contract;
use App\Models\License;
use App\Models\Page;
use App\Models\Project;
use App\Models\ThemeSetting;
use App\Models\User;
use App\Observers\AuditObserver;
use App\Policies\ContractPolicy;
use App\Policies\LicensePolicy;
use App\Policies\ProjectPolicy;
use App\Policies\ThemeSettingPolicy;
use App\Policies\UserPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        Project::observe(AuditObserver::class);
        Contract::observe(AuditObserver::class);
        License::observe(AuditObserver::class);
        Page::observe(AuditObserver::class);
        User::observe(AuditObserver::class);

        Gate::policy(Project::class, ProjectPolicy::class);
        Gate::policy(Contract::class, ContractPolicy::class);
        Gate::policy(License::class, LicensePolicy::class);
        Gate::policy(User::class, UserPolicy::class);
        Gate::policy(ThemeSetting::class, ThemeSettingPolicy::class);

        Gate::before(static fn (User $user): ?bool => $user->hasRole('super_admin') ? true : null);
    }
}
