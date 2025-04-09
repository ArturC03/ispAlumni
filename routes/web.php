<?php

use App\Http\Controllers\CommentController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\FriendshipController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\LikeController;
use App\Http\Controllers\NewsController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\ProfileController;
use App\Http\Middleware\AdminMiddleware;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

// Página inicial
Route::get('/', [HomeController::class, 'index'])->name('home');

// Rotas de autenticação geradas pelo Laravel
// Descomente a linha abaixo se estiver usando o Laravel Breeze ou UI
// Auth::routes();

// Posts
Route::get('/posts', [PostController::class, 'index'])->name('posts.index');
Route::get('/posts/{post}', [PostController::class, 'show'])->name('posts.show');
Route::post('/posts', [PostController::class, 'store'])->name('posts.store');
Route::delete('/posts/{post}', [PostController::class, 'destroy'])->name('posts.destroy');

// Comentários
Route::post('/posts/{post}/comments', [CommentController::class, 'store'])->name('comments.store');
Route::delete('/comments/{comment}', [CommentController::class, 'destroy'])->name('comments.destroy');

// Likes
Route::post('/posts/{post}/like', [LikeController::class, 'toggle'])->name('likes.toggle');

// Notícias
Route::get('/news', [NewsController::class, 'index'])->name('news.index');
Route::get('/news/create', [NewsController::class, 'create'])->name('news.create');
Route::post('/news', [NewsController::class, 'store'])->name('news.store');
Route::get('/news/{news}', [NewsController::class, 'show'])->name('news.show');
Route::get('/news/{news}/edit', [NewsController::class, 'edit'])->name('news.edit');
Route::put('/news/{news}', [NewsController::class, 'update'])->name('news.update');
Route::delete('/news/{news}', [NewsController::class, 'destroy'])->name('news.destroy');

// Eventos
Route::get('/events', [EventController::class, 'index'])->name('events.index');
Route::get('/events/create', [EventController::class, 'create'])->name('events.create');
Route::post('/events', [EventController::class, 'store'])->name('events.store');
Route::get('/events/{event}', [EventController::class, 'show'])->name('events.show');
Route::get('/events/{event}/edit', [EventController::class, 'edit'])->name('events.edit');
Route::put('/events/{event}', [EventController::class, 'update'])->name('events.update');
Route::delete('/events/{event}', [EventController::class, 'destroy'])->name('events.destroy');

// Amizades
Route::get('/friends', [FriendshipController::class, 'index'])->name('friendships.index');
Route::post('/friends/{user}', [FriendshipController::class, 'store'])->name('friendships.store');
Route::put('/friends/{friendship}/accept', [FriendshipController::class, 'accept'])->name('friendships.accept');
Route::put('/friends/{friendship}/reject', [FriendshipController::class, 'reject'])->name('friendships.reject');
Route::delete('/friends/{friendship}', [FriendshipController::class, 'destroy'])->name('friendships.destroy');

// Perfis
Route::get('/profile/{user}', [ProfileController::class, 'show'])->name('profile.show');
Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
Route::put('/profile', [ProfileController::class, 'update'])->name('profile.update');
Route::put('/profile/password', [ProfileController::class, 'changePassword'])->name('profile.password');

// Rota para Admin Middleware (precisa ser criado)
/* Route::middleware(['auth', AdminMiddleware::class])->prefix('admin')->group(function () { */
/*     // Rotas protegidas para administradores */
/*     // Exemplo: rota para painel administrativo */
/*     Route::get('/dashboard', [dashboard'])->name('admin.dashboard'); */
/* }); */

Route::middleware(['auth', 'verified', AdminMiddleware::class])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
