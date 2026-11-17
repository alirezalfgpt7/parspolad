<?php

return [
    'name' => env('APP_NAME', 'Pars Poolad Aghaee'),
    'env' => env('APP_ENV', 'production'),
    'debug' => (bool) env('APP_DEBUG', false),
    'url' => env('APP_URL', 'http://localhost:8000'),
    'frontend_url' => env('FRONTEND_URL', 'http://localhost:3000'),
    'force_https' => env('FORCE_HTTPS', false),
    'trusted_proxies' => array_values(array_filter(array_map(
        'trim',
        explode(',', (string) env('TRUSTED_PROXIES', '')),
    ))),
    'timezone' => 'Asia/Tehran',
    'locale' => 'fa',
    'fallback_locale' => 'en',
    'faker_locale' => 'fa_IR',
    'cipher' => 'AES-256-CBC',
    'key' => env('APP_KEY'),
    'previous_keys' => array_filter(explode(',', (string) env('APP_PREVIOUS_KEYS', ''))),
    'maintenance' => ['driver' => 'file'],
];
