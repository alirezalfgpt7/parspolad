import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, Eye, Lock } from 'lucide-react';
import { apiRequest } from '../../services/api.ts';
import { useAppStore } from '../../store/useAppStore.ts';
import type { Contract, License } from '../../types/index.ts';
import { SeoHead } from '../../components/common/SeoHead.tsx';
import { Breadcrumb } from '../../components/ui/Breadcrumb.tsx';
import { DataTable, type Column } from '../../components/ui/DataTable.tsx';
import { Modal } from '../../components/ui/Modal.tsx';
import { ZeroBrokenImage } from '../../components/ui/ZeroBrokenImage.tsx';

export const ContractsLicensesPage: React.FC = () => {
  const { language, user } = useAppStore();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [licenses, setLicenses] = useState<License[]>([]);
  const [previewLicense, setPreviewLicense] = useState<License | null>(null);

  useEffect(() => {
    apiRequest<{ data: Contract[] }>('/contracts').then((r) => setContracts(r.data)).catch(() => {});
    apiRequest<{ data: License[] }>('/licenses').then((r) => setLicenses(r.data)).catch(() => {});
  }, []);

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
          c.requires_auth && !user ? (
            <Link to="/login" className="inline-flex items-center gap-1 text-xs text-amber-600 hover:underline">
              <Lock className="h-3.5 w-3.5" />
              <span>ورود</span>
            </Link>
          ) : (
            <a href={c.document_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--theme-primary)] hover:underline">
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
      <SeoHead title="قراردادها و گواهینامه‌های بین‌المللی" />
      <Breadcrumb items={[{ label: 'قراردادها و گواهینامه‌ها' }]} />

      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
          گواهینامه‌های بین‌المللی، افتخارات و سوابق قراردادها
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          تاییدیه رسمی شرکت دانش‌بنیان، آزمون آتش API 6FA و استانداردهای ایزو ۹۰۰۱، ۱۴۰۰۱، ۴۵۰۰۱، ۲۹۰۰۱ و ۱۰۴۲۳
        </p>
      </div>

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
                  <div className="font-mono text-xs font-bold text-[var(--theme-primary)]">{lic.code}</div>
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
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--theme-link)] hover:underline"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>دانلود گواهینامه PDF</span>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contracts Table */}
      <section>
        <h2 className="mb-5 text-xl font-bold text-slate-900 dark:text-white">
          فهرست قراردادهای شاخص سرچاهی و درون‌چاهی
        </h2>
        <DataTable
          data={contracts}
          columns={contractCols}
          searchKeys={[(c) => c.title_fa, (c) => c.client_fa, (c) => c.contract_number]}
          searchPlaceholder="جستجو در شماره قرارداد، عنوان یا کارفرما..."
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
            <img
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
                  className="inline-flex items-center gap-1 font-semibold text-[var(--theme-primary)] hover:underline"
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
