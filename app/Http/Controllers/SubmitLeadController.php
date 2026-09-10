<?php

namespace App\Http\Controllers;

use App\Models\Lead;
use App\Models\PageView;
use App\Models\VisitorSession;
use App\Services\GeoLocator;
use App\Services\RiskScorer;
use App\Services\VisitorIdentityService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SubmitLeadController extends Controller
{
    /**
     * A session started less than this long ago at the moment its lead is
     * submitted is suspiciously fast for a human to have read the page,
     * filled in the form, and hit submit — fed into RiskScorer as the
     * "fast_form_submission" signal.
     */
    private const FAST_SUBMISSION_THRESHOLD_SECONDS = 4;

    public function store(
        Request $request,
        GeoLocator $geoLocator,
        VisitorIdentityService $identity,
        RiskScorer $riskScorer,
    ): JsonResponse {
        $validated = $request->validate([
            'firstname' => ['required', 'string', 'max:255'],
            'lastname' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'mobile' => ['required', 'string', 'max:32'],
            'country_code' => ['required', 'string', 'size:2'],
            'click_id' => ['nullable', 'string', 'max:255'],
        ]);

        $session = $identity->identify($request);

        if ($session->started_at && Carbon::parse($session->started_at)->diffInSeconds(now()) < self::FAST_SUBMISSION_THRESHOLD_SECONDS) {
            $riskScorer->recompute($session, ['fast_form_submission']);
        }

        $payload = [
            ...$validated,
            'country_code' => strtoupper($validated['country_code']),
            'ip_address' => $geoLocator->resolveClientIp($request),
        ];

        try {
            $response = Http::withHeaders([
                'Api-Key' => config('services.mercari_leads.api_key'),
                'Content-Type' => 'application/json',
            ])->post(config('services.mercari_leads.url'), $payload);
        } catch (\Throwable $e) {
            Log::error('mercari_leads: request to affiliate API failed', [
                'message' => $e->getMessage(),
                'payload' => $payload,
            ]);

            $this->recordLead($session, $validated, $payload, 'failed', ['error' => $e->getMessage()]);

            return response()->json([
                'success' => false,
                'message' => __('We could not submit your information right now. Please try again in a moment.'),
            ], 502);
        }

        $body = $response->json() ?? [];

        // The affiliate API can signal failure two ways: a non-2xx HTTP
        // status, or HTTP 200 with `"success": false` in the JSON body
        // (e.g. duplicate IP, no eligible advertisers). Treat both as
        // failures — checking the HTTP status alone would let a "success:
        // false, no autologin_url" body through as a false success.
        if ($response->failed() || ($body['success'] ?? null) === false) {
            Log::error('mercari_leads: affiliate API returned an error', [
                'status' => $response->status(),
                'body' => $response->body(),
                'payload' => $payload,
            ]);

            $this->recordLead($session, $validated, $payload, 'failed', $body);

            return response()->json([
                'success' => false,
                'message' => __('We could not submit your information right now. Please try again in a moment.'),
            ], 502);
        }

        $this->recordLead($session, $validated, $payload, 'success', $body);

        if (! empty($validated['click_id'])) {
            PageView::markConverted($validated['click_id']);
        }

        return response()->json([
            'success' => true,
            'autologin_url' => $body['autologin_url'] ?? $body['auto_login_url'] ?? $body['autoLoginUrl'] ?? null,
            'data' => $body,
        ]);
    }

    /**
     * Persist a local copy of this submission alongside forwarding it to
     * the external affiliate API, so the funnel (and its success/failure
     * outcome) can be analyzed here even though the affiliate API remains
     * the actual system of record for the lead itself.
     *
     * @param  array<string, mixed>  $validated
     * @param  array<string, mixed>  $payload
     * @param  array<string, mixed>  $externalResponse
     */
    private function recordLead(
        VisitorSession $session,
        array $validated,
        array $payload,
        string $status,
        array $externalResponse,
    ): void {
        $clickId = $validated['click_id'] ?? null;

        Lead::create([
            'visitor_session_id' => $session->id,
            'visitor_id' => $session->visitor_id,
            'page_view_id' => $clickId ? PageView::where('click_id', $clickId)->value('id') : null,
            'click_id' => $clickId,
            'firstname' => $validated['firstname'],
            'lastname' => $validated['lastname'],
            'email' => $validated['email'],
            'mobile' => $validated['mobile'],
            'country_code' => $payload['country_code'],
            'ip_address' => $payload['ip_address'],
            'status' => $status,
            'external_response' => $externalResponse,
        ]);
    }
}
