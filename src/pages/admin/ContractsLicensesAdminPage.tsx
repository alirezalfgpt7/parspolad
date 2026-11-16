import React, { useEffect, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { apiRequest } from '../../services/api.ts';
import { useAppStore } from '../../store/useAppStore.ts';
import type { Contract, License } from '../../types/index.ts';
import { DataTable, type Column } from '../../components/ui/DataTable.tsx';
import { FileUploader } from '../../components/ui/FileUploader.tsx';
import { Modal } from '../../components/ui/Modal.tsx';
import { SearchableSelect } from '../../components/ui/SearchableSelect.tsx';
import { PersianDatePicker } from '../../components/ui/PersianDatePicker.tsx';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog.tsx';

type DeleteTarget = { type: 'contract'; id: number } | { type: 'license'; id: number };

export const ContractsLicensesAdminPage: React.FC = () => {
  const { addToast } = useAppStore();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [licenses, setLicenses] = useState<License[]>([]);
  const [contractModal, setContractModal] = useState<Partial<Contract> | null>(null);
  const [licenseModal, setLicenseModal] = useState<Partial<License> | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    const [c, l] = await Promise.all([
      apiRequest<{ data: Contract[] }>('/admin/contracts'),
      apiRequest<{ data: License[] }>('/admin/licenses'),
    ]);
    setContracts(c.data);
    setLicenses(l.data);
  };

  useEffect(() => {
    load().catch(() => {});
  }, []);

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
    try {
      await apiRequest(
        contractModal.id ? `/admin/contracts/${contractModal.id}` : '/admin/contracts',
        { method: contractModal.id ? 'PUT' : 'POST', body: JSON.stringify(contractModal) },
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
    try {
      await apiRequest(
        licenseModal.id ? `/admin/licenses/${licenseModal.id}` : '/admin/licenses',
        { method: licenseModal.id ? 'PUT' : 'POST', body: JSON.stringify(licenseModal) },
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
            onClick={() => setContractModal({ contract_number: '', title_fa: '', client_fa: '', amount_billion_irr: 100, start_year: 1404, status: 'active', scope_fa: '', requires_auth: false })}
            style={{ backgroundColor: 'var(--theme-primary)' }}
            className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold text-white"
          >
            <Plus className="h-4 w-4" />
            <span>ثبت قرارداد</span>
          </button>
        </div>
        <DataTable data={contracts} columns={contractCols} searchKeys={[(c) => c.title_fa, (c) => c.contract_number]} />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold">مدیریت لایسنس‌ها و گواهینامه‌های استاندارد</h2>
          <button
            type="button"
            onClick={() => setLicenseModal({ code: 'ISO-9001', title_fa: '', issuer_fa: '', issue_date: '1404/01/01', category: 'iso', image_url: '/storage/certificates/iso-9001.jpg', requires_auth: false })}
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
              <div className="font-mono text-xs font-bold text-[var(--theme-primary)]">{lic.code}</div>
              <div className="mt-1 text-sm font-bold">{lic.title_fa}</div>
              <div className="mt-1 text-xs text-slate-500">{lic.issuer_fa}</div>
              <div className="mt-3 flex gap-3">
                <button type="button" onClick={() => setLicenseModal(lic)} className="inline-flex items-center gap-1 text-xs text-slate-600 hover:underline"><Pencil className="h-3.5 w-3.5" />ویرایش</button>
                <button type="button" onClick={() => setDeleteTarget({ type: 'license', id: lic.id })} className="text-xs text-red-600 hover:underline">حذف گواهینامه</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal open={Boolean(contractModal)} onClose={() => setContractModal(null)} title={contractModal?.id ? 'ویرایش قرارداد' : 'ثبت قرارداد جدید'} size="md">
        {contractModal && (
          <form onSubmit={saveContract} className="space-y-3">
            <input required placeholder="شماره قرارداد" value={contractModal.contract_number || ''} onChange={(e) => setContractModal({ ...contractModal, contract_number: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
            <input required placeholder="عنوان قرارداد" value={contractModal.title_fa || ''} onChange={(e) => setContractModal({ ...contractModal, title_fa: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
            <input required placeholder="کارفرما" value={contractModal.client_fa || ''} onChange={(e) => setContractModal({ ...contractModal, client_fa: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
            <input type="number" placeholder="مبلغ (میلیارد ریال)" value={contractModal.amount_billion_irr || 0} onChange={(e) => setContractModal({ ...contractModal, amount_billion_irr: Number(e.target.value) })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
            <FileUploader folder="documents" label="پیوست PDF قرارداد" onUploaded={(url) => setContractModal({ ...contractModal, document_url: url })} />
            <button type="submit" style={{ backgroundColor: 'var(--theme-primary)' }} className="w-full rounded-lg py-2 text-xs font-semibold text-white">ذخیره قرارداد</button>
          </form>
        )}
      </Modal>

      <Modal open={Boolean(licenseModal)} onClose={() => setLicenseModal(null)} title={licenseModal?.id ? 'ویرایش گواهینامه' : 'افزودن گواهینامه و استاندارد'} size="md">
        {licenseModal && (
          <form onSubmit={saveLicense} className="space-y-3">
            <input required placeholder="کد استاندارد (مثل API 6A)" value={licenseModal.code || ''} onChange={(e) => setLicenseModal({ ...licenseModal, code: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
            <input required placeholder="عنوان فارسی" value={licenseModal.title_fa || ''} onChange={(e) => setLicenseModal({ ...licenseModal, title_fa: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
            <input required placeholder="مرجع صادرکننده" value={licenseModal.issuer_fa || ''} onChange={(e) => setLicenseModal({ ...licenseModal, issuer_fa: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
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
            <FileUploader folder="certificates" label="تصویر یا PDF گواهینامه" onUploaded={(url) => setLicenseModal({ ...licenseModal, document_url: url, image_url: url.endsWith('.pdf') ? '/storage/certificates/iso-9001.jpg' : url })} />
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
