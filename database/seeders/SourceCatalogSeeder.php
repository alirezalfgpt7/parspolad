<?php

namespace Database\Seeders;

use App\Models\Contract;
use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Arr;
use RuntimeException;

class SourceCatalogSeeder extends Seeder
{
    public function run(): void
    {
        $path = database_path('seeders/data/source-catalog.json');
        $contents = file_get_contents($path);

        if ($contents === false) {
            throw new RuntimeException("Unable to read source catalog seed data at [{$path}].");
        }

        $data = json_decode($contents, true, flags: JSON_THROW_ON_ERROR);

        foreach ($data['contracts'] as $contract) {
            Contract::withTrashed()->firstOrCreate(
                ['contract_number' => $contract['contract_number']],
                Arr::only($contract, (new Contract)->getFillable()),
            );
        }

        foreach ($data['products'] as $product) {
            Product::withTrashed()->firstOrCreate(
                ['slug' => $product['slug']],
                Arr::only($product, (new Product)->getFillable()),
            );
        }
    }
}
