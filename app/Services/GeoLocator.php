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
     * In local development, a real lookup can't resolve a country for
     * localhost/private IPs, so `?debug_country=CA` lets a developer
     * simulate a visitor's country instead. Never applies outside local.
     *
     * @see \App\Models\PageView::resolveCountryForRequest() for the
     *      equivalent override used when recording the page view.
     */
    public function countryCode(Request $request): ?string
    {
        if (app()->environment('local') && $request->filled('debug_country')) {
            return strtoupper((string) $request->string('debug_country'));
        }

        $ip = $request->ip();

        if (! $ip || ! filter_var($ip, FILTER_VALIDATE_IP) || ! $this->isPubliclyRoutable($ip)) {
            return null;
        }

        return Cache::remember("geo:country:{$ip}", now()->addHours(6), function () use ($ip) {
            try {
                $response = Http::timeout(3)->get("https://ipapi.co/{$ip}/json/");
            } catch (\Throwable $e) {
                Log::warning('geo: ip lookup request failed', ['ip' => $ip, 'message' => $e->getMessage()]);

                return null;
            }

            if ($response->failed()) {
                Log::warning('geo: ip lookup returned an error', ['ip' => $ip, 'status' => $response->status()]);

                return null;
            }

            $code = $response->json('country_code');

            return is_string($code) && strlen($code) === 2 ? strtoupper($code) : null;
        });
    }

    private function isPubliclyRoutable(string $ip): bool
    {
        return filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) !== false;
    }
}
