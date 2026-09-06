<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GeoController extends Controller
{
    /**
     * Resolve the visitor's ISO 3166-1 alpha-2 country code from their IP
     * address, so the frontend can preselect the phone dial code.
     *
     * Done server-side (rather than the browser calling a geo-IP API
     * directly) so the lookup isn't affected by ad/tracker blockers, which
     * commonly block third-party IP-geolocation domains, and so it uses the
     * IP address as the server sees it.
     */
    public function countryCode(Request $request): JsonResponse
    {
        $ip = $request->ip();

        if (! $ip || ! filter_var($ip, FILTER_VALIDATE_IP) || ! $this->isPubliclyRoutable($ip)) {
            return response()->json(['country_code' => null]);
        }

        $countryCode = Cache::remember("geo:country:{$ip}", now()->addHours(6), function () use ($ip) {
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

        return response()->json(['country_code' => $countryCode]);
    }

    private function isPubliclyRoutable(string $ip): bool
    {
        return filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) !== false;
    }
}
