<?php

namespace App\Http\Controllers;

use App\Models\News;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class NewsController extends Controller
{
    /**
     * Display a listing of the news.
     *
     * @return \Inertia\Response
     */
    public function index()
    {
        $news = News::with('author')
            ->published()
            ->orderBy('published_at', 'desc')
            ->paginate(10);

        // Transform the news collection to match the expected format
        $transformedNews = $news->getCollection()->map(function ($newsItem) {
            return [
                'id' => $newsItem->id,
                'title' => $newsItem->title,
                'content' => $newsItem->content,
                'image_url' => $newsItem->image_url,
                'published_at' => $newsItem->published_at,
                'view_count' => $newsItem->views_count ?? 0,
                'author' => [
                    'id' => $newsItem->author->id,
                    'name' => $newsItem->author->name,
                    'avatar_url' => $newsItem->author->profile_image ?? '/images/default-avatar.png',
                ],
            ];
        });

        // Replace the collection with our transformed data
        $news->setCollection($transformedNews);

        return Inertia::render('News/Index', [
            'news' => $news,
        ]);
    }

    /**
     * Show the form for creating a new news article.
     *
     * @return \Inertia\Response
     */
    public function create()
    {
        $this->authorize('create', News::class);

        return Inertia::render('News/Create');
    }

    /**
     * Store a newly created news article in storage.
     *
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(Request $request)
    {
        $this->authorize('create', News::class);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'image' => 'nullable|image|max:2048', // Max 2MB
            'is_published' => 'boolean',
            'published_at' => 'nullable|date',
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('news', 'public');
        }

        $news = News::create([
            'title' => $validated['title'],
            'content' => $validated['content'],
            'image_url' => $imagePath,
            'author_id' => Auth::id(),
            'is_published' => $validated['is_published'] ?? false,
            'published_at' => $validated['published_at'] ?? ($validated['is_published'] ? now() : null),
        ]);

        return redirect()->route('news.show', $news->id)
            ->with('success', 'Notícia criada com sucesso!');
    }

    /**
     * Display the specified news article.
     *
     * @return \Inertia\Response
     */
    public function show(News $news)
    {
        // Ensure only published news are visible to regular users
        if (! $news->is_published && ! Auth::user()->is_admin) {
            abort(404);
        }

        // Record view using morphMany relationship
        $news->views()->updateOrCreate(
            ['user_id' => auth()->id()],
            ['updated_at' => now()]
        );

        // Increment view count - you might want to implement a more sophisticated
        // approach that only counts unique views
        /* $news->increment('views_count'); */

        return Inertia::render('News/Show', [
            'news' => [
                'id' => $news->id,
                'title' => $news->title,
                'content' => $news->content,
                'image_url' => $news->image_url,
                'published_at' => $news->published_at,
                'view_count' => $news->views()->count(),
                'author' => [
                    'id' => $news->author->id,
                    'name' => $news->author->name,
                    'avatar_url' => $news->author->profile_image ?? '/images/default-avatar.png',
                ],
            ],
        ]);
    }

    /**
     * Show the form for editing the specified news article.
     *
     * @return \Inertia\Response
     */
    public function edit(News $news)
    {
        $this->authorize('update', $news);

        return Inertia::render('News/Edit', [
            'news' => [
                'id' => $news->id,
                'title' => $news->title,
                'content' => $news->content,
                'image_url' => $news->image_url,
                'is_published' => $news->is_published,
                'published_at' => $news->published_at,
            ],
        ]);
    }

    /**
     * Update the specified news article in storage.
     *
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(Request $request, News $news)
    {
        $this->authorize('update', $news);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'image' => 'nullable|image|max:2048', // Max 2MB
            'is_published' => 'boolean',
            'published_at' => 'nullable|date',
            'remove_image' => 'boolean',
        ]);

        // Handle image upload or removal
        if ($request->boolean('remove_image') && $news->image_url) {
            Storage::disk('public')->delete($news->image_url);
            $imagePath = null;
        } elseif ($request->hasFile('image')) {
            // Delete old image if it exists
            if ($news->image_url) {
                Storage::disk('public')->delete($news->image_url);
            }
            $imagePath = $request->file('image')->store('news', 'public');
        } else {
            $imagePath = $news->image_url;
        }

        // Determine published_at
        $publishedAt = $news->published_at;
        if (isset($validated['is_published']) && $validated['is_published']) {
            if (isset($validated['published_at'])) {
                $publishedAt = $validated['published_at'];
            } elseif (! $news->is_published) {
                // If it's being published for the first time and no date is specified
                $publishedAt = now();
            }
        } elseif (isset($validated['is_published']) && ! $validated['is_published']) {
            // If it's being unpublished
            $publishedAt = null;
        }

        $news->update([
            'title' => $validated['title'],
            'content' => $validated['content'],
            'image_url' => $imagePath,
            'is_published' => $validated['is_published'] ?? $news->is_published,
            'published_at' => $publishedAt,
        ]);

        return redirect()->route('news.show', $news->id)
            ->with('success', 'Notícia atualizada com sucesso!');
    }

    /**
     * Remove the specified news article from storage.
     *
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy(News $news)
    {
        $this->authorize('delete', $news);

        // Delete the image if it exists
        if ($news->image_url) {
            Storage::disk('public')->delete($news->image_url);
        }

        $news->delete();

        return redirect()->route('news.index')
            ->with('success', 'Notícia excluída com sucesso!');
    }

    /**
     * Display a listing of all news articles (for admin purposes).
     *
     * @return \Inertia\Response
     */
    public function adminIndex()
    {
        $this->authorize('viewAny', News::class);

        $news = News::with('author')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return Inertia::render('Admin/News/Index', [
            'news' => $news,
        ]);
    }
}
