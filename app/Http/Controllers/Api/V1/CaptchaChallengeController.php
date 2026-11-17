<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\CaptchaChallengeService;
use Illuminate\Http\JsonResponse;

class CaptchaChallengeController extends Controller
{
    public function __invoke(CaptchaChallengeService $captcha): JsonResponse
    {
        return response()
            ->json($captcha->issue())
            ->header('Cache-Control', 'no-store, private');
    }
}
