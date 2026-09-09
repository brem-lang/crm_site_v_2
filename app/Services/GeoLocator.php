<?php

namespace App\Services;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GeoLocator
{
    /**
     * Resolve the visitor's ISO 3166-1 alpha-2 country code from their IP
     * address.
     *
     * Done server-side (rather than the browser calling a geo-IP API
     * directly) so the lookup isn't affected by ad/tracker blockers, which
     * commonly block third-party IP-geolocation domains, and so it uses the
     * IP address as the server sees it.
     *
     * In local development, `?debug_country=CA` still lets a developer
     * force a specific country. But by default (no override), this now
     * resolves against the real client IP wherever possible — see
     * resolveClientIp().
     *
     * @see \App\Models\PageView::resolveCountryForRequest() for the
     *      equivalent override used when recording the page view.
     */
    public function countryCode(Request $request): ?string
    {
        if (app()->environment('local') && $request->filled('debug_country')) {
            return strtoupper((string) $request->string('debug_country'));
        }

        $ip = $this->resolveClientIp($request);

        if (! $ip) {
            return null;
        }

        return Cache::remember("geo:country:{$ip}", now()->addHours(6), function () use ($ip) {
            // ip-api.com's free tier (no signup/key needed, HTTP only, ~45
            // req/min from this server's IP) — switched from ipapi.co,
            // whose free quota was exhausted and returning 429 for every
            // lookup.
            try {
                $response = Http::timeout(3)->get("http://ip-api.com/json/{$ip}", [
                    'fields' => 'status,countryCode',
                ]);
            } catch (\Throwable $e) {
                Log::warning('geo: ip lookup request failed', ['ip' => $ip, 'message' => $e->getMessage()]);

                return null;
            }

            if ($response->failed() || $response->json('status') !== 'success') {
                Log::warning('geo: ip lookup returned an error', [
                    'ip' => $ip,
                    'status' => $response->status(),
                    'body' => $response->json('status'),
                ]);

                return null;
            }

            $code = $response->json('countryCode');

            return is_string($code) && strlen($code) === 2 ? strtoupper($code) : null;
        });
    }

    /**
     * Resolve the IP address to use for geolocation.
     *
     * In production this is always just the real client IP Laravel
     * resolved from the request. In local development, that's always a
     * private/loopback address (127.0.0.1 or a LAN IP), which no
     * geolocation provider can resolve — so instead we look up the
     * machine's actual public IP (via a "what's my IP" service, cached so
     * we're not hitting it on every request) and geolocate that, letting a
     * developer's real location resolve without any manual override.
     */
    public function resolveClientIp(Request $request): ?string
    {
        // Cloudflare sets this to the visitor's real IP directly, which is
        // more reliable than the X-Forwarded-For chain (which can list
        // multiple hops, or be absent if proxy trust isn't configured).
        $cfIp = $request->header('CF-Connecting-IP');

        if (is_string($cfIp) && filter_var($cfIp, FILTER_VALIDATE_IP) && $this->isPubliclyRoutable($cfIp)) {
            return $cfIp;
        }

        $ip = $request->ip();

        if ($ip && filter_var($ip, FILTER_VALIDATE_IP) && $this->isPubliclyRoutable($ip)) {
            return $ip;
        }

        if (! app()->environment('local')) {
            return null;
        }

        return Cache::remember('geo:local-public-ip', now()->addMinutes(30), function () {
            try {
                $response = Http::timeout(3)->get('https://api.ipify.org', ['format' => 'json']);
            } catch (\Throwable $e) {
                Log::warning('geo: local public IP lookup failed', ['message' => $e->getMessage()]);

                return null;
            }

            if ($response->failed()) {
                return null;
            }

            $publicIp = $response->json('ip');

            return is_string($publicIp) && filter_var($publicIp, FILTER_VALIDATE_IP) ? $publicIp : null;
        });
    }

    private function isPubliclyRoutable(string $ip): bool
    {
        return filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) !== false;
    }
}
