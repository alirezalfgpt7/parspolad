import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../../services/api.ts';
import { useAppStore } from '../../store/useAppStore.ts';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog.tsx';

type CommentStatus = 'pending' | 'approved' | 'rejected';

interface ArticleComment {
  id: number;
  author_name: string;
  body: string;
  status: CommentStatus;
  created_at: string;
  article: { slug: string; title_fa: string } | null;
}

const statusLabels: Record<CommentStatus, string> = {
  pending: 'در انتظار بررسی',
  approved: 'منتشرشده',
  rejected: 'ردشده',
};

export const ArticleCommentsAdminPage: React.FC = () => {
  const { addToast } = useAppStore();
  const [comments, setComments] = useState<ArticleComment[]>([]);
  const [statusFilter, setStatusFilter] = useState<CommentStatus | 'all'>('pending');
  const [deleteTarget, setDeleteTarget] = useState<ArticleComment | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    const query = statusFilter === 'all' ? '' : `?status=${statusFilter}`;
    const response = await apiRequest<{ data: ArticleComment[] }>(`/admin/comments${query}`);
    setComments(response.data);
  };

  useEffect(() => {
    load().catch((error: unknown) => {
      addToast('error', error instanceof Error ? error.message : 'دریافت دیدگاه‌ها ناموفق بود.');
    });
  }, [statusFilter]);

  const moderate = async (comment: ArticleComment, status: CommentStatus) => {
    try {
      await apiRequest(`/admin/comments/${comment.id}`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      await load();
      addToast('success', `وضعیت دیدگاه «${statusLabels[status]}» شد.`);
    } catch (error) {
      addToast('error', error instanceof Error ? error.message : 'تغییر وضعیت دیدگاه ناموفق بود.');
    }
  };

  const deleteComment = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    try {
      await apiRequest(`/admin/comments/${deleteTarget.id}`, { method: 'DELETE' });
      setDeleteTarget(null);
      await load();
      addToast('success', 'دیدگاه حذف شد.');
    } catch (error) {
      addToast('error', error instanceof Error ? error.message : 'حذف دیدگاه ناموفق بود.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-extrabold">مدیریت دیدگاه‌های مقالات</h1>
          <p className="mt-1 text-xs text-slate-500">دیدگاه‌ها تا زمان تأیید مدیر برای بازدیدکنندگان نمایش داده نمی‌شوند.</p>
        </div>
        <label className="flex items-center gap-2 text-xs">
          وضعیت
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as CommentStatus | 'all')}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
          >
            <option value="pending">در انتظار بررسی</option>
            <option value="approved">منتشرشده</option>
            <option value="rejected">ردشده</option>
            <option value="all">همه</option>
          </select>
        </label>
      </div>

      {comments.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900">
          دیدگاهی در این وضعیت وجود ندارد.
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <article key={comment.id} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-sm font-bold">{comment.author_name}</h2>
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {statusLabels[comment.status]}
                    </span>
                  </div>
                  <time className="mt-1 block text-[11px] text-slate-500">
                    {new Date(comment.created_at).toLocaleString('fa-IR')}
                  </time>
                </div>
                {comment.article && (
                  <Link to={`/news/${comment.article.slug}`} target="_blank" className="text-xs text-[var(--theme-primary)] hover:underline">
                    {comment.article.title_fa}
                  </Link>
                )}
              </div>
              <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-slate-700 dark:text-slate-300">
                {comment.body}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {comment.status !== 'approved' && (
                  <button
                    type="button"
                    onClick={() => moderate(comment, 'approved')}
                    className="rounded-lg bg-emerald-700 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-800"
                  >
                    تأیید و انتشار
                  </button>
                )}
                {comment.status !== 'rejected' && (
                  <button
                    type="button"
                    onClick={() => moderate(comment, 'rejected')}
                    className="rounded-lg border border-amber-300 px-3 py-2 text-xs font-semibold text-amber-800 dark:border-amber-700 dark:text-amber-300"
                  >
                    رد دیدگاه
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setDeleteTarget(comment)}
                  className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 dark:border-red-900 dark:text-red-400"
                >
                  حذف
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={deleteComment}
        message="آیا از حذف این دیدگاه اطمینان دارید؟"
        loading={deleting}
      />
    </div>
  );
};
