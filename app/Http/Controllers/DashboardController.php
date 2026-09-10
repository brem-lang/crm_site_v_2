<?php

namespace App\Http\Controllers;

use App\Models\PageView;
use App\Support\UserAgentParser;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * The selectable "page" filter options, mapped to the underlying page
     * key plus (where relevant) a country. The Canada template variants
     * share their page key with the default variant and are only
     * distinguished by the visitor's country, so they aren't a distinct
     * `key` value in the database.
     *
     * @var array<string, array{key: string, country: ?string}>
     */
    private const PAGE_FILTERS = [
        'articles' => ['key' => 'articles', 'country' => null],
        'articles-canada' => ['key' => 'articles', 'country' => 'Canada'],
        'prime-zone' => ['key' => 'prime-zone', 'country' => null],
        'prime-zone-canada' => ['key' => 'prime-zone', 'country' => 'Canada'],
    ];

    /**
     * A session at or above this App\Services\RiskScorer score is flagged
     * "suspicious" in the dashboard (a single strong signal, e.g. a bot
     * user agent, already clears it on its own).
     */
    private const SUSPICIOUS_RISK_THRESHOLD = 40;

    /**
     * Display the dashboard.
     */
    public function index(Request $request): Response
    {
        return Inertia::render('dashboard', [
            'pageViews' => [
                'articles' => $this->statsFor('articles'),
                'articles-canada' => $this->statsFor('articles', country: 'Canada'),
                'prime-zone' => $this->statsFor('prime-zone'),
                'prime-zone-canada' => $this->statsFor('prime-zone', country: 'Canada'),
            ],
            'recentVisits' => $this->visitsFor($request),
            'filters' => [
                'visit_page' => $request->string('visit_page')->value() ?: 'all',
                'device' => $request->string('device')->value() ?: 'all',
                'search' => $request->string('search')->value() ?: null,
                'from' => $request->string('from')->value() ?: null,
                'to' => $request->string('to')->value() ?: null,
                'suspicious_only' => $request->boolean('suspicious_only'),
                'per_page' => (int) $request->integer('per_page', 10),
            ],
        ]);
    }

    /**
     * Build the filtered, paginated list of recent visits.
     */
    private function visitsFor(Request $request): LengthAwarePaginator
    {
        $query = PageView::query()->latest('created_at');

        if ($request->filled('visit_page') && $request->string('visit_page')->value() !== 'all') {
            $filter = self::PAGE_FILTERS[(string) $request->string('visit_page')] ?? null;

            if ($filter) {
                $query->forKey($filter['key']);

                if ($filter['country']) {
                    $query->where('country', $filter['country']);
                }
            }
        }

        if ($request->filled('from')) {
            $query->whereDate('created_at', '>=', $request->date('from'));
        }

        if ($request->filled('to')) {
            $query->whereDate('created_at', '<=', $request->date('to'));
        }

        if ($request->filled('search')) {
            $search = (string) $request->string('search');

            $query->where(function ($query) use ($search) {
                $query->where('country', 'like', "%{$search}%")
                    ->orWhere('click_id', 'like', "%{$search}%");
            });
        }

        $device = $request->string('device')->value() ?: 'all';

        if ($device !== 'all') {
            // device_type is only persisted for page views recorded after
            // the tracking migration that added it — treat a null value
            // (older rows) the same as an explicit "Unknown" so they still
            // surface under that filter instead of disappearing.
            if ($device === 'Unknown') {
                $query->where(function ($query) {
                    $query->whereNull('device_type')->orWhere('device_type', 'Unknown');
                });
            } else {
                $query->where('device_type', $device);
            }
        }

        if ($request->boolean('suspicious_only')) {
            $query->whereHas('visitorSession', function ($query) {
                $query->where('risk_score', '>=', self::SUSPICIOUS_RISK_THRESHOLD);
            });
        }

        $perPage = (int) $request->integer('per_page', 10);

        return $query
            ->with(['visitorSession:id,is_bot,is_proxy,is_hosting,risk_score,risk_reasons'])
            ->paginate(
                $perPage,
                ['click_id', 'key', 'ip_address', 'user_agent', 'country', 'referer', 'browser', 'device_type', 'created_at', 'visitor_session_id'],
                'visits_page',
            )
            ->withQueryString()
            ->through(fn (PageView $visit) => [
                'click_id' => $visit->click_id,
                'key' => $visit->key,
                'ip_address' => $visit->ip_address,
                'country' => $visit->country,
                'referer' => $visit->referer,
                // Fall back to re-parsing the user agent for rows that
                // predate these being persisted at write time.
                'browser' => $visit->browser ?? UserAgentParser::browser($visit->user_agent),
                'device' => $visit->device_type ?? UserAgentParser::device($visit->user_agent),
                'created_at' => $visit->created_at,
                'visitor_session_id' => $visit->visitor_session_id,
                'risk_score' => $visit->visitorSession?->risk_score,
                'risk_reasons' => $visit->visitorSession?->risk_reasons ?? [],
                'is_suspicious' => ($visit->visitorSession?->risk_score ?? 0) >= self::SUSPICIOUS_RISK_THRESHOLD,
            ]);
    }

    /**
     * Build the view stats for a single tracked page key, optionally
     * narrowed to visits from a given country (e.g. the Canada-specific
     * template variants, which share the same page key as their default
     * counterpart and are only distinguished by the visitor's country).
     *
     * @return array{total: int, today: int, last_viewed_at: ?string}
     */
    private function statsFor(string $key, ?string $country = null): array
    {
        $query = PageView::query()->forKey($key);

        if ($country) {
            $query->where('country', $country);
        }

        return [
            'total' => (clone $query)->count(),
            'today' => (clone $query)->whereDate('created_at', Carbon::today())->count(),
            'last_viewed_at' => (clone $query)->latest('created_at')->value('created_at'),
        ];
    }
}
