<?php

namespace App\Http\Responses;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Laravel\Fortify\Contracts\EmailVerificationNotificationSentResponse as EmailVerificationNotificationSentResponseContract;
use Laravel\Fortify\Fortify;
use Symfony\Component\HttpFoundation\Response;

class EmailVerificationNotificationSentResponse implements EmailVerificationNotificationSentResponseContract
{
    /**
     * Create an HTTP response that represents the object.
     *
     * @param  Request  $request
     * @return Response
     */
    public function toResponse($request)
    {
        if ($request->wantsJson()) {
            return new JsonResponse('', 202);
        }

        // Falls back to the verification notice screen instead of Laravel's
        // default "/", which is a public ad-traffic route in this app.
        return back(fallback: route('verification.notice'))
            ->with('status', Fortify::VERIFICATION_LINK_SENT);
    }
}
