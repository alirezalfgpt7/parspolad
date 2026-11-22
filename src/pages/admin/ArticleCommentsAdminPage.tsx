import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { apiRequest } from '../../services/api.ts';
import { useAppStore } from '../../store/useAppStore.ts';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog.tsx';
import { Pagination } from '../../components/ui/Pagination.tsx';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader.tsx';

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
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<CommentStatus | 'all'>('pending');
  const [deleteTarget, setDeleteTarget] = useState<ArticleComment | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = async (targetPage = page) => {
    const query = new URLSearchParams({ page: String(targetPage), per_page: '20' });
    if (statusFilter !== 'all') query.set('status', statusFilter);
    const response = await apiRequest<{ data: ArticleComment[]; meta: { last_page: number } }>(`/admin/comments?${query}`);
    if (targetPage > response.meta.last_page) {
      setPage(Math.max(1, response.meta.last_page));
      return;
    }
    setComments(response.data);
    setLastPage(response.meta.last_page);
  };

  useEffect(() => {
    load(page).catch((error: unknown) => {
      addToast('error', error instanceof Error ? error.message : 'دریافت دیدگاه‌ها ناموفق بود.');
    });
  }, [statusFilter, page]);

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
      <AdminPageHeader
        icon={MessageCircle}
        eyebrow="Content moderation"
        title="مدیریت دیدگاه‌های مقالات"
        description="دیدگاه‌ها تا زمان تأیید مدیر برای بازدیدکنندگان نمایش داده نمی‌شوند."
        actions={(
          <label className="flex min-w-52 items-center gap-2 text-xs text-(--theme-text)">
            <span className="shrink-0">وضعیت</span>
            <select
              aria-label="فیلتر وضعیت دیدگاه‌ها"
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value as CommentStatus | 'all');
                setPage(1);
              }}
              className="min-w-0 flex-1 rounded-xl border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-(--theme-input-text)"
            >
              <option value="pending">در انتظار بررسی</option>
              <option value="approved">منتشرشده</option>
              <option value="rejected">ردشده</option>
              <option value="all">همه</option>
            </select>
          </label>
        )}
      />

      {comments.length === 0 ? (
        <div className="rounded-2xl border border-(--theme-card-border) bg-(--theme-card-surface) p-8 text-center text-sm text-(--theme-text-muted) shadow-(--theme-card-shadow)">
          دیدگاهی در این وضعیت وجود ندارد.
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <article key={comment.id} className="rounded-2xl border border-(--theme-card-border) bg-(--theme-card-surface) p-4 shadow-(--theme-card-shadow)">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-sm font-bold text-(--theme-text)">{comment.author_name}</h2>
                    <span className="rounded-full border border-(--theme-border) bg-(--theme-surface-muted) px-2.5 py-0.5 text-[10px] text-(--theme-text-muted)">
                      {statusLabels[comment.status]}
                    </span>
                  </div>
                  <time className="mt-1 block text-[11px] text-(--theme-text-muted)">
                    {new Date(comment.created_at).toLocaleString('fa-IR')}
                  </time>
                </div>
                {comment.article && (
                  <Link to={`/news/${comment.article.slug}`} target="_blank" className="text-xs font-semibold text-(--theme-link) hover:underline">
                    {comment.article.title_fa}
                  </Link>
                )}
              </div>
              <p className="mt-3 whitespace-pre-wrap wrap-break-word text-sm leading-7 text-(--theme-text)">
                {comment.body}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {comment.status !== 'approved' && (
                  <button
                    type="button"
                    onClick={() => moderate(comment, 'approved')}
                    className="rounded-xl bg-emerald-700 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-800"
                  >
                    تأیید و انتشار
                  </button>
                )}
                {comment.status !== 'rejected' && (
                  <button
                    type="button"
                    onClick={() => moderate(comment, 'rejected')}
                    className="rounded-xl border border-amber-300 px-3 py-2 text-xs font-semibold text-amber-800 dark:border-amber-700 dark:text-amber-300"
                  >
                    رد دیدگاه
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setDeleteTarget(comment)}
                  className="rounded-xl border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 dark:border-red-900 dark:text-red-400"
                >
                  حذف
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
      <Pagination page={page} lastPage={lastPage} onChange={setPage} />

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
