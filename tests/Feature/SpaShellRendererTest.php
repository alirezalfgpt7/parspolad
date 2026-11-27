<?php

use App\Services\SpaShellRenderer;

it('renders share metadata into the initial frontend HTML', function (): void {
    $shell = '<html><head><!-- SEO_HEAD_START --><title>Old title</title><!-- SEO_HEAD_END --></head><body></body></html>';
    $metadata = [
        'title' => 'Wellhead & Liner Hanger',
        'description' => 'Product summary',
        'robots' => 'index,follow',
        'canonical' => 'https://example.test/products/liner-hanger',
        'open_graph_type' => 'product',
        'brand' => 'Pars Poolad',
        'brand_logo' => 'https://example.test/logo.png',
        'brand_name_en' => 'Pars Poolad Aghaee Co.',
        'organization_description' => 'Engineering oilfield equipment.',
        'organization_address' => 'Ahvaz Industrial Zone',
        'organization_phone' => '+98-61-32907005',
        'organization_email' => 'info@example.test',
        'organization_same_as' => ['https://linkedin.com/company/example'],
        'keywords' => '',
        'image' => 'https://example.test/liner-hanger.webp',
        'schema' => [
            '@type' => 'Product',
            'name' => 'Liner Hanger',
        ],
    ];

    $html = app(SpaShellRenderer::class)->render($shell, $metadata);

    expect($html)
        ->toContain('<title>Wellhead &amp; Liner Hanger</title>')
        ->toContain('property="og:type" content="product"')
        ->toContain('property="og:image" content="https://example.test/liner-hanger.webp"')
        ->toContain('rel="canonical" href="https://example.test/products/liner-hanger"')
        ->toContain('"@type":"Product"')
        ->toContain('"foundingDate":"1969"')
        ->toContain('"telephone":"+98-61-32907005"')
        ->toContain('"email":"info@example.test"')
        ->toContain('"sameAs":["https://linkedin.com/company/example"]')
        ->not->toContain('Old title');
});
