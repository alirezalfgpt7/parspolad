import React, { useEffect, useState } from 'react';
import { Pencil, Plus, Save, Trash2 } from 'lucide-react';
import { apiRequest } from '../../services/api.ts';
import { useAppStore } from '../../store/useAppStore.ts';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog.tsx';
import { SearchableSelect } from '../../components/ui/SearchableSelect.tsx';

type FieldType = 'boolean' | 'json' | 'number' | 'string' | 'textarea';

interface ContentField {
  name: string;
  type: FieldType;
  required: boolean;
}

interface ContentRecord extends Record<string, unknown> {
  id: number;
}

const resources = [
  { value: 'categories', label: 'دسته‌بندی پروژه' },
  { value: 'services', label: 'خدمات' },
  { value: 'products', label: 'محصولات' },
  { value: 'departments', label: 'واحدهای سازمانی' },
  { value: 'team', label: 'اعضای تیم' },
  { value: 'partners', label: 'کارفرمایان و شرکا' },
  { value: 'articles', label: 'اخبار و مقالات' },
  { value: 'pages', label: 'صفحات' },
  { value: 'banners', label: 'بنرها' },
  { value: 'kpis', label: 'شاخص‌های آماری' },
  { value: 'notification-templates', label: 'قالب‌های اعلان' },
  { value: 'faqs', label: 'سوالات متداول' },
];

const emptyValue = (field: ContentField, index: number): unknown => {
  if (field.type === 'boolean') return field.name === 'is_active';
  if (field.type === 'json') return '[]';
  if (field.type === 'number') return field.name === 'sort_order' ? index + 1 : 0;
  return '';
};

const recordLabel = (record: ContentRecord): string =>
  String(record.title_fa ?? record.name_fa ?? record.label_fa ?? record.question_fa ?? record.event_key ?? record.slug ?? record.key ?? record.id);

