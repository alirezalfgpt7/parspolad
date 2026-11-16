import React, { useEffect, useState } from 'react';
import { Users } from 'lucide-react';
import { apiRequest } from '../../services/api.ts';
import { useAppStore } from '../../store/useAppStore.ts';
import type { Department, TeamMember } from '../../types/index.ts';
import { SeoHead } from '../../components/common/SeoHead.tsx';
import { Breadcrumb } from '../../components/ui/Breadcrumb.tsx';

export const OrgChartPage: React.FC = () => {
  const language = useAppStore((s) => s.language);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [selectedDeptId, setSelectedDeptId] = useState<number | null>(null);

  useEffect(() => {
    apiRequest<{ data: { departments: Department[]; team: TeamMember[] } }>('/departments')
      .then((r) => {
        setDepartments(r.data.departments);
        setTeam(r.data.team);
      })
      .catch(() => {});
  }, []);

  const root = departments.find((d) => d.parent_id === null);
  const children = departments.filter((d) => d.parent_id !== null);
  const activeDept = departments.find((d) => d.id === selectedDeptId) || root;
  const deptMembers = selectedDeptId ? team.filter((m) => m.department_id === selectedDeptId) : team;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <SeoHead title={language === 'fa' ? 'ساختار سازمانی' : 'Organization Chart'} />
      <Breadcrumb items={[{ label: language === 'fa' ? 'ساختار سازمانی' : 'Org Chart' }]} />

      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
          ساختار سازمانی و تیم مدیریتی پارس پولاد آقایی
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          روی هر واحد سازمانی کلیک کنید تا جزئیات مدیریت، تعداد پرسنل و اعضای کلیدی نمایش داده شود.
        </p>
      </div>

      {/* Interactive Org Tree */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-900">
        {root && (
          <div className="flex flex-col items-center">
            <button
              type="button"
              onClick={() => setSelectedDeptId(root.id)}
              style={{ borderColor: selectedDeptId === root.id ? root.color : undefined }}
              className="w-full max-w-xs rounded-xl border-2 border-slate-200 bg-slate-50 p-4 text-center transition-all hover:border-[var(--theme-primary)] dark:border-slate-700 dark:bg-slate-800"
            >
              <div className="text-xs font-bold" style={{ color: root.color }}>
                {language === 'fa' ? root.name_fa : root.name_en}
              </div>
              <div className="mt-1 text-base font-extrabold text-slate-900 dark:text-white">
                {language === 'fa' ? root.head_name_fa : root.head_name_en}
              </div>
              <div className="text-xs text-slate-500">{root.head_title_fa}</div>
            </button>

            <div className="h-8 w-px bg-slate-300 dark:bg-slate-700" />
            <div className="h-px w-full max-w-5xl bg-slate-300 dark:bg-slate-700" />

            <div className="mt-6 grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {children.map((dept) => {
                const isSelected = selectedDeptId === dept.id;
                return (
                  <button
                    key={dept.id}
                    type="button"
                    onClick={() => setSelectedDeptId(dept.id)}
                    className={`flex flex-col justify-between rounded-xl border p-4 text-start transition-all hover:-translate-y-0.5 ${
                      isSelected
                        ? 'border-[var(--theme-primary)] bg-red-50/40 dark:bg-red-950/20'
                        : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950'
                    }`}
                  >
                    <div>
                      <span className="inline-block h-1.5 w-8 rounded-full" style={{ backgroundColor: dept.color }} />
                      <h3 className="mt-2 text-xs font-bold text-slate-900 dark:text-white">
                        {language === 'fa' ? dept.name_fa : dept.name_en}
                      </h3>
                      <p className="mt-1 text-xs font-medium text-slate-600 dark:text-slate-300">
                        {language === 'fa' ? dept.head_name_fa : dept.head_name_en}
                      </p>
                      <p className="text-[11px] text-slate-400">{dept.head_title_fa}</p>
                    </div>
                    <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-500 tabular-nums">
                      <Users className="h-3.5 w-3.5" />
                      <span>{dept.member_count} نفر</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Selected Department & Key Team */}
      <div className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {selectedDeptId && activeDept
              ? `اعضای کلیدی واحد: ${activeDept.name_fa}`
              : 'مدیران و کارشناسان کلیدی شرکت'}
          </h2>
          {selectedDeptId && (
            <button
              type="button"
              onClick={() => setSelectedDeptId(null)}
              className="text-xs font-semibold text-[var(--theme-primary)] hover:underline"
            >
              نمایش همه واحدها
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {deptMembers.map((m) => (
            <div
              key={m.id}
              className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="text-base font-bold text-slate-900 dark:text-white">
                {language === 'fa' ? m.name_fa : m.name_en}
              </div>
              <div className="mt-0.5 text-xs font-semibold text-[var(--theme-primary)]">
                {language === 'fa' ? m.role_fa : m.role_en}
              </div>
              <div className="mt-3 text-xs text-slate-500 tabular-nums">
                سابقه تخصصی: {m.experience_years} سال
              </div>
              {m.phone && <div className="mt-1 text-xs text-slate-500 tabular-nums">تلفن: {m.phone}</div>}
              {m.email && <div className="mt-1 text-xs text-slate-500">{m.email}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
