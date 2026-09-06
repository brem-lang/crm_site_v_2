<?php

namespace App\Http\Controllers;

use App\Models\PageView;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the dashboard.
     */
    public function index(): Response
    {
        return Inertia::render('dashboard', [
            'pageViews' => [
                'articles' => $this->statsFor('articles'),
                'prime-zone' => $this->statsFor('prime-zone'),
            ],
        ]);
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
