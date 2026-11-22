<?php

use App\Models\Page;
use App\Models\Setting;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        $pages = Page::query()->get()->keyBy('slug');

        Setting::query()
            ->where('group', 'pages_config')
            ->get()
            ->each(function (Setting $setting) use ($pages): void {
                $page = $pages->get($setting->key);
                $override = json_decode((string) $setting->value, true);

                if (! $page || ! is_array($override)) {
                    return;
                }

                $attributes = [];
                foreach (['title_fa', 'title_en', 'subtitle_fa', 'subtitle_en'] as $field) {
                    if (isset($override[$field]) && is_string($override[$field]) && trim($override[$field]) !== '') {
                        $attributes[$field] = $override[$field];
                    }
                }

                $metadata = $page->metadata ?? [];
                foreach (['badge_fa', 'badge_en', 'logo_url'] as $field) {
                    if (isset($override[$field]) && is_string($override[$field]) && trim($override[$field]) !== '') {
                        $metadata[$field] = $override[$field];
                    }
                }

                if ($metadata !== ($page->metadata ?? [])) {
                    $attributes['metadata'] = $metadata;
                }

                if ($attributes !== []) {
                    $page->forceFill($attributes)->saveQuietly();
                }
            });
    }

    public function down(): void
    {
        // The original settings remain intact, so rolling back the UI needs no data reversal.
    }
};