export const ContentRecordsAdminPage: React.FC = () => {
  const { addToast } = useAppStore();
  const [resource, setResource] = useState('services');
  const [fields, setFields] = useState<ContentField[]>([]);
  const [records, setRecords] = useState<ContentRecord[]>([]);
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ContentRecord | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async (target = resource) => {
    const [schema, rows] = await Promise.all([
      apiRequest<{ data: { fields: ContentField[] } }>(`/admin/content-schema/${target}`),
      apiRequest<{ data: ContentRecord[] }>(`/admin/${target}`),
    ]);
    setFields(schema.data.fields);
    setRecords(rows.data);
  };

  useEffect(() => {
    load(resource).catch((error: unknown) => addToast('error', error instanceof Error ? error.message : 'بارگذاری اطلاعات ناموفق بود.'));
  }, [resource]);

  const startCreate = () => {
    setEditingId(null);
    setForm(Object.fromEntries(fields.map((field) => [field.name, emptyValue(field, records.length)])));
  };

  const startEdit = (record: ContentRecord) => {
    setEditingId(record.id);
    setForm(Object.fromEntries(fields.map((field) => {
      const value = record[field.name];
      return [field.name, field.type === 'json' ? JSON.stringify(value ?? [], null, 2) : value ?? ''];
    })));
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    const payload: Record<string, unknown> = {};
    try {
      for (const field of fields) {
        const value = form[field.name];
        if (field.type === 'json') {
          payload[field.name] = typeof value === 'string' ? JSON.parse(value) : value;
        } else if (field.type === 'number') {
          if (value === '' && !field.required && !editingId) continue;
          payload[field.name] = value === '' ? null : Number(value);
        } else if (field.type === 'boolean') {
          payload[field.name] = Boolean(value);
        } else if (value === '' && !field.required && !editingId) {
          continue;
        } else {
          payload[field.name] = value === '' && !field.required ? null : value;
        }
      }
    } catch {
      addToast('error', 'مقدار یکی از فیلدهای JSON معتبر نیست.');
      return;
    }

    setSaving(true);
    try {
      await apiRequest(editingId ? `/admin/${resource}/${editingId}` : `/admin/${resource}`, {
        method: editingId ? 'PUT' : 'POST',
        body: JSON.stringify(payload),
      });
      setForm({});
      setEditingId(null);
      await load();
      addToast('success', 'اطلاعات ذخیره شد.');
    } catch (error) {
      addToast('error', error instanceof Error ? error.message : 'ذخیره اطلاعات ناموفق بود.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!deleteTarget) return;
    try {
      await apiRequest(`/admin/${resource}/${deleteTarget.id}`, { method: 'DELETE' });
      setDeleteTarget(null);
      await load();
      addToast('success', 'رکورد نرم حذف شد.');
    } catch (error) {
      addToast('error', error instanceof Error ? error.message : 'حذف رکورد ناموفق بود.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="w-full max-w-sm">
          <h1 className="mb-2 text-lg font-extrabold">مدیریت محتوای پایگاه‌داده</h1>
          <SearchableSelect label="بخش" options={resources} value={resource} onChange={setResource} />
        </div>
        <button type="button" onClick={startCreate} className="inline-flex items-center gap-2 rounded-lg bg-[var(--theme-primary)] px-4 py-2 text-sm font-semibold text-white">
          <Plus className="h-4 w-4" />افزودن رکورد
        </button>
      </div>

      {fields.length > 0 && (
        <form onSubmit={save} className="grid gap-3 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-2">
          <h2 className="text-sm font-bold sm:col-span-2">{editingId ? 'ویرایش رکورد' : 'رکورد جدید'}</h2>
          {fields.map((field) => (
            <label key={field.name} className={`space-y-1 text-xs font-medium ${field.type === 'textarea' || field.type === 'json' ? 'sm:col-span-2' : ''}`}>
              <span>{field.name}{field.required ? ' *' : ''}</span>
              {field.type === 'boolean' ? (
                <input type="checkbox" checked={Boolean(form[field.name])} onChange={(event) => setForm({ ...form, [field.name]: event.target.checked })} />
              ) : field.type === 'textarea' || field.type === 'json' ? (
                <textarea required={field.required} rows={field.type === 'json' ? 4 : 2} value={String(form[field.name] ?? '')} onChange={(event) => setForm({ ...form, [field.name]: event.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 font-normal dark:border-slate-700 dark:bg-slate-800" />
              ) : (
                <input required={field.required} type={field.type === 'number' ? 'number' : 'text'} value={String(form[field.name] ?? '')} onChange={(event) => setForm({ ...form, [field.name]: field.type === 'number' ? event.target.value === '' ? '' : Number(event.target.value) : event.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 font-normal dark:border-slate-700 dark:bg-slate-800" />
              )}
            </label>
          ))}
          <div className="flex gap-2 sm:col-span-2">
            <button disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-[var(--theme-primary)] px-4 py-2 text-xs font-semibold text-white disabled:opacity-60"><Save className="h-4 w-4" />ذخیره</button>
            <button type="button" onClick={() => { setEditingId(null); setForm({}); }} className="rounded-lg border px-4 py-2 text-xs">پاک‌کردن فرم</button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <table className="w-full text-start text-sm">
          <thead><tr className="border-b text-xs"><th className="p-3 text-start">شناسه</th><th className="p-3 text-start">عنوان</th><th className="p-3 text-start">عملیات</th></tr></thead>
          <tbody>
            {records.map((record) => (
              <tr key={record.id} className="border-b last:border-0 dark:border-slate-800">
                <td className="p-3 tabular-nums">{record.id}</td>
                <td className="max-w-xl truncate p-3">{recordLabel(record)}</td>
                <td className="p-3"><div className="flex gap-2">
                  <button type="button" onClick={() => startEdit(record)} aria-label="ویرایش" className="rounded p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800"><Pencil className="h-4 w-4" /></button>
                  <button type="button" onClick={() => setDeleteTarget(record)} aria-label="حذف" className="rounded p-1.5 text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                </div></td>
              </tr>
            ))}
            {records.length === 0 && <tr><td colSpan={3} className="p-8 text-center text-slate-500">رکوردی ثبت نشده است.</td></tr>}
          </tbody>
        </table>
      </div>
      <ConfirmDialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} onConfirm={remove} message="این رکورد نرم حذف می‌شود و از سایت عمومی نمایش داده نخواهد شد. ادامه می‌دهید؟" />
    </div>
  );
};
