<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'profile_image',
        'graduation_year',
        'course_id',
        'bio',
        'current_job',
        'current_company',
        'linkedin_url',
        'is_admin',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'is_admin' => 'boolean',
        'graduation_year' => 'integer',
    ];

    // Relacionamentos
    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function posts()
    {
        return $this->hasMany(Post::class);
    }

    public function comments()
    {
        return $this->hasMany(Comment::class);
    }

    public function likes()
    {
        return $this->hasMany(Like::class);
    }

    public function news()
    {
        return $this->hasMany(News::class, 'author_id');
    }

    // Amizades que o usuário iniciou (user_id1)
    public function friendshipsInitiated()
    {
        return $this->hasMany(Friendship::class, 'user_id1');
    }

    // Amizades que o usuário recebeu (user_id2)
    public function friendshipsReceived()
    {
        return $this->hasMany(Friendship::class, 'user_id2');
    }

    // Método para obter todos os amigos
    public function friends()
    {
        $friends1 = $this->belongsToMany(User::class, 'friendships', 'user_id1', 'user_id2')
            ->wherePivot('status', 'aceito');

        $friends2 = $this->belongsToMany(User::class, 'friendships', 'user_id2', 'user_id1')
            ->wherePivot('status', 'aceito');

        return $friends1->union($friends2);
    }

    // Método para obter pedidos de amizade pendentes
    public function pendingFriendRequests()
    {
        return $this->hasMany(Friendship::class, 'user_id2')
            ->where('status', 'pendente');
    }

    public function viewedPosts()
    {
        return $this->hasMany(View::class);
    }
}
