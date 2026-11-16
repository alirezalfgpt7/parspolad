<?php

use App\Http\Controllers\Api\V1\AdminResourceController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\ContractController;
use App\Http\Controllers\Api\V1\LicenseController;
use App\Http\Controllers\Api\V1\ProjectController;
use App\Http\Controllers\Api\V1\PublicController;
use App\Http\Controllers\Api\V1\SettingsController;
use App\Http\Controllers\Api\V1\SliderController;
use App\Http\Controllers\Api\V1\ThemeController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function (): void {
    // Public API endpoints
    Route::get('/bootstrap', [PublicController::class, 'bootstrap']);
    Route::get('/search', [PublicController::class, 'search']);
    Route::post('/contact', [PublicController::class, 'submitContact']);
    Route::get('/projects', [ProjectController::class, 'index']);
    Route::get('/projects/{slug}', [ProjectController::class, 'show']);
    Route::get('/contracts', [ContractController::class, 'index']);
    Route::get('/licenses', [LicenseController::class, 'index']);
    Route::get('/sliders', [SliderController::class, 'index']);
    Route::get('/theme', [ThemeController::class, 'show']);

    // Authentication
    Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:10,1');

    // Protected API routes (Laravel Sanctum)
    Route::middleware('auth:sanctum')->group(function (): void {
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::post('/auth/2fa', [AuthController::class, 'toggleTwoFactor']);

        // Admin CMS & Management
        Route::prefix('admin')->group(function (): void {
            Route::put('/theme', [ThemeController::class, 'update']);
            Route::post('/theme/presets', [ThemeController::class, 'storePreset']);

            Route::post('/sliders/slides', [SliderController::class, 'storeSlide']);
            Route::put('/sliders/slides/{slide}', [SliderController::class, 'updateSlide']);
            Route::post('/sliders/reorder', [SliderController::class, 'reorder']);
            Route::delete('/sliders/slides/{slide}', [SliderController::class, 'destroySlide']);

            Route::post('/projects', [ProjectController::class, 'store']);
            Route::put('/projects/{project}', [ProjectController::class, 'update']);
            Route::delete('/projects/{project}', [ProjectController::class, 'destroy']);
            Route::get('/projects-export', [ProjectController::class, 'export']);

            Route::post('/contracts', [ContractController::class, 'store']);
            Route::put('/contracts/{contract}', [ContractController::class, 'update']);
            Route::delete('/contracts/{contract}', [ContractController::class, 'destroy']);
            Route::get('/contracts-export', [ContractController::class, 'export']);

            Route::post('/licenses', [LicenseController::class, 'store']);
            Route::put('/licenses/{license}', [LicenseController::class, 'update']);
            Route::delete('/licenses/{license}', [LicenseController::class, 'destroy']);

            Route::put('/settings', [SettingsController::class, 'updateGeneral']);
            Route::put('/settings/email', [SettingsController::class, 'updateEmail']);
            Route::put('/settings/sms', [SettingsController::class, 'updateSms']);
            Route::post('/settings/sms/test', [SettingsController::class, 'testSms']);

            Route::get('/users', [AdminResourceController::class, 'users']);
            Route::post('/users', [AdminResourceController::class, 'storeUser']);
            Route::get('/messages', [AdminResourceController::class, 'messages']);
            Route::put('/messages/{message}', [AdminResourceController::class, 'updateMessageStatus']);
            Route::get('/notifications', [AdminResourceController::class, 'notifications']);
            Route::post('/media/upload', [AdminResourceController::class, 'uploadMedia']);
            Route::get('/activity-logs', [AdminResourceController::class, 'activityLogs']);
            Route::get('/activity-logs-export', [AdminResourceController::class, 'exportLogs']);
        });
    });
});
