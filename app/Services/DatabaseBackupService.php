<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\ValidationException;
use Illuminate\Database\QueryException;
use Spatie\Permission\PermissionRegistrar;
use JsonException;

class DatabaseBackupService
{
    public const FORMAT = 'parspolad.database-backup';

    public const VERSION = 1;

    private const EXCLUDED_TABLES = [
        'cache',
        'cache_locks',
        'failed_jobs',
        'job_batches',
        'jobs',
        'migrations',
        'password_reset_tokens',
        'personal_access_tokens',
        'sessions',
    ];

    private const TABLE_LABELS = [
        'activity_log' => ['fa' => 'گزارش فعالیت‌ها', 'en' => 'Activity logs'],
        'articles' => ['fa' => 'مقالات', 'en' => 'Articles'],
        'article_comments' => ['fa' => 'دیدگاه‌های مقالات', 'en' => 'Article comments'],
        'banners' => ['fa' => 'بنرها', 'en' => 'Banners'],
        'cache' => ['fa' => 'حافظهٔ موقت', 'en' => 'Cache'],
        'contact_messages' => ['fa' => 'پیام‌های تماس', 'en' => 'Contact messages'],
        'contracts' => ['fa' => 'قراردادها', 'en' => 'Contracts'],
        'contract_documents' => ['fa' => 'اسناد قراردادها', 'en' => 'Contract documents'],
        'departments' => ['fa' => 'واحدهای سازمانی', 'en' => 'Departments'],
        'email_settings' => ['fa' => 'تنظیمات ایمیل', 'en' => 'Email settings'],
        'failed_jobs' => ['fa' => 'کارهای ناموفق صف', 'en' => 'Failed jobs'],
        'kpis' => ['fa' => 'شاخص‌های آماری', 'en' => 'Performance indicators'],
        'licenses' => ['fa' => 'گواهینامه‌ها', 'en' => 'Licenses'],
        'license_attachments' => ['fa' => 'پیوست‌های گواهینامه‌ها', 'en' => 'License attachments'],
        'media_files' => ['fa' => 'کتابخانهٔ رسانه', 'en' => 'Media files'],
        'menus' => ['fa' => 'منوها', 'en' => 'Menus'],
        'menu_items' => ['fa' => 'آیتم‌های منو', 'en' => 'Menu items'],
        'model_has_permissions' => ['fa' => 'دسترسی‌های کاربران', 'en' => 'User permissions'],
        'model_has_roles' => ['fa' => 'نقش‌های کاربران', 'en' => 'User roles'],
        'notifications' => ['fa' => 'اعلان‌ها', 'en' => 'Notifications'],
        'notification_templates' => ['fa' => 'قالب‌های اعلان', 'en' => 'Notification templates'],
        'pages' => ['fa' => 'صفحات محتوا', 'en' => 'Content pages'],
        'partners' => ['fa' => 'کارفرمایان و شرکا', 'en' => 'Clients and partners'],
        'permissions' => ['fa' => 'مجوزهای سامانه', 'en' => 'Permissions'],
        'products' => ['fa' => 'محصولات', 'en' => 'Products'],
        'project_categories' => ['fa' => 'دسته‌بندی پروژه‌ها', 'en' => 'Project categories'],
        'project_documents' => ['fa' => 'اسناد پروژه‌ها', 'en' => 'Project documents'],
        'project_images' => ['fa' => 'تصاویر پروژه‌ها', 'en' => 'Project images'],
        'project_videos' => ['fa' => 'ویدیوهای پروژه‌ها', 'en' => 'Project videos'],
        'projects' => ['fa' => 'پروژه‌ها', 'en' => 'Projects'],
        'role_has_permissions' => ['fa' => 'مجوزهای نقش‌ها', 'en' => 'Role permissions'],
        'roles' => ['fa' => 'نقش‌های سامانه', 'en' => 'Roles'],
        'services' => ['fa' => 'خدمات', 'en' => 'Services'],
        'settings' => ['fa' => 'تنظیمات سامانه', 'en' => 'Settings'],
        'slides' => ['fa' => 'اسلایدها', 'en' => 'Slides'],
        'sliders' => ['fa' => 'اسلایدرها', 'en' => 'Sliders'],
        'sms_provider_settings' => ['fa' => 'تنظیمات پیامک', 'en' => 'SMS provider settings'],
        'team_members' => ['fa' => 'اعضای تیم', 'en' => 'Team members'],
        'theme_presets' => ['fa' => 'قالب‌های رنگ‌بندی', 'en' => 'Theme presets'],
        'theme_settings' => ['fa' => 'تنظیمات ظاهری', 'en' => 'Theme settings'],
        'users' => ['fa' => 'حساب‌های کاربری', 'en' => 'User accounts'],
    ];

    private ?array $tableNamesCache = null;

