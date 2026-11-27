<?php

namespace App\Services;

use Illuminate\Support\Facades\URL;

class SpaShellRenderer
{
    public function render(string $shell, array $metadata): string
    {
        $metadata += [
            'brand_name_en' => null,
            'organization_description' => null,
            'organization_address' => null,
            'organization_phone' => null,
            'organization_email' => null,
            'organization_same_as' => [],
        ];
        $startMarker = '<!-- SEO_HEAD_START -->';
        $endMarker = '<!-- SEO_HEAD_END -->';
        $start = strpos($shell, $startMarker);
        $end = strpos($shell, $endMarker);
        abort_unless($start !== false && $end !== false && $end > $start, 503, 'The frontend build is missing SEO markers.');

        return substr_replace(
            $shell,
            $this->renderHead($metadata),
            $start,
            $end + strlen($endMarker) - $start,
        );
    }

    private function renderHead(array $metadata): string
    {
        $escape = static fn (string $value): string => e($value);
        $tags = [
            '<title>'.$escape($metadata['title']).'</title>',
            '<meta name="description" content="'.$escape($metadata['description']).'" />',
            '<meta name="robots" content="'.$escape($metadata['robots']).'" />',
            '<link rel="canonical" href="'.$escape($metadata['canonical']).'" />',
            '<meta property="og:type" content="'.$escape($metadata['open_graph_type']).'" />',
            '<meta property="og:site_name" content="'.$escape($metadata['brand']).'" />',
            '<meta property="og:title" content="'.$escape($metadata['title']).'" />',
            '<meta property="og:description" content="'.$escape($metadata['description']).'" />',
            '<meta property="og:url" content="'.$escape($metadata['canonical']).'" />',
            '<meta property="og:locale" content="fa_IR" />',
            '<meta name="twitter:card" content="'.($metadata['image'] ? 'summary_large_image' : 'summary').'" />',
            '<meta name="twitter:title" content="'.$escape($metadata['title']).'" />',
            '<meta name="twitter:description" content="'.$escape($metadata['description']).'" />',
        ];

        if ($metadata['keywords'] !== '') {
            $tags[] = '<meta name="keywords" content="'.$escape($metadata['keywords']).'" />';
        }
        if ($metadata['image']) {
            $tags[] = '<meta property="og:image" content="'.$escape($metadata['image']).'" />';
            $tags[] = '<meta property="og:image:alt" content="'.$escape($metadata['title']).'" />';
            $tags[] = '<meta name="twitter:image" content="'.$escape($metadata['image']).'" />';
        }

        $organization = array_filter([
            '@type' => 'Organization',
            '@id' => URL::to('/').'#organization',
            'name' => $metadata['brand'],
            'alternateName' => $metadata['brand_name_en'],
            'url' => URL::to('/'),
            'logo' => $metadata['brand_logo'],
            'description' => $metadata['organization_description'],
            'telephone' => $metadata['organization_phone'],
            'email' => $metadata['organization_email'],
            'foundingDate' => '1969',
            'address' => $metadata['organization_address']
                ? [
                    '@type' => 'PostalAddress',
                    'streetAddress' => $metadata['organization_address'],
                    'addressLocality' => 'اهواز',
                    'addressRegion' => 'خوزستان',
                    'addressCountry' => 'IR',
                ]
                : null,
            'sameAs' => $metadata['organization_same_as'] ?: null,
        ], static fn (mixed $value): bool => $value !== null && $value !== '');
        $graph = [
            $organization,
            array_filter([
                '@type' => 'WebPage',
                '@id' => $metadata['canonical'].'#webpage',
                'name' => $metadata['title'],
                'description' => $metadata['description'],
                'url' => $metadata['canonical'],
                'inLanguage' => 'fa-IR',
                'isPartOf' => ['@id' => URL::to('/').'#organization'],
                'primaryImageOfPage' => $metadata['image'],
            ], static fn (mixed $value): bool => $value !== null && $value !== ''),
        ];
        if (is_array($metadata['schema'])) {
            $graph[] = array_filter($metadata['schema'], static fn (mixed $value): bool => $value !== null && $value !== '');
        }
        $jsonLd = json_encode([
            '@context' => 'https://schema.org',
            '@graph' => $graph,
        ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT);
        $tags[] = '<script type="application/ld+json">'.$jsonLd.'</script>';

        return implode("\n    ", $tags);
    }
}
