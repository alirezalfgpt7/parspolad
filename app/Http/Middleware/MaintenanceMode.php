<?php

namespace App\Http\Middleware;

use App\Models\Setting;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class MaintenanceMode
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->is('api/v1/bootstrap', 'api/v1/auth/login', 'api/v1/captcha/challenge') || ! $this->isEnabled()) {
            return $next($request);
        }

        $user = $request->user('sanctum');
        if ($user?->can('settings.manage') || $user?->hasRole(['super_admin', 'admin'])) {
            return $next($request);
        }

        return response()->json([
            'message' => 'سامانه موقتاً در حال بروزرسانی است. لطفاً بعداً دوباره تلاش کنید.',
        ], 503, ['Retry-After' => '300']);
    }

    private function isEnabled(): bool
    {
        $value = Setting::query()
            ->where('group', 'site')
            ->where('key', 'maintenance_mode')
            ->value('value');

        return filter_var($value, FILTER_VALIDATE_BOOLEAN);
    }
}
