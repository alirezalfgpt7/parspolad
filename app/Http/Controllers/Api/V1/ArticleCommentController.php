<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreArticleCommentRequest;
use App\Models\Article;
use App\Models\ArticleComment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ArticleCommentController extends Controller
{
    public function publicIndex(Request $request, string $slug): JsonResponse
    {
        $article = Article::query()->where('slug', $slug)->firstOrFail();
        $perPage = min(max($request->integer('per_page', 20), 1), 100);
        $comments = $article->comments()
            ->where('status', 'approved')
            ->oldest()
            ->paginate($perPage, ['id', 'author_name', 'body', 'created_at'])
            ->withQueryString();

        return response()->json($comments);
    }

    public function store(StoreArticleCommentRequest $request, string $slug): JsonResponse
    {
        $article = Article::query()->where('slug', $slug)->firstOrFail();
        $article->comments()->create(
            $request->safe()->except(['captcha', 'captcha_key', 'website']) + ['status' => 'pending'],
        );

        return response()->json([
            'message' => 'نظر شما پس از بررسی مدیر منتشر خواهد شد.',
        ], 201);
    }

    public function adminIndex(Request $request): JsonResponse
    {
        $filters = $request->validate([
            'status' => ['nullable', 'in:pending,approved,rejected'],
        ]);
        $perPage = min(max($request->integer('per_page', 20), 1), 100);
        $comments = ArticleComment::query()
            ->with('article:id,slug,title_fa')
            ->when($filters['status'] ?? null, fn ($query, string $status) => $query->where('status', $status))
            ->latest()
            ->paginate($perPage)
            ->withQueryString();

        return response()->json($comments);
    }

    public function updateStatus(Request $request, ArticleComment $comment): JsonResponse
    {
        $data = $request->validate([
            'status' => ['required', 'in:pending,approved,rejected'],
        ]);
        $comment->update([
            'status' => $data['status'],
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
        ]);

        return response()->json(['data' => $comment->fresh()->load('article:id,slug,title_fa')]);
    }

    public function destroy(ArticleComment $comment): JsonResponse
    {
        $comment->delete();

        return response()->json(['ok' => true]);
    }
}
