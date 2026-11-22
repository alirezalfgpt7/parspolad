import React, { useEffect, useState } from 'react';
import { Building2, Pencil, Plus, Trash2 } from 'lucide-react';
import { apiRequest } from '../../services/api.ts';
import { useAppStore } from '../../store/useAppStore.ts';
import type { Department, TeamMember } from '../../types/index.ts';
import { PartnerLogoManager } from '../../components/admin/PartnerLogoManager.tsx';
import { Modal } from '../../components/ui/Modal.tsx';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader.tsx';

interface DepartmentForm {
  parent_id: string;
  name_fa: string;
  name_en: string;
  head_name_fa: string;
  head_name_en: string;
  head_title_fa: string;
  head_title_en: string;
  color: string;
  member_count: string;
  sort_order: string;
}

interface TeamForm {
  department_id: string;
  name_fa: string;
  name_en: string;
  role_fa: string;
  role_en: string;
  experience_years: string;
  email: string;
  phone: string;
  avatar_url: string;
  sort_order: string;
}

const emptyDepartment: DepartmentForm = {
  parent_id: '',
  name_fa: '',
  name_en: '',
  head_name_fa: '',
  head_name_en: '',
  head_title_fa: '',
  head_title_en: '',
  color: '#B91C1C',
  member_count: '0',
  sort_order: '0',
};

const emptyMember: TeamForm = {
  department_id: '',
  name_fa: '',
  name_en: '',
  role_fa: '',
  role_en: '',
  experience_years: '0',
  email: '',
  phone: '',
  avatar_url: '',
  sort_order: '0',
};

const inputClass = 'w-full rounded-lg border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text) placeholder:text-(--theme-placeholder) outline-none focus:border-(--theme-primary)';