    public function tableNames(): array
    {
        return $this->tableNamesCache ??= array_values(array_filter(
            DB::connection()->getSchemaBuilder()->getTableListing(null, false),
            fn (string $table): bool => ! in_array($table, self::EXCLUDED_TABLES, true)
                && ! str_starts_with($table, 'sqlite_'),
        ));
    }

    public function catalog(): array
    {
        return array_map(fn (string $table): array => [
            'name' => $table,
            'label_fa' => $this->tableLabel($table)['fa'],
            'label_en' => $this->tableLabel($table)['en'],
            'count' => DB::table($table)->count(),
            'sensitive' => in_array($table, ['users', 'roles', 'permissions', 'email_settings', 'sms_provider_settings'], true),
        ], $this->tableNames());
    }

    public function selectedTables(?array $requested): array
    {
        $available = $this->tableNames();

        if ($requested === null) {
            return $available;
        }

        $unknown = array_values(array_diff($requested, $available));
        if ($unknown !== []) {
            throw ValidationException::withMessages([
                'tables' => 'یک یا چند جدول انتخاب‌شده در این پایگاه‌داده وجود ندارد.',
            ]);
        }

        if ($requested === []) {
            throw ValidationException::withMessages([
                'tables' => 'حداقل یک جدول برای پشتیبان‌گیری انتخاب کنید.',
            ]);
        }

        return array_values(array_unique($requested));
    }

    public function readBackup(UploadedFile $file): array
    {
        try {
            $payload = json_decode(
                file_get_contents($file->getRealPath()),
                true,
                512,
                JSON_THROW_ON_ERROR,
            );
        } catch (JsonException) {
            throw ValidationException::withMessages(['file' => 'محتوای فایل JSON معتبر نیست.']);
        }

        if (! is_array($payload)) {
            throw ValidationException::withMessages(['file' => 'ساختار فایل پشتیبان معتبر نیست.']);
        }

        if (($payload['format'] ?? null) === self::FORMAT) {
            if (($payload['version'] ?? null) !== self::VERSION || ! is_array($payload['tables'] ?? null)) {
                throw ValidationException::withMessages(['file' => 'نسخهٔ فایل پشتیبان با این سامانه سازگار نیست.']);
            }

            $backup = [
                'format' => self::FORMAT,
                'version' => self::VERSION,
                'created_at' => $payload['created_at'] ?? null,
                'legacy' => false,
                'tables' => $payload['tables'],
            ];
        } elseif (is_array($payload['data'] ?? null)) {
            $backup = [
                'format' => 'legacy',
                'version' => 0,
                'created_at' => null,
                'legacy' => true,
                'tables' => $payload['data'],
            ];
        } else {
            throw ValidationException::withMessages(['file' => 'این فایل، نسخهٔ پشتیبان قابل‌بازیابی پارس‌پولاد نیست.']);
        }

        foreach ($backup['tables'] as $table => $rows) {
            if (! is_string($table) || ! is_array($rows)) {
                throw ValidationException::withMessages(['file' => 'ساختار داده‌های فایل پشتیبان معتبر نیست.']);
            }
            foreach ($rows as $row) {
                if (! is_array($row) || ($row !== [] && array_is_list($row))) {
                    throw ValidationException::withMessages(['file' => "ساختار رکوردهای جدول {$table} معتبر نیست."]);
                }
            }
        }

        return $backup;
    }

    public function inspect(array $backup): array
    {
        $availableTables = $this->tableNames();
        $fileTables = array_keys($backup['tables']);
        $tableRows = [];

        foreach ($fileTables as $table) {
            $supported = in_array($table, $availableTables, true);
            $restorable = $supported;
            $error = null;
            if ($supported) {
                try {
                    $this->normalizeRows($table, $backup['tables'][$table]);
                } catch (ValidationException $exception) {
                    $restorable = false;
                    $error = $exception->errors()['file'][0] ?? 'ساختار جدول با پایگاه‌داده فعلی سازگار نیست.';
                }
            } else {
                $error = 'این جدول در نسخهٔ فعلی سامانه وجود ندارد.';
            }

            $tableRows[] = [
                'name' => $table,
                'label_fa' => $this->tableLabel($table)['fa'],
                'label_en' => $this->tableLabel($table)['en'],
                'row_count' => count($backup['tables'][$table]),
                'supported' => $supported,
                'restorable' => $restorable,
                'error' => $error,
            ];
        }

        $missingTables = array_values(array_diff($availableTables, $fileTables));
        $unsupportedTables = array_values(array_diff($fileTables, $availableTables));

        return [
            'format' => $backup['format'],
            'version' => $backup['version'],
            'created_at' => $backup['created_at'],
            'legacy' => $backup['legacy'],
            'complete' => $missingTables === [] && $unsupportedTables === [],
            'table_count' => count($fileTables),
            'current_table_count' => count($availableTables),
            'missing_tables' => $missingTables,
            'unsupported_tables' => $unsupportedTables,
            'tables' => $tableRows,
        ];
    }

