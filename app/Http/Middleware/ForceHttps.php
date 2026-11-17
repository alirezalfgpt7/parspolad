<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\IpUtils;
use Symfony\Component\HttpFoundation\Response;

class ForceHttps
{
    public function handle(Request $request, Closure $next): Response
    {
        $trustedProxies = config('app.trusted_proxies', []);
        $remoteAddress = (string) $request->server->get('REMOTE_ADDR', '');
        $isTrustedProxy = $trustedProxies !== []
            && (in_array('*', $trustedProxies, true) || IpUtils::checkIp($remoteAddress, $trustedProxies));

        Request::setTrustedProxies(
            $isTrustedProxy ? $trustedProxies : [],
            Request::HEADER_X_FORWARDED_FOR
                | Request::HEADER_X_FORWARDED_HOST
                | Request::HEADER_X_FORWARDED_PORT
                | Request::HEADER_X_FORWARDED_PROTO
                | Request::HEADER_X_FORWARDED_PREFIX,
        );

        if (config('app.force_https') && ! $request->isSecure()) {
            return redirect()->secure($request->getRequestUri(), 308);
        }

        return $next($request);
    }
}
