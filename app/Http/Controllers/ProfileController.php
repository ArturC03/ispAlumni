<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ProfileController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    /* public function show(User $user) */
    /* { */
    /*     $posts = $user->posts()->with('comments', 'likes')->latest()->take(10)->get(); */
    /**/
    /*     // Verificar status de amizade se não for o próprio perfil */
    /*     $friendshipStatus = null; */
    /**/
    /*     if (Auth::id() !== $user->id) { */
    /*         $currentUser = Auth::user(); */
    /**/
    /*         $friendship = \App\Models\Friendship::where(function ($query) use ($currentUser, $user) { */
    /*             $query->where('user_id1', $currentUser->id) */
    /*                 ->where('user_id2', $user->id); */
    /*         })->orWhere(function ($query) use ($currentUser, $user) { */
    /*             $query->where('user_id1', $user->id) */
    /*                 ->where('user_id2', $currentUser->id); */
    /*         })->first(); */
    /**/
    /*         if ($friendship) { */
    /*             $friendshipStatus = $friendship->status; */
    /*         } */
    /*     } */
    /**/
    /*     return Inertia::render('Profile/Show', [ */
    /*         'user' => $user, */
    /*         'posts' => $posts, */
    /*         'friendshipStatus' => $friendshipStatus, */
    /*     ]); */
    /* } */

    public function edit()
    {
        $user = Auth::user();
        $courses = Course::orderBy('name')->get();

        return Inertia::render('Profile/Edit', [
            'user' => $user,
            'courses' => $courses,
        ]);
    }

    public function update(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,'.$user->id,
            'bio' => 'nullable|string|max:1000',
            'graduation_year' => 'nullable|integer|min:1980|max:'.date('Y'),
            'course_id' => 'nullable|exists:courses,id',
            'current_job' => 'nullable|string|max:255',
            'current_company' => 'nullable|string|max:255',
            'linkedin_url' => 'nullable|url|max:255',
            'profile_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $user->fill($validated);

        if ($request->hasFile('profile_image')) {
            // Remover imagem antiga se existir
            if ($user->profile_image) {
                Storage::disk('public')->delete($user->profile_image);
            }

            $path = $request->file('profile_image')->store('profiles', 'public');
            $user->profile_image = $path;
        }

        $user->save();

        return redirect()->route('profile.show', $user)
            ->with('success', 'Perfil atualizado com sucesso!');
    }

    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = Auth::user();

        // Verificar senha atual
        if (! Hash::check($request->current_password, $user->password)) {
            return back()->withErrors(['current_password' => 'A senha atual está incorreta.']);
        }

        $user->password = Hash::make($request->password);
        $user->save();

        return redirect()->route('profile.edit')
            ->with('success', 'Senha alterada com sucesso!');
    }

    public function show(?User $user = null)
    {
        if (! $user) {
            $user = Auth::user();
        }

        $posts = $user->posts()
            ->with(['user', 'comments.user', 'likes', 'media', 'views'])
            ->latest()
            ->paginate(10);

        // Transform posts to match the frontend interface
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

        // Friendship status check
        $friendshipStatus = null;
        if (Auth::id() !== $user->id) {
            $currentUser = Auth::user();
            $friendship = \App\Models\Friendship::where(function ($query) use ($currentUser, $user) {
                $query->where('user_id1', $currentUser->id)
                    ->where('user_id2', $user->id);
            })->orWhere(function ($query) use ($currentUser, $user) {
                $query->where('user_id1', $user->id)
                    ->where('user_id2', $currentUser->id);
            })->first();

            if ($friendship) {
                $friendshipStatus = $friendship->status;
            }
        }

        /* dd([ */
        /*     'user' => $user, */
        /*     'posts' => $posts, */
        /*     'friendshipStatus' => $friendshipStatus, */
        /* ]); */

        return Inertia::render('Profile/Show', [
            'user' => $user,
            'posts' => $posts,
            'friendshipStatus' => $friendshipStatus,
        ]);
    }
}
