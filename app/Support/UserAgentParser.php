<?php

namespace App\Support;

class UserAgentParser
{
    /**
     * Bot/crawler signatures matched against the user agent string.
     *
     * @var list<string>
     */
    public const BOT_SIGNATURES = [
        'bot', 'crawl', 'spider', 'slurp', 'bingpreview',
        'facebookexternalhit', 'semrush', 'ahrefs', 'mj12bot',
        'python-requests', 'curl', 'wget', 'headless', 'preview',
    ];

    /**
     * Browser signatures, checked in order (most specific first).
     *
     * @var array<string, string>
     */
    public const BROWSER_SIGNATURES = [
        'edg/' => 'Edge',
        'opr/' => 'Opera',
        'firefox' => 'Firefox',
        'chrome' => 'Chrome',
        'safari' => 'Safari',
    ];

    public static function browser(?string $userAgent): string
    {
        if (! $userAgent) {
            return 'Unknown';
        }

        $ua = strtolower($userAgent);

        foreach (self::BROWSER_SIGNATURES as $needle => $label) {
            if (str_contains($ua, $needle)) {
                return $label;
            }
        }

        return 'Unknown';
    }

    public static function device(?string $userAgent): string
    {
        if (! $userAgent) {
            return 'Unknown';
        }

        $ua = strtolower($userAgent);

        if (str_contains($ua, 'ipad') || str_contains($ua, 'tablet')) {
            return 'Tablet';
        }

        if (str_contains($ua, 'mobile') || str_contains($ua, 'iphone') || str_contains($ua, 'android')) {
            return 'Mobile';
        }

        if (str_contains($ua, 'windows') || str_contains($ua, 'macintosh') || str_contains($ua, 'linux') || str_contains($ua, 'x11')) {
            return 'Desktop';
        }

        return 'Unknown';
    }

    public static function isBot(?string $userAgent): bool
    {
        if (! $userAgent) {
            return false;
        }

        $ua = strtolower($userAgent);

        foreach (self::BOT_SIGNATURES as $signature) {
            if (str_contains($ua, $signature)) {
                return true;
            }
        }

        return false;
    }
}
