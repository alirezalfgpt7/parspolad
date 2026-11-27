<?php

use App\Services\SitemapService;
use App\Http\Controllers\SpaController;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Route;

Route::get('/', [SpaController::class, 'show']);

Route::get('/sitemap.xml', function (SitemapService $sitemap): Response {
    $xml = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n";
    foreach ($sitemap->entries() as $entry) {
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

Route::get('/{path?}', [SpaController::class, 'show'])
    ->where('path', '^(?!api(?:/|$)|assets(?:/|$)|storage(?:/|$)|build(?:/|$)|vendor(?:/|$)|_test(?:/|$)|robots\\.txt$|sitemap\\.xml$).*$');
