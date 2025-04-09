<?php

namespace App\Http\Controllers;

use App\Models\News;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia; // Isso aqui

class NewsController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth')->except(['index', 'show']);
        $this->middleware('admin')->except(['index', 'show']);
    }

    public function index()
    {
        $news = News::published()->with('author')->latest('published_at')->paginate(10);

        return Inertia::render('News/Index', [
            'news' => $news,
        ]);
    }

    public function show(News $news)
    {
        if (! $news->is_published && (! Auth::check() || ! Auth::user()->is_admin)) {
            abort(404);
        }

        return Inertia::render('News/Show', [
            'news' => $news,
        ]);
    }

    public function create()
    {
        return Inertia::render('News/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'is_published' => 'boolean',
        ]);

        $news = new News($validated);
        $news->author_id = Auth::id();
        $news->is_published = $request->has('is_published');
        if ($news->is_published) {
            $news->published_at = now();
        }

        if ($request->hasFile('image')) {
            $news->image_url = $request->file('image')->store('news', 'public');
        }

        $news->save();

        return redirect()->route('news.index')->with('success', 'Notícia criada com sucesso!');
    }

    public function edit(News $news)
    {
        return Inertia::render('News/Edit', [
            'news' => $news,
        ]);
    }

    public function update(Request $request, News $news)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'is_published' => 'boolean',
        ]);

        $news->fill($validated);
        if (! $news->is_published && $request->has('is_published')) {
            $news->published_at = now();
        }

        if ($request->hasFile('image')) {
            if ($news->image_url) {
                Storage::disk('public')->delete($news->image_url);
            }
            $news->image_url = $request->file('image')->store('news', 'public');
        }

        $news->save();

        return redirect()->route('news.index')->with('success', 'Notícia atualizada com sucesso!');
    }

    public function destroy(News $news)
    {
        if ($news->image_url) {
            Storage::disk('public')->delete($news->image_url);
        }

        $news->delete();

        return redirect()->route('news.index')->with('success', 'Notícia excluída com sucesso!');
    }
}
