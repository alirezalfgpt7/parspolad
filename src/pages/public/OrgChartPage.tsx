import React, { useEffect, useState } from 'react';
import { Mail, Phone, Users } from 'lucide-react';
import { apiRequest } from '../../services/api.ts';
import { useAppStore } from '../../store/useAppStore.ts';
import type { Department, TeamMember } from '../../types/index.ts';
import { CmsPageIntro } from '../../components/common/CmsPageIntro.tsx';
import { ProfileCardEffect, SlidingProfileCardEffect } from '../../components/effects/index.ts';

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
  const children = departments.filter((d) => d.parent_id === root?.id);
  const activeDept = departments.find((d) => d.id === selectedDeptId) || root;
  const deptMembers = selectedDeptId ? team.filter((m) => m.department_id === selectedDeptId) : team;
  const renderDepartment = (
    department: Department,
    ancestors: ReadonlySet<number> = new Set(),
  ): React.ReactNode => {
    if (ancestors.has(department.id)) return null;
    const nestedDepartments = departments.filter((item) => item.parent_id === department.id);
    const isSelected = selectedDeptId === department.id;
    const nextAncestors = new Set(ancestors).add(department.id);

    return (
      <div key={department.id} className="min-w-0">
        <button
          type="button"
          onClick={() => setSelectedDeptId(department.id)}
          className={`flex min-h-full w-full flex-col justify-between rounded-2xl border p-4 text-start transition-all hover:-translate-y-0.5 ${
            isSelected
              ? 'border-(--theme-primary) bg-(--theme-primary)/10 shadow-(--theme-card-shadow)'
              : 'border-(--theme-card-border) bg-(--theme-surface-muted) hover:border-(--theme-card-border-hover)'
          }`}
        >
          <div>
            <span className="inline-block h-1.5 w-8 rounded-full" style={{ backgroundColor: department.color }} />
            <h3 className="mt-2 text-xs font-bold text-(--theme-text)">
              {language === 'fa' ? department.name_fa : department.name_en}
            </h3>
            <p className="mt-1 text-xs font-medium text-(--theme-text-muted)">
              {language === 'fa' ? department.head_name_fa : department.head_name_en}
            </p>
            <p className="text-[11px] text-(--theme-text-muted)">{department.head_title_fa}</p>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] text-(--theme-text-muted) tabular-nums">
            <Users className="h-3.5 w-3.5" />
            <span>{department.member_count} نفر</span>
          </div>
        </button>
        {nestedDepartments.length > 0 && (
          <div className="mt-3 space-y-3 border-s-2 border-(--theme-border) ps-3">
            {nestedDepartments.map((nested) => renderDepartment(nested, nextAncestors))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <CmsPageIntro slug="org-chart" />

      {/* Interactive Org Tree */}
      <div className="rounded-2xl border border-(--theme-card-border) bg-(--theme-card-surface) p-6 shadow-(--theme-card-shadow) sm:p-8">
        {root && (
          <div className="flex flex-col items-center">
            <button
              type="button"
              onClick={() => setSelectedDeptId(root.id)}
              style={{ borderColor: selectedDeptId === root.id ? root.color : undefined }}
              className="w-full max-w-xs rounded-2xl border-2 border-(--theme-border) bg-(--theme-surface-muted) p-4 text-center transition-all hover:border-(--theme-primary-ink)"
            >
              <div className="text-xs font-bold text-(--theme-primary-ink)">
                {language === 'fa' ? root.name_fa : root.name_en}
              </div>
              <div className="mt-1 text-base font-extrabold text-(--theme-text)">
                {language === 'fa' ? root.head_name_fa : root.head_name_en}
              </div>
              <div className="text-xs text-(--theme-text-muted)">{root.head_title_fa}</div>
            </button>

            <div className="h-8 w-px bg-(--theme-border-strong)" />
            <div className="h-px w-full max-w-5xl bg-(--theme-border-strong)" />

            <div className="mt-6 grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {children.map((department) => renderDepartment(department))}
            </div>
          </div>
        )}
      </div>

      {/* Effect 046: Department Heads Showcase */}
      {departments.length > 0 && (
        <div className="mt-10">
          <h2 className="mb-4 text-lg font-bold text-(--theme-text)">
            {language === 'fa' ? 'مدیران واحدهای تخصصی' : 'Department Heads'}
          </h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {departments.slice(0, 3).map((dept) => {
              const leadMember = team.find((m) => m.department_id === dept.id && m.avatar_url);
              return (
                <ProfileCardEffect
                  key={dept.id}
                  name={language === 'fa' ? dept.head_name_fa : dept.head_name_en}
                  role={language === 'fa' ? dept.name_fa : dept.name_en}
                  subtitle={`${dept.head_title_fa} · ${dept.member_count} ${language === 'fa' ? 'نفر' : 'members'}`}
                  imageUrl={leadMember?.avatar_url}
                  accentColor={dept.color}
                  actions={
                    <button
                      type="button"
                      onClick={() => setSelectedDeptId(dept.id)}
                      className="rounded-lg bg-white/15 p-1.5 text-white hover:bg-white/30"
                      title={language === 'fa' ? 'فیلتر واحد' : 'Filter department'}
                    >
                      <Users className="h-3.5 w-3.5" />
                    </button>
                  }
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Selected Department & Key Team (Effect 066: Sliding Profile Cards) */}
      <div className="mt-12">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-(--theme-text)">
            {selectedDeptId && activeDept
              ? `${language === 'fa' ? 'اعضای کلیدی واحد' : 'Team Members'}: ${language === 'fa' ? activeDept.name_fa : activeDept.name_en}`
              : (language === 'fa' ? 'مدیران و کارشناسان کلیدی شرکت' : 'Key Specialists & Engineers')}
          </h2>
          {selectedDeptId && (
            <button
              type="button"
              onClick={() => setSelectedDeptId(null)}
              className="text-xs font-semibold text-(--theme-primary-ink) hover:underline"
            >
              {language === 'fa' ? 'نمایش همه واحدها' : 'Show All'}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {deptMembers.map((m) => (
            <SlidingProfileCardEffect
              key={m.id}
              name={language === 'fa' ? m.name_fa : m.name_en}
              role={language === 'fa' ? m.role_fa : m.role_en}
              bio={language === 'fa' ? `سابقه تخصصی: ${m.experience_years} سال در پروژه‌های سرچاهی و درون‌چاهی` : `${m.experience_years} years of oil & gas field engineering`}
              imageUrl={m.avatar_url}
              viewLabel={language === 'fa' ? 'مشاهده اطلاعات' : 'View Profile'}
              meta={
                <div className="flex flex-col gap-1">
                  {m.phone && (
                    <span className="inline-flex items-center gap-1.5 tabular-nums">
                      <Phone className="h-3 w-3" />
                      <span dir="ltr">{m.phone}</span>
                    </span>
                  )}
                  {m.email && (
                    <span className="inline-flex items-center gap-1.5 truncate">
                      <Mail className="h-3 w-3" />
                      <span>{m.email}</span>
                    </span>
                  )}
                </div>
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
};
