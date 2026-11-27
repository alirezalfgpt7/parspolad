import React, { useEffect, useRef, useState } from 'react';
import { FileSpreadsheet, Pencil, Plus, Trash2 } from 'lucide-react';
import { z } from 'zod';
import { apiRequest } from '../../services/api.ts';
import { useAppStore } from '../../store/useAppStore.ts';
import type { Contract } from '../../types/index.ts';
import { DataTable, type Column } from '../../components/ui/DataTable.tsx';
import { FileUploader } from '../../components/ui/FileUploader.tsx';
import { Modal } from '../../components/ui/Modal.tsx';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog.tsx';
import { InlineLoader } from '../../components/common/InlineLoader.tsx';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader.tsx';

const contractFormSchema = z.object({
  contract_number: z.string().trim().min(1, 'شماره قرارداد الزامی است.').max(120),
  title_fa: z.string().trim().min(1, 'عنوان فارسی الزامی است.').max(255),
  title_en: z.string().trim().min(1, 'عنوان انگلیسی الزامی است.').max(255),
  client_fa: z.string().trim().min(1, 'نام فارسی کارفرما الزامی است.').max(255),
  client_en: z.string().trim().min(1, 'نام انگلیسی کارفرما الزامی است.').max(255),
  amount_billion_irr: z.number().min(0, 'مبلغ نمی‌تواند منفی باشد.'),
  start_year: z.number().int().min(1348).max(1450).nullable().optional(),
  end_year: z.number().int().min(1348).max(1450).nullable().optional(),
  status: z.enum(['active', 'completed', 'pending', 'archived']),
  scope_fa: z.string().nullable().optional(),
  scope_en: z.string().nullable().optional(),
  document_url: z.string().max(255).nullable().optional(),
  requires_auth: z.boolean().optional(),
});

type PaginatedResponse<T> = {
  data: T[];
  meta: { current_page: number; last_page: number; per_page: number; total: number };
};
type ContractListRow = Pick<
  Contract,
  'id' | 'contract_number' | 'title_fa' | 'client_fa' | 'amount_billion_irr' | 'start_year' | 'end_year' | 'status'
