import React, { useEffect, useState } from 'react';
import { FileSpreadsheet, Upload } from 'lucide-react';
import * as XLSX from 'xlsx';
import { apiRequest } from '../../services/api.ts';
import { useAppStore } from '../../store/useAppStore.ts';
import type { ActivityLog } from '../../types/index.ts';
import { DataTable, type Column } from '../../components/ui/DataTable.tsx';
import { Pagination } from '../../components/ui/Pagination.tsx';

interface ProjectImportRow {
  line: number;
  title: string;
  errors: string[];
  payload?: Record<string, unknown>;
  importError?: string;
  imported?: boolean;
}

export const ReportsLogsAdminPage: React.FC = () => {
  const { token, addToast, bootstrap } = useAppStore();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [importRows, setImportRows] = useState<ProjectImportRow[]>([]);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    let active = true;
    apiRequest<{ data: ActivityLog[]; meta: { last_page: number } }>(`/admin/activity-logs?page=${page}&per_page=50`)
      .then((response) => {
        if (active) {
          setLogs(response.data);
          setLastPage(response.meta.last_page);
        }
      })
      .catch((error: unknown) => {
        if (active) addToast('error', error instanceof Error ? error.message : 'دریافت گزارش فعالیت‌ها ناموفق بود.');
      });

    return () => {
      active = false;
    };
  }, [page, addToast]);

  const exportExcel = async (entity: 'projects' | 'contracts' | 'logs') => {
    try {
      const res = await fetch(`/api/v1/admin/reports/export/${entity}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('دریافت فایل گزارش ناموفق بود.');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `parspolad-${entity}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
      addToast('success', `گزارش اکسل (${entity}) دانلود شد.`);
    } catch (error) {
      addToast('error', error instanceof Error ? error.message : 'دانلود فایل گزارش ناموفق بود.');
    }
  };

  const previewImport = async (file?: File) => {
    if (!file) return;
    if (!/\.(xlsx|xls|csv)$/i.test(file.name) || file.size > 10 * 1024 * 1024) {
      addToast('error', 'فقط فایل xlsx، xls یا csv تا حجم ۱۰ مگابایت قابل بررسی است.');
      return;
    }

    try {
      const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      if (!sheetName) throw new Error('فایل شیت قابل‌خواندن ندارد.');
      const sourceRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(workbook.Sheets[sheetName], { defval: '' });
      if (sourceRows.length === 0) throw new Error('فایل هیچ ردیف داده‌ای ندارد.');
      if (sourceRows.length > 500) throw new Error('حداکثر ۵۰۰ ردیف در هر بار قابل ورود است.');

      const readText = (row: Record<string, unknown>, ...keys: string[]): string => {
        for (const key of keys) {
          const value = row[key];
          if (value !== undefined && value !== null && String(value).trim() !== '') return String(value).trim();
        }
        return '';
      };
      const categories = bootstrap?.categories ?? [];
      const preview = sourceRows.map((row, index): ProjectImportRow => {
        const titleFa = readText(row, 'title_fa', 'عنوان پروژه');
        const titleEn = readText(row, 'title_en', 'عنوان انگلیسی');
        const clientFa = readText(row, 'client_name_fa', 'کارفرما');
        const clientEn = readText(row, 'client_name_en', 'کارفرما انگلیسی', 'client');
        const contract = readText(row, 'contract_number', 'شماره قرارداد');
        const categoryLabel = readText(row, 'category_id', 'category', 'دسته‌بندی', 'دسته بندی');
        const category = categories.find((item) =>
          String(item.id) === categoryLabel || item.slug === categoryLabel || item.name_fa === categoryLabel || item.name_en === categoryLabel,
        );
        const year = Number(readText(row, 'year', 'سال'));
        const status = readText(row, 'status', 'وضعیت');
        const summaryFa = readText(row, 'summary_fa', 'خلاصه فارسی', 'خلاصه');
        const coverImage = readText(row, 'cover_image', 'تصویر کاور', 'تصویر');
        const errors: string[] = [];

        if (!titleFa || !titleEn) errors.push('عنوان فارسی و انگلیسی لازم است.');
        if (!clientFa || !clientEn) errors.push('نام فارسی و انگلیسی کارفرما لازم است.');
        if (!contract) errors.push('شماره قرارداد لازم است.');
        if (!category) errors.push('دسته‌بندی باید با شناسه، نام یا شناسه یکتای دسته موجود تطبیق داشته باشد.');
        if (!Number.isInteger(year) || year < 1348 || year > 1450) errors.push('سال باید عددی بین ۱۳۴۸ تا ۱۴۵۰ باشد.');
        if (!status) errors.push('وضعیت پروژه لازم است.');
        if (!['completed', 'in_progress', 'planned', 'contracted'].includes(status)) errors.push('وضعیت پروژه معتبر نیست.');
        if (!summaryFa) errors.push('خلاصه فارسی پروژه لازم است.');
        if (!coverImage) errors.push('مسیر تصویر کاور لازم است.');

        return {
          line: index + 2,
          title: titleFa || titleEn || `ردیف ${index + 2}`,
          errors,
          ...(errors.length === 0 && category ? {
            payload: {
              slug: `import-${Date.now()}-${index + 1}`,
              title_fa: titleFa,
              title_en: titleEn,
              category_id: category.id,
              client_name_fa: clientFa,
              client_name_en: clientEn,
              contract_number: contract,
              contract_type_fa: readText(row, 'contract_type_fa', 'نوع قرارداد') || null,
              contract_type_en: readText(row, 'contract_type_en', 'contract_type') || null,
              location_fa: readText(row, 'location_fa', 'محل اجرا') || null,
              location_en: readText(row, 'location_en', 'location') || null,
              year,
              status,
              summary_fa: summaryFa,
              summary_en: readText(row, 'summary_en', 'خلاصه انگلیسی') || null,
              description_fa: readText(row, 'description_fa', 'شرح فارسی') || null,
              description_en: readText(row, 'description_en', 'شرح انگلیسی') || null,
              standards: readText(row, 'standards', 'استانداردها').split(/[,،]/).map((value) => value.trim()).filter(Boolean),
              cover_image: coverImage,
              is_featured: false,
            },
          } : {}),
        };
      });
      setImportRows(preview);
      addToast('info', `${preview.length} ردیف بررسی شد؛ ${preview.filter((row) => row.errors.length === 0).length} ردیف آماده ورود است.`);
    } catch (error) {
      addToast('error', error instanceof Error ? error.message : 'خواندن فایل اکسل ناموفق بود.');
    }
  };

  const importValidRows = async () => {
    setImporting(true);
    let imported = 0;
    const updatedRows = [...importRows];
    for (let index = 0; index < updatedRows.length; index += 1) {
      const row = updatedRows[index];
      if (!row.payload || row.errors.length > 0 || row.imported) continue;
      try {
        await apiRequest('/admin/projects', { method: 'POST', body: JSON.stringify(row.payload) });
        imported += 1;
        row.imported = true;
        delete row.importError;
      } catch (error) {
        row.importError = error instanceof Error ? error.message : 'خطای نامشخص هنگام ثبت ردیف.';
      }
    }
    setImportRows(updatedRows);
    setImporting(false);
    addToast(imported > 0 ? 'success' : 'error', `${imported} ردیف وارد شد؛ ${updatedRows.filter((row) => row.importError).length} ردیف در ثبت نهایی خطا داشت.`);
  };

  const cols: Column<ActivityLog>[] = [
    { key: 'user', header: 'کاربر', render: (l) => <span className="font-semibold">{l.user_name}</span> },
    { key: 'action', header: 'رویداد', render: (l) => <span className="font-mono text-xs text-(--theme-primary)">{l.action}</span> },
    { key: 'subject', header: 'بخش / موضوع', render: (l) => <span>{l.subject_type} · {l.subject_label}</span> },
    { key: 'ip', header: 'IP', render: (l) => <span className="font-mono text-xs">{l.ip_address}</span> },
    { key: 'date', header: 'زمان', render: (l) => <span className="text-xs text-slate-500">{new Date(l.created_at).toLocaleString('fa-IR')}</span> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div>
          <h1 className="text-lg font-extrabold">گزارش‌های اکسل (Import/Export) و لاگ فعالیت‌های سیستم</h1>
          <p className="mt-1 text-xs text-slate-500">خروجی رسمی اکسل از پروژه‌ها، قراردادها و لاگ‌های امنیتی</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => exportExcel('projects')} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3.5 py-2 text-xs font-semibold text-white">
            <FileSpreadsheet className="h-4 w-4" />
            <span>خروجی اکسل پروژه‌ها</span>
          </button>
          <button type="button" onClick={() => exportExcel('contracts')} className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 px-3.5 py-2 text-xs font-semibold text-white">
            <FileSpreadsheet className="h-4 w-4" />
            <span>خروجی اکسل قراردادها</span>
          </button>
          <button type="button" onClick={() => exportExcel('logs')} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-semibold dark:border-slate-700">
            <FileSpreadsheet className="h-4 w-4" />
            <span>اکسل لاگ‌ها</span>
          </button>
          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-semibold hover:bg-slate-50 dark:border-slate-700">
            <Upload className="h-4 w-4" />
            <span>بررسی فایل اکسل پروژه‌ها</span>
            <input type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={(e) => previewImport(e.target.files?.[0])} />
          </label>
        </div>
      </div>

      {importRows.length > 0 && (
        <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm font-bold">پیش‌نمایش ورود: {importRows.length} ردیف</div>
            <button type="button" onClick={importValidRows} disabled={importing || !importRows.some((row) => row.payload && row.errors.length === 0 && !row.imported)} className="rounded-lg bg-(--theme-primary) px-4 py-2 text-xs font-semibold text-white disabled:opacity-50">
              {importing ? 'در حال ورود...' : 'ثبت ردیف‌های معتبر'}
            </button>
          </div>
          <div className="max-h-80 overflow-auto">
            <table className="w-full text-start text-xs">
              <thead><tr><th className="p-2">ردیف</th><th className="p-2">پروژه</th><th className="p-2">اعتبارسنجی</th></tr></thead>
              <tbody>
                {importRows.map((row) => (
                  <tr key={row.line} className="border-t border-slate-100 align-top dark:border-slate-800">
                    <td className="p-2 tabular-nums">{row.line}</td>
                    <td className="p-2">{row.title}</td>
                    <td className={`p-2 ${row.errors.length || row.importError ? 'text-red-600' : 'text-emerald-700'}`}>{[...row.errors, ...(row.importError ? [row.importError] : [])].join(' · ') || (row.imported ? 'وارد شد' : 'آماده ورود')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <DataTable data={logs} columns={cols} pageSize={50} searchKeys={[(l) => l.user_name, (l) => l.action, (l) => l.subject_label]} />
      <Pagination page={page} lastPage={lastPage} onChange={setPage} />
    </div>
  );
};
