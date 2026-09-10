<?php

namespace App\Services;

use App\Models\PageView;
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
     * @see PageView::resolveCountryForRequest() for the
     *      equivalent override used when recording the page view.
     */
    public function countryCode(Request $request): ?string
    {
        if (app()->environment('local') && $request->filled('debug_country')) {
            return strtoupper((string) $request->string('debug_country'));
        }

        if ($cfCountry = $this->cloudflareCountryCode($request)) {
            return $cfCountry;
        }

        $ip = $this->resolveClientIp($request);

        if (! $ip) {
            return null;
        }

        return Cache::remember("geo:country:{$ip}", now()->addHours(6), function () use ($ip) {
            // Fallback for requests that don't carry CF-IPCountry (local
            // dev, or anything reaching the origin without going through
            // Cloudflare). ip-api.com's free tier (no signup/key needed,
            // HTTP only, ~45 req/min from this server's IP) — switched from
            // ipapi.co, whose free quota was exhausted and returning 429
            // for every lookup.
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
     * Read the visitor's country straight from Cloudflare, if this request
     * was proxied through it.
     *
     * Cloudflare already resolves the visitor's country on every proxied
     * request and hands it to us for free in this header — no network
     * round-trip, no third-party API, no rate limit. "XX" means Cloudflare
     * couldn't determine it and "T1" means Tor; both are treated as
     * unknown (null), so callers fall back to an IP-based lookup, which
     * also covers local dev and any request that reaches us directly,
     * bypassing Cloudflare.
     *
     * @see PageView::resolveCountryForRequest() also uses this
     *      to avoid an ip-api.com lookup when Cloudflare already knows.
     */
    public function cloudflareCountryCode(Request $request): ?string
    {
        $cfCountry = $request->header('CF-IPCountry');

        if (! is_string($cfCountry) || ! preg_match('/^[A-Za-z]{2}$/', $cfCountry)) {
            return null;
        }

        $cfCountry = strtoupper($cfCountry);

        return in_array($cfCountry, ['XX', 'T1'], true) ? null : $cfCountry;
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

    /**
     * Resolve the richer set of free geo/network details ip-api.com's free
     * tier exposes for the given IP: region, city, timezone, ISP, ASN, and
     * (best-effort, no paid provider) mobile-carrier/proxy/hosting flags —
     * used to populate VisitorSession's location and traffic-quality
     * columns. Cached per IP alongside the simpler country-only lookups
     * this class already does; only a successful lookup is cached, so a
     * failed attempt can retry live on the next request for that IP.
     *
     * Cloudflare's CF-IPCountry header still wins for the country itself
     * when available (see cloudflareCountryCode()) since it's free and
     * doesn't cost an ip-api.com request.
     *
     * @return array<string, string|bool|null>
     */
    public function geoDetails(Request $request, ?string $ip): array
    {
        $empty = [
            'country' => null, 'country_code' => null, 'region' => null,
            'city' => null, 'timezone' => null, 'isp' => null, 'asn' => null,
            'mobile' => null, 'proxy' => null, 'hosting' => null,
        ];

        $details = $ip ? $this->lookupGeoDetails($ip) : null;
        $details = $details ? [...$empty, ...$details] : $empty;

        // Prefer Cloudflare's own country signal over ip-api.com's when
        // both are available — it's free, instant, and already what the
        // rest of the app treats as authoritative.
        if ($cfCountry = $this->cloudflareCountryCode($request)) {
            $details['country_code'] = $cfCountry;
        }

        return $details;
    }

    /**
     * @return array<string, string|bool|null>|null
     */
    private function lookupGeoDetails(string $ip): ?array
    {
        if (! filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
            return null;
        }

        $cacheKey = "geo:details:{$ip}";

        if (! is_null($cached = Cache::get($cacheKey))) {
            return $cached;
        }

        try {
            // Free tier, no signup/key needed (~45 req/min from this
            // server's IP) — proxy/hosting/mobile are included in the free
            // field set too, just not returned unless explicitly requested.
            $response = Http::timeout(3)->retry(2, 200)->get("http://ip-api.com/json/{$ip}", [
                'fields' => 'status,country,countryCode,regionName,city,timezone,isp,as,mobile,proxy,hosting',
            ]);
        } catch (\Throwable $e) {
            Log::warning('geo: extended ip lookup failed', ['ip' => $ip, 'message' => $e->getMessage()]);

            return null;
        }

        if ($response->failed() || $response->json('status') !== 'success') {
            return null;
        }

        $details = [
            'country' => $response->json('country'),
            'country_code' => $response->json('countryCode'),
            'region' => $response->json('regionName'),
            'city' => $response->json('city'),
            'timezone' => $response->json('timezone'),
            'isp' => $response->json('isp'),
            'asn' => $response->json('as'),
            'mobile' => $response->json('mobile'),
            'proxy' => $response->json('proxy'),
            'hosting' => $response->json('hosting'),
        ];

        Cache::put($cacheKey, $details, now()->addDay());

        return $details;
    }
}
