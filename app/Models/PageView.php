<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Throwable;

class PageView extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'key',
        'click_id',
        'ip_address',
        'user_agent',
        'country',
        'referer',
    ];

    /**
     * Log a view of the given page for the current request.
     *
     * When the request carries a click_id (forwarded from an upstream
     * ad-tracking redirect), it's reused as this view's click_id rather than
     * generating a fresh one, and firstOrCreate keeps a repeat hit on the
     * same click_id (e.g. a page reload) idempotent instead of tripping the
     * column's unique constraint.
     */
    public static function record(string $key, Request $request): self
    {
        $ip = $request->ip();
        $clickId = $request->query('click_id');

        $attributes = [
            'key' => $key,
            'ip_address' => $ip,
            'user_agent' => $request->userAgent(),
            'country' => static::resolveCountry($ip),
            'referer' => $request->headers->get('referer'),
        ];

        if ($clickId) {
            return static::firstOrCreate(['click_id' => $clickId], $attributes);
        }

        return static::create($attributes);
    }

    /**
     * Scope a query to only include views for the given page key.
     */
    public function scopeForKey(Builder $query, string $key): Builder
    {
        return $query->where('key', $key);
    }

    /**
     * Mark the page view behind the given click_id as converted into a
     * lead, so it isn't double-counted on a later submission attempt.
     */
    public static function markConverted(string $clickId): void
    {
        static::where('click_id', $clickId)
            ->whereNull('converted_at')
            ->update(['converted_at' => now()]);
    }

    /**
     * Resolve the country name for an IP address via a free geolocation
     * lookup, cached per IP so we don't hit the provider repeatedly.
     *
     * Only a successful lookup is cached (for a day) — a failed/timed-out
     * attempt is left uncached so the next page view for that IP gets to
     * retry live instead of being stuck with a null country for a day.
     */
    public static function resolveCountry(?string $ip): ?string
    {
        if (! $ip || ! filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
            return null;
        }

        $cacheKey = "geoip:country:{$ip}";

        if (! is_null($cached = Cache::get($cacheKey))) {
            return $cached;
        }

        $country = static::lookupCountry($ip);

        if ($country) {
            Cache::put($cacheKey, $country, now()->addDay());
        }

        return $country;
    }

    /**
     * Hit the geolocation provider for the given IP's country, retrying
     * once on network failures (e.g. a slow DNS resolution) before giving
     * up.
     */
    protected static function lookupCountry(string $ip): ?string
    {
        try {
            $response = Http::timeout(3)->retry(2, 200)->get("http://ip-api.com/json/{$ip}", [
                'fields' => 'status,country',
            ]);

            if ($response->ok() && $response->json('status') === 'success') {
                return $response->json('country');
            }
        } catch (Throwable $e) {
            report($e);
        }

        return null;
    }
}