export const OrganizationAdminPage: React.FC = () => {
  const addToast = useAppStore((state) => state.addToast);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [departmentModalOpen, setDepartmentModalOpen] = useState(false);
  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [departmentForm, setDepartmentForm] = useState<DepartmentForm>(emptyDepartment);
  const [memberForm, setMemberForm] = useState<TeamForm>(emptyMember);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const [departmentResponse, memberResponse] = await Promise.all([
        apiRequest<{ data: Department[] }>('/admin/departments?per_page=100'),
        apiRequest<{ data: TeamMember[] }>('/admin/team?per_page=100'),
      ]);
      setDepartments(departmentResponse.data);
      setTeam(memberResponse.data);
    } catch (error) {
      addToast('error', error instanceof Error ? error.message : 'بارگذاری ساختار سازمانی ناموفق بود.');
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const openNewDepartment = () => {
    setEditingDepartment(null);
    setDepartmentForm({ ...emptyDepartment, sort_order: String(departments.length * 10) });
    setDepartmentModalOpen(true);
  };

  const openEditDepartment = (department: Department) => {
    setEditingDepartment(department);
    setDepartmentForm({
      parent_id: department.parent_id === null ? '' : String(department.parent_id),
      name_fa: department.name_fa,
      name_en: department.name_en,
      head_name_fa: department.head_name_fa,
      head_name_en: department.head_name_en,
      head_title_fa: department.head_title_fa,
      head_title_en: department.head_title_en,
      color: department.color,
      member_count: String(department.member_count),
      sort_order: String(department.sort_order ?? 0),
    });
    setDepartmentModalOpen(true);
  };

  const saveDepartment = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    const body = {
      ...departmentForm,
      parent_id: departmentForm.parent_id ? Number(departmentForm.parent_id) : null,
      member_count: Number(departmentForm.member_count),
      sort_order: Number(departmentForm.sort_order),
    };
    try {
      await apiRequest(editingDepartment
        ? `/admin/departments/${editingDepartment.id}`
        : '/admin/departments', {
        method: editingDepartment ? 'PUT' : 'POST',
        body: JSON.stringify(body),
      });
      setDepartmentModalOpen(false);
      addToast('success', editingDepartment ? 'واحد سازمانی بروزرسانی شد.' : 'واحد سازمانی اضافه شد.');
      await load();
    } catch (error) {
      addToast('error', error instanceof Error ? error.message : 'ذخیره واحد سازمانی ناموفق بود.');
    } finally {
      setSaving(false);
    }
  };

  const deleteDepartment = async (department: Department) => {
    if (!window.confirm(`واحد «${department.name_fa}» حذف شود؟ واحدهای زیرمجموعه و کارکنان وابسته باید ابتدا منتقل شوند.`)) return;
    try {
      await apiRequest(`/admin/departments/${department.id}`, { method: 'DELETE' });
      addToast('success', 'واحد سازمانی حذف شد.');
      await load();
    } catch (error) {
      addToast('error', error instanceof Error ? error.message : 'حذف واحد سازمانی ناموفق بود.');
    }
  };

  const openNewMember = (departmentId?: number) => {
    setEditingMember(null);
    setMemberForm({
      ...emptyMember,
      department_id: departmentId ? String(departmentId) : departments[0] ? String(departments[0].id) : '',
      sort_order: String(team.length * 10),
    });
    setMemberModalOpen(true);
  };

  const openEditMember = (member: TeamMember) => {
    setEditingMember(member);
    setMemberForm({
      department_id: String(member.department_id),
      name_fa: member.name_fa,
      name_en: member.name_en,
      role_fa: member.role_fa,
      role_en: member.role_en,
      experience_years: String(member.experience_years),
      email: member.email || '',
      phone: member.phone || '',
      avatar_url: member.avatar_url || '',
      sort_order: String(member.sort_order ?? 0),
    });
    setMemberModalOpen(true);
  };

  const saveMember = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    const body = {
      ...memberForm,
      department_id: Number(memberForm.department_id),
      experience_years: Number(memberForm.experience_years),
      sort_order: Number(memberForm.sort_order),
    };
    try {
      await apiRequest(editingMember
        ? `/admin/team/${editingMember.id}`
        : '/admin/team', {
        method: editingMember ? 'PUT' : 'POST',
        body: JSON.stringify(body),
      });
      setMemberModalOpen(false);
      addToast('success', editingMember ? 'اطلاعات عضو تیم بروزرسانی شد.' : 'عضو جدید به تیم اضافه شد.');
      await load();
    } catch (error) {
      addToast('error', error instanceof Error ? error.message : 'ذخیره عضو تیم ناموفق بود.');
    } finally {
      setSaving(false);
    }
  };

  const deleteMember = async (member: TeamMember) => {
    if (!window.confirm(`اطلاعات «${member.name_fa}» از ساختار سازمانی حذف شود؟`)) return;
    try {
      await apiRequest(`/admin/team/${member.id}`, { method: 'DELETE' });
      addToast('success', 'عضو تیم حذف شد.');
      await load();
    } catch (error) {
      addToast('error', error instanceof Error ? error.message : 'حذف عضو تیم ناموفق بود.');
    }
  };

  return (
    <div className="space-y-8">
      <AdminPageHeader
        icon={Building2}
        eyebrow="Organization structure"
        title="ساختار سازمانی، مدیران و کارکنان"
        description="واحدها و زیرمجموعه‌ها را تعریف کنید و با ترتیب نمایش، چیدمان نمودار عمومی را تنظیم کنید."
        actions={(
          <button
            type="button"
            onClick={openNewDepartment}
            className="inline-flex items-center gap-1.5 rounded-lg bg-(--theme-btn-bg) px-4 py-2 text-xs font-semibold text-(--theme-btn-text) hover:bg-(--theme-btn-hover)"
          >
            <Plus className="h-4 w-4" />
            افزودن واحد
          </button>
        )}
      />
      <section className="space-y-5 rounded-2xl border border-(--theme-card-border) bg-(--theme-card-surface) p-5 shadow-(--theme-card-shadow)">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {departments.map((department) => (
            <article key={department.id} className="rounded-xl border border-(--theme-card-border) bg-(--theme-card-surface) p-4 shadow-(--theme-card-shadow)">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: department.color }} />
                    <h2 className="truncate text-sm font-bold text-(--theme-text)">{department.name_fa}</h2>
                  </div>
                  <p className="mt-1 text-[11px] text-(--theme-text-muted)" dir="ltr">{department.name_en}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button type="button" onClick={() => openEditDepartment(department)} className="rounded-md p-1.5 text-(--theme-text-muted) hover:bg-(--theme-surface-muted) hover:text-(--theme-primary-ink)" aria-label={`ویرایش ${department.name_fa}`}>
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => void deleteDepartment(department)} className="rounded-md p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30" aria-label={`حذف ${department.name_fa}`}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="mt-4 border-t border-(--theme-border) pt-3 text-xs">
                <p className="font-semibold text-(--theme-text)">{department.head_name_fa}</p>
                <p className="mt-1 text-(--theme-text-muted)">{department.head_title_fa}</p>
                <p className="mt-2 text-[11px] text-(--theme-text-muted)">
                  {department.parent_id
                    ? `زیرمجموعهٔ ${departments.find((parent) => parent.id === department.parent_id)?.name_fa || 'واحد دیگر'}`
                    : 'واحد اصلی'}
                  {' · ترتیب نمایش: '}
                  {department.sort_order ?? 0}
                </p>
              </div>
              <button
                type="button"
                onClick={() => openNewMember(department.id)}
                className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-(--theme-primary-ink) hover:underline"
              >
                <Plus className="h-3.5 w-3.5" />
                افزودن مدیر یا کارمند
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-(--theme-card-border) bg-(--theme-card-surface) p-5 shadow-(--theme-card-shadow)">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-(--theme-text)">مدیران و کارکنان ({team.length})</h2>
            <p className="mt-1 text-xs text-(--theme-text-muted)">ویرایش اطلاعات، عکس، واحد سازمانی و ترتیب نمایش کارت‌ها.</p>
          </div>
          <button
            type="button"
            onClick={() => openNewMember()}
            disabled={departments.length === 0}
            className="inline-flex items-center gap-1.5 rounded-lg border border-(--theme-border) bg-(--theme-surface) px-3 py-2 text-xs font-semibold text-(--theme-text) hover:bg-(--theme-surface-muted) disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            افزودن عضو
          </button>
        </div>
        {team.length === 0 ? (
          <p className="rounded-xl bg-(--theme-surface-muted) p-4 text-sm text-(--theme-text-muted)">
            هنوز مدیری یا کارمندی ثبت نشده است.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {team.map((member) => (
              <article key={member.id} className="flex items-start gap-3 rounded-xl border border-(--theme-card-border) bg-(--theme-card-surface) p-3 shadow-(--theme-card-shadow)">
                {member.avatar_url ? (
                  <img src={member.avatar_url} alt={member.name_fa} className="h-12 w-12 shrink-0 rounded-xl object-cover" />
                ) : (
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-(--theme-primary)/12 text-sm font-bold text-(--theme-primary-ink)">
                    {member.name_fa.slice(0, 1)}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-bold text-(--theme-text)">{member.name_fa}</h3>
                  <p className="mt-1 truncate text-xs text-(--theme-text-muted)">{member.role_fa}</p>
                  <p className="mt-1 truncate text-[11px] text-(--theme-text-muted)">
                    {departments.find((department) => department.id === member.department_id)?.name_fa || 'بدون واحد'}
                    {' · ترتیب '}
                    {member.sort_order ?? 0}
                  </p>
                </div>
                <div className="flex shrink-0">
                  <button type="button" onClick={() => openEditMember(member)} className="rounded-md p-1.5 text-(--theme-text-muted) hover:bg-(--theme-surface-muted) hover:text-(--theme-primary-ink)" aria-label={`ویرایش ${member.name_fa}`}>
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => void deleteMember(member)} className="rounded-md p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30" aria-label={`حذف ${member.name_fa}`}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <PartnerLogoManager />

      <Modal
        open={departmentModalOpen}
        onClose={() => setDepartmentModalOpen(false)}
        title={editingDepartment ? 'ویرایش واحد سازمانی' : 'افزودن واحد سازمانی'}
        size="lg"
      >
        <form onSubmit={saveDepartment} className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1 text-xs font-semibold">
            <span>نام واحد (فارسی)</span>
            <input required maxLength={255} value={departmentForm.name_fa} onChange={(event) => setDepartmentForm({ ...departmentForm, name_fa: event.target.value })} className={inputClass} />
          </label>
          <label className="space-y-1 text-xs font-semibold">
            <span>نام واحد (انگلیسی)</span>
            <input required maxLength={255} dir="ltr" value={departmentForm.name_en} onChange={(event) => setDepartmentForm({ ...departmentForm, name_en: event.target.value })} className={inputClass} />
          </label>
          <label className="space-y-1 text-xs font-semibold">
            <span>نام مدیر (فارسی)</span>
            <input required maxLength={255} value={departmentForm.head_name_fa} onChange={(event) => setDepartmentForm({ ...departmentForm, head_name_fa: event.target.value })} className={inputClass} />
          </label>
          <label className="space-y-1 text-xs font-semibold">
            <span>نام مدیر (انگلیسی)</span>
            <input required maxLength={255} dir="ltr" value={departmentForm.head_name_en} onChange={(event) => setDepartmentForm({ ...departmentForm, head_name_en: event.target.value })} className={inputClass} />
          </label>
          <label className="space-y-1 text-xs font-semibold">
            <span>سمت مدیر (فارسی)</span>
            <input required maxLength={255} value={departmentForm.head_title_fa} onChange={(event) => setDepartmentForm({ ...departmentForm, head_title_fa: event.target.value })} className={inputClass} />
          </label>
          <label className="space-y-1 text-xs font-semibold">
            <span>سمت مدیر (انگلیسی)</span>
            <input required maxLength={255} dir="ltr" value={departmentForm.head_title_en} onChange={(event) => setDepartmentForm({ ...departmentForm, head_title_en: event.target.value })} className={inputClass} />
          </label>
          <label className="space-y-1 text-xs font-semibold">
            <span>واحد بالادست (برای ساخت زیرمجموعه)</span>
            <select value={departmentForm.parent_id} onChange={(event) => setDepartmentForm({ ...departmentForm, parent_id: event.target.value })} className={inputClass}>
              <option value="">واحد اصلی</option>
              {departments.filter((department) => department.id !== editingDepartment?.id).map((department) => (
                <option key={department.id} value={department.id}>{department.name_fa}</option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-xs font-semibold">
            <span>رنگ واحد</span>
            <input type="color" value={departmentForm.color} onChange={(event) => setDepartmentForm({ ...departmentForm, color: event.target.value })} className="h-10 w-full rounded-lg border border-(--theme-input-border) bg-(--theme-input-bg) p-1" />
          </label>
          <label className="space-y-1 text-xs font-semibold">
            <span>تعداد پرسنل</span>
            <input type="number" min="0" value={departmentForm.member_count} onChange={(event) => setDepartmentForm({ ...departmentForm, member_count: event.target.value })} className={inputClass} />
          </label>
          <label className="space-y-1 text-xs font-semibold">
            <span>ترتیب نمایش (عدد کمتر، بالاتر)</span>
            <input type="number" min="0" value={departmentForm.sort_order} onChange={(event) => setDepartmentForm({ ...departmentForm, sort_order: event.target.value })} className={inputClass} />
          </label>
          <button type="submit" disabled={saving} className="mt-2 rounded-lg bg-(--theme-btn-bg) px-4 py-2.5 text-xs font-semibold text-(--theme-btn-text) hover:bg-(--theme-btn-hover) disabled:opacity-60 sm:col-span-2">
            {saving ? 'در حال ذخیره...' : 'ذخیره واحد سازمانی'}
          </button>
        </form>
      </Modal>

      <Modal
        open={memberModalOpen}
        onClose={() => setMemberModalOpen(false)}
        title={editingMember ? 'ویرایش مدیر یا کارمند' : 'افزودن مدیر یا کارمند'}
        size="lg"
      >
        <form onSubmit={saveMember} className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1 text-xs font-semibold">
            <span>نام (فارسی)</span>
            <input required maxLength={255} value={memberForm.name_fa} onChange={(event) => setMemberForm({ ...memberForm, name_fa: event.target.value })} className={inputClass} />
          </label>
          <label className="space-y-1 text-xs font-semibold">
            <span>نام (انگلیسی)</span>
            <input required maxLength={255} dir="ltr" value={memberForm.name_en} onChange={(event) => setMemberForm({ ...memberForm, name_en: event.target.value })} className={inputClass} />
          </label>
          <label className="space-y-1 text-xs font-semibold">
            <span>سمت (فارسی)</span>
            <input required maxLength={255} value={memberForm.role_fa} onChange={(event) => setMemberForm({ ...memberForm, role_fa: event.target.value })} className={inputClass} />
          </label>
          <label className="space-y-1 text-xs font-semibold">
            <span>سمت (انگلیسی)</span>
            <input required maxLength={255} dir="ltr" value={memberForm.role_en} onChange={(event) => setMemberForm({ ...memberForm, role_en: event.target.value })} className={inputClass} />
          </label>
          <label className="space-y-1 text-xs font-semibold">
            <span>واحد سازمانی</span>
            <select required value={memberForm.department_id} onChange={(event) => setMemberForm({ ...memberForm, department_id: event.target.value })} className={inputClass}>
              <option value="">انتخاب واحد</option>
              {departments.map((department) => <option key={department.id} value={department.id}>{department.name_fa}</option>)}
            </select>
          </label>
          <label className="space-y-1 text-xs font-semibold">
            <span>سابقه (سال)</span>
            <input type="number" min="0" max="100" value={memberForm.experience_years} onChange={(event) => setMemberForm({ ...memberForm, experience_years: event.target.value })} className={inputClass} />
          </label>
          <label className="space-y-1 text-xs font-semibold">
            <span>ایمیل</span>
            <input type="email" maxLength={255} dir="ltr" value={memberForm.email} onChange={(event) => setMemberForm({ ...memberForm, email: event.target.value })} className={inputClass} />
          </label>
          <label className="space-y-1 text-xs font-semibold">
            <span>تلفن</span>
            <input type="tel" maxLength={30} dir="ltr" value={memberForm.phone} onChange={(event) => setMemberForm({ ...memberForm, phone: event.target.value })} className={inputClass} />
          </label>
          <label className="space-y-1 text-xs font-semibold sm:col-span-2">
            <span>نشانی تصویر پرسنلی</span>
            <input maxLength={255} dir="ltr" value={memberForm.avatar_url} onChange={(event) => setMemberForm({ ...memberForm, avatar_url: event.target.value })} className={inputClass} placeholder="/storage/..." />
          </label>
          <label className="space-y-1 text-xs font-semibold">
            <span>ترتیب نمایش کارت (عدد کمتر، بالاتر)</span>
            <input type="number" min="0" value={memberForm.sort_order} onChange={(event) => setMemberForm({ ...memberForm, sort_order: event.target.value })} className={inputClass} />
          </label>
          <button type="submit" disabled={saving || departments.length === 0} className="mt-2 rounded-lg bg-(--theme-btn-bg) px-4 py-2.5 text-xs font-semibold text-(--theme-btn-text) hover:bg-(--theme-btn-hover) disabled:opacity-60 sm:col-span-2">
            {saving ? 'در حال ذخیره...' : 'ذخیره اطلاعات'}
          </button>
        </form>
      </Modal>
    </div>
  );
};
