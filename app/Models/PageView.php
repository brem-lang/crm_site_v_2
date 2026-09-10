<?php

namespace App\Models;

use App\Services\GeoLocator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
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
        'visitor_session_id',
        'visitor_id',
        'sequence_number',
        'page_path',
        'full_url',
        'entered_at',
        'left_at',
        'time_spent_seconds',
        'scroll_depth_max',
        'load_time_ms',
        'is_entry',
        'is_exit',
        'device_type',
        'browser',
        'os',
    ];

    /**
     * The attributes that should be cast.
     *
     * A plain $casts property rather than the casts() method Laravel also
     * supports — Larastan's static analysis reads this reliably, whereas
     * it doesn't always pick up a method-based cast map.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'entered_at' => 'datetime',
        'left_at' => 'datetime',
        'is_entry' => 'boolean',
        'is_exit' => 'boolean',
    ];

    /**
     * @return BelongsTo<VisitorSession, $this>
     */
    public function visitorSession(): BelongsTo
    {
        return $this->belongsTo(VisitorSession::class);
    }

    /**
     * @return BelongsTo<Visitor, $this>
     */
    public function visitor(): BelongsTo
    {
        return $this->belongsTo(Visitor::class);
    }

    /**
     * Log a view of the given page for the current request.
     *
     * When the request carries a click_id (forwarded from an upstream
     * ad-tracking redirect), it's reused as this view's click_id rather than
     * generating a fresh one, and firstOrCreate keeps a repeat hit on the
     * same click_id (e.g. a page reload) idempotent instead of tripping the
     * column's unique constraint.
     *
     * When a VisitorSession is available (the normal case — see
     * App\Http\Middleware\TrackPageView), this also stamps the view's
     * position within that session and rolls the session's page count and
     * entry/exit pointers forward.
     */
    public static function record(string $key, Request $request, ?VisitorSession $session = null): self
    {
        $ip = $request->ip();
        $clickId = $request->query('click_id');

        $attributes = [
            'key' => $key,
            'ip_address' => $ip,
            'user_agent' => $request->userAgent(),
            'country' => static::resolveCountryForRequest($request),
            'referer' => $request->headers->get('referer'),
        ];

        if ($session) {
            $attributes = [
                ...$attributes,
                'visitor_session_id' => $session->id,
                'visitor_id' => $session->visitor_id,
                'sequence_number' => $session->pages_viewed + 1,
                'page_path' => $request->path(),
                'full_url' => $request->fullUrl(),
                'entered_at' => now(),
                'is_entry' => $session->pages_viewed === 0,
                'device_type' => $session->device_type,
                'browser' => $session->browser,
                'os' => $session->os,
            ];
        }

        $view = $clickId
            ? static::firstOrCreate(['click_id' => $clickId], $attributes)
            : static::create($attributes);

        if ($session && $view->wasRecentlyCreated) {
            $session->increment('pages_viewed');

            $updates = ['exit_page_view_id' => $view->id];
            if ($session->pages_viewed === 1) {
                $updates['entry_page_view_id'] = $view->id;
            }
            $session->forceFill($updates)->save();
        }

        return $view;
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
     * Resolve the country to record for this request.
     *
     * `?debug_country=CA` still lets a developer force a specific country
     * (local environment only). Otherwise this prefers Cloudflare's
     * CF-IPCountry header (see GeoLocator::cloudflareCountryCode()) so
     * logging a page view doesn't cost an ip-api.com lookup when Cloudflare
     * already told us the country; only falls back to geolocating whichever
     * IP GeoLocator::resolveClientIp() decides is the real one — the actual
     * client IP in production, or (in local development) the developer's
     * real public IP — when that header is missing or unknown.
     *
     * @see GeoLocator::countryCode() for the equivalent
     *      override used to decide which template variant to redirect to.
     */
    protected static function resolveCountryForRequest(Request $request): ?string
    {
        if (app()->environment('local') && $request->filled('debug_country')) {
            return static::countryNameForCode((string) $request->string('debug_country'));
        }

        $geoLocator = app(GeoLocator::class);

        if ($cfCountry = $geoLocator->cloudflareCountryCode($request)) {
            return static::countryNameForCode($cfCountry);
        }

        return static::resolveCountry($geoLocator->resolveClientIp($request));
    }

    /**
     * Map an ISO 3166-1 alpha-2 country code to the country name our real
     * geolocation lookup (ip-api.com's `country` field) would have stored,
     * so a value read from CF-IPCountry or ?debug_country lands in this
     * column in the same format regardless of which path produced it.
     * `Locale::getDisplayRegion()` (the intl extension) already agrees with
     * ip-api.com on the names this app cares about (e.g. "Canada", "United
     * Kingdom"), and covers every other country the same way. Falls back to
     * the raw code if it can't resolve one (e.g. a bogus ?debug_country).
     */
    protected static function countryNameForCode(string $code): string
    {
        $code = strtoupper($code);
        $name = \Locale::getDisplayRegion("und-{$code}", 'en');

        return $name !== '' && $name !== $code ? $name : $code;
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
