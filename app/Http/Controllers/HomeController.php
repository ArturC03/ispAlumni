<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Inertia\Inertia;

class HomeController extends Controller
{
    public function index()
    {
        $posts = Post::with(['user', 'likes', 'comments', 'media'])
            ->latest()
            ->paginate(10);

        // Add this line to debug
        // dd($posts);

        $transformedPosts = $posts->getCollection()->map(function ($post) {
            return [
                'id' => $post->id,
                'content' => $post->content,
                'created_at' => $post->created_at,
                'user' => [
                    'id' => $post->user->id,
                    'name' => $post->user->name,
                    'avatar_url' => $post->user->profile_image ?? null,
                ],
                'likes' => $post->likes->map(function ($like) {
                    return [
                        'id' => $like->id,
                        'user_id' => $like->user_id,
                    ];
                })->values(),
                'comments' => $post->comments->map(function ($comment) {
                    return [
                        'id' => $comment->id,
                        'content' => $comment->content,
                        'user' => [
                            'id' => $comment->user->id,
                            'name' => $comment->user->name,
                            'avatar_url' => $comment->user->profile_image ?? null,
                        ],
                        'created_at' => $comment->created_at,
                    ];
                })->values(),
                'shares' => $post->shares ?? 0,
                'views' => $post->views->count() ?? 0,
                'media' => $post->media->map(function ($media) {
                    return [
                        'id' => $media->id,
                        'url' => $media->url,
                        'type' => $media->type,
                    ];
                })->values(),
            ];
        });

        $posts->setCollection($transformedPosts);

        // Add this line to debug the final output
        // dd($posts);

        return Inertia::render('Home', [
            'posts' => $posts,
        ]);
    }
}
