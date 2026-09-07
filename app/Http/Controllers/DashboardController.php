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
     * Safety cap on how many rows we'll pull into memory before
     * filtering by device (which isn't a stored column) and paginating.
     */
    private const MAX_SCAN = 2000;

    /**
     * Display the dashboard.
     */
    public function index(Request $request): Response
    {
        return Inertia::render('dashboard', [
            'pageViews' => [
                'articles' => $this->statsFor('articles'),
                'prime-zone' => $this->statsFor('prime-zone'),
            ],
            'recentVisits' => $this->visitsFor($request),
            'filters' => [
                'visit_page' => $request->string('visit_page')->value() ?: 'all',
                'device' => $request->string('device')->value() ?: 'all',
                'country' => $request->string('country')->value() ?: null,
                'from' => $request->string('from')->value() ?: null,
                'to' => $request->string('to')->value() ?: null,
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
            $query->forKey((string) $request->string('visit_page'));
        }

        if ($request->filled('from')) {
            $query->whereDate('created_at', '>=', $request->date('from'));
        }

        if ($request->filled('to')) {
            $query->whereDate('created_at', '<=', $request->date('to'));
        }

        if ($request->filled('country')) {
            $query->where('country', 'like', '%'.$request->string('country').'%');
        }

        $device = $request->string('device')->value() ?: 'all';

        $visits = $query
            ->limit(self::MAX_SCAN)
            ->get(['click_id', 'key', 'ip_address', 'user_agent', 'country', 'referer', 'created_at'])
            ->filter(function (PageView $visit) use ($device) {
                if ($device !== 'all' && UserAgentParser::device($visit->user_agent) !== $device) {
                    return false;
                }

                return true;
            })
            ->values();

        $perPage = (int) $request->integer('per_page', 10);
        $page = (int) $request->integer('visits_page', 1);

        $items = $visits->slice(($page - 1) * $perPage, $perPage)->values()->map(fn (PageView $visit) => [
            'click_id' => $visit->click_id,
            'key' => $visit->key,
            'ip_address' => $visit->ip_address,
            'country' => $visit->country,
            'referer' => $visit->referer,
            'browser' => UserAgentParser::browser($visit->user_agent),
            'device' => UserAgentParser::device($visit->user_agent),
            'created_at' => $visit->created_at,
        ]);

        return new LengthAwarePaginator(
            $items,
            $visits->count(),
            $perPage,
            $page,
            [
                'path' => $request->url(),
                'pageName' => 'visits_page',
                'query' => $request->query(),
            ]
        );
    }

    /**
     * Build the view stats for a single tracked page key.
     *
     * @return array{total: int, today: int, last_viewed_at: ?string}
     */
    private function statsFor(string $key): array
    {
        $query = PageView::query()->forKey($key);

        return [
            'total' => (clone $query)->count(),
            'today' => (clone $query)->whereDate('created_at', Carbon::today())->count(),
            'last_viewed_at' => (clone $query)->latest('created_at')->value('created_at'),
        ];
    }
}
