import React, { useEffect, useRef, useState } from 'react';
import { Award, Pencil, Plus, Trash2 } from 'lucide-react';
import { z } from 'zod';
import { apiRequest } from '../../services/api.ts';
import { useAppStore } from '../../store/useAppStore.ts';
import type { License } from '../../types/index.ts';
import { DataTable, type Column } from '../../components/ui/DataTable.tsx';
import { FileUploader } from '../../components/ui/FileUploader.tsx';
import { Modal } from '../../components/ui/Modal.tsx';
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
  const [sortBy, setSortBy] = useState('issue_date');
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
    { key: 'code', sortKey: 'code', header: 'کد استاندارد', className: 'min-w-[130px]', render: (row) => <span dir="ltr" className="font-mono text-xs font-semibold">{row.code}</span> },
    { key: 'title', sortKey: 'title_fa', header: 'عنوان گواهینامه', className: 'min-w-[180px]', render: (row) => <span className="font-semibold">{row.title_fa}</span> },
    { key: 'issuer', sortKey: 'issuer_fa', header: 'مرجع صادرکننده', className: 'hidden md:table-cell min-w-[150px]', render: (row) => row.issuer_fa },
    { key: 'category', sortKey: 'category', header: 'دسته', className: 'whitespace-nowrap', render: (row) => <span className="rounded-full bg-(--theme-surface-muted) px-2.5 py-1 text-xs">{CATEGORY_LABELS[row.category]}</span> },
    { key: 'issue', sortKey: 'issue_date', header: 'تاریخ صدور', className: 'hidden sm:table-cell whitespace-nowrap', render: (row) => row.issue_date },
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
      <header className="flex flex-col gap-5 rounded-2xl border border-(--theme-card-border) bg-(--theme-card-surface) p-5 shadow-(--theme-card-shadow) sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex min-w-0 items-start gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-(--theme-primary)/10 text-(--theme-primary-ink)">
            <Award className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-(--theme-primary-ink)">Licenses workspace</p>
            <h1 className="mt-1 text-lg font-black text-(--theme-text) sm:text-xl">مدیریت گواهینامه‌ها و استانداردها</h1>
            <p className="mt-1.5 max-w-2xl text-xs leading-6 text-(--theme-text-muted)">فهرست جدولی، جست‌وجو و بارگذاری صفحه‌ای؛ نمایش کارتی گواهینامه‌ها در سایت عمومی باقی می‌ماند.</p>
          </div>
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
          className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-(--theme-btn-bg) px-5 py-2.5 text-sm font-bold text-(--theme-btn-text) shadow-sm transition hover:bg-(--theme-btn-hover)"
        >
          <Plus className="h-4 w-4" />
          افزودن گواهینامه
        </button>
      </header>

      <DataTable
        data={licenses}
        columns={columns}
        rowKey={(row) => row.id}
        tableLabel="فهرست گواهینامه‌ها"
        pageSize={perPage}
        pageSizeOptions={PAGE_SIZES}
        onPageSizeChange={(size) => {
          setPerPage(size);
          setPage(1);
        }}
        currentPage={page}
        lastPage={lastPage}
        total={total}
        onPageChange={setPage}
        searchValue={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        searchPlaceholder="جست‌وجوی عنوان، کد یا مرجع..."
        searchLabel="جست‌وجوی گواهینامه‌ها"
        sortBy={sortBy}
        sortDirection={sortDir}
        onSortChange={(field, direction) => {
          setSortBy(field);
          setSortDir(direction);
          setPage(1);
        }}
        loading={loading}
        emptyText={appliedSearch ? 'گواهینامه‌ای با این جست‌وجو پیدا نشد.' : 'هنوز گواهینامه‌ای ثبت نشده است.'}
      />

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
