<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PostMedia extends Model
{
    protected $fillable = ['post_id', 'url', 'type'];

    public function post()
    {
        return $this->belongsTo(Post::class);
    }
}
