<?php

namespace App\Http\Middleware;

use App\Models\PageView;
use App\Services\VisitorIdentityService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TrackPageView
{
    public function __construct(private readonly VisitorIdentityService $identity) {}

    /**
     * Handle an incoming request.
     *
     * Resolves (or creates) the visitor/session behind this request, logs
     * a view of the given page key against it, then lets the request
     * continue so the routes this is attached to can keep doing their own
     * thing (redirecting, rendering, etc.) untouched.
     */
    public function handle(Request $request, Closure $next, string $key): Response
    {
        $session = $this->identity->identify($request);

        $view = PageView::record($key, $request, $session);

        $request->attributes->set('click_id', $view->click_id);
        $request->attributes->set('visitor_session', $session);

        return $next($request);
    }
}
