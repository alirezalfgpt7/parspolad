import React, { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { apiRequest } from '../../services/api.ts';
import { useAppStore } from '../../store/useAppStore.ts';
import type { Contract, License } from '../../types/index.ts';
import { DataTable, type Column } from '../../components/ui/DataTable.tsx';
import { FileUploader } from '../../components/ui/FileUploader.tsx';
import { Modal } from '../../components/ui/Modal.tsx';
import { SearchableSelect } from '../../components/ui/SearchableSelect.tsx';

export const ContractsLicensesAdminPage: React.FC = () => {
  const { addToast } = useAppStore();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [licenses, setLicenses] = useState<License[]>([]);
  const [contractModal, setContractModal] = useState<Partial<Contract> | null>(null);
  const [licenseModal, setLicenseModal] = useState<Partial<License> | null>(null);

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

  const contractCols: Column<Contract>[] = [
    { key: 'num', header: 'شماره قرارداد', render: (c) => <span className="font-mono text-xs">{c.contract_number}</span> },
    { key: 'title', header: 'عنوان', render: (c) => <span className="font-semibold">{c.title_fa}</span> },
    { key: 'client', header: 'کارفرما', render: (c) => <span>{c.client_fa}</span> },
    { key: 'amt', header: 'مبلغ (میلیارد ریال)', render: (c) => <span>{c.amount_billion_irr}</span> },
    {
      key: 'del',
      header: 'حذف',
      render: (c) => (
        <button
          type="button"
          onClick={async () => {
            await apiRequest(`/admin/contracts/${c.id}`, { method: 'DELETE' });
            load();
            addToast('success', 'قرارداد حذف شد.');
          }}
          className="text-red-600"
        >
          <Trash2 className="h-4 w-4" />
        </button>
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
              <button
                type="button"
                onClick={async () => {
                  await apiRequest(`/admin/licenses/${lic.id}`, { method: 'DELETE' });
                  load();
                  addToast('success', 'گواهینامه حذف شد.');
                }}
                className="mt-3 text-xs text-red-600 hover:underline"
              >
                حذف گواهینامه
              </button>
            </div>
          ))}
        </div>
      </div>

      <Modal open={Boolean(contractModal)} onClose={() => setContractModal(null)} title="ثبت قرارداد جدید" size="md">
        {contractModal && (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              await apiRequest('/admin/contracts', { method: 'POST', body: JSON.stringify(contractModal) });
              setContractModal(null);
              load();
              addToast('success', 'قرارداد ثبت شد.');
            }}
            className="space-y-3"
          >
            <input required placeholder="شماره قرارداد" value={contractModal.contract_number || ''} onChange={(e) => setContractModal({ ...contractModal, contract_number: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
            <input required placeholder="عنوان قرارداد" value={contractModal.title_fa || ''} onChange={(e) => setContractModal({ ...contractModal, title_fa: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
            <input required placeholder="کارفرما" value={contractModal.client_fa || ''} onChange={(e) => setContractModal({ ...contractModal, client_fa: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
            <input type="number" placeholder="مبلغ (میلیارد ریال)" value={contractModal.amount_billion_irr || 0} onChange={(e) => setContractModal({ ...contractModal, amount_billion_irr: Number(e.target.value) })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
            <FileUploader folder="documents" label="پیوست PDF قرارداد" onUploaded={(url) => setContractModal({ ...contractModal, document_url: url })} />
            <button type="submit" style={{ backgroundColor: 'var(--theme-primary)' }} className="w-full rounded-lg py-2 text-xs font-semibold text-white">ذخیره قرارداد</button>
          </form>
        )}
      </Modal>

      <Modal open={Boolean(licenseModal)} onClose={() => setLicenseModal(null)} title="افزودن گواهینامه و استاندارد" size="md">
        {licenseModal && (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              await apiRequest('/admin/licenses', { method: 'POST', body: JSON.stringify(licenseModal) });
              setLicenseModal(null);
              load();
              addToast('success', 'گواهینامه جدید ثبت شد.');
            }}
            className="space-y-3"
          >
            <input required placeholder="کد استاندارد (مثل API 6A)" value={licenseModal.code || ''} onChange={(e) => setLicenseModal({ ...licenseModal, code: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
            <input required placeholder="عنوان فارسی" value={licenseModal.title_fa || ''} onChange={(e) => setLicenseModal({ ...licenseModal, title_fa: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
            <input required placeholder="مرجع صادرکننده" value={licenseModal.issuer_fa || ''} onChange={(e) => setLicenseModal({ ...licenseModal, issuer_fa: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
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
    </div>
  );
};
