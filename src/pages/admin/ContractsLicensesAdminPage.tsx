import React, { useEffect, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { z } from 'zod';
import { apiRequest } from '../../services/api.ts';
import { useAppStore } from '../../store/useAppStore.ts';
import type { Contract, License } from '../../types/index.ts';
import { DataTable, type Column } from '../../components/ui/DataTable.tsx';
import { FileUploader } from '../../components/ui/FileUploader.tsx';
import { Modal } from '../../components/ui/Modal.tsx';
import { Pagination } from '../../components/ui/Pagination.tsx';
import { SearchableSelect } from '../../components/ui/SearchableSelect.tsx';
import { PersianDatePicker } from '../../components/ui/PersianDatePicker.tsx';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog.tsx';
import { ZeroBrokenImage } from '../../components/ui/ZeroBrokenImage.tsx';

type DeleteTarget = { type: 'contract'; id: number } | { type: 'license'; id: number };

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

export const ContractsLicensesAdminPage: React.FC = () => {
  const { addToast } = useAppStore();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [licenses, setLicenses] = useState<License[]>([]);
  const [contractPage, setContractPage] = useState(1);
  const [contractLastPage, setContractLastPage] = useState(1);
  const [licensePage, setLicensePage] = useState(1);
  const [licenseLastPage, setLicenseLastPage] = useState(1);
  const [contractModal, setContractModal] = useState<Partial<Contract> | null>(null);
  const [licenseModal, setLicenseModal] = useState<Partial<License> | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = async (targetContractPage = contractPage, targetLicensePage = licensePage) => {
    const [c, l] = await Promise.all([
      apiRequest<{ data: Contract[]; meta: { last_page: number } }>(`/admin/contracts?page=${targetContractPage}&per_page=8`),
      apiRequest<{ data: License[]; meta: { last_page: number } }>(`/admin/licenses?page=${targetLicensePage}&per_page=8`),
    ]);
    if (targetContractPage > c.meta.last_page) {
      setContractPage(Math.max(1, c.meta.last_page));
    } else {
      setContracts(c.data);
      setContractLastPage(c.meta.last_page);
    }
    if (targetLicensePage > l.meta.last_page) {
      setLicensePage(Math.max(1, l.meta.last_page));
    } else {
      setLicenses(l.data);
      setLicenseLastPage(l.meta.last_page);
    }
  };

  useEffect(() => {
    load().catch((error: unknown) => {
      addToast('error', error instanceof Error ? error.message : 'بارگذاری قراردادها و گواهینامه‌ها ناموفق بود.');
    });
  }, [contractPage, licensePage]);

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    try {
      const { type, id } = deleteTarget;
      await apiRequest(`/admin/${type === 'contract' ? 'contracts' : 'licenses'}/${id}`, { method: 'DELETE' });
      setDeleteTarget(null);
      await load();
      addToast('success', type === 'contract' ? 'قرارداد حذف شد.' : 'گواهینامه حذف شد.');
    } catch (error) {
      addToast('error', error instanceof Error ? error.message : 'حذف مورد ناموفق بود.');
    } finally {
      setDeleting(false);
    }
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
      await load();
      addToast('success', 'قرارداد ذخیره شد.');
    } catch (error) {
      addToast('error', error instanceof Error ? error.message : 'ذخیره قرارداد ناموفق بود.');
    }
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
      await load();
      addToast('success', 'گواهینامه ذخیره شد.');
    } catch (error) {
      addToast('error', error instanceof Error ? error.message : 'ذخیره گواهینامه ناموفق بود.');
    }
  };

  const contractCols: Column<Contract>[] = [
    { key: 'num', header: 'شماره قرارداد', render: (c) => <span className="font-mono text-xs">{c.contract_number}</span> },
    { key: 'title', header: 'عنوان', render: (c) => <span className="font-semibold">{c.title_fa}</span> },
    { key: 'client', header: 'کارفرما', render: (c) => <span>{c.client_fa}</span> },
    { key: 'amt', header: 'مبلغ (میلیارد ریال)', render: (c) => <span>{c.amount_billion_irr}</span> },
    {
      key: 'del',
      header: 'عملیات',
      render: (c) => (
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setContractModal(c)} aria-label="ویرایش قرارداد" className="text-slate-600"><Pencil className="h-4 w-4" /></button>
          <button type="button" onClick={() => setDeleteTarget({ type: 'contract', id: c.id })} aria-label="حذف قرارداد" className="text-red-600"><Trash2 className="h-4 w-4" /></button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-extrabold">مدیریت قراردادهای کلان</h1>
          <button
            type="button"
            onClick={() => setContractModal({ contract_number: '', title_fa: '', title_en: '', client_fa: '', client_en: '', amount_billion_irr: 100, start_year: 1404, status: 'active', scope_fa: '', scope_en: '', requires_auth: false })}
            style={{ backgroundColor: 'var(--theme-primary)' }}
            className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold text-white"
          >
            <Plus className="h-4 w-4" />
            <span>ثبت قرارداد</span>
          </button>
        </div>
        <DataTable data={contracts} columns={contractCols} pageSize={8} searchKeys={[(c) => c.title_fa, (c) => c.contract_number]} />
        <Pagination page={contractPage} lastPage={contractLastPage} onChange={setContractPage} />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold">مدیریت لایسنس‌ها و گواهینامه‌های استاندارد</h2>
          <button
            type="button"
            onClick={() => setLicenseModal({ code: 'ISO-9001', title_fa: '', title_en: '', issuer_fa: '', issuer_en: '', issue_date: '1404/01/01', category: 'iso', image_url: '/storage/certificates/iso-9001.jpg', requires_auth: false })}
            style={{ backgroundColor: 'var(--theme-primary)' }}
            className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold text-white"
          >
            <Plus className="h-4 w-4" />
            <span>افزودن گواهینامه</span>
          </button>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {licenses.map((lic) => (
            <div key={lic.id} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              {lic.image_url && (
                <div className="mb-3 h-28 w-full overflow-hidden rounded-lg border border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-800">
                  <ZeroBrokenImage src={lic.image_url} alt={lic.title_fa} className="h-full w-full object-cover" />
                </div>
              )}
              <div className="font-mono text-xs font-bold text-(--theme-primary)">{lic.code}</div>
              <div className="mt-1 text-sm font-bold">{lic.title_fa}</div>
              <div className="mt-1 text-xs text-slate-500">{lic.issuer_fa}</div>
              <div className="mt-3 flex gap-3">
                <button type="button" onClick={() => setLicenseModal(lic)} className="inline-flex items-center gap-1 text-xs text-slate-600 hover:underline"><Pencil className="h-3.5 w-3.5" />ویرایش</button>
                <button type="button" onClick={() => setDeleteTarget({ type: 'license', id: lic.id })} className="text-xs text-red-600 hover:underline">حذف گواهینامه</button>
              </div>
            </div>
          ))}
        </div>
        <Pagination page={licensePage} lastPage={licenseLastPage} onChange={setLicensePage} />
      </div>

      <Modal open={Boolean(contractModal)} onClose={() => setContractModal(null)} title={contractModal?.id ? 'ویرایش قرارداد' : 'ثبت قرارداد جدید'} size="md">
        {contractModal && (
          <form onSubmit={saveContract} className="space-y-3">
            <input required placeholder="شماره قرارداد" value={contractModal.contract_number || ''} onChange={(e) => setContractModal({ ...contractModal, contract_number: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
            <input required placeholder="عنوان قرارداد" value={contractModal.title_fa || ''} onChange={(e) => setContractModal({ ...contractModal, title_fa: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
            <input required placeholder="عنوان انگلیسی قرارداد" value={contractModal.title_en || ''} onChange={(e) => setContractModal({ ...contractModal, title_en: e.target.value })} dir="ltr" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
            <input required placeholder="کارفرما" value={contractModal.client_fa || ''} onChange={(e) => setContractModal({ ...contractModal, client_fa: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
            <input required placeholder="کارفرما (انگلیسی)" value={contractModal.client_en || ''} onChange={(e) => setContractModal({ ...contractModal, client_en: e.target.value })} dir="ltr" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
            <input type="number" placeholder="مبلغ (میلیارد ریال)" value={contractModal.amount_billion_irr || 0} onChange={(e) => setContractModal({ ...contractModal, amount_billion_irr: Number(e.target.value) })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
            <input required type="number" min={1348} max={1450} placeholder="سال شروع" value={contractModal.start_year || ''} onChange={(e) => setContractModal({ ...contractModal, start_year: Number(e.target.value) })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
            <select value={contractModal.status || 'active'} onChange={(e) => setContractModal({ ...contractModal, status: e.target.value as Contract['status'] })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800">
              <option value="active">فعال</option><option value="completed">تکمیل‌شده</option><option value="pending">در انتظار</option><option value="archived">بایگانی</option>
            </select>
            <FileUploader
              folder="documents"
              currentUrl={contractModal.document_url || undefined}
              label="پیوست PDF قرارداد"
              onUploaded={(url) => setContractModal({ ...contractModal, document_url: url })}
            />
            <button type="submit" style={{ backgroundColor: 'var(--theme-primary)' }} className="w-full rounded-lg py-2 text-xs font-semibold text-white">ذخیره قرارداد</button>
          </form>
        )}
      </Modal>

      <Modal open={Boolean(licenseModal)} onClose={() => setLicenseModal(null)} title={licenseModal?.id ? 'ویرایش گواهینامه' : 'افزودن گواهینامه و استاندارد'} size="md">
        {licenseModal && (
          <form onSubmit={saveLicense} className="space-y-3">
            <input required placeholder="کد استاندارد (مثل API 6A)" value={licenseModal.code || ''} onChange={(e) => setLicenseModal({ ...licenseModal, code: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
            <input required placeholder="عنوان فارسی" value={licenseModal.title_fa || ''} onChange={(e) => setLicenseModal({ ...licenseModal, title_fa: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
            <input required placeholder="عنوان انگلیسی" value={licenseModal.title_en || ''} onChange={(e) => setLicenseModal({ ...licenseModal, title_en: e.target.value })} dir="ltr" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
            <input required placeholder="مرجع صادرکننده" value={licenseModal.issuer_fa || ''} onChange={(e) => setLicenseModal({ ...licenseModal, issuer_fa: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
            <input required placeholder="مرجع صادرکننده (انگلیسی)" value={licenseModal.issuer_en || ''} onChange={(e) => setLicenseModal({ ...licenseModal, issuer_en: e.target.value })} dir="ltr" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
            <label className="block text-xs">
              تاریخ صدور
              <PersianDatePicker
                value={licenseModal.issue_date || ''}
                onChange={(issue_date) => setLicenseModal({ ...licenseModal, issue_date })}
                className="mt-1"
              />
            </label>
            <SearchableSelect
              label="دسته"
              options={[{ value: 'iso', label: 'ISO' }, { value: 'api', label: 'API' }, { value: 'knowledge_based', label: 'دانش‌بنیان' }]}
              value={licenseModal.category || 'iso'}
              onChange={(v) => setLicenseModal({ ...licenseModal, category: v as License['category'] })}
            />
            <FileUploader
              folder="certificates"
              currentUrl={licenseModal.image_url || licenseModal.document_url || undefined}
              label="تصویر یا PDF گواهینامه"
              onUploaded={(url) => setLicenseModal({ ...licenseModal, document_url: url, image_url: url.endsWith('.pdf') ? '/storage/certificates/iso-9001.jpg' : url })}
            />
            <button type="submit" style={{ backgroundColor: 'var(--theme-primary)' }} className="w-full rounded-lg py-2 text-xs font-semibold text-white">ثبت گواهینامه</button>
          </form>
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        message={deleteTarget?.type === 'contract' ? 'آیا از حذف این قرارداد اطمینان دارید؟' : 'آیا از حذف این گواهینامه اطمینان دارید؟'}
        loading={deleting}
      />
    </div>
  );
};
