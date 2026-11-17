<?php

namespace App\Services;

use App\Models\Article;
use App\Models\Page;
use App\Models\Project;
use Illuminate\Support\Collection;

class SitemapService
{
    public function entries(): Collection
    {
        $entries = collect([
            ['path' => '/', 'title_fa' => 'صفحه اصلی', 'title_en' => 'Home', 'updated_at' => now()],
            ['path' => '/about', 'title_fa' => 'درباره ما', 'title_en' => 'About Us', 'updated_at' => now()],
            ['path' => '/services', 'title_fa' => 'خدمات', 'title_en' => 'Services', 'updated_at' => now()],
            ['path' => '/products', 'title_fa' => 'محصولات', 'title_en' => 'Products', 'updated_at' => now()],
            ['path' => '/projects', 'title_fa' => 'پروژه‌ها', 'title_en' => 'Projects', 'updated_at' => now()],
            ['path' => '/contracts-licenses', 'title_fa' => 'قراردادها و گواهینامه‌ها', 'title_en' => 'Contracts and Licenses', 'updated_at' => now()],
            ['path' => '/org-chart', 'title_fa' => 'ساختار سازمانی', 'title_en' => 'Organization', 'updated_at' => now()],
            ['path' => '/news', 'title_fa' => 'اخبار و مقالات', 'title_en' => 'News and Articles', 'updated_at' => now()],
            ['path' => '/contact', 'title_fa' => 'تماس با ما', 'title_en' => 'Contact Us', 'updated_at' => now()],
            ['path' => '/rfq', 'title_fa' => 'درخواست همکاری و استعلام', 'title_en' => 'Request for Quotation', 'updated_at' => now()],
            ['path' => '/faq', 'title_fa' => 'سوالات متداول', 'title_en' => 'FAQ', 'updated_at' => now()],
            ['path' => '/legal', 'title_fa' => 'قوانین و حریم خصوصی', 'title_en' => 'Legal and Privacy', 'updated_at' => now()],
            ['path' => '/sitemap', 'title_fa' => 'نقشه سایت', 'title_en' => 'Sitemap', 'updated_at' => now()],
        ])->keyBy('path');

        Page::query()->get(['slug', 'title_fa', 'title_en', 'metadata', 'updated_at'])
            ->each(function (Page $page) use ($entries): void {
                $path = $page->metadata['path'] ?? null;
                if (! $this->isPublicPath($path)) {
                    return;
                }

                $entries->put($path, [
                    'path' => $path,
                    'title_fa' => $page->title_fa,
                    'title_en' => $page->title_en,
                    'updated_at' => $page->updated_at,
                ]);
            });

        Project::query()->get(['slug', 'title_fa', 'title_en', 'updated_at'])
            ->each(function (Project $project) use ($entries): void {
                $entries->put('/projects/'.$project->slug, [
                    'path' => '/projects/'.$project->slug,
                    'title_fa' => $project->title_fa,
                    'title_en' => $project->title_en,
                    'updated_at' => $project->updated_at,
                ]);
            });

        Article::query()->whereNotNull('published_at')->where('published_at', '<=', now())
            ->get(['slug', 'title_fa', 'title_en', 'updated_at'])
            ->each(function (Article $article) use ($entries): void {
                $entries->put('/news/'.$article->slug, [
                    'path' => '/news/'.$article->slug,
                    'title_fa' => $article->title_fa,
                    'title_en' => $article->title_en,
                    'updated_at' => $article->updated_at,
                ]);
            });

        return $entries->values();
    }

    private function isPublicPath(mixed $path): bool
    {
        return is_string($path)
            && preg_match('~^/(?!/)(?!admin(?:/|$))[A-Za-z0-9/_-]*$~', $path) === 1;
    }
}
