<?php

namespace Database\Seeders;

use App\Enums\ContractStatusEnum;
use App\Enums\ProjectStatusEnum;
use App\Models\Contract;
use App\Models\License;
use App\Models\Project;
use App\Models\ProjectCategory;
use App\Models\Slider;
use Illuminate\Database\Seeder;

class CatalogAndProjectsSeeder extends Seeder
{
    public function run(): void
    {
        $wellhead = ProjectCategory::query()->firstOrCreate(
            ['slug' => 'wellhead-equipment'],
            ['name_fa' => 'تجهیزات سرچاهی (Wellhead & X-Mas Tree)', 'name_en' => 'Wellhead Equipment', 'icon' => 'Gauge', 'color' => '#B91C1C']
        );

        $downhole = ProjectCategory::query()->firstOrCreate(
            ['slug' => 'downhole-tools'],
            ['name_fa' => 'ادوات درون‌چاهی (Downhole Tools)', 'name_en' => 'Downhole Tools', 'icon' => 'Cylinder', 'color' => '#D97706']
        );

        Project::query()->firstOrCreate(
            ['slug' => 'nisoc-christmas-tree-5000psi'],
            [
                'title_fa' => 'طراحی، ساخت و آزمون ۵۲ دستگاه شیرآلات و متعلقات سرچاهی کلاس ۵۰۰۰/۱۰۰۰۰ PSI',
                'title_en' => 'Engineering & Manufacturing of 52 API 6A Wellhead & X-Mas Tree Assemblies',
                'category_id' => $wellhead->id,
                'client_name_fa' => 'شرکت ملی مناطق نفت‌خیز جنوب (NISOC)',
                'client_name_en' => 'National Iranian South Oil Company (NISOC)',
                'contract_number' => 'K/402/118-PPA',
                'contract_type_fa' => 'ساخت و تحویل EPC',
                'location_fa' => 'میدان نفتی اهواز و آغاجاری',
                'year' => 1403,
                'status' => ProjectStatusEnum::COMPLETED,
                'summary_fa' => 'تامین و تست هیدرواستاتیک مجموعه‌های اسپول، گیت ولو و درخت کریسمس سرچاهی طبق API 6A.',
                'standards' => ['API 6A PSL-3G', 'ISO 10423:2022', 'NACE MR0175'],
                'cover_image' => '/storage/products/christmas-tree.jpg',
                'is_featured' => true,
            ]
        );

        Project::query()->firstOrCreate(
            ['slug' => 'pedec-downhole-packer-azadegan'],
            [
                'title_fa' => 'ساخت و رانش پکرهای درون‌چاهی و آداپتورهای فشار بالا میادین آزادگان',
                'title_en' => 'Downhole Retrievable Packers & High-Pressure Adapters — Azadegan Field',
                'category_id' => $downhole->id,
                'client_name_fa' => 'شرکت مهندسی و توسعه نفت (متن / PEDEC)',
                'client_name_en' => 'Petroleum Engineering & Development Co. (PEDEC)',
                'contract_number' => 'M/403/044-DH',
                'contract_type_fa' => 'ساخت دانش‌بنیان و عملیات چاه',
                'location_fa' => 'میدان آزادگان جنوبی، خوزستان',
                'year' => 1404,
                'status' => ProjectStatusEnum::IN_PROGRESS,
                'summary_fa' => 'ساخت پکرهای هیدرولیک مقاوم در برابر گاز ترش H2S و آزمون عملکرد دما-فشار.',
                'standards' => ['ISO 14310 V0', 'API 11D1', 'ISO 29001:2020'],
                'cover_image' => '/storage/products/downhole-packer.jpg',
                'is_featured' => true,
            ]
        );

        Contract::query()->firstOrCreate(
            ['contract_number' => 'NISOC-1403-884'],
            [
                'title_fa' => 'ساخت و تعمیر اساسی تجهیزات سرچاهی چاه‌های مناطق نفت‌خیز جنوب',
                'title_en' => 'Manufacturing & Overhaul of Wellhead Assemblies for NISOC',
                'client_fa' => 'شرکت ملی مناطق نفت‌خیز جنوب',
                'client_en' => 'NISOC',
                'amount_billion_irr' => 420.50,
                'start_year' => 1403,
                'status' => ContractStatusEnum::ACTIVE,
                'scope_fa' => 'طراحی مهندسی معکوس، فورج، ماشین‌کاری CNC، جوشکاری روکش اینکونل و تست API 6A',
                'requires_auth' => true,
            ]
        );

        License::query()->firstOrCreate(
            ['code' => 'ISO 29001:2020'],
            [
                'title_fa' => 'سیستم مدیریت کیفیت ویژه صنایع نفت، گاز و پتروشیمی',
                'title_en' => 'Oil, Gas & Petrochemical Quality Management System',
                'issuer_fa' => 'TÜV NORD / مرجع بین‌المللی ممیزی کیفیت',
                'issuer_en' => 'International Quality Certification Body',
                'issue_date' => '1402/06/15',
                'expiry_date' => '1405/06/14',
                'category' => 'iso',
                'image_url' => '/storage/certificates/iso-29001.jpg',
                'requires_auth' => false,
            ]
        );

        Slider::query()->firstOrCreate(
            ['key' => 'home_hero'],
            ['title_fa' => 'اسلایدر اصلی صفحه نخست', 'title_en' => 'Home Hero Slider', 'page_slug' => 'home', 'is_active' => true]
        );
    }
}
