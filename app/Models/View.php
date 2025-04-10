<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class View extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'viewable_id',
        'viewable_type',
    ];

    /**
     * Get the user who viewed the content.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the parent viewable model (post or news).
     */
    public function viewable()
    {
        return $this->morphTo();
    }

    /**
     * Scope to get views for a specific viewable item.
     */
    public function scopeForViewable($query, $viewableType, $viewableId)
    {
        return $query->where('viewable_type', $viewableType)
                     ->where('viewable_id', $viewableId);
    }
}
