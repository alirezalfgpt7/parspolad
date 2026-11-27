<?php

use App\Models\ThemeSetting;
use App\Models\ThemePreset;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use PragmaRX\Google2FA\Google2FA;

beforeEach(fn () => $this->seed(DatabaseSeeder::class));

it('returns public bootstrap payload with active industrial crimson theme', function (): void {
    ThemeSetting::query()->firstOrFail()->update([
        'active_palette' => [
            'primary' => '#B91C1C',
            'secondary' => '#1E293B',
            'accent' => '#D97706',
        ],
        'admin_palette' => [
            'primary' => '#B91C1C',
            'secondary' => '#1E293B',
            'accent' => '#D97706',
        ],
    ]);

    $response = $this->getJson('/api/v1/bootstrap');

    $response->assertOk()
        ->assertJsonPath('theme_settings.active_preset_slug', 'industrial-crimson')
        ->assertJsonPath('theme_settings.design_style', 'modern')
        ->assertJsonPath('theme_settings.button_shape', 'rounded')
        ->assertJsonPath('theme_settings.landing_design_style', 'glass')
        ->assertJsonPath('theme_settings.admin_design_style', 'industrial')
        ->assertJsonPath('theme_settings.landing_header_settings.mode', 'glass')
        ->assertJsonPath('theme_settings.admin_palette.surface', '#FFFFFF')
        ->assertJsonPath('theme.admin_palette.headerBg', '#FFFFFF')
        ->assertJsonStructure([
            'theme_presets',
            'theme_settings',
            'kpis',
            'contracts',
            'licenses',
            'settings',
        ]);

    expect(ThemePreset::query()->whereIn('slug', [
        'midnight-violet',
        'rose-burgundy',
        'teal-sunset',
        'forest-mint',
        'deep-ocean',
    ])->count())->toBe(5);
});

