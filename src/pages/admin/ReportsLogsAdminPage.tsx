import React, { useEffect, useState } from 'react';
import { FileSpreadsheet, Upload } from 'lucide-react';
import * as XLSX from 'xlsx';
import { apiRequest } from '../../services/api.ts';
import { useAppStore } from '../../store/useAppStore.ts';
import type { ActivityLog } from '../../types/index.ts';
import { DataTable, type Column } from '../../components/ui/DataTable.tsx';
import { Pagination } from '../../components/ui/Pagination.tsx';

export const ReportsLogsAdminPage: React.FC = () => {
  const { token, addToast } = useAppStore();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

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
    const res = await fetch(`/api/v1/admin/reports/export/${entity}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `parspolad-${entity}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('success', `گزارش اکسل (${entity}) دانلود شد.`);
  };

  const handleImportExcel = async (file?: File) => {
    if (!file) return;
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf, { type: 'array' });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);
    for (const r of rows.slice(0, 10)) {
      await apiRequest('/admin/projects', {
        method: 'POST',
        body: JSON.stringify({
          slug: `import-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          title_fa: String(r['عنوان پروژه'] || r['title'] || 'پروژه ایمپورت‌شده'),
          title_en: String(r['title_en'] || 'Imported Project'),
          category_id: 1,
          client_name_fa: String(r['کارفرما'] || r['client'] || 'کارفرما'),
          client_name_en: String(r['client'] || 'Client'),
          contract_number: String(r['شماره قرارداد'] || r['contract'] || 'IMP-1404'),
          contract_type_fa: 'ساخت و تولید',
          contract_type_en: 'Manufacturing',
          location_fa: String(r['محل اجرا'] || 'اهواز'),
          location_en: 'Ahvaz',
          year: Number(r['سال'] || 1404),
          status: 'in_progress',
          summary_fa: 'وارد شده از فایل اکسل',
          summary_en: 'Imported from Excel',
          description_fa: 'وارد شده از فایل اکسل',
          description_en: 'Imported from Excel',
          standards: ['API 6A'],
          cover_image: '/storage/hero/hero-rig.jpg',
          images: ['/storage/hero/hero-rig.jpg'],
          videos: [],
          documents: [],
          is_featured: false,
        }),
      });
    }
    addToast('success', `${Math.min(rows.length, 10)} ردیف از فایل اکسل وارد سیستم شد.`);
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
            <span>ورود پروژه‌ها از اکسل</span>
            <input type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={(e) => handleImportExcel(e.target.files?.[0])} />
          </label>
        </div>
      </div>

      <DataTable data={logs} columns={cols} pageSize={50} searchKeys={[(l) => l.user_name, (l) => l.action, (l) => l.subject_label]} />
      <Pagination page={page} lastPage={lastPage} onChange={setPage} />
    </div>
  );
};
