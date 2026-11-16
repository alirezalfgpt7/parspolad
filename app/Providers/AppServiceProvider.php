<?php

namespace App\Providers;

use App\Models\Article;
use App\Models\ArticleComment;
use App\Models\ContactMessage;
use App\Models\Contract;
use App\Models\ContractDocument;
use App\Models\EmailSetting;
use App\Models\LicenseAttachment;
use App\Models\License;
use App\Models\MediaFile;
use App\Models\Menu;
use App\Models\MenuItem;
use App\Models\Notification;
use App\Models\ProjectDocument;
use App\Models\ProjectImage;
use App\Models\Page;
use App\Models\Project;
use App\Models\ProjectVideo;
use App\Models\Setting;
use App\Models\Slide;
use App\Models\Slider;
use App\Models\SmsProviderSetting;
use App\Models\ThemePreset;
use App\Models\ThemeSetting;
use App\Models\User;
use App\Observers\AuditObserver;
use App\Policies\AdminContentPolicy;
use App\Policies\ContractPolicy;
use App\Policies\LicensePolicy;
use App\Policies\ProjectPolicy;
use App\Policies\ThemeSettingPolicy;
use App\Policies\UserPolicy;
use App\Support\AdminContentRegistry;
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
        $auditedModels = array_unique(array_merge(array_values(AdminContentRegistry::MODELS), [
            ArticleComment::class,
            ContactMessage::class,
            Contract::class,
            ContractDocument::class,
            EmailSetting::class,
            License::class,
            LicenseAttachment::class,
            MediaFile::class,
            Menu::class,
            MenuItem::class,
            Notification::class,
            Project::class,
            ProjectDocument::class,
            ProjectImage::class,
            ProjectVideo::class,
            Setting::class,
            Slide::class,
            Slider::class,
            SmsProviderSetting::class,
            ThemePreset::class,
            ThemeSetting::class,
            User::class,
        ]));

        foreach ($auditedModels as $model) {
            $model::observe(AuditObserver::class);
        }

        Gate::policy(Project::class, ProjectPolicy::class);
        Gate::policy(Contract::class, ContractPolicy::class);
        Gate::policy(License::class, LicensePolicy::class);
        Gate::policy(User::class, UserPolicy::class);
        Gate::policy(ThemeSetting::class, ThemeSettingPolicy::class);
        foreach (AdminContentRegistry::MODELS as $model) {
            Gate::policy($model, AdminContentPolicy::class);
        }

        Gate::before(static fn (User $user): ?bool => $user->hasRole('super_admin') ? true : null);
    }
}