    public function restore(array $backup, array $selectedTables): array
    {
        $selectedTables = $this->selectedTables($selectedTables);
        $normalized = [];
        foreach ($selectedTables as $table) {
            if (! array_key_exists($table, $backup['tables'])) {
                throw ValidationException::withMessages([
                    'tables' => "جدول {$table} در فایل انتخاب‌شده وجود ندارد.",
                ]);
            }
            $normalized[$table] = $this->normalizeRows($table, $backup['tables'][$table]);
        }

        $order = $this->dependencyOrder($selectedTables);
        $connection = DB::connection();
        $disableSqliteForeignKeys = $connection->getDriverName() === 'sqlite';
        $permissionRegistrar = app(PermissionRegistrar::class);

        if ($disableSqliteForeignKeys) {
            $connection->statement('PRAGMA foreign_keys = OFF');
        }

        try {
            DB::transaction(function () use ($normalized, $order, $disableSqliteForeignKeys, $permissionRegistrar): void {
                foreach (array_reverse($order) as $table) {
                    DB::table($table)->delete();
                }

                foreach ($order as $table) {
                    foreach (array_chunk($normalized[$table], 500) as $chunk) {
                        DB::table($table)->insert($chunk);
                    }
                }

                $permissionRegistrar->forgetCachedPermissions();
                if (! \App\Models\User::role('super_admin')->where('is_active', true)->exists()) {
                    throw ValidationException::withMessages([
                        'file' => 'بازیابی متوقف شد؛ حداقل یک حساب فعال سوپرادمین باید باقی بماند.',
                    ]);
                }

                if (Schema::hasTable('personal_access_tokens')) {
                    DB::table('personal_access_tokens')->delete();
                }

                if ($disableSqliteForeignKeys && DB::select('PRAGMA foreign_key_check') !== []) {
                    throw ValidationException::withMessages([
                        'tables' => 'بازیابی با روابط بین جدول‌ها سازگار نیست؛ هیچ تغییری اعمال نشد.',
                    ]);
                }
            });
        } catch (QueryException) {
            throw ValidationException::withMessages([
                'tables' => 'جداول انتخاب‌شده با کلیدهای یکتا یا روابط فعلی سازگار نیستند؛ هیچ تغییری اعمال نشد.',
            ]);
        } finally {
            if ($disableSqliteForeignKeys) {
                $connection->statement('PRAGMA foreign_keys = ON');
            }
            $permissionRegistrar->forgetCachedPermissions();
        }

        return array_map(fn (string $table): array => [
            'name' => $table,
            'label_fa' => $this->tableLabel($table)['fa'],
            'row_count' => count($normalized[$table]),
        ], $order);
    }

    private function normalizeRows(string $table, array $rows): array
    {
        if (! in_array($table, $this->tableNames(), true)) {
            throw ValidationException::withMessages(['file' => "جدول {$table} در این سامانه پشتیبانی نمی‌شود."]);
        }

        $schema = DB::connection()->getSchemaBuilder();
        $columns = $schema->getColumns($table);
        $columnNames = array_column($columns, 'name');
        $normalized = [];

        foreach ($rows as $index => $row) {
            $missing = [];
            foreach ($columns as $column) {
                if (
                    ($column['nullable'] ?? true) === false
                    && ($column['default'] ?? null) === null
                    && ! ($column['auto_increment'] ?? false)
                    && (
                        ! array_key_exists($column['name'], $row)
                        || $row[$column['name']] === null
                    )
                ) {
                    $missing[] = $column['name'];
                }
            }

            if ($missing !== []) {
                throw ValidationException::withMessages([
                    'file' => "رکورد ".($index + 1)." از جدول {$table} فیلدهای الزامی را ندارد: ".implode(', ', $missing).'.',
                ]);
            }

            $normalized[] = array_intersect_key($row, array_flip($columnNames));
        }

        return $normalized;
    }

    private function dependencyOrder(array $tables): array
    {
        $schema = DB::connection()->getSchemaBuilder();
        $selected = array_fill_keys($tables, true);
        $state = [];
        $ordered = [];
        $visit = function (string $table) use (&$visit, &$state, &$ordered, $selected, $schema): void {
            if (($state[$table] ?? null) === 'done' || ($state[$table] ?? null) === 'visiting') {
                return;
            }

            $state[$table] = 'visiting';
            foreach ($schema->getForeignKeys($table) as $foreignKey) {
                $parent = $foreignKey['foreign_table'] ?? null;
                if (is_string($parent) && isset($selected[$parent])) {
                    $visit($parent);
                }
            }
            $state[$table] = 'done';
            $ordered[] = $table;
        };

        foreach ($tables as $table) {
            $visit($table);
        }

        return $ordered;
    }

    private function tableLabel(string $table): array
    {
        return self::TABLE_LABELS[$table] ?? [
            'fa' => 'جدول '.str_replace('_', ' ', $table),
            'en' => ucwords(str_replace('_', ' ', $table)),
        ];
    }
}
