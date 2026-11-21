import React, { useEffect, useState } from 'react';
import { Pencil, Save, Trash2 } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { apiRequest } from '../../services/api.ts';
import { useAppStore } from '../../store/useAppStore.ts';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog.tsx';
import { Pagination } from '../../components/ui/Pagination.tsx';

interface FaqItem {
  id: number;
  question_fa: string;
  answer_fa: string;
  sort_order: number;
  is_active: boolean;
}

const emptyFaq = { question_fa: '', answer_fa: '', sort_order: 0, is_active: true };
const faqSchema = z.object({
  question_fa: z.string().trim().min(1, 'پرسش الزامی است.').max(500, 'پرسش نمی‌تواند بیش از ۵۰۰ نویسه باشد.'),
  answer_fa: z.string().trim().min(1, 'پاسخ الزامی است.').max(10000, 'پاسخ بیش از حد طولانی است.'),
  sort_order: z.number().int().min(0, 'ترتیب نمی‌تواند منفی باشد.'),
  is_active: z.boolean(),
});
type FaqForm = z.infer<typeof faqSchema>;

export const FaqAdminPage: React.FC = () => {
  const { addToast } = useAppStore();
  const [items, setItems] = useState<FaqItem[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [editing, setEditing] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<FaqItem | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FaqForm>({ resolver: zodResolver(faqSchema), defaultValues: emptyFaq });

  const load = async (targetPage = page) => {
    const response = await apiRequest<{ data: FaqItem[]; meta: { last_page: number } }>(
      `/admin/faqs?page=${targetPage}&per_page=20`,
    );
    if (targetPage > response.meta.last_page) {
      setPage(Math.max(1, response.meta.last_page));
      return;
    }
    setItems(response.data);
    setLastPage(response.meta.last_page);
  };

  useEffect(() => {
    load(page).catch((error: unknown) => addToast('error', error instanceof Error ? error.message : 'بارگذاری سوالات ناموفق بود.'));
  }, [page]);

  const save = async (values: FaqForm) => {
    try {
      await apiRequest(editing ? `/admin/faqs/${editing}` : '/admin/faqs', {
        method: editing ? 'PUT' : 'POST',
        body: JSON.stringify(values),
      });
      reset(emptyFaq);
      setEditing(null);
      await load();
      addToast('success', 'سوال متداول ذخیره شد.');
    } catch (error) {
      addToast('error', error instanceof Error ? error.message : 'ذخیره سوال ناموفق بود.');
    }
  };

  const remove = async () => {
    if (!deleting) return;
    try {
      await apiRequest(`/admin/faqs/${deleting.id}`, { method: 'DELETE' });
      setDeleting(null);
      await load();
      addToast('success', 'سوال متداول حذف نرم شد.');
    } catch (error) {
      addToast('error', error instanceof Error ? error.message : 'حذف سوال ناموفق بود.');
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <form onSubmit={handleSubmit(save)} className="space-y-4 rounded-2xl border border-(--theme-card-border) bg-(--theme-card-surface) p-5 shadow-(--theme-card-shadow)">
        <h1 className="text-lg font-extrabold text-(--theme-text)">{editing ? 'ویرایش سوال متداول' : 'افزودن سوال متداول'}</h1>
        <label className="block space-y-1">
          <input maxLength={500} {...register('question_fa')} placeholder="پرسش" className="w-full rounded-xl border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text) placeholder:text-(--theme-placeholder)" />
          {errors.question_fa && <span role="alert" className="text-xs text-red-600 dark:text-red-400">{errors.question_fa.message}</span>}
        </label>
        <label className="block space-y-1">
          <textarea maxLength={10000} rows={6} {...register('answer_fa')} placeholder="پاسخ" className="w-full rounded-xl border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text) placeholder:text-(--theme-placeholder)" />
          {errors.answer_fa && <span role="alert" className="text-xs text-red-600 dark:text-red-400">{errors.answer_fa.message}</span>}
        </label>
        <div className="flex flex-wrap items-center gap-4 text-(--theme-text)">
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" {...register('is_active')} className="accent-(--theme-primary)" />فعال</label>
          <label className="flex items-center gap-2 text-sm">ترتیب
            <input type="number" min={0} {...register('sort_order', { valueAsNumber: true })} className="w-24 rounded-xl border border-(--theme-input-border) bg-(--theme-input-bg) px-2 py-1 text-(--theme-input-text)" />
          </label>
          {errors.sort_order && <span role="alert" className="text-xs text-red-600 dark:text-red-400">{errors.sort_order.message}</span>}
        </div>
        <div className="flex gap-2">
          <button disabled={isSubmitting} className="inline-flex items-center gap-2 rounded-xl bg-(--theme-btn-bg) px-4 py-2 text-sm font-semibold text-(--theme-btn-text) transition hover:bg-(--theme-btn-hover) disabled:opacity-60"><Save className="h-4 w-4" />ذخیره</button>
          {editing && <button type="button" onClick={() => { setEditing(null); reset(emptyFaq); }} className="rounded-xl border border-(--theme-border) bg-(--theme-surface) px-4 py-2 text-sm text-(--theme-text) hover:bg-(--theme-surface-muted)">انصراف</button>}
        </div>
      </form>

      <div className="space-y-3">
        {items.map((item) => (
          <article key={item.id} className="rounded-2xl border border-(--theme-card-border) bg-(--theme-card-surface) p-4 shadow-(--theme-card-shadow)">
            <div className="flex items-start justify-between gap-3">
              <div><h2 className="font-bold text-(--theme-text)">{item.question_fa}</h2><p className="mt-2 text-sm text-(--theme-text-muted)">{item.answer_fa}</p></div>
              <span className="shrink-0 text-xs text-(--theme-text-muted)">{item.is_active ? 'فعال' : 'غیرفعال'} · {item.sort_order}</span>
            </div>
            <div className="mt-3 flex gap-2">
              <button type="button" onClick={() => { setEditing(item.id); reset({ question_fa: item.question_fa, answer_fa: item.answer_fa, sort_order: item.sort_order, is_active: item.is_active }); }} className="inline-flex items-center gap-1 rounded-xl border border-(--theme-border) px-3 py-1.5 text-xs text-(--theme-text) hover:bg-(--theme-surface-muted)"><Pencil className="h-3.5 w-3.5" />ویرایش</button>
              <button type="button" onClick={() => setDeleting(item)} className="inline-flex items-center gap-1 rounded-xl border border-red-200 px-3 py-1.5 text-xs text-red-700 dark:border-red-900 dark:text-red-400"><Trash2 className="h-3.5 w-3.5" />حذف</button>
            </div>
          </article>
        ))}
        {items.length === 0 && <p className="text-sm text-(--theme-text-muted)">سوالی برای نمایش وجود ندارد.</p>}
      </div>
      <Pagination page={page} lastPage={lastPage} onChange={setPage} />
      <ConfirmDialog open={Boolean(deleting)} onClose={() => setDeleting(null)} onConfirm={remove} message="این سوال نرم حذف می‌شود و از سایت عمومی نمایش داده نخواهد شد. ادامه می‌دهید؟" />
    </div>
  );
};
