import React, { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { apiRequest } from '../../services/api.ts';
import { useAppStore } from '../../store/useAppStore.ts';
import type { Department, Partner, TeamMember } from '../../types/index.ts';
import { FileUploader } from '../../components/ui/FileUploader.tsx';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog.tsx';

export const OrganizationAdminPage: React.FC = () => {
  const { addToast, fetchBootstrap } = useAppStore();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [newPartnerName, setNewPartnerName] = useState('');
  const [newPartnerLogo, setNewPartnerLogo] = useState('/storage/partners/nisoc.png');
  const [deletePartner, setDeletePartner] = useState<Partner | null>(null);
  const [deletingPartner, setDeletingPartner] = useState(false);

  const load = async () => {
    const [d, t, p] = await Promise.all([
      apiRequest<{ data: Department[] }>('/admin/departments'),
      apiRequest<{ data: TeamMember[] }>('/admin/team'),
      apiRequest<{ data: Partner[] }>('/admin/partners'),
    ]);
    setDepartments(d.data);
    setTeam(t.data);
    setPartners(p.data);
  };

  useEffect(() => {
    load().catch(() => {});
  }, []);

  const confirmDeletePartner = async () => {
    if (!deletePartner) return;

    setDeletingPartner(true);
    try {
      await apiRequest(`/admin/partners/${deletePartner.id}`, { method: 'DELETE' });
      setDeletePartner(null);
      await load();
      await fetchBootstrap();
      addToast('success', 'کارفرما حذف شد.');
    } catch (error) {
      addToast('error', error instanceof Error ? error.message : 'حذف کارفرما ناموفق بود.');
    } finally {
      setDeletingPartner(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h1 className="mb-4 text-lg font-extrabold">واحدهای ساختار سازمانی و مدیران کلیدی</h1>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {departments.map((d) => (
            <div key={d.id} className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold">{d.name_fa}</span>
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: d.color }} />
              </div>
              <div className="mt-1 text-xs text-slate-600 dark:text-slate-300">{d.head_name_fa} · {d.head_title_fa}</div>
              <div className="mt-2 text-xs text-slate-400 tabular-nums">{d.member_count} پرسنل</div>
            </div>
          ))}
        </div>

        <h2 className="mb-3 mt-6 text-sm font-bold">تیم متخصصان و مدیران ({team.length})</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {team.map((m) => (
            <div key={m.id} className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-xs dark:border-slate-800 dark:bg-slate-800/50">
              <div className="font-bold">{m.name_fa}</div>
              <div className="text-slate-500">{m.role_fa}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-4 text-lg font-extrabold">مدیریت کارفرمایان و شرکای راهبردی</h2>
        <div className="mb-5 grid gap-3 sm:grid-cols-3">
          <input value={newPartnerName} onChange={(e) => setNewPartnerName(e.target.value)} placeholder="نام کارفرما یا شریک تجاری..." className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
          <FileUploader folder="partners" label="آپلود لوگوی کارفرما" onUploaded={setNewPartnerLogo} />
          <button
            type="button"
            onClick={async () => {
              if (!newPartnerName.trim()) return;
              await apiRequest('/admin/partners', {
                method: 'POST',
                body: JSON.stringify({ name_fa: newPartnerName, name_en: newPartnerName, logo_url: newPartnerLogo, sector_fa: 'نفت و گاز', is_active: true }),
              });
              setNewPartnerName('');
              await load();
              await fetchBootstrap();
              addToast('success', 'کارفرمای جدید اضافه شد.');
            }}
            style={{ backgroundColor: 'var(--theme-primary)' }}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold text-white"
          >
            <Plus className="h-4 w-4" />
            <span>افزودن کارفرما</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-5">
          {partners.map((p) => (
            <div key={p.id} className="flex flex-col items-center justify-between rounded-xl border border-slate-200 p-3 text-center dark:border-slate-800">
              <img src={p.logo_url} alt={p.name_fa} className="h-12 object-contain" />
              <div className="mt-2 text-xs font-semibold">{p.name_fa}</div>
              <button
                type="button"
                onClick={() => setDeletePartner(p)}
                className="mt-2 text-red-600"
                aria-label={`حذف ${p.name_fa}`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
      <ConfirmDialog
        open={Boolean(deletePartner)}
        onClose={() => setDeletePartner(null)}
        onConfirm={confirmDeletePartner}
        message="آیا از حذف این کارفرما یا شریک راهبردی اطمینان دارید؟"
        loading={deletingPartner}
      />
    </div>
  );
};
