<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('menu_items', function (Blueprint $table): void {
            $table->string('icon', 60)->nullable()->after('url');
        });

        foreach ([
            '/' => 'Home',
            '/services' => 'Wrench',
            '/projects' => 'Layers',
            '/contracts-licenses' => 'Award',
            '/about' => 'Building2',
            '/contact' => 'Phone',
            '/rfq' => 'MessageCircle',
            '/faq' => 'HelpCircle',
            '/legal' => 'ShieldCheck',
            '/sitemap' => 'Globe',
        ] as $url => $icon) {
            DB::table('menu_items')
                ->whereNull('parent_id')
                ->where('url', $url)
                ->update(['icon' => $icon]);
        }
    }

    public function down(): void
    {
        Schema::table('menu_items', function (Blueprint $table): void {
            $table->dropColumn('icon');
        });
    }
};
