<?php

namespace App\Http\Middleware;

use App\Models\PageView;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TrackPageView
{
    /**
     * Handle an incoming request.
     *
     * Logs a view of the given page key before letting the request
     * continue, so the routes it's attached to can keep doing their own
     * thing (redirecting, rendering, etc.) untouched.
     */
    public function handle(Request $request, Closure $next, string $key): Response
    {
        PageView::record($key, $request);

        return $next($request);
    }
}
