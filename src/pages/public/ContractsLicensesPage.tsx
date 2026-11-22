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

const CONTRACT_PAGE_SIZES = [5, 10, 20, 50] as const;

export const ContractsLicensesPage: React.FC = () => {
  const { language, user, addToast } = useAppStore();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [licenses, setLicenses] = useState<License[]>([]);
  const [contractPage, setContractPage] = useState(1);
  const [contractLastPage, setContractLastPage] = useState(1);
  const [contractTotal, setContractTotal] = useState(0);
  const [contractPerPage, setContractPerPage] = useState<number>(10);
  const [contractSearch, setContractSearch] = useState('');
  const [appliedContractSearch, setAppliedContractSearch] = useState('');
  const [contractSortBy, setContractSortBy] = useState('start_year');
  const [contractSortDirection, setContractSortDirection] = useState<'asc' | 'desc'>('desc');
  const [contractsLoading, setContractsLoading] = useState(false);
  const [licensePage, setLicensePage] = useState(1);
  const [licenseLastPage, setLicenseLastPage] = useState(1);
  const [previewLicense, setPreviewLicense] = useState<License | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setAppliedContractSearch(contractSearch.trim()), 300);
    return () => {
      window.clearTimeout(timer);
    };
  }, [contractSearch]);

  useEffect(() => {
    let active = true;
    const params = new URLSearchParams({
      page: String(contractPage),
      per_page: String(contractPerPage),
      sort_by: contractSortBy,
      sort_dir: contractSortDirection,
    });
    if (appliedContractSearch) params.set('q', appliedContractSearch);
    setContractsLoading(true);
    apiRequest<{ data: Contract[]; meta: { last_page: number; total: number } }>(`/contracts?${params.toString()}`)
      .then((response) => {
        if (!active) return;
        if (contractPage > response.meta.last_page) {
          setContractPage(Math.max(1, response.meta.last_page));
          return;
        }
        setContracts(response.data);
        setContractLastPage(response.meta.last_page);
        setContractTotal(response.meta.total);
      })
      .catch((error: unknown) => {
        if (active) addToast('error', error instanceof Error ? error.message : 'دریافت قراردادها و گواهینامه‌ها ناموفق بود.');
      })
      .finally(() => {
        if (active) setContractsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [contractPage, contractPerPage, appliedContractSearch, contractSortBy, contractSortDirection, addToast]);

  useEffect(() => {
    let active = true;
    apiRequest<{ data: License[]; meta: { last_page: number } }>(`/licenses?page=${licensePage}&per_page=8`)
      .then((response) => {
        if (!active) return;
        setLicenses(response.data);
        setLicenseLastPage(response.meta.last_page);
      })
      .catch((error: unknown) => {
        if (active) addToast('error', error instanceof Error ? error.message : 'دریافت قراردادها و گواهینامه‌ها ناموفق بود.');
      });

    return () => {
      active = false;
    };
  }, [licensePage, addToast]);

  const contractCols: Column<Contract>[] = [
    {
      key: 'number',
      sortKey: 'contract_number',
      hideable: true,
      header: 'شماره قرارداد',
      render: (c) => <span className="font-mono text-xs font-semibold">{c.contract_number}</span>,
    },
    {
      key: 'title',
      sortKey: 'title_fa',
      header: 'موضوع قرارداد',
      render: (c) => (
        <div>
          <div className="font-semibold text-(--theme-text)">{language === 'fa' ? c.title_fa : c.title_en}</div>
          <div className="text-xs text-(--theme-text-muted)">{c.client_fa}</div>
        </div>
      ),
    },
    {
      key: 'year',
      sortKey: 'start_year',
      hideable: true,
      header: 'دوره اجرا',
      render: (c) => <span>{c.start_year} – {c.end_year || 'جاری'}</span>,
    },
    {
      key: 'status',
      sortKey: 'status',
      hideable: true,
      header: 'وضعیت',
      render: (c) => (
        <span className={c.status === 'completed' ? 'text-emerald-600 font-semibold' : 'text-amber-600 font-semibold'}>
          {c.status === 'completed' ? 'تکمیل‌شده' : 'در حال اجرا'}
        </span>
      ),
    },
    {
      key: 'doc',
      hideable: true,
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
              <span className="inline-flex items-center gap-1 text-xs text-(--theme-text-muted)">
                <Lock className="h-3.5 w-3.5" />
                <span>مدرک محافظت‌شده در دسترس نیست</span>
              </span>
            )
          ) : (
            <a href={c.document_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-(--theme-link) hover:underline">
              <Download className="h-3.5 w-3.5" />
              <span>PDF</span>
            </a>
          )
        ) : (
          <span className="text-xs text-(--theme-text-muted)">—</span>
        ),
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <CmsPageIntro slug="contracts-licenses" />

      {/* Certificates Grid */}
      <section className="mb-14">
        <h2 className="mb-5 text-xl font-bold text-(--theme-text)">
          گواهینامه‌ها و لایسنس‌های استاندارد
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {licenses.map((lic) => (
            <div
              key={lic.id}
              className="flex flex-col overflow-hidden rounded-2xl border border-(--theme-card-border) bg-(--theme-card-surface) shadow-(--theme-card-shadow) transition hover:border-(--theme-card-border-hover) hover:shadow-(--theme-card-shadow-hover)"
            >
              <button
                type="button"
                onClick={() => setPreviewLicense(lic)}
                className="group relative h-48 overflow-hidden bg-(--theme-surface-muted)"
              >
                <ZeroBrokenImage
                  src={lic.image_url}
                  alt={lic.title_fa}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <span className="absolute bottom-2 inset-e-2 flex items-center gap-1 rounded-md bg-black/70 px-2 py-1 text-[11px] text-white">
                  <Eye className="h-3 w-3" />
                  <span>بزرگنمایی</span>
                </span>
              </button>
              <div className="flex flex-1 flex-col justify-between p-4">
                <div>
                  <div className="font-mono text-xs font-bold text-(--theme-primary-ink)">{lic.code}</div>
                  <h3 className="mt-1 text-sm font-bold text-(--theme-text)">
                    {language === 'fa' ? lic.title_fa : lic.title_en}
                  </h3>
                  <p className="mt-1 text-xs text-(--theme-text-muted)">{lic.issuer_fa}</p>
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
        <h2 className="mb-5 text-xl font-bold text-(--theme-text)">
          فهرست قراردادهای شاخص سرچاهی و درون‌چاهی
        </h2>
        <DataTable
          data={contracts}
          columns={contractCols}
          rowKey={(contract) => contract.id}
          tableLabel="فهرست قراردادهای شاخص"
          pageSize={contractPerPage}
          pageSizeOptions={CONTRACT_PAGE_SIZES}
          onPageSizeChange={(size) => {
            setContractPerPage(size);
            setContractPage(1);
          }}
          currentPage={contractPage}
          lastPage={contractLastPage}
          total={contractTotal}
          onPageChange={setContractPage}
          searchValue={contractSearch}
          onSearchChange={(value) => {
            setContractSearch(value);
            setContractPage(1);
          }}
          searchPlaceholder="جستجو در شماره قرارداد، عنوان یا کارفرما..."
          searchLabel="جست‌وجوی قراردادها"
          sortBy={contractSortBy}
          sortDirection={contractSortDirection}
          onSortChange={(field, direction) => {
            setContractSortBy(field);
            setContractSortDirection(direction);
            setContractPage(1);
          }}
          loading={contractsLoading}
          emptyText={appliedContractSearch ? 'قراردادی با این جست‌وجو پیدا نشد.' : 'قراردادی برای نمایش وجود ندارد.'}
        />
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
            <div className="flex items-center justify-between text-xs text-(--theme-text-muted) tabular-nums">
              <span>صادرکننده: {previewLicense.issuer_fa} · تاریخ صدور: {previewLicense.issue_date}</span>
              {previewLicense.document_url && (
                <a
                  href={previewLicense.document_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 font-semibold text-(--theme-link) hover:underline"
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
