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
     * Login and registration have been disabled for this application.
     * These routes are provided by Laravel Fortify and can't be removed
     * from config alone, so we intercept them here and 404 instead.
     *
     * Left open in local development so password login can be tested
     * (e.g. for the admin panel) without a passkey already enrolled.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (! app()->environment('local') && $request->is('login', 'register')) {
            abort(404);
        }

        return $next($request);
    }
}
