<?php

use App\Models\Article;
use App\Models\Project;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Route;

Route::get('/', fn () => redirect()->away(config('app.frontend_url', 'http://localhost:3000')));

Route::get('/sitemap.xml', function (): Response {
    $projects = Project::query()->select(['slug', 'updated_at'])->get();
    $articles = Article::query()->select(['slug', 'updated_at'])->get();

    $urls = collect([
        '/',
        '/about',
        '/services',
        '/products',
        '/projects',
        '/contracts-licenses',
        '/org-chart',
        '/news',
        '/contact',
        '/rfq',
        '/faq',
        '/legal',
    ])->map(fn (string $path): array => ['path' => $path, 'updated_at' => now()]);
    foreach ($projects as $project) {
        $urls->push(['path' => '/projects/'.$project->slug, 'updated_at' => $project->updated_at]);
    }
    foreach ($articles as $article) {
        $urls->push(['path' => '/news/'.$article->slug, 'updated_at' => $article->updated_at]);
    }

    $xml = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n";
    foreach ($urls as $entry) {
        $location = htmlspecialchars(url($entry['path']), ENT_XML1 | ENT_QUOTES, 'UTF-8');
        $lastModified = $entry['updated_at']?->toDateString() ?? today()->toDateString();
        $xml .= "  <url><loc>{$location}</loc><lastmod>{$lastModified}</lastmod><changefreq>weekly</changefreq></url>\n";
    }
    $xml .= '</urlset>';

    return response($xml, 200, ['Content-Type' => 'application/xml']);
});

Route::get('/robots.txt', function (): Response {
    return response("User-agent: *\nAllow: /\nDisallow: /admin/\nSitemap: ".url('/sitemap.xml')."\n", 200, [
        'Content-Type' => 'text/plain',
    ]);
});
