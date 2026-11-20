import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ArrowUpRight,
  ArrowUpDown,
  CopyPlus,
  Database,
  ListFilter,
  Pencil,
  Plus,
  Search,
  Save,
  Trash2,
} from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { apiRequest } from '../../services/api.ts';
import { useAppStore } from '../../store/useAppStore.ts';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog.tsx';
import { MediaUrlField } from '../../components/ui/MediaUrlField.tsx';
import { Modal } from '../../components/ui/Modal.tsx';
import { Pagination } from '../../components/ui/Pagination.tsx';
import { PersianDatePicker, gregorianToJalali, jalaliToGregorian } from '../../components/ui/PersianDatePicker.tsx';
import { SearchableSelect } from '../../components/ui/SearchableSelect.tsx';
import { IconPicker } from '../../components/ui/IconPicker.tsx';
import { InlineLoader } from '../../components/common/InlineLoader.tsx';
import { RichTextEditor } from '../../components/ui/RichTextEditor.tsx';

type FieldType = 'boolean' | 'color' | 'date' | 'datetime' | 'jalali-date' | 'json' | 'number' | 'richtext' | 'select' | 'string' | 'textarea';

interface ContentFieldOption {
  value: string;
  label_fa: string;
  label_en: string;
}

interface ContentField {
  name: string;
  label_fa: string;
  label_en: string;
  type: FieldType;
  required: boolean;
  unique: boolean;
  options?: ContentFieldOption[];
}

interface ContentResource {
  key: string;
  label_fa: string;
  label_en: string;
  description_fa: string;
  usage_fa: string;
  public_path: string | null;
  related_admin_path: string | null;
  count: number;
}

interface ContentRecord extends Record<string, unknown> {
  id: number;
}

