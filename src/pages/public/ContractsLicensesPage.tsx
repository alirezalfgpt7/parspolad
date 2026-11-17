import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, Eye, Lock } from 'lucide-react';
import { apiRequest } from '../../services/api.ts';
import { useAppStore } from '../../store/useAppStore.ts';
import type { Contract, License } from '../../types/index.ts';
import { CmsPageIntro } from '../../components/common/CmsPageIntro.tsx';
import { DataTable, type Column } from '../../components/ui/DataTable.tsx';
import { Modal } from '../../components/ui/Modal.tsx';
import { Pagination } from '../../components/ui/Pagination.tsx';
import { ZeroBrokenImage } from '../../components/ui/ZeroBrokenImage.tsx';

export const ContractsLicensesPage: React.FC = () => {
  const { language, user, addToast } = useAppStore();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [licenses, setLicenses] = useState<License[]>([]);
  const [contractPage, setContractPage] = useState(1);
  const [contractLastPage, setContractLastPage] = useState(1);
  const [licensePage, setLicensePage] = useState(1);
  const [licenseLastPage, setLicenseLastPage] = useState(1);
  const [previewLicense, setPreviewLicense] = useState<License | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([
      apiRequest<{ data: Contract[]; meta: { last_page: number } }>(`/contracts?page=${contractPage}&per_page=8`),
      apiRequest<{ data: License[]; meta: { last_page: number } }>(`/licenses?page=${licensePage}&per_page=8`),
    ])
      .then(([contractResponse, licenseResponse]) => {
        if (!active) return;
        setContracts(contractResponse.data);
        setContractLastPage(contractResponse.meta.last_page);
        setLicenses(licenseResponse.data);
        setLicenseLastPage(licenseResponse.meta.last_page);
      })
      .catch((error: unknown) => {
        if (active) addToast('error', error instanceof Error ? error.message : 'دریافت قراردادها و گواهینامه‌ها ناموفق بود.');
      });

    return () => {
      active = false;
    };
  }, [contractPage, licensePage, addToast]);

  const contractCols: Column<Contract>[] = [
    {
      key: 'number',
      header: 'شماره قرارداد',
      sortValue: (c) => c.contract_number,
      render: (c) => <span className="font-mono text-xs font-semibold">{c.contract_number}</span>,
    },
    {
      key: 'title',
      header: 'موضوع قرارداد',
      sortValue: (c) => c.title_fa,
      render: (c) => (
        <div>
          <div className="font-semibold text-slate-900 dark:text-white">{language === 'fa' ? c.title_fa : c.title_en}</div>
          <div className="text-xs text-slate-500">{c.client_fa}</div>
        </div>
      ),
    },
    {
      key: 'year',
      header: 'دوره اجرا',
      sortValue: (c) => c.start_year,
      render: (c) => <span>{c.start_year} – {c.end_year || 'جاری'}</span>,
    },
    {
      key: 'status',
      header: 'وضعیت',
      render: (c) => (
        <span className={c.status === 'completed' ? 'text-emerald-600 font-semibold' : 'text-amber-600 font-semibold'}>
          {c.status === 'completed' ? 'تکمیل‌شده' : 'در حال اجرا'}
        </span>
      ),
    },
    {
      key: 'doc',
      header: 'مستندات',
      render: (c) =>
        c.document_url ? (
          c.requires_auth && (!user || !c.document_url) ? (
            !user ? (
              <Link to="/login" className="inline-flex items-center gap-1 text-xs text-amber-600 hover:underline">
                <Lock className="h-3.5 w-3.5" />
                <span>ورود</span>
              </Link>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                <Lock className="h-3.5 w-3.5" />
                <span>مدرک محافظت‌شده در دسترس نیست</span>
              </span>
            )
          ) : (
            <a href={c.document_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-(--theme-primary) hover:underline">
              <Download className="h-3.5 w-3.5" />
              <span>PDF</span>
            </a>
          )
        ) : (
          <span className="text-xs text-slate-400">—</span>
        ),
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <CmsPageIntro slug="contracts-licenses" />

      {/* Certificates Grid */}
      <section className="mb-14">
        <h2 className="mb-5 text-xl font-bold text-slate-900 dark:text-white">
          گواهینامه‌ها و لایسنس‌های استاندارد
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {licenses.map((lic) => (
            <div
              key={lic.id}
              className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
            >
              <button
                type="button"
                onClick={() => setPreviewLicense(lic)}
                className="group relative h-48 overflow-hidden bg-slate-100 dark:bg-slate-800"
              >
                <ZeroBrokenImage
                  src={lic.image_url}
                  alt={lic.title_fa}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <span className="absolute bottom-2 end-2 flex items-center gap-1 rounded-md bg-black/70 px-2 py-1 text-[11px] text-white">
                  <Eye className="h-3 w-3" />
                  <span>بزرگنمایی</span>
                </span>
              </button>
              <div className="flex flex-1 flex-col justify-between p-4">
                <div>
                  <div className="font-mono text-xs font-bold text-(--theme-primary)">{lic.code}</div>
                  <h3 className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                    {language === 'fa' ? lic.title_fa : lic.title_en}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">{lic.issuer_fa}</p>
                </div>
                {lic.document_url && (
                  <a
                    href={lic.document_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-(--theme-link) hover:underline"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>دانلود گواهینامه PDF</span>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
        <Pagination page={licensePage} lastPage={licenseLastPage} onChange={setLicensePage} />
      </section>

      {/* Contracts Table */}
      <section>
        <h2 className="mb-5 text-xl font-bold text-slate-900 dark:text-white">
          فهرست قراردادهای شاخص سرچاهی و درون‌چاهی
        </h2>
        <DataTable
          data={contracts}
          columns={contractCols}
          pageSize={8}
          searchKeys={[(c) => c.title_fa, (c) => c.client_fa, (c) => c.contract_number]}
          searchPlaceholder="جستجو در شماره قرارداد، عنوان یا کارفرما..."
        />
        <Pagination page={contractPage} lastPage={contractLastPage} onChange={setContractPage} />
      </section>

      <Modal
        open={Boolean(previewLicense)}
        onClose={() => setPreviewLicense(null)}
        title={previewLicense?.title_fa || ''}
        size="lg"
      >
        {previewLicense && (
          <div className="space-y-4">
            <ZeroBrokenImage
              src={previewLicense.image_url}
              alt={previewLicense.title_fa}
              className="max-h-[70vh] w-full rounded-lg object-contain"
            />
            <div className="flex items-center justify-between text-xs text-slate-500 tabular-nums">
              <span>صادرکننده: {previewLicense.issuer_fa} · تاریخ صدور: {previewLicense.issue_date}</span>
              {previewLicense.document_url && (
                <a
                  href={previewLicense.document_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 font-semibold text-(--theme-primary) hover:underline"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>دریافت فایل اصلی</span>
                </a>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
