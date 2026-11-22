import React, { useEffect, useRef, useState } from 'react';
import { ArrowDownWideNarrow, ArrowUpWideNarrow, Award, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { z } from 'zod';
import { apiRequest } from '../../services/api.ts';
import { useAppStore } from '../../store/useAppStore.ts';
import type { License } from '../../types/index.ts';
import { DataTable, type Column } from '../../components/ui/DataTable.tsx';
import { FileUploader } from '../../components/ui/FileUploader.tsx';
import { Modal } from '../../components/ui/Modal.tsx';
import { Pagination } from '../../components/ui/Pagination.tsx';
import { SearchableSelect } from '../../components/ui/SearchableSelect.tsx';
import { PersianDatePicker } from '../../components/ui/PersianDatePicker.tsx';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog.tsx';
import { InlineLoader } from '../../components/common/InlineLoader.tsx';

const licenseFormSchema = z.object({
  code: z.string().trim().min(1, 'کد استاندارد الزامی است.').max(80),
  title_fa: z.string().trim().min(1, 'عنوان فارسی الزامی است.').max(255),
  title_en: z.string().trim().min(1, 'عنوان انگلیسی الزامی است.').max(255),
  issuer_fa: z.string().trim().min(1, 'مرجع فارسی الزامی است.').max(255),
  issuer_en: z.string().trim().min(1, 'مرجع انگلیسی الزامی است.').max(255),
  issue_date: z.string().trim().min(1, 'تاریخ صدور الزامی است.').max(30),
  expiry_date: z.string().max(30).nullable().optional(),
  category: z.enum(['iso', 'api', 'knowledge_based', 'association']),
  image_url: z.string().trim().min(1, 'تصویر گواهینامه الزامی است.').max(255),
  document_url: z.string().max(255).nullable().optional(),
  requires_auth: z.boolean().optional(),
});

type LicenseSortField = 'code' | 'title_fa' | 'issuer_fa' | 'issue_date' | 'category';
type PaginatedResponse<T> = {
  data: T[];
  meta: { current_page: number; last_page: number; per_page: number; total: number };
};
type LicenseListRow = Pick<
  License,
  'id' | 'code' | 'title_fa' | 'issuer_fa' | 'issue_date' | 'expiry_date' | 'category'
>;
const PAGE_SIZES = [10, 20, 50] as const;
const CATEGORY_LABELS: Record<License['category'], string> = {
  iso: 'ISO',
  api: 'API',
  knowledge_based: 'دانش‌بنیان',
  association: 'انجمن‌ها',
};

export const LicensesAdminPage: React.FC = () => {
  const { addToast } = useAppStore();
  const [licenses, setLicenses] = useState<LicenseListRow[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [perPage, setPerPage] = useState<number>(PAGE_SIZES[0]);
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [sortBy, setSortBy] = useState<LicenseSortField>('issue_date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [refresh, setRefresh] = useState(0);
  const [loading, setLoading] = useState(false);
  const [editorLoading, setEditorLoading] = useState(false);
  const [licenseModal, setLicenseModal] = useState<Partial<License> | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const editRequest = useRef(0);

  useEffect(() => {
    const timer = window.setTimeout(() => setAppliedSearch(search.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let active = true;
    const params = new URLSearchParams({
      page: String(page),
      per_page: String(perPage),
      sort_by: sortBy,
      sort_dir: sortDir,
    });
    if (appliedSearch) params.set('q', appliedSearch);

    setLoading(true);
    apiRequest<PaginatedResponse<LicenseListRow>>(`/admin/licenses?${params.toString()}`)
      .then((response) => {
        if (!active) return;
        if (page > response.meta.last_page) {
          setPage(Math.max(1, response.meta.last_page));
          return;
        }
        setLicenses(response.data);
        setLastPage(response.meta.last_page);
        setTotal(response.meta.total);
      })
      .catch((error: unknown) => {
        if (active) addToast('error', error instanceof Error ? error.message : 'بارگذاری گواهینامه‌ها ناموفق بود.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [page, perPage, appliedSearch, sortBy, sortDir, refresh, addToast]);

  const openEditor = async (license: LicenseListRow) => {
    const requestId = ++editRequest.current;
    setLicenseModal(null);
    setEditorLoading(true);
    try {
      const response = await apiRequest<{ data: License }>(`/admin/licenses/${license.id}`);
      if (editRequest.current === requestId) setLicenseModal(response.data);
    } catch (error) {
      if (editRequest.current === requestId) {
        addToast('error', error instanceof Error ? error.message : 'بارگذاری جزئیات گواهینامه ناموفق بود.');
      }
    } finally {
      if (editRequest.current === requestId) setEditorLoading(false);
    }
  };

  const closeEditor = () => {
    editRequest.current += 1;
    setLicenseModal(null);
    setEditorLoading(false);
  };

  const saveLicense = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!licenseModal) return;
    const parsed = licenseFormSchema.safeParse(licenseModal);
    if (!parsed.success) {
      addToast('error', parsed.error.issues[0]?.message ?? 'اطلاعات گواهینامه معتبر نیست.');
      return;
    }
    try {
      await apiRequest(
        licenseModal.id ? `/admin/licenses/${licenseModal.id}` : '/admin/licenses',
        { method: licenseModal.id ? 'PUT' : 'POST', body: JSON.stringify(parsed.data) },
      );
      setLicenseModal(null);
      setPage(1);
      setRefresh((current) => current + 1);
      addToast('success', 'گواهینامه ذخیره شد.');
    } catch (error) {
      addToast('error', error instanceof Error ? error.message : 'ذخیره گواهینامه ناموفق بود.');
    }
  };

  const confirmDelete = async () => {
    if (deleteId === null) return;
    setDeleting(true);
    try {
      await apiRequest(`/admin/licenses/${deleteId}`, { method: 'DELETE' });
      setDeleteId(null);
      setPage(1);
      setRefresh((current) => current + 1);
      addToast('success', 'گواهینامه حذف شد.');
    } catch (error) {
      addToast('error', error instanceof Error ? error.message : 'حذف گواهینامه ناموفق بود.');
    } finally {
      setDeleting(false);
    }
  };

  const columns: Column<LicenseListRow>[] = [
    { key: 'code', header: 'کد استاندارد', className: 'min-w-[130px]', render: (row) => <span dir="ltr" className="font-mono text-xs font-semibold">{row.code}</span> },
    { key: 'title', header: 'عنوان گواهینامه', className: 'min-w-[180px]', render: (row) => <span className="font-semibold">{row.title_fa}</span> },
    { key: 'issuer', header: 'مرجع صادرکننده', className: 'hidden md:table-cell min-w-[150px]', render: (row) => row.issuer_fa },
    { key: 'category', header: 'دسته', className: 'whitespace-nowrap', render: (row) => <span className="rounded-full bg-(--theme-surface-muted) px-2.5 py-1 text-xs">{CATEGORY_LABELS[row.category]}</span> },
    { key: 'issue', header: 'تاریخ صدور', className: 'hidden sm:table-cell whitespace-nowrap', render: (row) => row.issue_date },
    { key: 'expiry', header: 'انقضا', className: 'hidden lg:table-cell whitespace-nowrap', render: (row) => row.expiry_date || 'بدون انقضا' },
    {
      key: 'actions',
      header: 'عملیات',
      className: 'whitespace-nowrap',
      render: (row) => (
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => openEditor(row)} aria-label={`ویرایش ${row.title_fa}`} className="rounded p-1.5 text-(--theme-text-muted) hover:bg-(--theme-surface-muted) hover:text-(--theme-text)">
            <Pencil className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => setDeleteId(row.id)} aria-label={`حذف ${row.title_fa}`} className="rounded p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-extrabold text-(--theme-text)">مدیریت گواهینامه‌ها و استانداردها</h1>
          <p className="mt-1 text-xs text-(--theme-text-muted)">اطلاعات به‌صورت جدولی و صفحه‌ای بارگذاری می‌شود؛ نمایش کارتی فقط در سایت عمومی باقی می‌ماند.</p>
        </div>
        <button
          type="button"
          onClick={() => setLicenseModal({
            code: 'ISO-9001',
            title_fa: '',
            title_en: '',
            issuer_fa: '',
            issuer_en: '',
            issue_date: '1404/01/01',
            category: 'iso',
            image_url: '/storage/certificates/iso-9001.jpg',
            requires_auth: false,
          })}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-(--theme-btn-bg) px-4 py-2.5 text-xs font-semibold text-(--theme-btn-text) transition hover:bg-(--theme-btn-hover)"
        >
          <Plus className="h-4 w-4" />
          افزودن گواهینامه
        </button>
      </header>

      <section className="space-y-3">
        <div className="flex flex-col gap-3 rounded-xl border border-(--theme-border) bg-(--theme-surface) p-4 shadow-(--theme-card-shadow) sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search className="pointer-events-none absolute inset-s-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--theme-placeholder)" />
            <input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="جست‌وجوی عنوان، کد یا مرجع..."
              aria-label="جست‌وجوی گواهینامه‌ها"
              className="w-full rounded-lg border border-(--theme-input-border) bg-(--theme-input-bg) py-2 pe-3 ps-9 text-sm text-(--theme-input-text) placeholder:text-(--theme-placeholder) outline-none focus:border-(--theme-primary)"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-2 text-xs text-(--theme-text-muted)">
              مرتب‌سازی
              <select value={sortBy} onChange={(event) => setSortBy(event.target.value as LicenseSortField)} className="rounded-lg border border-(--theme-input-border) bg-(--theme-input-bg) px-2.5 py-2 text-xs text-(--theme-input-text)" aria-label="مرتب‌سازی گواهینامه‌ها">
                <option value="issue_date">تاریخ صدور</option>
                <option value="code">کد استاندارد</option>
                <option value="title_fa">عنوان</option>
                <option value="issuer_fa">مرجع صادرکننده</option>
                <option value="category">دسته</option>
              </select>
            </label>
            <button type="button" onClick={() => setSortDir((direction) => direction === 'asc' ? 'desc' : 'asc')} className="rounded-lg border border-(--theme-border) p-2 text-(--theme-text-muted) hover:bg-(--theme-surface-muted)" aria-label={sortDir === 'asc' ? 'مرتب‌سازی نزولی' : 'مرتب‌سازی صعودی'} title={sortDir === 'asc' ? 'صعودی' : 'نزولی'}>
              {sortDir === 'asc' ? <ArrowUpWideNarrow className="h-4 w-4" /> : <ArrowDownWideNarrow className="h-4 w-4" />}
            </button>
            <label className="flex items-center gap-2 text-xs text-(--theme-text-muted)">
              ردیف در صفحه
              <select
                value={perPage}
                onChange={(event) => {
                  setPerPage(Number(event.target.value));
                  setPage(1);
                }}
                aria-label="تعداد گواهینامه در هر صفحه"
                className="rounded-lg border border-(--theme-input-border) bg-(--theme-input-bg) px-2.5 py-2 text-xs text-(--theme-input-text)"
              >
                {PAGE_SIZES.map((size) => <option key={size} value={size}>{size}</option>)}
              </select>
            </label>
          </div>
        </div>

        <p className="text-xs text-(--theme-text-muted)" aria-live="polite">
          {loading ? 'در حال بارگذاری گواهینامه‌ها...' : `نمایش ${licenses.length ? (page - 1) * perPage + 1 : 0} تا ${Math.min(page * perPage, total)} از ${total} گواهینامه`}
        </p>
        <DataTable data={licenses} columns={columns} pageSize={perPage} loading={loading} emptyText={appliedSearch ? 'گواهینامه‌ای با این جست‌وجو پیدا نشد.' : 'هنوز گواهینامه‌ای ثبت نشده است.'} />
        <Pagination page={page} lastPage={lastPage} onChange={setPage} />
      </section>

      <Modal open={Boolean(licenseModal) || editorLoading} onClose={closeEditor} title={editorLoading ? 'بارگذاری گواهینامه' : licenseModal?.id ? 'ویرایش گواهینامه' : 'افزودن گواهینامه'} size="md">
        {editorLoading ? <InlineLoader label="در حال دریافت جزئیات گواهینامه..." /> : licenseModal && (
          <form onSubmit={saveLicense} className="space-y-3">
            <input required placeholder="کد استاندارد (مثل API 6A)" value={licenseModal.code || ''} onChange={(event) => setLicenseModal({ ...licenseModal, code: event.target.value })} dir="ltr" className="w-full rounded-xl border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text) placeholder:text-(--theme-placeholder)" />
            <input required placeholder="عنوان فارسی" value={licenseModal.title_fa || ''} onChange={(event) => setLicenseModal({ ...licenseModal, title_fa: event.target.value })} className="w-full rounded-xl border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text) placeholder:text-(--theme-placeholder)" />
            <input required placeholder="عنوان انگلیسی" value={licenseModal.title_en || ''} onChange={(event) => setLicenseModal({ ...licenseModal, title_en: event.target.value })} dir="ltr" className="w-full rounded-xl border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text) placeholder:text-(--theme-placeholder)" />
            <input required placeholder="مرجع صادرکننده" value={licenseModal.issuer_fa || ''} onChange={(event) => setLicenseModal({ ...licenseModal, issuer_fa: event.target.value })} className="w-full rounded-xl border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text) placeholder:text-(--theme-placeholder)" />
            <input required placeholder="مرجع صادرکننده (انگلیسی)" value={licenseModal.issuer_en || ''} onChange={(event) => setLicenseModal({ ...licenseModal, issuer_en: event.target.value })} dir="ltr" className="w-full rounded-xl border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text) placeholder:text-(--theme-placeholder)" />
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-xs text-(--theme-text)">تاریخ صدور
                <PersianDatePicker value={licenseModal.issue_date || ''} onChange={(issue_date) => setLicenseModal({ ...licenseModal, issue_date })} className="mt-1" />
              </label>
              <label className="text-xs text-(--theme-text)">تاریخ انقضا (اختیاری)
                <PersianDatePicker value={licenseModal.expiry_date || ''} onChange={(expiry_date) => setLicenseModal({ ...licenseModal, expiry_date: expiry_date || null })} className="mt-1" />
              </label>
            </div>
            <SearchableSelect
              label="دسته"
              options={[
                { value: 'iso', label: 'ISO' },
                { value: 'api', label: 'API' },
                { value: 'knowledge_based', label: 'دانش‌بنیان' },
                { value: 'association', label: 'انجمن‌ها' },
              ]}
              value={licenseModal.category || 'iso'}
              onChange={(value) => setLicenseModal({ ...licenseModal, category: value as License['category'] })}
            />
            <FileUploader
              folder="certificates"
              currentUrl={licenseModal.image_url || licenseModal.document_url || undefined}
              label="تصویر یا PDF گواهینامه"
              onUploaded={(url) => setLicenseModal({
                ...licenseModal,
                document_url: url,
                image_url: url.endsWith('.pdf') ? (licenseModal.image_url || '/storage/certificates/iso-9001.jpg') : url,
              })}
            />
            <label className="flex items-center gap-2 text-xs text-(--theme-text)">
              <input type="checkbox" checked={licenseModal.requires_auth ?? false} onChange={(event) => setLicenseModal({ ...licenseModal, requires_auth: event.target.checked })} />
              فایل گواهینامه فقط برای کاربران مجاز قابل دریافت باشد
            </label>
            <button type="submit" className="w-full rounded-xl bg-(--theme-btn-bg) py-2.5 text-xs font-semibold text-(--theme-btn-text) transition hover:bg-(--theme-btn-hover)">ذخیره گواهینامه</button>
          </form>
        )}
      </Modal>

      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        message="آیا از حذف این گواهینامه اطمینان دارید؟"
        loading={deleting}
      />
    </div>
  );
};
