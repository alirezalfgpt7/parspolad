<?php

use App\Models\Article;
use App\Models\Project;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Route;

Route::get('/', fn () => redirect()->away(config('app.frontend_url', 'http://localhost:3000')));

Route::get('/sitemap.xml', function (): Response {
    $projects = Project::query()->select(['slug', 'updated_at'])->get();
    $articles = Article::query()->select(['slug', 'updated_at'])->get();

    $urls = ['/', '/about', '/services', '/products', '/projects', '/contracts-licenses', '/org-chart', '/news', '/contact', '/rfq'];
    foreach ($projects as $project) {
        $urls[] = '/projects/'.$project->slug;
    }
    foreach ($articles as $article) {
        $urls[] = '/news/'.$article->slug;
    }

    $xml = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n";
    foreach ($urls as $path) {
        $xml .= '  <url><loc>'.url($path)."</loc><changefreq>weekly</changefreq></url>\n";
    }
    $xml .= '</urlset>';

    return response($xml, 200, ['Content-Type' => 'application/xml']);
});

Route::get('/robots.txt', function (): Response {
    return response("User-agent: *\nAllow: /\nDisallow: /admin/\nSitemap: ".url('/sitemap.xml')."\n", 200, [
        'Content-Type' => 'text/plain',
    ]);
});
