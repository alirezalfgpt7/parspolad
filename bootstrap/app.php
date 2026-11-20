<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Console\Scheduling\Schedule;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withCommands()
    ->withSchedule(function (Schedule $schedule): void {
        $schedule->command('activity-logs:prune')->daily()->withoutOverlapping();
    })
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->statefulApi();
        $middleware->append(\App\Http\Middleware\ForceHttps::class);
        $middleware->append(\App\Http\Middleware\SecurityHeaders::class);
        $middleware->alias([
            'role' => \Spatie\Permission\Middleware\RoleMiddleware::class,
            'permission' => \Spatie\Permission\Middleware\PermissionMiddleware::class,
            'role_or_permission' => \Spatie\Permission\Middleware\RoleOrPermissionMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (\PDOException $exception, Request $request) {
            $connectionErrorCodes = [2002, 2003, 2006, 2013, 2055];
            $connectionUnavailable = false;

            for ($cause = $exception; $cause !== null; $cause = $cause->getPrevious()) {
                $errorInfo = $cause instanceof \PDOException ? ($cause->errorInfo ?? []) : [];
                $sqlState = (string) ($errorInfo[0] ?? $cause->getCode());
                $driverCode = (int) ($errorInfo[1] ?? $cause->getCode());

                if (
                    str_starts_with($sqlState, '08')
                    || in_array($sqlState, ['57P01', '57P02', '57P03'], true)
                    || in_array($driverCode, $connectionErrorCodes, true)
                ) {
                    $connectionUnavailable = true;
                    break;
                }
            }

            if (! $connectionUnavailable) {
                return null;
            }

            $headers = ['Retry-After' => '60'];

            if ($request->expectsJson()) {
                return response()->json([
                    'code' => 'database_unavailable',
                    'message' => 'ارتباط با پایگاه داده موقتاً برقرار نیست. لطفاً کمی بعد دوباره تلاش کنید.',
                ], 503, $headers);
            }

            return response()->view('errors.database-unavailable', [], 503, $headers);
        });
    })
    ->create();
