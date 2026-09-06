<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

class PageView extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'key',
        'ip_address',
        'user_agent',
        'referer',
    ];

    /**
     * Log a view of the given page for the current request.
     */
    public static function record(string $key, Request $request): self
    {
        return static::create([
            'key' => $key,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'referer' => $request->headers->get('referer'),
        ]);
    }

    /**
     * Scope a query to only include views for the given page key.
     */
    public function scopeForKey(Builder $query, string $key): Builder
    {
        return $query->where('key', $key);
    }
}
