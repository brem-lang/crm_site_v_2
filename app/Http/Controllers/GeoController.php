<?php

namespace App\Http\Controllers;

use App\Services\GeoLocator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GeoController extends Controller
{
    /**
     * Resolve the visitor's ISO 3166-1 alpha-2 country code from their IP
     * address, so the frontend can preselect the phone dial code.
     */
    public function countryCode(Request $request, GeoLocator $geoLocator): JsonResponse
    {
        return response()->json(['country_code' => $geoLocator->countryCode($request)]);
    }
}
