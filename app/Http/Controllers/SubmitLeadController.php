<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SubmitLeadController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'firstname' => ['required', 'string', 'max:255'],
            'lastname' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'mobile' => ['required', 'string', 'max:32'],
            'country_code' => ['required', 'string', 'size:2'],
        ]);

        $payload = [
            ...$validated,
            'country_code' => strtoupper($validated['country_code']),
            'ip_address' => $request->ip(),
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

            return response()->json([
                'success' => false,
                'message' => __('We could not submit your information right now. Please try again in a moment.'),
            ], 502);
        }

        return response()->json([
            'success' => true,
            'autologin_url' => $body['autologin_url'] ?? $body['auto_login_url'] ?? $body['autoLoginUrl'] ?? null,
            'data' => $body,
        ]);
    }
}
