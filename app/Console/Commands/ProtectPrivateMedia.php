<?php

namespace App\Console\Commands;

use App\Models\Contract;
use App\Models\License;
use App\Models\MediaFile;
use App\Models\Page;
use App\Models\Product;
use App\Models\ProjectDocument;
use App\Services\PrivateMediaStorageService;
use Illuminate\Console\Command;

class ProtectPrivateMedia extends Command
{
    protected $signature = 'media:protect-private';

    protected $description = 'Migrate existing protected documents and media to private storage';

    public function handle(PrivateMediaStorageService $storage): int
    {
        $conflicts = $this->publicReferenceConflicts();
        if ($conflicts !== []) {
            foreach ($conflicts as $conflict) {
                $this->error($conflict);
            }
            $this->error('Resolve these public/private references before moving files; no files were changed.');

            return self::FAILURE;
        }

        $count = 0;
        $records = [
            [ProjectDocument::query(), 'file_url'],
            [Contract::query(), 'document_url'],
            [License::query(), 'document_url'],
            [MediaFile::query(), 'url'],
        ];

        foreach ($records as [$query, $urlField]) {
            $query->where('requires_auth', true)
                ->whereNotNull($urlField)
                ->orderBy('id')
                ->chunkById(100, function ($items) use ($storage, $urlField, &$count): void {
                    foreach ($items as $item) {
                        $item->{$urlField} = $storage->protectUrl($item->{$urlField}, true);
                        $item->save();
                        $count++;
                    }
                });
        }

        $this->info("Protected {$count} document(s).");

        return self::SUCCESS;
    }

    private function publicReferenceConflicts(): array
    {
        $protectedPaths = [];
        $protectedRecords = [
            [ProjectDocument::query()->where('requires_auth', true), 'file_url'],
            [Contract::query()->where('requires_auth', true), 'document_url'],
            [License::query()->where('requires_auth', true), 'document_url'],
            [MediaFile::query()->where('requires_auth', true), 'url'],
        ];
        foreach ($protectedRecords as [$query, $field]) {
            foreach ($query->get([$field]) as $record) {
                $path = $this->pathForUrl($record->{$field});
                if ($path) $protectedPaths[$path] = true;
            }
        }

        $publicReferences = [];
        $publicRecords = [
            [ProjectDocument::query()->where('requires_auth', false), 'file_url', 'Project document'],
            [Contract::query()->where('requires_auth', false), 'document_url', 'Contract document'],
            [License::query()->where('requires_auth', false), 'document_url', 'License document'],
            [Product::query()->whereNotNull('catalog_url'), 'catalog_url', 'Product catalog'],
            [MediaFile::query()->where('requires_auth', false), 'url', 'Public media'],
        ];
        foreach ($publicRecords as [$query, $field, $label]) {
            foreach ($query->get(['id', $field]) as $record) {
                $path = $this->pathForUrl($record->{$field});
                if ($path) $publicReferences[$path][] = "{$label} #{$record->id}";
            }
        }

        Page::query()->get(['id', 'metadata', 'content_fa', 'content_en'])->each(function (Page $page) use (&$publicReferences): void {
            $values = [$page->metadata ?? [], $page->content_fa, $page->content_en];
            array_walk_recursive($values, function (mixed $value) use (&$publicReferences, $page): void {
                if (! is_string($value)) return;
                foreach ($this->pathsInValue($value) as $path) {
                    $publicReferences[$path][] = "Public page #{$page->id}";
                }
            });
        });

        $conflicts = [];
        foreach (array_intersect_key($publicReferences, $protectedPaths) as $path => $references) {
            $conflicts[] = "File [{$path}] is marked private but also referenced publicly by: ".implode(', ', array_unique($references));
        }

        return $conflicts;
    }

    private function pathForUrl(?string $url): ?string
    {
        if (! $url) return null;
        return $this->pathsInValue($url)[0] ?? null;
    }

    private function pathsInValue(string $value): array
    {
        preg_match_all('~/storage/([A-Za-z0-9_./-]+\.[A-Za-z0-9]+)~', $value, $storageMatches);
        $paths = $storageMatches[1] ?? [];
        preg_match_all('~/api/v1/media/(\d+)/download~', $value, $mediaMatches);
        foreach ($mediaMatches[1] ?? [] as $mediaId) {
            $path = MediaFile::query()->whereKey((int) $mediaId)->value('storage_path');
            if ($path) $paths[] = $path;
        }

        return array_values(array_unique($paths));
    }
}
