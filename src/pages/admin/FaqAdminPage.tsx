import React, { useEffect, useState } from 'react';
import { Pencil, Save, Trash2 } from 'lucide-react';
import { apiRequest } from '../../services/api.ts';
import { useAppStore } from '../../store/useAppStore.ts';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog.tsx';

interface FaqItem {
  id: number;
  question_fa: string;
  answer_fa: string;
  sort_order: number;
  is_active: boolean;
}

const emptyFaq = { question_fa: '', answer_fa: '', sort_order: 0, is_active: true };

export const FaqAdminPage: React.FC = () => {
  const { addToast } = useAppStore();
  const [items, setItems] = useState<FaqItem[]>([]);
  const [form, setForm] = useState(emptyFaq);
  const [editing, setEditing] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<FaqItem | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const response = await apiRequest<{ data: FaqItem[] }>('/admin/faqs');
    setItems(response.data);
  };

  useEffect(() => {
    load().catch((error: unknown) => addToast('error', error instanceof Error ? error.message : 'بارگذاری سوالات ناموفق بود.'));
  }, []);

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      await apiRequest(editing ? `/admin/faqs/${editing}` : '/admin/faqs', {
        method: editing ? 'PUT' : 'POST',
        body: JSON.stringify(form),
      });
      setForm(emptyFaq);
      setEditing(null);
      await load();
      addToast('success', 'سوال متداول ذخیره شد.');
    } catch (error) {
      addToast('error', error instanceof Error ? error.message : 'ذخیره سوال ناموفق بود.');
    } finally {
      setSaving(false);
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
      <form onSubmit={save} className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-lg font-extrabold">{editing ? 'ویرایش سوال متداول' : 'افزودن سوال متداول'}</h1>
        <input required maxLength={500} value={form.question_fa} onChange={(event) => setForm({ ...form, question_fa: event.target.value })} placeholder="پرسش" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
        <textarea required maxLength={10000} rows={6} value={form.answer_fa} onChange={(event) => setForm({ ...form, answer_fa: event.target.value })} placeholder="پاسخ" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_active} onChange={(event) => setForm({ ...form, is_active: event.target.checked })} />فعال</label>
          <label className="flex items-center gap-2 text-sm">ترتیب
            <input type="number" min={0} value={form.sort_order} onChange={(event) => setForm({ ...form, sort_order: Number(event.target.value) })} className="w-24 rounded-lg border border-slate-200 px-2 py-1 dark:border-slate-700 dark:bg-slate-800" />
          </label>
        </div>
        <div className="flex gap-2">
          <button disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-[var(--theme-primary)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"><Save className="h-4 w-4" />ذخیره</button>
          {editing && <button type="button" onClick={() => { setEditing(null); setForm(emptyFaq); }} className="rounded-lg border px-4 py-2 text-sm">انصراف</button>}
        </div>
      </form>

      <div className="space-y-3">
        {items.map((item) => (
          <article key={item.id} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-start justify-between gap-3">
              <div><h2 className="font-bold">{item.question_fa}</h2><p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{item.answer_fa}</p></div>
              <span className="shrink-0 text-xs text-slate-500">{item.is_active ? 'فعال' : 'غیرفعال'} · {item.sort_order}</span>
            </div>
            <div className="mt-3 flex gap-2">
              <button type="button" onClick={() => { setEditing(item.id); setForm({ question_fa: item.question_fa, answer_fa: item.answer_fa, sort_order: item.sort_order, is_active: item.is_active }); }} className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs"><Pencil className="h-3.5 w-3.5" />ویرایش</button>
              <button type="button" onClick={() => setDeleting(item)} className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs text-red-700"><Trash2 className="h-3.5 w-3.5" />حذف</button>
            </div>
          </article>
        ))}
        {items.length === 0 && <p className="text-sm text-slate-500">سوالی برای نمایش وجود ندارد.</p>}
      </div>
      <ConfirmDialog open={Boolean(deleting)} onClose={() => setDeleting(null)} onConfirm={remove} message="این سوال نرم حذف می‌شود و از سایت عمومی نمایش داده نخواهد شد. ادامه می‌دهید؟" />
    </div>
  );
};
