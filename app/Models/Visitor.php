<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Visitor extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'uuid',
        'first_seen_at',
        'last_seen_at',
        'total_visits',
    ];

    /**
     * @var array<string, string>
     */
    protected $casts = [
        'first_seen_at' => 'datetime',
        'last_seen_at' => 'datetime',
    ];

    /**
     * @return HasMany<VisitorSession, $this>
     */
    public function sessions(): HasMany
    {
        return $this->hasMany(VisitorSession::class);
    }

    /**
     * @return HasMany<PageView, $this>
     */
    public function pageViews(): HasMany
    {
        return $this->hasMany(PageView::class);
    }

    /**
     * @return HasMany<Lead, $this>
     */
    public function leads(): HasMany
    {
        return $this->hasMany(Lead::class);
    }
}
