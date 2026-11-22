import React, { useEffect, useRef, useState } from 'react';
import { ArrowDownWideNarrow, ArrowUpWideNarrow, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { z } from 'zod';
import { apiRequest } from '../../services/api.ts';
import { useAppStore } from '../../store/useAppStore.ts';
import type { Contract } from '../../types/index.ts';
import { DataTable, type Column } from '../../components/ui/DataTable.tsx';
import { FileUploader } from '../../components/ui/FileUploader.tsx';
import { Modal } from '../../components/ui/Modal.tsx';
import { Pagination } from '../../components/ui/Pagination.tsx';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog.tsx';
import { InlineLoader } from '../../components/common/InlineLoader.tsx';

const contractFormSchema = z.object({
  contract_number: z.string().trim().min(1, 'شماره قرارداد الزامی است.').max(120),
  title_fa: z.string().trim().min(1, 'عنوان فارسی الزامی است.').max(255),
  title_en: z.string().trim().min(1, 'عنوان انگلیسی الزامی است.').max(255),
  client_fa: z.string().trim().min(1, 'نام فارسی کارفرما الزامی است.').max(255),
  client_en: z.string().trim().min(1, 'نام انگلیسی کارفرما الزامی است.').max(255),
  amount_billion_irr: z.number().min(0, 'مبلغ نمی‌تواند منفی باشد.'),
  start_year: z.number().int().min(1348).max(1450),
  end_year: z.number().int().min(1348).max(1450).nullable().optional(),
  status: z.enum(['active', 'completed', 'pending', 'archived']),
  scope_fa: z.string().nullable().optional(),
  scope_en: z.string().nullable().optional(),
  document_url: z.string().max(255).nullable().optional(),
  requires_auth: z.boolean().optional(),
});

type ContractSortField = 'start_year' | 'contract_number' | 'title_fa' | 'client_fa' | 'amount_billion_irr' | 'status';
type PaginatedResponse<T> = {
  data: T[];
  meta: { current_page: number; last_page: number; per_page: number; total: number };
};
type ContractListRow = Pick<
  Contract,
  'id' | 'contract_number' | 'title_fa' | 'client_fa' | 'amount_billion_irr' | 'start_year' | 'end_year' | 'status'
>;
const PAGE_SIZES = [10, 20, 50] as const;

const statusLabels: Record<Contract['status'], string> = {
  active: 'فعال',
  completed: 'تکمیل‌شده',
  pending: 'در انتظار',
  archived: 'بایگانی',
};

export const ContractsAdminPage: React.FC = () => {
  const { addToast } = useAppStore();
  const [contracts, setContracts] = useState<ContractListRow[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [perPage, setPerPage] = useState<number>(PAGE_SIZES[0]);
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [sortBy, setSortBy] = useState<ContractSortField>('start_year');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [refresh, setRefresh] = useState(0);
  const [loading, setLoading] = useState(false);
  const [editorLoading, setEditorLoading] = useState(false);
  const [contractModal, setContractModal] = useState<Partial<Contract> | null>(null);
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
    apiRequest<PaginatedResponse<ContractListRow>>(`/admin/contracts?${params.toString()}`)
      .then((response) => {
        if (!active) return;
        if (page > response.meta.last_page) {
          setPage(Math.max(1, response.meta.last_page));
          return;
        }
        setContracts(response.data);
        setLastPage(response.meta.last_page);
        setTotal(response.meta.total);
      })
      .catch((error: unknown) => {
        if (active) addToast('error', error instanceof Error ? error.message : 'بارگذاری قراردادها ناموفق بود.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [page, perPage, appliedSearch, sortBy, sortDir, refresh, addToast]);

  const openEditor = async (contract: ContractListRow) => {
    const requestId = ++editRequest.current;
    setContractModal(null);
    setEditorLoading(true);
    try {
      const response = await apiRequest<{ data: Contract }>(`/admin/contracts/${contract.id}`);
      if (editRequest.current === requestId) setContractModal(response.data);
    } catch (error) {
      if (editRequest.current === requestId) {
        addToast('error', error instanceof Error ? error.message : 'بارگذاری جزئیات قرارداد ناموفق بود.');
      }
    } finally {
      if (editRequest.current === requestId) setEditorLoading(false);
    }
  };

  const closeEditor = () => {
    editRequest.current += 1;
    setContractModal(null);
    setEditorLoading(false);
  };

  const saveContract = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!contractModal) return;
    const parsed = contractFormSchema.safeParse(contractModal);
    if (!parsed.success) {
      addToast('error', parsed.error.issues[0]?.message ?? 'اطلاعات قرارداد معتبر نیست.');
      return;
    }
    try {
      await apiRequest(
        contractModal.id ? `/admin/contracts/${contractModal.id}` : '/admin/contracts',
        { method: contractModal.id ? 'PUT' : 'POST', body: JSON.stringify(parsed.data) },
      );
      setContractModal(null);
      setPage(1);
      setRefresh((current) => current + 1);
      addToast('success', 'قرارداد ذخیره شد.');
    } catch (error) {
      addToast('error', error instanceof Error ? error.message : 'ذخیره قرارداد ناموفق بود.');
    }
  };

  const confirmDelete = async () => {
    if (deleteId === null) return;
    setDeleting(true);
    try {
      await apiRequest(`/admin/contracts/${deleteId}`, { method: 'DELETE' });
      setDeleteId(null);
      setPage(1);
      setRefresh((current) => current + 1);
      addToast('success', 'قرارداد حذف شد.');
    } catch (error) {
      addToast('error', error instanceof Error ? error.message : 'حذف قرارداد ناموفق بود.');
    } finally {
      setDeleting(false);
    }
  };

  const columns: Column<ContractListRow>[] = [
    { key: 'number', header: 'شماره قرارداد', className: 'min-w-[140px]', render: (row) => <span dir="ltr" className="font-mono text-xs">{row.contract_number}</span> },
    { key: 'title', header: 'عنوان قرارداد', className: 'min-w-[180px]', render: (row) => <span className="font-semibold">{row.title_fa}</span> },
    { key: 'client', header: 'کارفرما', className: 'hidden md:table-cell min-w-[140px]', render: (row) => row.client_fa },
    { key: 'amount', header: 'مبلغ (میلیارد ریال)', className: 'hidden lg:table-cell whitespace-nowrap', render: (row) => Number(row.amount_billion_irr).toLocaleString('fa-IR') },
    { key: 'years', header: 'مدت قرارداد', className: 'whitespace-nowrap', render: (row) => `${row.start_year}${row.end_year ? ` تا ${row.end_year}` : ' به بعد'}` },
    {
      key: 'status',
      header: 'وضعیت',
      className: 'hidden sm:table-cell whitespace-nowrap',
      render: (row) => <span className="rounded-full bg-(--theme-surface-muted) px-2.5 py-1 text-xs">{statusLabels[row.status]}</span>,
    },
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
          <h1 className="text-lg font-extrabold text-(--theme-text)">مدیریت قراردادها</h1>
          <p className="mt-1 text-xs text-(--theme-text-muted)">جست‌وجو، مرتب‌سازی و مدیریت قراردادها با بارگذاری صفحه‌ای.</p>
        </div>
        <button
          type="button"
          onClick={() => setContractModal({
            contract_number: '',
            title_fa: '',
            title_en: '',
            client_fa: '',
            client_en: '',
            amount_billion_irr: 0,
            start_year: 1404,
            status: 'active',
            scope_fa: '',
            scope_en: '',
            requires_auth: false,
          })}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-(--theme-btn-bg) px-4 py-2.5 text-xs font-semibold text-(--theme-btn-text) transition hover:bg-(--theme-btn-hover)"
        >
          <Plus className="h-4 w-4" />
          ثبت قرارداد
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
              placeholder="جست‌وجوی عنوان، شماره یا کارفرما..."
              aria-label="جست‌وجوی قراردادها"
              className="w-full rounded-lg border border-(--theme-input-border) bg-(--theme-input-bg) py-2 pe-3 ps-9 text-sm text-(--theme-input-text) placeholder:text-(--theme-placeholder) outline-none focus:border-(--theme-primary)"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-2 text-xs text-(--theme-text-muted)">
              مرتب‌سازی
              <select value={sortBy} onChange={(event) => setSortBy(event.target.value as ContractSortField)} className="rounded-lg border border-(--theme-input-border) bg-(--theme-input-bg) px-2.5 py-2 text-xs text-(--theme-input-text)" aria-label="مرتب‌سازی قراردادها">
                <option value="start_year">سال شروع</option>
                <option value="contract_number">شماره قرارداد</option>
                <option value="title_fa">عنوان</option>
                <option value="client_fa">کارفرما</option>
                <option value="amount_billion_irr">مبلغ</option>
                <option value="status">وضعیت</option>
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
                aria-label="تعداد قرارداد در هر صفحه"
                className="rounded-lg border border-(--theme-input-border) bg-(--theme-input-bg) px-2.5 py-2 text-xs text-(--theme-input-text)"
              >
                {PAGE_SIZES.map((size) => <option key={size} value={size}>{size}</option>)}
              </select>
            </label>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
          <p className="text-xs text-(--theme-text-muted)" aria-live="polite">
            {loading ? 'در حال بارگذاری قراردادها...' : `نمایش ${contracts.length ? (page - 1) * perPage + 1 : 0} تا ${Math.min(page * perPage, total)} از ${total} قرارداد`}
          </p>
        </div>
        <DataTable data={contracts} columns={columns} pageSize={perPage} loading={loading} emptyText={appliedSearch ? 'قراردادی با این جست‌وجو پیدا نشد.' : 'هنوز قراردادی ثبت نشده است.'} />
        <Pagination page={page} lastPage={lastPage} onChange={setPage} />
      </section>

      <Modal open={Boolean(contractModal) || editorLoading} onClose={closeEditor} title={editorLoading ? 'بارگذاری قرارداد' : contractModal?.id ? 'ویرایش قرارداد' : 'ثبت قرارداد جدید'} size="md">
        {editorLoading ? <InlineLoader label="در حال دریافت جزئیات قرارداد..." /> : contractModal && (
          <form onSubmit={saveContract} className="space-y-3">
            <input required placeholder="شماره قرارداد" value={contractModal.contract_number || ''} onChange={(event) => setContractModal({ ...contractModal, contract_number: event.target.value })} className="w-full rounded-xl border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text) placeholder:text-(--theme-placeholder)" />
            <input required placeholder="عنوان قرارداد" value={contractModal.title_fa || ''} onChange={(event) => setContractModal({ ...contractModal, title_fa: event.target.value })} className="w-full rounded-xl border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text) placeholder:text-(--theme-placeholder)" />
            <input required placeholder="عنوان انگلیسی قرارداد" value={contractModal.title_en || ''} onChange={(event) => setContractModal({ ...contractModal, title_en: event.target.value })} dir="ltr" className="w-full rounded-xl border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text) placeholder:text-(--theme-placeholder)" />
            <input required placeholder="کارفرما" value={contractModal.client_fa || ''} onChange={(event) => setContractModal({ ...contractModal, client_fa: event.target.value })} className="w-full rounded-xl border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text) placeholder:text-(--theme-placeholder)" />
            <input required placeholder="کارفرما (انگلیسی)" value={contractModal.client_en || ''} onChange={(event) => setContractModal({ ...contractModal, client_en: event.target.value })} dir="ltr" className="w-full rounded-xl border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text) placeholder:text-(--theme-placeholder)" />
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-xs text-(--theme-text-muted)">مبلغ (میلیارد ریال)
                <input type="number" min={0} value={contractModal.amount_billion_irr ?? 0} onChange={(event) => setContractModal({ ...contractModal, amount_billion_irr: Number(event.target.value) })} className="mt-1 w-full rounded-xl border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text)" />
              </label>
              <label className="text-xs text-(--theme-text-muted)">سال شروع
                <input required type="number" min={1348} max={1450} value={contractModal.start_year || ''} onChange={(event) => setContractModal({ ...contractModal, start_year: Number(event.target.value) })} className="mt-1 w-full rounded-xl border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text)" />
              </label>
              <label className="text-xs text-(--theme-text-muted)">سال پایان (اختیاری)
                <input type="number" min={1348} max={1450} value={contractModal.end_year ?? ''} onChange={(event) => setContractModal({ ...contractModal, end_year: event.target.value ? Number(event.target.value) : null })} className="mt-1 w-full rounded-xl border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text)" />
              </label>
              <label className="text-xs text-(--theme-text-muted)">وضعیت
                <select value={contractModal.status || 'active'} onChange={(event) => setContractModal({ ...contractModal, status: event.target.value as Contract['status'] })} className="mt-1 w-full rounded-xl border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text)">
                  <option value="active">فعال</option><option value="completed">تکمیل‌شده</option><option value="pending">در انتظار</option><option value="archived">بایگانی</option>
                </select>
              </label>
            </div>
            <textarea placeholder="شرح فارسی قرارداد" value={contractModal.scope_fa || ''} onChange={(event) => setContractModal({ ...contractModal, scope_fa: event.target.value })} rows={3} className="w-full rounded-xl border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text) placeholder:text-(--theme-placeholder)" />
            <textarea placeholder="Contract scope (English)" value={contractModal.scope_en || ''} onChange={(event) => setContractModal({ ...contractModal, scope_en: event.target.value })} dir="ltr" rows={3} className="w-full rounded-xl border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text) placeholder:text-(--theme-placeholder)" />
            <FileUploader folder="documents" currentUrl={contractModal.document_url || undefined} label="پیوست PDF قرارداد" onUploaded={(url) => setContractModal({ ...contractModal, document_url: url })} />
            <label className="flex items-center gap-2 text-xs text-(--theme-text)">
              <input type="checkbox" checked={contractModal.requires_auth ?? false} onChange={(event) => setContractModal({ ...contractModal, requires_auth: event.target.checked })} />
              فایل قرارداد فقط برای کاربران مجاز قابل دریافت باشد
            </label>
            <button type="submit" className="w-full rounded-xl bg-(--theme-btn-bg) py-2.5 text-xs font-semibold text-(--theme-btn-text) transition hover:bg-(--theme-btn-hover)">ذخیره قرارداد</button>
          </form>
        )}
      </Modal>

      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        message="آیا از حذف این قرارداد اطمینان دارید؟"
        loading={deleting}
      />
    </div>
  );
};
