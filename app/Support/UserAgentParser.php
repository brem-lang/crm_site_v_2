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

    public static function os(?string $userAgent): string
    {
        if (! $userAgent) {
            return 'Unknown';
        }

        $ua = strtolower($userAgent);

        return match (true) {
            str_contains($ua, 'windows') => 'Windows',
            str_contains($ua, 'android') => 'Android',
            str_contains($ua, 'iphone'), str_contains($ua, 'ipad'), str_contains($ua, 'ios') => 'iOS',
            str_contains($ua, 'mac os'), str_contains($ua, 'macintosh') => 'macOS',
            str_contains($ua, 'linux') => 'Linux',
            default => 'Unknown',
        };
    }

    /**
     * Best-effort OS version, parsed straight out of the user agent string.
     * Not as reliable as a dedicated UA-parsing library, but consistent
     * with the rest of this hand-rolled parser and good enough for
     * dashboard breakdowns.
     */
    public static function osVersion(?string $userAgent): ?string
    {
        if (! $userAgent) {
            return null;
        }

        if (preg_match('/Windows NT ([\d.]+)/i', $userAgent, $m)) {
            return match ($m[1]) {
                '10.0' => '10/11',
                '6.3' => '8.1',
                '6.2' => '8',
                '6.1' => '7',
                default => $m[1],
            };
        }

        if (preg_match('/OS ([\d_]+) like Mac OS X/i', $userAgent, $m)) {
            return str_replace('_', '.', $m[1]);
        }

        if (preg_match('/Mac OS X ([\d_]+)/i', $userAgent, $m)) {
            return str_replace('_', '.', $m[1]);
        }

        if (preg_match('/Android ([\d.]+)/i', $userAgent, $m)) {
            return $m[1];
        }

        return null;
    }

    public static function browserVersion(?string $userAgent): ?string
    {
        if (! $userAgent) {
            return null;
        }

        foreach (['Edg', 'OPR', 'Firefox', 'Chrome', 'Version'] as $token) {
            if (preg_match('/'.preg_quote($token, '/').'\/([\d.]+)/', $userAgent, $m)) {
                return $m[1];
            }
        }

        return null;
    }

    public static function brand(?string $userAgent): ?string
    {
        if (! $userAgent) {
            return null;
        }

        $ua = strtolower($userAgent);

        return match (true) {
            str_contains($ua, 'iphone'), str_contains($ua, 'ipad'), str_contains($ua, 'macintosh') => 'Apple',
            str_contains($ua, 'samsung') => 'Samsung',
            str_contains($ua, 'pixel') => 'Google',
            str_contains($ua, 'huawei') => 'Huawei',
            default => null,
        };
    }

    /**
     * Best-effort device model. Reliable for Android (which advertises its
     * build model in the UA string) and iOS (device family only, since
     * Apple's UA strings don't include the specific model); returns null
     * for everything else rather than guess.
     */
    public static function model(?string $userAgent): ?string
    {
        if (! $userAgent) {
            return null;
        }

        if (preg_match('/;\s*([^;()]+?)\s+Build\//', $userAgent, $m)) {
            return trim($m[1]);
        }

        if (str_contains($userAgent, 'iPad')) {
            return 'iPad';
        }

        if (str_contains($userAgent, 'iPhone')) {
            return 'iPhone';
        }

        return null;
    }
}
