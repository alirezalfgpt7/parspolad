import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../services/api.ts';
import type { Department, TeamMember } from '../../types/index.ts';
import { PartnerLogoManager } from '../../components/admin/PartnerLogoManager.tsx';

export const OrganizationAdminPage: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);

  const load = async () => {
    const [d, t] = await Promise.all([
      apiRequest<{ data: Department[] }>('/admin/departments'),
      apiRequest<{ data: TeamMember[] }>('/admin/team'),
    ]);
    setDepartments(d.data);
    setTeam(t.data);
  };

  useEffect(() => {
    load().catch(() => {});
  }, []);

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

      <PartnerLogoManager />
    </div>
  );
};