>;
const PAGE_SIZES = [5, 10, 20, 50] as const;

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
  const [perPage, setPerPage] = useState<number>(10);
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [sortBy, setSortBy] = useState('start_year');
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
    { key: 'number', sortKey: 'contract_number', header: 'شماره قرارداد', className: 'min-w-[140px]', render: (row) => <span dir="ltr" className="font-mono text-xs">{row.contract_number}</span> },
    { key: 'title', sortKey: 'title_fa', header: 'عنوان قرارداد', className: 'min-w-[180px]', render: (row) => <span className="font-semibold">{row.title_fa}</span> },
    { key: 'client', sortKey: 'client_fa', hideable: true, header: 'کارفرما', className: 'hidden md:table-cell min-w-[140px]', render: (row) => row.client_fa },
    { key: 'amount', sortKey: 'amount_billion_irr', hideable: true, header: 'مبلغ (میلیارد ریال)', className: 'hidden lg:table-cell whitespace-nowrap', render: (row) => Number(row.amount_billion_irr).toLocaleString('fa-IR') },
    { key: 'years', sortKey: 'start_year', hideable: true, header: 'مدت قرارداد', className: 'whitespace-nowrap', render: (row) => row.start_year === null ? (row.end_year ? `تا ${row.end_year}` : 'سال نامشخص') : `${row.start_year}${row.end_year ? ` تا ${row.end_year}` : ' به بعد'}` },
    {
      key: 'status',
      sortKey: 'status',
      hideable: true,
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
      <AdminPageHeader
        icon={FileSpreadsheet}
        eyebrow="Contracts workspace"
        title="مدیریت قراردادها"
        description="جست‌وجو، مرتب‌سازی و مدیریت قراردادها با بارگذاری صفحه‌ای."
        actions={(
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
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-(--theme-btn-bg) px-5 py-2.5 text-sm font-bold text-(--theme-btn-text) shadow-sm transition hover:bg-(--theme-btn-hover)"
          >
            <Plus className="h-4 w-4" />
            ثبت قرارداد
          </button>
        )}
      />

      <DataTable
        data={contracts}
        columns={columns}
        rowKey={(row) => row.id}
        tableLabel="فهرست قراردادها"
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
        searchPlaceholder="جست‌وجوی عنوان، شماره یا کارفرما..."
        searchLabel="جست‌وجوی قراردادها"
        sortBy={sortBy}
        sortDirection={sortDir}
        onSortChange={(field, direction) => {
          setSortBy(field);
          setSortDir(direction);
          setPage(1);
        }}
        loading={loading}
        emptyText={appliedSearch ? 'قراردادی با این جست‌وجو پیدا نشد.' : 'هنوز قراردادی ثبت نشده است.'}
      />

      <Modal open={Boolean(contractModal) || editorLoading} onClose={closeEditor} title={editorLoading ? 'بارگذاری قرارداد' : contractModal?.id ? 'ویرایش قرارداد' : 'ثبت قرارداد جدید'} size="md">
        {editorLoading ? <InlineLoader label="در حال دریافت جزئیات قرارداد..." /> : contractModal && (
          <form onSubmit={saveContract} className="space-y-3">
            <label className="block space-y-1 text-xs font-medium text-(--theme-text)">
              <span className="block">شماره قرارداد *</span>
              <input required value={contractModal.contract_number || ''} onChange={(event) => setContractModal({ ...contractModal, contract_number: event.target.value })} className="w-full rounded-xl border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text)" />
            </label>
            <label className="block space-y-1 text-xs font-medium text-(--theme-text)">
              <span className="block">عنوان قرارداد (فارسی) *</span>
              <input required value={contractModal.title_fa || ''} onChange={(event) => setContractModal({ ...contractModal, title_fa: event.target.value })} className="w-full rounded-xl border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text)" />
            </label>
            <label className="block space-y-1 text-xs font-medium text-(--theme-text)">
              <span className="block">عنوان قرارداد (انگلیسی) *</span>
              <input required value={contractModal.title_en || ''} onChange={(event) => setContractModal({ ...contractModal, title_en: event.target.value })} dir="ltr" className="w-full rounded-xl border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text)" />
            </label>
            <label className="block space-y-1 text-xs font-medium text-(--theme-text)">
              <span className="block">نام کارفرما (فارسی) *</span>
              <input required value={contractModal.client_fa || ''} onChange={(event) => setContractModal({ ...contractModal, client_fa: event.target.value })} className="w-full rounded-xl border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text)" />
            </label>
            <label className="block space-y-1 text-xs font-medium text-(--theme-text)">
              <span className="block">نام کارفرما (انگلیسی) *</span>
              <input required value={contractModal.client_en || ''} onChange={(event) => setContractModal({ ...contractModal, client_en: event.target.value })} dir="ltr" className="w-full rounded-xl border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text)" />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block space-y-1 text-xs text-(--theme-text-muted)">
                <span className="block">مبلغ (میلیارد ریال)</span>
                <input type="number" min={0} value={contractModal.amount_billion_irr ?? 0} onChange={(event) => setContractModal({ ...contractModal, amount_billion_irr: Number(event.target.value) })} className="w-full rounded-xl border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text)" />
              </label>
              <label className="block space-y-1 text-xs text-(--theme-text-muted)">
                <span className="block">سال شروع (اختیاری)</span>
                <input type="number" min={1348} max={1450} value={contractModal.start_year ?? ''} onChange={(event) => setContractModal({ ...contractModal, start_year: event.target.value ? Number(event.target.value) : null })} className="w-full rounded-xl border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text)" />
              </label>
              <label className="block space-y-1 text-xs text-(--theme-text-muted)">
                <span className="block">سال پایان (اختیاری)</span>
                <input type="number" min={1348} max={1450} value={contractModal.end_year ?? ''} onChange={(event) => setContractModal({ ...contractModal, end_year: event.target.value ? Number(event.target.value) : null })} className="w-full rounded-xl border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text)" />
              </label>
              <label className="block space-y-1 text-xs text-(--theme-text-muted)">
                <span className="block">وضعیت</span>
                <select value={contractModal.status || 'active'} onChange={(event) => setContractModal({ ...contractModal, status: event.target.value as Contract['status'] })} className="w-full min-w-0 rounded-xl border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text)">
                  <option value="active">فعال</option><option value="completed">تکمیل‌شده</option><option value="pending">در انتظار</option><option value="archived">بایگانی</option>
                </select>
              </label>
            </div>
            <label className="block space-y-1 text-xs text-(--theme-text-muted)">
              <span className="block">شرح فارسی قرارداد (اختیاری)</span>
              <textarea value={contractModal.scope_fa || ''} onChange={(event) => setContractModal({ ...contractModal, scope_fa: event.target.value })} rows={3} className="w-full rounded-xl border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text)" />
            </label>
            <label className="block space-y-1 text-xs text-(--theme-text-muted)">
              <span className="block">شرح انگلیسی قرارداد (اختیاری)</span>
              <textarea value={contractModal.scope_en || ''} onChange={(event) => setContractModal({ ...contractModal, scope_en: event.target.value })} dir="ltr" rows={3} className="w-full rounded-xl border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text)" />
            </label>
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
