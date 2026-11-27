<?php

namespace Database\Seeders;

use App\Models\MachineryAsset;
use App\Models\Page;
use Illuminate\Database\Seeder;
use Illuminate\Support\Arr;
use RuntimeException;

class SourceDocumentsSeeder extends Seeder
{
    public function run(): void
    {
        $path = database_path('seeders/data/source-documents.json');
        $contents = file_get_contents($path);

        if ($contents === false) {
            throw new RuntimeException("Unable to read source document seed data at [{$path}].");
        }

        $data = json_decode($contents, true, flags: JSON_THROW_ON_ERROR);

        foreach ($data['machinery'] as $index => $assetData) {
            $sourceKey = sprintf('site-machinery-%02d', $index + 1);
            $asset = MachineryAsset::withTrashed()->where('source_key', $sourceKey)->first();

            if ($asset !== null) {
                continue;
            }

            $asset = new MachineryAsset;
            $asset->source_key = $sourceKey;
            $asset->fill(Arr::only($assetData, (new MachineryAsset)->getFillable()));
            $asset->save();
        }

        $page = Page::query()->where('slug', 'about')->first();
        if ($page === null) {
            throw new RuntimeException('The source document appendix requires the seeded [about] page.');
        }

        $changed = false;
        foreach (['fa', 'en'] as $language) {
            $field = "content_{$language}";
            $appendix = $data["about_appendix_{$language}"];
            $marker = $data["about_appendix_marker_{$language}"];

            if (! str_contains((string) $page->{$field}, $marker)) {
                $page->{$field} = rtrim((string) $page->{$field}).$appendix;
                $changed = true;
            }
        }

        if ($changed) {
            $page->save();
        }
    }
}
