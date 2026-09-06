<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class BlockDisabledAuthRoutes
{
    /**
     * Handle an incoming request.
     *
     * Public self-registration has been disabled for this application —
     * accounts are created by an administrator via the admin panel instead.
     * Registration is provided by Laravel Fortify and can't be removed from
     * config alone, so we intercept it here and 404 instead.
     *
     * Login stays open in every environment: administrators need it to
     * sign in and reach the admin panel in production, not just locally.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->is('register')) {
            abort(404);
        }

        return $next($request);
    }
}
