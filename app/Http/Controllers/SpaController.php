<?php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Models\Page;
use App\Models\PhotoAlbum;
use App\Models\Product;
use App\Models\Project;
use App\Models\Setting;
use App\Services\SpaShellRenderer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\URL;

class SpaController extends Controller
{
    public function show(Request $request, SpaShellRenderer $renderer, ?string $path = null)
    {
        $shellPath = base_path('dist/index.html');
        abort_unless(is_file($shellPath), 503, 'The frontend build is not available.');
        $shell = file_get_contents($shellPath);

        abort_unless(is_string($shell), 503, 'The frontend build is not available.');

        $metadata = $this->metadataFor($request, trim((string) $path, '/'));
        $html = $renderer->render($shell, $metadata);

        return response($html, 200, [
            'Content-Type' => 'text/html; charset=UTF-8',
            'Cache-Control' => 'public, max-age=0, must-revalidate',
        ]);
    }

    private function metadataFor(Request $request, string $path): array
    {
        $settings = $this->publicSettings();
        $seo = $settings['seo'] ?? [];
        $company = $settings['company'] ?? [];
        $logos = $settings['logos'] ?? [];
        $language = 'fa';
        $brand = (string) ($company['name_fa'] ?? config('app.name'));
        $brandLogo = $this->absoluteUrl($company['logo_url'] ?? $company['logo_small_url'] ?? null);
        $siteTitle = (string) ($seo['site_title'] ?? $brand);
        $description = (string) ($seo['meta_description'] ?? 'طراحی، ساخت و تأمین تجهیزات مهندسی‌شده صنعت نفت، گاز و پتروشیمی.');
        $image = $seo['meta_image'] ?? $logos['seo_share'] ?? $company['logo_url'] ?? null;
        $canonical = $request->url();
        $openGraphType = 'website';
        $schema = null;
        $pageTitle = $siteTitle;
        $pageDescription = $description;

        $segments = $path === '' ? [] : explode('/', $path);
        if (count($segments) === 2 && $segments[0] === 'products') {
            $product = Product::query()->where('slug', $segments[1])->firstOrFail();
            $pageTitle = $product->name_fa;
            $pageDescription = $product->summary_fa ?: trim(implode(' · ', array_filter([
                $product->category_fa,
                $product->model_code,
                $product->standard,
            ])));
            $image = $product->image_url ?: $image;
            $openGraphType = 'product';
            $schema = [
                '@type' => 'Product',
                '@id' => $canonical.'#product',
                'name' => $product->name_fa,
                'description' => $pageDescription,
                'image' => $this->absoluteUrl($product->image_url),
                'sku' => $product->model_code ?: null,
                'category' => $product->category_fa ?: null,
                'brand' => ['@id' => $request->getSchemeAndHttpHost().'#organization'],
                'url' => $canonical,
            ];
        } elseif (count($segments) === 2 && $segments[0] === 'projects') {
            $project = Project::query()->where('slug', $segments[1])->firstOrFail();
            $pageTitle = $project->title_fa;
            $pageDescription = $project->summary_fa ?: $project->description_fa;
            $image = $project->cover_image ?: $image;
        } elseif (count($segments) === 2 && $segments[0] === 'news') {
            $article = Article::query()->where('slug', $segments[1])->firstOrFail();
            $pageTitle = $article->title_fa;
            $pageDescription = $article->excerpt_fa;
            $image = $article->cover_image ?: $image;
            $openGraphType = 'article';
            $schema = [
                '@type' => 'Article',
                '@id' => $canonical.'#article',
                'headline' => $article->title_fa,
                'description' => $pageDescription,
                'image' => $this->absoluteUrl($article->cover_image),
                'datePublished' => $article->published_at,
                'author' => ['@type' => 'Organization', 'name' => $brand],
                'mainEntityOfPage' => $canonical,
            ];
        } elseif (count($segments) === 2 && $segments[0] === 'albums') {
            $album = PhotoAlbum::query()
                ->where('is_active', true)
                ->where('slug', $segments[1])
                ->with('cover')
                ->firstOrFail();
            $pageTitle = $album->title_fa;
            $pageDescription = $album->description_fa;
            $image = $album->cover?->requires_auth ? null : ($album->cover?->url ?: $image);
        } else {
            $page = $this->pageForPath($path);
            if ($page) {
                $pageTitle = $page->meta_title ?: $page->title_fa;
                $pageDescription = $page->meta_description ?: $page->subtitle_fa ?: $description;
                $image = $page->meta_image ?: $image;
                $canonical = $page->canonical_url ?: $canonical;
            }
        }

        $pageTitle = trim((string) $pageTitle) ?: $siteTitle;
        $fullTitle = $pageTitle === $brand || $pageTitle === $siteTitle
            ? $pageTitle
            : $pageTitle.' | '.$brand;
        $safeRobots = ['index,follow', 'noindex,follow', 'noindex,nofollow'];
        $robots = in_array($seo['robots'] ?? null, $safeRobots, true)
            ? $seo['robots']
            : 'index,follow';

        return [
            'title' => $fullTitle,
            'description' => trim((string) $pageDescription) ?: $description,
            'image' => $this->absoluteUrl(is_string($image) ? $image : null),
            'canonical' => $this->absoluteUrl((string) $canonical),
            'robots' => $robots,
            'keywords' => (string) ($seo['keywords'] ?? ''),
            'brand' => $brand,
            'brand_logo' => $brandLogo,
            'brand_name_en' => $company['name_en'] ?? null,
            'organization_description' => $company['slogan_fa'] ?? null,
            'organization_address' => $company['factory_address_fa'] ?? $company['office_address_fa'] ?? null,
            'organization_phone' => $company['office_phone'] ?? $company['factory_phone'] ?? null,
            'organization_email' => $company['office_email'] ?? $company['factory_email'] ?? null,
            'organization_same_as' => array_values(array_filter([
                $company['linkedin_url'] ?? null,
                $company['instagram_url'] ?? null,
                $company['aparat_url'] ?? null,
            ], static fn (mixed $url): bool => is_string($url) && $url !== '')),
            'language' => $language,
            'open_graph_type' => $openGraphType,
            'schema' => $schema,
        ];
    }

    private function pageForPath(string $path): ?Page
    {
        $target = $path === '' ? '/' : '/'.$path;

        return Page::query()->get()->first(function (Page $page) use ($target): bool {
            $pagePath = $page->metadata['path'] ?? null;
            return is_string($pagePath) && rtrim($pagePath, '/') === rtrim($target, '/');
        });
    }

    private function publicSettings(): array
    {
        $groups = [];
        foreach (Setting::query()->whereIn('group', ['seo', 'company', 'logos'])->get() as $setting) {
            $decoded = json_decode((string) $setting->value, true);
            $groups[$setting->group][$setting->key] = json_last_error() === JSON_ERROR_NONE
                ? $decoded
                : $setting->value;
        }

        return $groups;
    }

    private function absoluteUrl(?string $value): ?string
    {
        if (! is_string($value) || trim($value) === '') {
            return null;
        }

        $url = filter_var($value, FILTER_VALIDATE_URL) ? $value : URL::to($value);
        $scheme = strtolower((string) parse_url($url, PHP_URL_SCHEME));

        return in_array($scheme, ['http', 'https'], true) ? $url : null;
    }

}
