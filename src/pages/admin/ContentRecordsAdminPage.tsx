import React, { useEffect, useState } from 'react';
import { Pencil, Plus, Save, Trash2 } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { apiRequest } from '../../services/api.ts';
import { useAppStore } from '../../store/useAppStore.ts';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog.tsx';
import { Pagination } from '../../components/ui/Pagination.tsx';
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
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ContentRecord | null>(null);
  const formSchema = React.useMemo(() => {
    const shape: Record<string, z.ZodTypeAny> = {};
    for (const field of fields) {
      if (field.type === 'boolean') {
        shape[field.name] = z.boolean();
      } else if (field.type === 'json') {
        shape[field.name] = z.string().superRefine((value, context) => {
          if (value === '' && !field.required) return;
          try {
            JSON.parse(value);
          } catch {
            context.addIssue({ code: 'custom', message: 'ساختار JSON معتبر نیست.' });
          }
        });
      } else if (field.type === 'number') {
        shape[field.name] = z.union([z.number(), z.string()]).refine(
          (value) => (value === '' && !field.required) || Number.isFinite(Number(value)),
          'یک عدد معتبر وارد کنید.',
        );
      } else {
        shape[field.name] = field.required
          ? z.string().trim().min(1, 'تکمیل این فیلد الزامی است.')
          : z.string();
      }
    }

    return z.object(shape);
  }, [fields]);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Record<string, unknown>>({
    resolver: zodResolver(formSchema),
    defaultValues: {},
  });

  const loadSchema = async (target: string) => {
    const schema = await apiRequest<{ data: { fields: ContentField[] } }>(`/admin/content-schema/${target}`);
    setFields(schema.data.fields);
  };

  const loadRecords = async (target = resource, targetPage = page) => {
    const rows = await apiRequest<{ data: ContentRecord[]; meta: { last_page: number } }>(
      `/admin/${target}?page=${targetPage}&per_page=20`,
    );
    if (targetPage > rows.meta.last_page) {
      setPage(Math.max(1, rows.meta.last_page));
      return;
    }
    setRecords(rows.data);
    setLastPage(rows.meta.last_page);
  };

  useEffect(() => {
    loadSchema(resource).catch((error: unknown) => addToast('error', error instanceof Error ? error.message : 'بارگذاری ساختار فیلدها ناموفق بود.'));
  }, [resource]);

  useEffect(() => {
    loadRecords(resource, page).catch((error: unknown) => addToast('error', error instanceof Error ? error.message : 'بارگذاری اطلاعات ناموفق بود.'));
  }, [resource, page]);

  const startCreate = () => {
    setEditingId(null);
    reset(Object.fromEntries(fields.map((field) => [field.name, emptyValue(field, records.length)])));
  };

  const startEdit = (record: ContentRecord) => {
    setEditingId(record.id);
    reset(Object.fromEntries(fields.map((field) => {
      const value = record[field.name];
      return [field.name, field.type === 'json' ? JSON.stringify(value ?? [], null, 2) : value ?? ''];
    })));
  };

  const save = async (values: Record<string, unknown>) => {
    const payload: Record<string, unknown> = {};
    for (const field of fields) {
      const value = values[field.name];
      if (field.type === 'json') {
        if (value === '' && !field.required && !editingId) continue;
        payload[field.name] = value === '' ? null : JSON.parse(String(value));
      } else if (field.type === 'number') {
        if (value === '' && !field.required && !editingId) continue;
        payload[field.name] = value === '' ? null : Number(value);
      } else if (field.type === 'boolean') {
        payload[field.name] = Boolean(value);
      } else {
        if (value === '' && !field.required && !editingId) continue;
        payload[field.name] = value === '' && !field.required ? null : value;
      }
    }

    try {
      await apiRequest(editingId ? `/admin/${resource}/${editingId}` : `/admin/${resource}`, {
        method: editingId ? 'PUT' : 'POST',
        body: JSON.stringify(payload),
      });
      reset({});
      setEditingId(null);
      await loadRecords(resource, page);
      addToast('success', 'اطلاعات ذخیره شد.');
    } catch (error) {
      addToast('error', error instanceof Error ? error.message : 'ذخیره اطلاعات ناموفق بود.');
    }
  };

  const remove = async () => {
    if (!deleteTarget) return;
    try {
      await apiRequest(`/admin/${resource}/${deleteTarget.id}`, { method: 'DELETE' });
      setDeleteTarget(null);
      await loadRecords(resource, page);
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
          <SearchableSelect
            label="بخش"
            options={resources}
            value={resource}
            onChange={(value) => {
              setResource(value);
              setPage(1);
              setEditingId(null);
              reset({});
            }}
          />
        </div>
        <button type="button" onClick={startCreate} className="inline-flex items-center gap-2 rounded-lg bg-(--theme-primary) px-4 py-2 text-sm font-semibold text-white">
          <Plus className="h-4 w-4" />افزودن رکورد
        </button>
      </div>

      {fields.length > 0 && (
        <form onSubmit={handleSubmit(save)} className="grid gap-3 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-2">
          <h2 className="text-sm font-bold sm:col-span-2">{editingId ? 'ویرایش رکورد' : 'رکورد جدید'}</h2>
          {fields.map((field) => (
            <label key={field.name} className={`space-y-1 text-xs font-medium ${field.type === 'textarea' || field.type === 'json' ? 'sm:col-span-2' : ''}`}>
              <span>{field.name}{field.required ? ' *' : ''}</span>
              {field.type === 'boolean' ? (
                <input type="checkbox" {...register(field.name)} />
              ) : field.type === 'textarea' || field.type === 'json' ? (
                <textarea rows={field.type === 'json' ? 4 : 2} {...register(field.name)} className="w-full rounded-lg border border-slate-200 px-3 py-2 font-normal dark:border-slate-700 dark:bg-slate-800" />
              ) : (
                <input type={field.type === 'number' ? 'number' : 'text'} {...register(field.name)} className="w-full rounded-lg border border-slate-200 px-3 py-2 font-normal dark:border-slate-700 dark:bg-slate-800" />
              )}
              {errors[field.name]?.message && (
                <span role="alert" className="block text-red-600">{String(errors[field.name]?.message)}</span>
              )}
            </label>
          ))}
          <div className="flex gap-2 sm:col-span-2">
            <button disabled={isSubmitting} className="inline-flex items-center gap-2 rounded-lg bg-(--theme-primary) px-4 py-2 text-xs font-semibold text-white disabled:opacity-60"><Save className="h-4 w-4" />ذخیره</button>
            <button type="button" onClick={() => { setEditingId(null); reset({}); }} className="rounded-lg border px-4 py-2 text-xs">پاک‌کردن فرم</button>
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
      <Pagination page={page} lastPage={lastPage} onChange={setPage} />
      <ConfirmDialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} onConfirm={remove} message="این رکورد نرم حذف می‌شود و از سایت عمومی نمایش داده نخواهد شد. ادامه می‌دهید؟" />
    </div>
  );
};
