<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class CommentController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    public function index(Post $post)
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

    public function store(Request $request, Post $post)
    {
        $validated = $request->validate([
            'content' => 'required|string|max:500',
            'post_id' => 'required|exists:posts,id',
        ]);

        // Criação do novo comentário
        $comment = new Comment([
            'content' => $validated['content'],
            'user_id' => Auth::id(),
            'post_id' => $post->id,
        ]);
        $comment->save();

        // Incrementar o contador de comentários no post
        /* $post->increment('comments_count'); */

        // Retornar a resposta com os dados atualizados
        return redirect()->route('posts.show', $post->id);

        return Inertia::render('Post/Index', [
            'post' => $post,
            'comments' => $post->comments()->latest()->get(),
            'flash' => [
                'success' => 'Comentário adicionado com sucesso!',
            ],
        ]);
    }

    public function destroy(Comment $comment)
    {
        // Verificar permissão do usuário
        if (Auth::id() !== $comment->user_id && ! Auth::user()->is_admin) {
            return Inertia::render('Posts/Show', [
                'post' => $comment->post,
                'comments' => $comment->post->comments()->latest()->get(),
                'flash' => [
                    'error' => 'Você não tem permissão para excluir este comentário.',
                ],
            ]);
        }

        // Decrementar o contador de comentários no post
        $comment->post->decrement('comments_count');

        // Excluir o comentário
        $comment->delete();

        // Retornar a resposta com os dados atualizados
        return Inertia::render('Posts/Show', [
            'post' => $comment->post,
            'comments' => $comment->post->comments()->latest()->get(),
            'flash' => [
                'success' => 'Comentário excluído com sucesso!',
            ],
        ]);
    }
}