interface ContentListResponse {
  data: ContentRecord[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

const emptyValue = (field: ContentField, index: number): unknown => {
  if (field.name === 'article_category_id') return '';
  if (field.unique && field.type !== 'boolean') return '';
  if (field.type === 'boolean') return field.name === 'is_active';
  if (field.type === 'json') return ['metadata', 'specs', 'specs_en'].includes(field.name) ? '{}' : '[]';
  if (field.type === 'number') return field.name === 'sort_order' ? index + 1 : 0;
  if (field.type === 'select') return field.options?.[0]?.value ?? '';
  return '';
};

const normalizeDateInput = (value: unknown, type: FieldType): string => {
  if (typeof value !== 'string') return '';
  if (type === 'jalali-date') return value.slice(0, 10).replace(/-/g, '/');
  if (type === 'date' || type === 'datetime') {
    const [date, time = '00:00'] = value.replace(' ', 'T').split('T');
    const jalaliDate = /^\d{4}-\d{2}-\d{2}$/.test(date) ? gregorianToJalali(date) : date.replace(/-/g, '/');
    return type === 'datetime' ? `${jalaliDate}T${time.slice(0, 5)}` : jalaliDate;
  }
  return value;
};

const printableValue = (value: unknown): string => {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'فعال' : 'غیرفعال';
  if (Array.isArray(value) || typeof value === 'object') return JSON.stringify(value);
  return String(value);
};

const getPrimaryField = (fields: ContentField[]): ContentField | undefined =>
  fields.find((field) => /^(title|name|question|label)_fa$/.test(field.name))
  ?? fields.find((field) => field.type === 'string' || field.type === 'textarea');

const getDefaultColumns = (fields: ContentField[]): string[] => {
  const primary = getPrimaryField(fields);
  const otherFields = fields.filter((field) =>
    field.name !== primary?.name && field.type !== 'json' && field.type !== 'textarea' && field.type !== 'boolean',
  );
  return [primary?.name, ...otherFields.slice(0, 3).map((field) => field.name)]
    .filter((name): name is string => Boolean(name));
};

interface ContentRecordsAdminPageProps {
  initialResource?: string;
  lockedResource?: boolean;
  embedded?: boolean;
}

export const ContentRecordsAdminPage: React.FC<ContentRecordsAdminPageProps> = ({
  initialResource,
  lockedResource = false,
  embedded = false,
}) => {
  const { addToast, fetchBootstrap } = useAppStore();
  const [searchParams] = useSearchParams();
  const [resources, setResources] = useState<ContentResource[]>([]);
  const [resource, setResource] = useState(initialResource ?? searchParams.get('resource') ?? '');
  const [fields, setFields] = useState<ContentField[]>([]);
  const [records, setRecords] = useState<ContentRecord[]>([]);
  const [visibleColumns, setVisibleColumns] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [perPage, setPerPage] = useState(20);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [loadingResources, setLoadingResources] = useState(true);
  const [loadingSchema, setLoadingSchema] = useState(false);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [refreshVersion, setRefreshVersion] = useState(0);
  const [formMode, setFormMode] = useState<'create' | 'edit' | null>(null);
  const [editingRecord, setEditingRecord] = useState<ContentRecord | null>(null);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ContentRecord | null>(null);
  const [deleting, setDeleting] = useState(false);

  const formSchema = useMemo(() => {
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
      } else if (field.type === 'select') {
        shape[field.name] = field.required
          ? z.string().min(1, 'یک گزینه انتخاب کنید.')
          : z.string();
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
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<Record<string, unknown>>({
    resolver: zodResolver(formSchema),
    defaultValues: {},
  });

  useEffect(() => {
    let active = true;
    apiRequest<{ data: ContentResource[] }>('/admin/content-resources')
      .then(({ data }) => {
        if (!active) return;
        setResources(data);
        const preferred = initialResource ?? searchParams.get('resource') ?? resource;
        setResource(data.some((item) => item.key === preferred) ? preferred : data[0]?.key ?? '');
      })
      .catch((error: unknown) => {
        if (active) addToast('error', error instanceof Error ? error.message : 'دریافت بخش‌های محتوا ناموفق بود.');
      })
      .finally(() => {
        if (active) setLoadingResources(false);
      });

    return () => {
      active = false;
    };
  }, [addToast, initialResource, searchParams]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    if (!resource) return;
    let active = true;
    setLoadingSchema(true);
    apiRequest<{ data: { fields: ContentField[] } }>(`/admin/content-schema/${resource}`)
      .then(({ data }) => {
        if (!active) return;
        setFields(data.fields);
        setVisibleColumns((current) => {
          const valid = current.filter((name) => data.fields.some((field) => field.name === name));
          return valid.length > 0 ? valid : getDefaultColumns(data.fields);
        });
      })
      .catch((error: unknown) => {
        if (active) {
          setFields([]);
          addToast('error', error instanceof Error ? error.message : 'دریافت ساختار فیلدها ناموفق بود.');
        }
      })
      .finally(() => {
        if (active) setLoadingSchema(false);
      });

    return () => {
      active = false;
    };
  }, [resource, addToast]);

  useEffect(() => {
    if (!resource) return;
    let active = true;
    setLoadingRecords(true);

    const params = new URLSearchParams({
      page: String(page),
      per_page: String(perPage),
      sort_by: sortBy,
      sort_order: sortOrder,
    });
    if (search) params.set('search', search);

    apiRequest<ContentListResponse>(`/admin/${resource}?${params.toString()}`)
      .then((response) => {
        if (!active) return;
        setRecords(response.data);
        setLastPage(response.meta.last_page);
        setTotal(response.meta.total);
        if (page > response.meta.last_page) setPage(Math.max(1, response.meta.last_page));
      })
      .catch((error: unknown) => {
        if (active) {
          setRecords([]);
          setTotal(0);
          addToast('error', error instanceof Error ? error.message : 'دریافت اطلاعات ناموفق بود.');
        }
      })
      .finally(() => {
        if (active) setLoadingRecords(false);
      });

    return () => {
      active = false;
    };
  }, [resource, page, perPage, search, sortBy, sortOrder, refreshVersion, addToast]);

  const selectedResource = resources.find((item) => item.key === resource);
  const availableResources = lockedResource && initialResource
    ? resources.filter((item) => item.key === initialResource)
    : resources;
  const primaryField = getPrimaryField(fields);
  const sortableFields = fields.filter((field) => field.type !== 'json' && field.type !== 'textarea');
  const displayedFields = sortableFields.filter((field) => visibleColumns.includes(field.name));

  const setSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder((current) => current === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setPage(1);
  };

  const openCreate = () => {
    setEditingRecord(null);
    setIsDuplicating(false);
    setFormMode('create');
    reset(Object.fromEntries(fields.map((field) => [field.name, emptyValue(field, (page - 1) * perPage + records.length)])));
  };

  const openEdit = (record: ContentRecord) => {
    setEditingRecord(record);
    setIsDuplicating(false);
    setFormMode('edit');
    reset(Object.fromEntries(fields.map((field) => {
      const value = record[field.name];
      const normalized = field.type === 'json'
        ? JSON.stringify(value ?? [], null, 2)
        : field.type === 'date' || field.type === 'datetime' || field.type === 'jalali-date'
          ? normalizeDateInput(value, field.type)
          : value ?? emptyValue(field, 0);
      return [field.name, normalized];
    })));
  };

  const openDuplicate = (record: ContentRecord) => {
    setEditingRecord(null);
    setIsDuplicating(true);
    setFormMode('create');
    reset(Object.fromEntries(fields.map((field) => [
      field.name,
      field.unique ? emptyValue(field, 0) : field.type === 'json'
        ? JSON.stringify(record[field.name] ?? [], null, 2)
        : field.type === 'date' || field.type === 'datetime' || field.type === 'jalali-date'
          ? normalizeDateInput(record[field.name], field.type)
          : record[field.name] ?? emptyValue(field, 0),
    ])));
  };

  const closeForm = () => {
    setFormMode(null);
    setEditingRecord(null);
    setIsDuplicating(false);
    reset({});
  };

  const refreshPublicContent = async () => {
    try {
      await fetchBootstrap();
    } catch (error) {
      addToast('error', error instanceof Error
        ? `رکورد ذخیره شد، اما تازه‌سازی محتوای سایت ناموفق بود: ${error.message}`
        : 'رکورد ذخیره شد، اما تازه‌سازی محتوای سایت ناموفق بود.');
    }
  };

  const save = async (values: Record<string, unknown>) => {
    const payload: Record<string, unknown> = {};
    for (const field of fields) {
      const value = values[field.name];
      if (field.type === 'json') {
        if (value === '' && !field.required && formMode === 'create') continue;
        payload[field.name] = value === '' ? null : JSON.parse(String(value));
      } else if (field.type === 'number') {
        if (value === '' && !field.required && formMode === 'create') continue;
        payload[field.name] = value === '' ? null : Number(value);
      } else if (field.type === 'datetime') {
        if (value === '' && !field.required && formMode === 'create') continue;
        if (value === '') {
          payload[field.name] = null;
        } else {
          const [date, time = '00:00'] = String(value).split('T');
          payload[field.name] = date ? `${jalaliToGregorian(date)} ${time}:00` : null;
        }
      } else if (field.type === 'date') {
        if (value === '' && !field.required && formMode === 'create') continue;
        payload[field.name] = value === '' ? null : jalaliToGregorian(String(value));
      } else if (field.type === 'jalali-date') {
        if (value === '' && !field.required && formMode === 'create') continue;
        payload[field.name] = value === '' ? null : String(value).replace(/-/g, '/');
      } else if (field.type === 'boolean') {
        payload[field.name] = Boolean(value);
      } else {
        if (value === '' && !field.required && formMode === 'create') continue;
        payload[field.name] = value === '' && !field.required ? null : value;
      }
    }

    try {
      const editing = formMode === 'edit' && editingRecord !== null;
      const path = editing ? `/admin/${resource}/${editingRecord.id}` : `/admin/${resource}`;
      await apiRequest(path, {
        method: editing ? 'PUT' : 'POST',
        body: JSON.stringify(payload),
      });
      closeForm();
      setPage(1);
      setSortBy('id');
      setSortOrder('desc');
      setRefreshVersion((version) => version + 1);
      apiRequest<{ data: ContentResource[] }>('/admin/content-resources')
        .then(({ data }) => setResources(data))
        .catch((error: unknown) => addToast('error', error instanceof Error ? error.message : 'به‌روزرسانی شمارندهٔ بخش‌ها ناموفق بود.'));
      addToast('success', formMode === 'edit' ? 'تغییرات رکورد ذخیره شد.' : 'رکورد جدید ثبت شد.');
      await refreshPublicContent();
    } catch (error) {
      addToast('error', error instanceof Error ? error.message : 'ذخیرهٔ اطلاعات ناموفق بود.');
    }
  };

  const remove = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await apiRequest(`/admin/${resource}/${deleteTarget.id}`, { method: 'DELETE' });
      setDeleteTarget(null);
      setRefreshVersion((version) => version + 1);
      apiRequest<{ data: ContentResource[] }>('/admin/content-resources')
        .then(({ data }) => setResources(data))
        .catch((error: unknown) => addToast('error', error instanceof Error ? error.message : 'به‌روزرسانی شمارندهٔ بخش‌ها ناموفق بود.'));
      addToast('success', 'رکورد حذف شد.');
      await refreshPublicContent();
    } catch (error) {
      addToast('error', error instanceof Error ? error.message : 'حذف رکورد ناموفق بود.');
    } finally {
      setDeleting(false);
    }
  };

  const toggleColumn = (name: string) => {
    setVisibleColumns((current) => current.includes(name)
      ? current.filter((column) => column !== name)
      : [...current, name]);
  };

  const renderValue = (record: ContentRecord, field: ContentField): React.ReactNode => {
    const value = record[field.name];
    if (field.type === 'boolean') {
      const enabled = Boolean(value);
      return (
        <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${enabled
          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
          : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
          {enabled ? 'فعال' : 'غیرفعال'}
        </span>
      );
    }
    if (field.type === 'select') {
      const option = field.options?.find((item) => item.value === String(value));
      if (option) return <span className="block max-w-[20rem] truncate" title={`${option.label_fa} · ${option.label_en}`}>{option.label_fa} · {option.label_en}</span>;
    }
    return <span className="block max-w-[20rem] truncate" title={printableValue(value)}>{printableValue(value)}</span>;
  };

  const recordActions = (record: ContentRecord) => (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => openDuplicate(record)}
        className="rounded-lg p-2 text-slate-500 transition hover:bg-indigo-50 hover:text-indigo-700 dark:hover:bg-indigo-950/40 dark:hover:text-indigo-300"
        aria-label="ساخت رکورد مشابه"
        title="کپی و ساخت رکورد مشابه"
      >
        <CopyPlus className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => openEdit(record)}
        className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-(--theme-primary) dark:hover:bg-slate-800"
        aria-label="ویرایش رکورد"
        title="ویرایش"
      >
        <Pencil className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => setDeleteTarget(record)}
        className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/40 dark:hover:text-red-300"
        aria-label="حذف رکورد"
        title="حذف"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );

  return (
    <div className="mx-auto max-w-[1600px] space-y-5">
      <header className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="relative flex flex-col gap-5 p-5 sm:p-7 lg:flex-row lg:items-center lg:justify-between">
          <div className="absolute inset-y-0 inset-s-0 w-1 bg-(--theme-primary)" aria-hidden="true" />
          <div className="flex items-start gap-4">
            <div className="hidden rounded-2xl bg-(--theme-primary)/10 p-3 text-(--theme-primary) sm:block">
              <Database className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-(--theme-primary)">Content workspace</p>
              <h1 className="mt-1 text-xl font-black text-slate-900 dark:text-white sm:text-2xl">مدیریت داده‌های محتوا</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                بخش موردنظر را انتخاب کنید، اطلاعات همان بخش را جست‌وجو و مرتب کنید و فقط در صورت نیاز فرم افزودن یا ویرایش را باز کنید.
              </p>
            </div>
          </div>

          <div className={`grid w-full gap-3 ${lockedResource ? '' : 'sm:grid-cols-[minmax(0,1fr)_auto]'} lg:w-auto lg:min-w-104`}>
            {lockedResource && selectedResource ? (
              <div className="flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 dark:border-slate-700 dark:bg-slate-800">
                <span className="text-sm font-bold">{selectedResource.label_fa}</span>
                <span className="text-xs text-slate-400" dir="ltr">{selectedResource.label_en}</span>
              </div>
            ) : !lockedResource ? (
              <SearchableSelect
                label="بخش محتوا / Content section"
                options={availableResources.map((item) => ({
                value: item.key,
                label: item.label_fa,
                sublabel: `${item.label_en} · ${item.count.toLocaleString('fa-IR')}`,
                }))}
                value={resource}
                onChange={(value) => {
                  setResource(value);
                  setFields([]);
                  setVisibleColumns([]);
                  setPage(1);
                  setSearchInput('');
                  setSearch('');
                  setSortBy('id');
                  setSortOrder('desc');
                  setFormMode(null);
                }}
                placeholder={loadingResources ? 'در حال دریافت بخش‌ها...' : 'انتخاب بخش'}
                disabled={loadingResources || availableResources.length === 0}
              />
            ) : null}
            <button
              type="button"
              onClick={openCreate}
              disabled={!resource || loadingSchema || fields.length === 0}
              className="inline-flex h-11 min-h-11 self-end items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-(--theme-primary) px-5 text-sm font-bold text-white shadow-sm transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              {embedded ? `افزودن ${selectedResource?.label_fa || 'رکورد'}` : 'افزودن رکورد'}
            </button>
          </div>
        </div>
      </header>

      {loadingResources ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
          <InlineLoader label="در حال دریافت بخش‌های محتوا..." />
        </div>
      ) : resources.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-900">
          <Database className="mx-auto h-8 w-8 text-slate-400" />
          <p className="mt-3 font-semibold">بخشی برای مدیریت در دسترس نیست.</p>
        </div>
      ) : (
        <>
          {selectedResource && (
            <section className="flex flex-col gap-3 rounded-2xl border border-blue-200 bg-blue-50/60 p-4 dark:border-blue-900/50 dark:bg-blue-950/20 sm:flex-row sm:items-start sm:justify-between sm:p-5">
              <div className="min-w-0">
                <p className="text-xs font-bold text-blue-950 dark:text-blue-200">{selectedResource.description_fa}</p>
                <p className="mt-1.5 text-xs leading-5 text-blue-900/75 dark:text-blue-200/75">
                  <span className="font-bold">محل استفاده: </span>{selectedResource.usage_fa}
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
              {selectedResource.public_path && (
                <Link
                  to={selectedResource.public_path}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 self-start rounded-lg border border-blue-200 bg-white px-3 py-2 text-[11px] font-bold text-blue-800 transition hover:border-(--theme-primary) hover:text-(--theme-primary) dark:border-blue-900 dark:bg-slate-900 dark:text-blue-200"
                >
                  مشاهده در سایت
                  <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                </Link>
              )}
              {selectedResource.related_admin_path && (
                <Link
                  to={selectedResource.related_admin_path}
                  className="inline-flex items-center gap-1 self-start rounded-lg border border-blue-200 bg-white px-3 py-2 text-[11px] font-bold text-blue-800 transition hover:border-(--theme-primary) hover:text-(--theme-primary) dark:border-blue-900 dark:bg-slate-900 dark:text-blue-200"
                >
                  {selectedResource.key === 'articles' ? 'مدیریت دسته‌های مقالات' : 'تنظیمات عنوان و پس‌زمینه'}
                  <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                </Link>
              )}
              </div>
            </section>
          )}
          <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <div className="rounded-xl bg-slate-100 p-2.5 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                <Database className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-base font-extrabold text-slate-900 dark:text-white">
                  {selectedResource?.label_fa}
                  <span className="ms-2 text-xs font-medium text-slate-400" dir="ltr">{selectedResource?.label_en}</span>
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  {total.toLocaleString('fa-IR')} رکورد
                  {search ? ` · نتیجه برای «${search}»` : ' · فهرست صفحه‌بندی‌شده'}
                </p>
              </div>
            </div>

            <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
              <label className="relative min-w-0 flex-1 sm:min-w-72 lg:min-w-88">
                <Search className="pointer-events-none absolute inset-s-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="جست‌وجوی سریع در همهٔ فیلدهای متنی..."
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pe-3 ps-10 text-sm outline-none transition focus:border-(--theme-primary) focus:bg-white focus:ring-2 focus:ring-(--theme-primary)/10 dark:border-slate-700 dark:bg-slate-800 dark:focus:bg-slate-900"
                  aria-label="جست‌وجو در رکوردها"
                />
              </label>

              <details className="group relative">
                <summary className="flex h-11 cursor-pointer list-none items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
                  <ListFilter className="h-4 w-4" />
                  ستون‌ها
                </summary>
                <div className="absolute inset-e-0 top-full z-30 mt-2 max-h-80 w-72 overflow-y-auto rounded-xl border border-slate-200 bg-white p-3 shadow-xl dark:border-slate-700 dark:bg-slate-900">
                  <p className="mb-2 text-xs font-bold text-slate-500">ستون‌های قابل نمایش</p>
                  {sortableFields.map((field) => (
                    <label key={field.name} className="flex cursor-pointer items-start gap-2 rounded-lg px-2 py-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-800">
                      <input
                        type="checkbox"
                        checked={visibleColumns.includes(field.name)}
                        onChange={() => toggleColumn(field.name)}
                        className="mt-0.5 accent-(--theme-primary)"
                      />
                      <span>
                        <span className="block font-semibold">{field.label_fa}</span>
                        <span className="mt-0.5 block text-[10px] text-slate-400" dir="ltr">{field.label_en}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </details>
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 dark:border-slate-800 sm:px-5">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>نمایش</span>
                <select
                  value={perPage}
                  onChange={(event) => {
                    setPerPage(Number(event.target.value));
                    setPage(1);
                  }}
                  className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 font-semibold text-slate-700 outline-none focus:border-(--theme-primary) dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  aria-label="تعداد رکورد در هر صفحه"
                >
                  {[20, 50, 100].map((size) => <option key={size} value={size}>{size}</option>)}
                </select>
                <span>رکورد در هر صفحه</span>
              </div>
              <p className="text-xs text-slate-500">
                {total > 0 ? `${((page - 1) * perPage + 1).toLocaleString('fa-IR')} تا ${Math.min(page * perPage, total).toLocaleString('fa-IR')} از ${total.toLocaleString('fa-IR')}` : 'رکوردی برای نمایش نیست'}
              </p>
            </div>

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-190 border-collapse text-start text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-300">
                    <th className="w-20 px-4 py-3 text-start">
                      <button type="button" onClick={() => setSort('id')} className="inline-flex items-center gap-1.5 hover:text-(--theme-primary)">
                        شناسه <ArrowUpDown className="h-3.5 w-3.5" />
                      </button>
                    </th>
                    {displayedFields.map((field) => (
                      <th key={field.name} className="px-4 py-3 text-start">
                        <button type="button" onClick={() => setSort(field.name)} className="inline-flex items-center gap-1.5 text-start hover:text-(--theme-primary)">
                          <span>
                            <span className="block">{field.label_fa}</span>
                            <span className="mt-0.5 block text-[10px] font-normal text-slate-400" dir="ltr">{field.label_en}</span>
                          </span>
                          <ArrowUpDown className={`h-3.5 w-3.5 shrink-0 ${sortBy === field.name ? 'text-(--theme-primary)' : 'opacity-40'}`} />
                        </button>
                      </th>
                    ))}
                    <th className="w-36 px-4 py-3 text-center">عملیات / Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {loadingRecords ? (
                    Array.from({ length: 5 }, (_, index) => (
                      <tr key={index} className="animate-pulse">
                        <td colSpan={displayedFields.length + 2} className="px-4 py-4">
                          <div className="h-4 w-2/3 rounded bg-slate-200 dark:bg-slate-800" />
                        </td>
                      </tr>
                    ))
                  ) : records.length === 0 ? (
                    <tr>
                      <td colSpan={displayedFields.length + 2} className="px-4 py-16 text-center">
                        <Database className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600" />
                        <p className="mt-3 text-sm font-semibold text-slate-600 dark:text-slate-300">
                          {search ? 'رکوردی با این عبارت پیدا نشد.' : 'هنوز رکوردی ثبت نشده است.'}
                        </p>
                        {!search && (
                          <button type="button" onClick={openCreate} className="mt-3 text-xs font-bold text-(--theme-primary) hover:underline">
                            افزودن اولین رکورد
                          </button>
                        )}
                      </td>
                    </tr>
                  ) : records.map((record) => (
                    <tr key={record.id} className="transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <td className="px-4 py-3.5 font-mono text-xs text-slate-400">#{record.id}</td>
                      {displayedFields.map((field) => (
                        <td key={field.name} className="px-4 py-3.5 text-slate-700 dark:text-slate-200">
                          {renderValue(record, field)}
                        </td>
                      ))}
                      <td className="px-4 py-2">
                        <div className="flex justify-center">{recordActions(record)}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-3 p-3 md:hidden">
              {loadingRecords ? (
                Array.from({ length: 4 }, (_, index) => <div key={index} className="h-24 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />)
              ) : records.length === 0 ? (
                <div className="px-3 py-12 text-center text-sm text-slate-500">
                  {search ? 'رکوردی با این عبارت پیدا نشد.' : 'هنوز رکوردی ثبت نشده است.'}
                </div>
              ) : records.map((record) => (
                <article key={record.id} className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                        {primaryField ? printableValue(record[primaryField.name]) : `رکورد ${record.id}`}
                      </p>
                      <p className="mt-1 font-mono text-[10px] text-slate-400">ID: {record.id}</p>
                    </div>
                    {recordActions(record)}
                  </div>
                  <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                    {displayedFields.filter((field) => field.name !== primaryField?.name).map((field) => (
                      <div key={field.name} className="min-w-0">
                        <dt className="truncate text-[10px] text-slate-400">{field.label_fa}</dt>
                        <dd className="mt-1 truncate text-xs font-medium text-slate-700 dark:text-slate-200">
                          {renderValue(record, field)}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </article>
              ))}
            </div>
          </section>

          <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
            <p className="text-xs text-slate-500">جست‌وجو و مرتب‌سازی در پایگاه‌داده انجام می‌شود؛ همهٔ رکوردها یک‌جا بارگیری نمی‌شوند.</p>
            <Pagination page={page} lastPage={lastPage} onChange={setPage} />
          </div>
        </>
      )}

      <Modal
        open={formMode !== null}
        onClose={closeForm}
        title={`${formMode === 'edit' ? 'ویرایش رکورد' : isDuplicating ? 'ساخت رکورد مشابه' : 'افزودن رکورد'} · ${selectedResource?.label_fa ?? ''}`}
        size="xl"
      >
        <form onSubmit={handleSubmit(save)} className="space-y-5">
          <div className="rounded-xl border border-indigo-100 bg-indigo-50/70 p-3 text-xs leading-6 text-indigo-900 dark:border-indigo-900/50 dark:bg-indigo-950/30 dark:text-indigo-200">
            نام هر فیلد به فارسی و انگلیسی نمایش داده می‌شود. موارد ستاره‌دار الزامی‌اند.
            {isDuplicating && (
              <span className="ms-1">در حالت ساخت مشابه، شناسه‌های یکتای خالی‌شده را وارد کنید.</span>
            )}
          </div>

          {fields.length === 0 ? (
            <div className="py-10 text-center text-sm text-slate-500">ساختار فیلدهای این بخش در دسترس نیست.</div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {fields.map((field) => {
                const isMediaField = field.type === 'string' && /(image|logo|avatar|media|cover|file|document|catalog|attachment)/i.test(field.name);
                const currentMediaValue = isMediaField ? String(watch(field.name) ?? '') : '';
                const isDocumentField = /(file|document|catalog|attachment)/i.test(field.name);
                const currentColorValue = String(watch(field.name) ?? '');
                const colorInputValue = /^#[\da-f]{6}$/i.test(currentColorValue) ? currentColorValue : '#b91c1c';
                const fullWidth = field.type === 'textarea' || field.type === 'richtext' || field.type === 'json' || isMediaField;
                return (
                  <div key={field.name} className={`min-w-0 space-y-1.5 ${fullWidth ? 'sm:col-span-2' : ''}`}>
                    <label className="block space-y-1.5">
                      <span className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5 text-xs font-bold text-slate-700 dark:text-slate-200">
                        <span>{field.label_fa}{field.required ? ' *' : ''}</span>
                        <span className="font-medium text-slate-400" dir="ltr">{field.label_en}{field.required ? ' *' : ''}</span>
                      </span>
                      {field.type === 'boolean' ? (
                        <span className="flex min-h-11 items-center gap-3 rounded-xl border border-slate-200 px-3 dark:border-slate-700">
                          <input type="checkbox" {...register(field.name)} className="h-4 w-4 accent-(--theme-primary)" />
                          <span className="text-sm font-medium">فعال / Active</span>
                        </span>
                      ) : field.type === 'select' ? (
                        <select
                          {...register(field.name)}
                          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-normal outline-none transition focus:border-(--theme-primary) focus:ring-2 focus:ring-(--theme-primary)/10 dark:border-slate-700 dark:bg-slate-800"
                        >
                          {(!field.required || field.name === 'article_category_id') && <option value="">انتخاب کنید / Select</option>}
                          {(field.options ?? []).map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label_fa} · {option.label_en}
                            </option>
                          ))}
                        </select>
                      ) : field.type === 'richtext' ? (
                        <RichTextEditor
                          value={String(watch(field.name) ?? '')}
                          onChange={(value) => setValue(field.name, value, { shouldDirty: true, shouldValidate: true })}
                        />
                      ) : field.type === 'date' || field.type === 'datetime' || field.type === 'jalali-date' ? (
                        <div className={field.type === 'datetime' ? 'grid gap-2 sm:grid-cols-[minmax(0,1fr)_8rem]' : ''}>
                          <PersianDatePicker
                            value={String(watch(field.name) ?? '').split('T')[0]}
                            onChange={(date) => {
                              const current = String(watch(field.name) ?? '');
                              const time = field.type === 'datetime' ? current.split('T')[1] || '00:00' : '';
                              setValue(field.name, field.type === 'datetime' ? `${date}T${time}` : date, { shouldDirty: true, shouldValidate: true });
                            }}
                          />
                          {field.type === 'datetime' && (
                            <input
                              type="time"
                              value={String(watch(field.name) ?? '').split('T')[1] || ''}
                              onChange={(event) => {
                                const date = String(watch(field.name) ?? '').split('T')[0] || '';
                                setValue(field.name, `${date}T${event.target.value}`, { shouldDirty: true, shouldValidate: true });
                              }}
                              aria-label="زمان انتشار"
                              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-800"
                            />
                          )}
                        </div>
                      ) : field.type === 'textarea' || field.type === 'json' ? (
                        <textarea
                          rows={field.type === 'json' ? 8 : 4}
                          dir={field.type === 'json' ? 'ltr' : undefined}
                          spellCheck={field.type !== 'json'}
                          {...register(field.name)}
                          placeholder={field.type === 'json' ? '{\n  \n}' : ''}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal outline-none transition focus:border-(--theme-primary) focus:ring-2 focus:ring-(--theme-primary)/10 dark:border-slate-700 dark:bg-slate-800"
                        />
                      ) : field.type === 'color' ? (
                        <span className="flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-2 dark:border-slate-700 dark:bg-slate-800">
                          <input
                            type="color"
                            value={colorInputValue}
                            onChange={(event) => setValue(field.name, event.target.value, { shouldDirty: true, shouldValidate: true })}
                            aria-label="انتخاب رنگ"
                            className="h-8 w-10 cursor-pointer rounded border-0 bg-transparent p-0"
                          />
                          <input
                            type="text"
                            dir="ltr"
                            {...register(field.name)}
                            className="h-9 min-w-0 flex-1 bg-transparent px-2 text-sm outline-none"
                          />
                        </span>
                      ) : field.name === 'icon' && field.type === 'string' ? (
                        <IconPicker
                          label={`${field.label_fa} · ${field.label_en}`}
                          value={String(watch(field.name) ?? '')}
                          onChange={(icon) => setValue(field.name, icon, { shouldDirty: true, shouldValidate: true })}
                        />
                      ) : isMediaField ? (
                        <MediaUrlField
                          label={field.label_fa}
                          value={currentMediaValue}
                          onChange={(url) => setValue(field.name, url, { shouldDirty: true, shouldValidate: true })}
                          folder={resource}
                          accept={isDocumentField ? '.pdf,.doc,.docx,.xls,.xlsx,.zip' : '.png,.jpg,.jpeg,.webp,.gif,.svg,.mp4,.webm'}
                          placeholder="/storage/"
                        />
                      ) : (
                        <input
                          type={field.type === 'number' ? 'number' : 'text'}
                          {...register(field.name)}
                          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-normal outline-none transition focus:border-(--theme-primary) focus:ring-2 focus:ring-(--theme-primary)/10 dark:border-slate-700 dark:bg-slate-800"
                        />
                      )}
                    </label>

                    {errors[field.name]?.message && (
                      <span role="alert" className="block text-xs text-red-600">{String(errors[field.name]?.message)}</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div className="sticky bottom-0 flex flex-col-reverse gap-2 border-t border-slate-100 bg-white pt-4 dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:justify-end">
            <button type="button" onClick={closeForm} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
              انصراف
            </button>
            <button
              type="submit"
              disabled={isSubmitting || fields.length === 0}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-(--theme-primary) px-5 py-2.5 text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {isSubmitting ? <InlineLoader label="در حال ذخیره..." /> : formMode === 'edit' ? 'ذخیرهٔ تغییرات' : 'ثبت رکورد'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => void remove()}
        title="حذف رکورد"
        message="این رکورد از فهرست عمومی حذف می‌شود. در صورت وابستگی اطلاعات دیگر، سامانه اجازهٔ حذف نمی‌دهد. ادامه می‌دهید؟"
        confirmLabel="حذف رکورد"
        loading={deleting}
      />
    </div>
  );
};
