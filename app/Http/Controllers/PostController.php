<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\PostMedia;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

// use App\Models\PostComment;
// use App\Models\PostLike;

class PostController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    public function index()
    {
        $posts = Post::with(['user', 'comments.user', 'likes'])->latest()->paginate(10);

        return Inertia::render('Posts/Index', [
            'posts' => $posts,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'content' => 'required|string|max:300',
            'files.*' => 'nullable|file|mimes:jpeg,png,jpg,gif,mp4|max:20480',
        ]);

        $post = Post::create([
            'content' => $request->content,
            'user_id' => auth()->id(),
        ]);

        if ($request->hasFile('files')) {
            foreach ($request->file('files') as $file) {
                $path = $file->store('post-media', 'public');
                $type = str_starts_with($file->getMimeType(), 'image/') ? 'image' : 'video';

                PostMedia::create([
                    'post_id' => $post->id,
                    'url' => $path,
                    'type' => $type,
                ]);
            }
        }

        return redirect()->back();
    }

    public function show(Post $post)
    {
        // Create a view for the post
        $post->views()->updateOrCreate(
            ['user_id' => auth()->id()], // critério de busca
            ['updated_at' => now()]      // atualizar o timestamp se já existir
        );

        $post->load(['user', 'likes', 'comments.user', 'media']);

        // Transform the data to match the frontend interface
        $transformedPost = [
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
            'views' => $post->views,
            'media' => $post->media->map(function ($media) {
                return [
                    'id' => $media->id,
                    'url' => $media->url,
                    'type' => $media->type,
                ];
            })->values(),
        ];

        /* dd($transformedPost); */

        return Inertia::render('Post/Index', [
            'post' => $transformedPost,
        ]);
    }

    public function like(Post $post)
    {
        $like = $post->likes()->where('user_id', auth()->id())->first();

        if ($like) {
            $like->delete();
        } else {
            $post->likes()->create(['user_id' => auth()->id()]);
        }

        return redirect()->back();
    }

    public function destroy(Post $post)
    {
        if (Auth::id() !== $post->user_id && ! Auth::user()->is_admin) {
            return redirect()->back()->with('error', 'Você não tem permissão para excluir esta publicação.');
        }

        if ($post->image_url) {
            Storage::disk('public')->delete($post->image_url);
        }

        $post->delete();

        return redirect()->back()->with('success', 'Publicação excluída com sucesso!');
    }
}
