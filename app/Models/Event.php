<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'location',
        'start_date',
        'end_date',
        'image_url',
        'organizer_name',
        'contact_info',
        'external_link',
        'event_type',
        'status',
    ];

    protected $casts = [
        'start_date' => 'datetime',
        'end_date' => 'datetime',
    ];

    // Scope para eventos futuros
    public function scopeUpcoming($query)
    {
        return $query->where('start_date', '>', now())
            ->orderBy('start_date', 'asc');
    }

    // Scope para eventos em andamento
    public function scopeOngoing($query)
    {
        return $query->where('start_date', '<=', now())
            ->where('end_date', '>=', now())
            ->orderBy('end_date', 'asc');
    }

    // Scope para eventos passados
    public function scopePast($query)
    {
        return $query->where('end_date', '<', now())
            ->orderBy('end_date', 'desc');
    }
}
