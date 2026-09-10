<?php

namespace App\Services;

use App\Models\Visitor;
use App\Models\VisitorSession;
use App\Support\UserAgentParser;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Str;

class VisitorIdentityService
{
    private const VISITOR_COOKIE = 'vtr_id';

    private const SESSION_COOKIE = 'vsn_id';

    /**
     * A gap this long with no activity ends the session; the next page
     * view/ping after it starts a fresh one.
     */
    private const SESSION_TIMEOUT_MINUTES = 30;

    /**
     * Known referrer-domain fragments mapped to a traffic source label,
     * used when the request doesn't carry an explicit utm_source.
     *
     * @var array<string, string>
     */
    private const KNOWN_REFERRER_SOURCES = [
        'google.' => 'google',
        'bing.' => 'bing',
        'yahoo.' => 'yahoo',
        'duckduckgo.' => 'duckduckgo',
        'facebook.' => 'facebook',
        'instagram.' => 'instagram',
        'twitter.' => 'twitter',
        'x.com' => 'twitter',
        't.co' => 'twitter',
        'telegram.' => 'telegram',
        't.me' => 'telegram',
        'linkedin.' => 'linkedin',
        'tiktok.' => 'tiktok',
        'reddit.' => 'reddit',
    ];

    public function __construct(
        private readonly GeoLocator $geoLocator,
        private readonly RiskScorer $riskScorer,
    ) {}

    /**
     * Resolve the visitor and session behind the current request, creating
     * either (or both) as needed, and queue the cookies that identify them
     * on the eventual response.
     */
    public function identify(Request $request): VisitorSession
    {
        $visitor = $this->resolveVisitor($request);

        return $this->resolveSession($request, $visitor);
    }

    private function resolveVisitor(Request $request): Visitor
    {
        $uuid = $request->cookie(self::VISITOR_COOKIE);
        $visitor = $uuid ? Visitor::where('uuid', $uuid)->first() : null;

        if ($visitor) {
            $visitor->forceFill(['last_seen_at' => now()])->save();
        } else {
            $visitor = Visitor::create([
                'uuid' => (string) Str::uuid(),
                'first_seen_at' => now(),
                'last_seen_at' => now(),
                'total_visits' => 0,
            ]);
        }

        Cookie::queue(Cookie::make(
            self::VISITOR_COOKIE,
            $visitor->uuid,
            60 * 24 * 365,
            httpOnly: false,
        ));

        return $visitor;
    }

    private function resolveSession(Request $request, Visitor $visitor): VisitorSession
    {
        $uuid = $request->cookie(self::SESSION_COOKIE);
        $session = $uuid ? VisitorSession::where('uuid', $uuid)->first() : null;

        $lastActivity = $session?->last_activity_at;
        $isStale = $lastActivity
            && Carbon::parse($lastActivity)->lt(now()->subMinutes(self::SESSION_TIMEOUT_MINUTES));

        if (! $session || $isStale) {
            $session = $this->createSession($request, $visitor);
        } else {
            $session->forceFill([
                'last_activity_at' => now(),
                'duration_seconds' => $session->started_at ? now()->diffInSeconds($session->started_at) : null,
            ])->save();
        }

        // Session-length cookie (expires when the browser session ends);
        // the 30-minute inactivity rule above is what actually decides
        // when a *new* session starts, not this cookie's own lifetime.
        Cookie::queue(Cookie::make(self::SESSION_COOKIE, $session->uuid, 0, httpOnly: false));

        return $session;
    }

    private function createSession(Request $request, Visitor $visitor): VisitorSession
    {
        $previousVisits = $visitor->total_visits;
        $visitor->increment('total_visits');

        $ip = $this->geoLocator->resolveClientIp($request);
        $geo = $this->geoLocator->geoDetails($request, $ip);
        $userAgent = (string) $request->userAgent();

        $referer = $request->headers->get('referer');
        $refererDomain = $referer ? (parse_url($referer, PHP_URL_HOST) ?: null) : null;

        // How many sessions from this IP already started in the preceding
        // 24h — a raw signal fed into RiskScorer, not itself a verdict
        // (shared NAT/office IPs, cellular carriers, etc. also produce a
        // high count without being fraudulent).
        $sameIpRecentVisits = $ip
            ? VisitorSession::where('ip_address', $ip)->where('created_at', '>=', now()->subDay())->count()
            : 0;

        $session = VisitorSession::create([
            'uuid' => (string) Str::uuid(),
            'visitor_id' => $visitor->id,
            'click_id' => $request->query('click_id'),

            'referrer_url' => $referer,
            'referrer_domain' => $refererDomain,
            'traffic_source' => $this->resolveTrafficSource($request, $refererDomain),
            'utm_source' => $request->query('utm_source'),
            'utm_medium' => $request->query('utm_medium'),
            'utm_campaign' => $request->query('utm_campaign'),
            'utm_content' => $request->query('utm_content'),
            'utm_term' => $request->query('utm_term'),
            'campaign_id' => $request->query('campaign_id'),
            'affiliate_id' => $request->query('affiliate_id'),
            'external_click_id' => $request->query('click_id'),
            'search_keyword' => $request->query('utm_term') ?: $request->query('q'),

            'ip_address' => $ip,
            'country' => $geo['country'] ?? null,
            'region' => $geo['region'] ?? null,
            'city' => $geo['city'] ?? null,
            'timezone' => $geo['timezone'] ?? null,
            'isp' => $geo['isp'] ?? null,
            'asn' => $geo['asn'] ?? null,
            'is_mobile_carrier' => $geo['mobile'] ?? null,

            'device_type' => UserAgentParser::device($userAgent),
            'device_brand' => UserAgentParser::brand($userAgent),
            'device_model' => UserAgentParser::model($userAgent),
            'os' => UserAgentParser::os($userAgent),
            'os_version' => UserAgentParser::osVersion($userAgent),
            'browser' => UserAgentParser::browser($userAgent),
            'browser_version' => UserAgentParser::browserVersion($userAgent),
            'user_agent' => $userAgent,

            'landing_url' => $request->fullUrl(),
            'url_params' => $request->query() ?: null,
            'hostname' => $request->getHost(),

            'is_bot' => UserAgentParser::isBot($userAgent),
            'is_proxy' => $geo['proxy'] ?? null,
            'is_hosting' => $geo['hosting'] ?? null,
            'same_ip_recent_visits' => $sameIpRecentVisits,

            'started_at' => now(),
            'last_activity_at' => now(),
            'pages_viewed' => 0,
            'is_first_time_visitor' => $previousVisits === 0,
            'previous_visits_count' => $previousVisits,
        ]);

        $this->riskScorer->recompute($session);

        return $session;
    }

    private function resolveTrafficSource(Request $request, ?string $refererDomain): string
    {
        if ($request->filled('utm_source')) {
            return strtolower((string) $request->string('utm_source'));
        }

        if (! $refererDomain) {
            return 'direct';
        }

        foreach (self::KNOWN_REFERRER_SOURCES as $needle => $source) {
            if (str_contains($refererDomain, $needle)) {
                return $source;
            }
        }

        return 'referral';
    }
}