it('authenticates seeded super admin with Sanctum token and updates theme', function (): void {
    $login = $this->postJson('/api/v1/auth/login', loginPayloadWithCaptcha($this));

    $login->assertOk()->assertJsonStructure(['token', 'user' => ['id', 'email', 'role']]);
    $token = $login->json('token');

    $updateTheme = $this->withToken($token)->putJson('/api/v1/admin/themes', [
        'active_preset_slug' => 'petro-navy',
        'default_mode' => 'dark',
        'design_style' => 'glass',
        'button_shape' => 'pill',
        'button_effect' => 'liquid',
        'active_palette' => [
            'primary' => '#0369A1',
            'secondary' => '#0F172A',
            'accent' => '#D97706',
        ],
        'landing_theme_enabled' => true,
        'landing_palette' => [
            'primary' => '#B91C1C',
            'secondary' => '#0F172A',
            'accent' => '#D97706',
        ],
        'landing_design_style' => 'industrial',
        'landing_button_shape' => 'square',
        'landing_button_effect' => 'glow',
        'landing_header_settings' => [
            'border_color' => '#CBD5E1',
            'mode' => 'solid',
            'radius' => 24,
            'blur' => 12,
            'wave_colors' => ['#DC2626', '#EF4444', '#F87171'],
            'wave_bottom_color' => '#EF4444',
        ],
        'public_page_title_settings' => [
            'background_color' => '#0F172A',
            'title_color' => '#FFFFFF',
            'subtitle_color' => '#CBD5E1',
            'border_color' => '#334155',
            'wave_color' => '#DC2626',
            'wave_colors' => ['#DC2626', '#EF4444', '#F87171'],
            'icon_name' => 'Globe',
            'icon_color' => '#F8FAFC',
            'icon_background_color' => '#1E293B',
            'radius' => 32,
            'wave_enabled' => true,
        ],
        'admin_palette' => [
            'primary' => '#0F4C81',
            'secondary' => '#1E293B',
            'accent' => '#E11D48',
        ],
        'admin_design_style' => 'modern',
        'admin_button_shape' => 'rounded',
        'admin_button_effect' => 'shimmer',
    ]);

    $updateTheme->assertOk()
        ->assertJsonPath('active_preset_slug', 'petro-navy')
        ->assertJsonPath('design_style', 'glass')
        ->assertJsonPath('button_shape', 'pill')
        ->assertJsonPath('button_effect', 'liquid')
        ->assertJsonPath('landing_design_style', 'industrial')
        ->assertJsonPath('landing_button_shape', 'square')
        ->assertJsonPath('landing_header_settings.mode', 'solid')
        ->assertJsonPath('landing_header_settings.radius', 24)
        ->assertJsonPath('landing_header_settings.wave_colors.1', '#EF4444')
        ->assertJsonPath('landing_header_settings.wave_bottom_color', '#EF4444')
        ->assertJsonPath('public_page_title_settings.wave_color', '#DC2626')
        ->assertJsonPath('public_page_title_settings.wave_colors.2', '#F87171')
        ->assertJsonPath('public_page_title_settings.radius', 32)
        ->assertJsonPath('admin_design_style', 'modern')
        ->assertJsonPath('admin_palette.primary', '#0F4C81')
        ->assertJsonPath('admin_palette.surface', '#FFFFFF')
        ->assertJsonPath('active_palette.headerBg', '#FFFFFF');

    $invalidHeaderSettings = $updateTheme->json();
    $invalidHeaderSettings['landing_header_settings']['radius'] = 999;
    $this->withToken($token)->putJson('/api/v1/admin/themes', $invalidHeaderSettings)
        ->assertUnprocessable()
        ->assertJsonValidationErrors('landing_header_settings.radius');

    $invalidPageTitleSettings = $updateTheme->json();
    $invalidPageTitleSettings['public_page_title_settings']['radius'] = 999;
    $this->withToken($token)->putJson('/api/v1/admin/themes', $invalidPageTitleSettings)
        ->assertUnprocessable()
        ->assertJsonValidationErrors('public_page_title_settings.radius');

    $invalidWaveColor = $updateTheme->json();
    $invalidWaveColor['landing_header_settings']['wave_colors'][1] = 'red';
    $this->withToken($token)->putJson('/api/v1/admin/themes', $invalidWaveColor)
        ->assertUnprocessable()
        ->assertJsonValidationErrors('landing_header_settings.wave_colors.1');
});

it('requires a valid server-side captcha for login', function (): void {
    $credentials = [
        'email' => env('SUPER_ADMIN_EMAIL', 'admin@parspooladaghaei.ir'),
        'password' => env('SUPER_ADMIN_PASSWORD', 'ParsPolad@1404'),
    ];

    $this->postJson('/api/v1/auth/login', $credentials)
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['captcha_key', 'captcha']);

    $payload = loginPayloadWithCaptcha($this, array_merge($credentials, ['captcha' => 'wrong']));
    $this->postJson('/api/v1/auth/login', $payload)
        ->assertUnprocessable()
        ->assertJsonValidationErrors('captcha');
});

it('preserves the captcha challenge when completing two-factor login', function (): void {
    $secret = (new Google2FA)->generateSecretKey();
    User::query()
        ->where('email', env('SUPER_ADMIN_EMAIL', 'admin@parspooladaghaei.ir'))
        ->firstOrFail()
        ->update([
            'two_factor_enabled' => true,
            'two_factor_secret' => $secret,
        ]);

    $credentials = [
        'email' => env('SUPER_ADMIN_EMAIL', 'admin@parspooladaghaei.ir'),
        'password' => env('SUPER_ADMIN_PASSWORD', 'ParsPolad@1404'),
    ];

    $this->postJson('/api/v1/auth/login', loginPayloadWithCaptcha($this, $credentials))
        ->assertOk()
        ->assertJsonPath('requires_2fa', true);

    $payload = loginPayloadWithCaptcha($this, $credentials);
    $payload['two_factor_code'] = (new Google2FA)->getCurrentOtp($secret);

    $this->postJson('/api/v1/auth/login', $payload)
        ->assertOk()
        ->assertJsonStructure(['token', 'user']);
});
