import React, { useEffect, useRef, useState } from 'react';
import { Pencil, Plus, Shield, Trash2, Users } from 'lucide-react';
import { z } from 'zod';
import { apiRequest } from '../../services/api.ts';
import { useAppStore } from '../../store/useAppStore.ts';
import type { Role, User } from '../../types/index.ts';
import { DataTable, type Column } from '../../components/ui/DataTable.tsx';
import { Modal } from '../../components/ui/Modal.tsx';
import { SearchableSelect } from '../../components/ui/SearchableSelect.tsx';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader.tsx';

interface UserForm {
  name: string;
  email: string;
  phone: string;
  role: string;
  password: string;
}

interface RoleForm {
  name: string;
  label_fa: string;
  label_en: string;
  permissions: string[];
}

const emptyUser: UserForm = { name: '', email: '', phone: '', role: '', password: '' };
const emptyRole: RoleForm = { name: '', label_fa: '', label_en: '', permissions: [] };
const systemRoles = ['super-admin', 'admin', 'editor', 'project_manager', 'client', 'content-manager', 'operator', 'user'];
const USER_PAGE_SIZES = [5, 10, 20, 50] as const;
const isSuperAdminRole = (role?: string): boolean => ['super-admin', 'super_admin'].includes(role ?? '');
const userFormSchema = z.object({
  name: z.string().trim().min(1, 'نام کاربر الزامی است.').max(120),
  email: z.string().trim().email('ایمیل معتبر وارد کنید.').max(255),
  phone: z.string().max(30),
  role: z.string().min(1, 'نقش کاربر را انتخاب کنید.'),
  password: z.string().refine((value) => value === '' || value.length >= 8, 'رمز عبور باید حداقل ۸ نویسه باشد.'),
});
const roleFormSchema = z.object({
  name: z.string().regex(/^[a-z][a-z0-9_-]{1,63}$/, 'شناسه نقش باید با حرف کوچک شروع شود و فقط حروف کوچک، عدد، خط تیره یا زیرخط داشته باشد.'),
  label_fa: z.string().trim().min(1, 'نام فارسی نقش الزامی است.').max(120),
  label_en: z.string().trim().min(1, 'نام انگلیسی نقش الزامی است.').max(120),
  permissions: z.array(z.string()),
});

export const UsersRolesAdminPage: React.FC = () => {
  const { addToast, language, user: currentUser } = useAppStore();
  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [userTotal, setUserTotal] = useState(0);
  const [perPage, setPerPage] = useState<number>(10);
  const [userSearch, setUserSearch] = useState('');
  const [appliedUserSearch, setAppliedUserSearch] = useState('');
  const [userSortBy, setUserSortBy] = useState('name');
  const [userSortOrder, setUserSortOrder] = useState<'asc' | 'desc'>('asc');
  const userLoadRequest = useRef(0);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [userForm, setUserForm] = useState<UserForm>(emptyUser);
  const [roleForm, setRoleForm] = useState<RoleForm>(emptyRole);
  const permissionNamesFa: Record<string, string> = {
    'dashboard.view': 'مشاهدهٔ داشبورد',
    'analytics.view': 'مشاهدهٔ آمار و تحلیل‌ها',
    'theme.manage': 'مدیریت تم',
    'themes.manage': 'مدیریت تم‌ها',
    'slider.manage': 'مدیریت اسلایدر',
    'sliders.manage': 'مدیریت اسلایدرها',
    'projects.manage': 'مدیریت پروژه‌ها',
    'projects.view': 'مشاهدهٔ پروژه‌ها',
    'contracts.manage': 'مدیریت قراردادها',
    'contracts.view': 'مشاهدهٔ قراردادها',
    'licenses.manage': 'مدیریت گواهینامه‌ها',
    'licenses.view': 'مشاهدهٔ گواهینامه‌ها',
    'menus.manage': 'مدیریت منوها',
    'cms.manage': 'مدیریت محتوای سایت',
    'pages.manage': 'مدیریت صفحات',
    'organization.manage': 'مدیریت ساختار سازمانی',
    'media.manage': 'مدیریت کتابخانه رسانه',
    'messages.manage': 'مدیریت پیام‌ها',
    'messages.view': 'مشاهدهٔ پیام‌ها',
    'comments.manage': 'مدیریت دیدگاه‌ها',
    'users.manage': 'مدیریت کاربران و نقش‌ها',
    'users.view': 'مشاهدهٔ کاربران و نقش‌ها',
    'settings.manage': 'مدیریت تنظیمات سامانه',
    'reports.export': 'دریافت گزارش‌ها',
    'documents.download_authorized': 'دریافت اسناد مجاز',
    'profile.manage': 'مدیریت پروفایل',
    'notifications.view': 'مشاهدهٔ اعلان‌ها',
    'logs.view': 'مشاهدهٔ گزارش رویدادها',
  };
  const permissionNamesEn: Record<string, string> = {
    'dashboard.view': 'View dashboard',
    'analytics.view': 'View analytics',
    'theme.manage': 'Manage theme',
    'themes.manage': 'Manage themes',
    'slider.manage': 'Manage slider',
    'sliders.manage': 'Manage sliders',
    'projects.manage': 'Manage projects',
    'projects.view': 'View projects',
    'contracts.manage': 'Manage contracts',
    'contracts.view': 'View contracts',
    'licenses.manage': 'Manage licenses',
    'licenses.view': 'View licenses',
    'menus.manage': 'Manage menus',
    'cms.manage': 'Manage site content',
    'pages.manage': 'Manage pages',
    'organization.manage': 'Manage organization',
    'media.manage': 'Manage media library',
    'messages.manage': 'Manage messages',
    'messages.view': 'View messages',
    'comments.manage': 'Manage comments',
    'users.manage': 'Manage users and roles',
    'users.view': 'View users and roles',
    'settings.manage': 'Manage system settings',
    'reports.export': 'Export reports',
    'documents.download_authorized': 'Download authorized documents',
    'profile.manage': 'Manage profile',
    'notifications.view': 'View notifications',
    'logs.view': 'View activity logs',
  };

  useEffect(() => {
    const timer = window.setTimeout(() => setAppliedUserSearch(userSearch.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [userSearch]);

  const load = async (targetPage = page) => {
    const requestId = ++userLoadRequest.current;
    try {
      const params = new URLSearchParams({
        page: String(targetPage),
        per_page: String(perPage),
        sort_by: userSortBy,
        sort_order: userSortOrder,
      });
      if (appliedUserSearch) params.set('q', appliedUserSearch);
      const response = await apiRequest<{
        users: User[];
        users_meta: { last_page: number; total: number };
        roles: Role[];
        permissions: string[];
      }>(`/admin/users?${params.toString()}`);
      if (requestId !== userLoadRequest.current) return;
      if (targetPage > response.users_meta.last_page) {
        setPage(Math.max(1, response.users_meta.last_page));
        return;
      }
      setUsers(response.users);
      setLastPage(response.users_meta.last_page);
      setUserTotal(response.users_meta.total);
      setRoles(response.roles);
      setPermissions(response.permissions);
    } catch (error) {
      if (requestId === userLoadRequest.current) {
        addToast('error', error instanceof Error ? error.message : 'دریافت کاربران و نقش‌ها ناموفق بود.');
      }
    }
  };

  useEffect(() => {
    void load(page);
  }, [page, perPage, appliedUserSearch, userSortBy, userSortOrder]);

  const openNewUser = () => {
    setEditingUser(null);
    setUserForm({ ...emptyUser, role: roles.find((role) => role.name !== 'super-admin')?.name ?? '' });
    setUserModalOpen(true);
  };

  const openEditUser = (user: User) => {
    setEditingUser(user);
    setUserForm({ name: user.name, email: user.email, phone: user.phone ?? '', role: user.role, password: '' });
    setUserModalOpen(true);
  };

  const saveUser = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsed = userFormSchema.safeParse(userForm);
    if (!parsed.success) {
      addToast('error', parsed.error.issues[0]?.message ?? 'اطلاعات کاربر معتبر نیست.');
      return;
    }
    const body: Record<string, string> = {
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      role: parsed.data.role,
    };
    if (parsed.data.password) body.password = parsed.data.password;
    if (!editingUser && !body.password) {
      addToast('error', 'برای کاربر جدید رمز عبور الزامی است.');
      return;
    }

    try {
      await apiRequest(editingUser ? `/admin/users/${editingUser.id}` : '/admin/users', {
        method: editingUser ? 'PUT' : 'POST',
        body: JSON.stringify(body),
      });
      setUserModalOpen(false);
      addToast('success', editingUser ? 'اطلاعات کاربر بروزرسانی شد.' : 'کاربر جدید ایجاد شد.');
      await load();
    } catch (error) {
      addToast('error', error instanceof Error ? error.message : 'ذخیره کاربر ناموفق بود.');
    }
  };

  const deleteUser = async (user: User) => {
    if (!window.confirm(`حساب «${user.name}» به‌صورت نرم حذف و نشست‌های فعال آن باطل شود؟`)) return;
    try {
      await apiRequest(`/admin/users/${user.id}`, { method: 'DELETE' });
      addToast('success', 'کاربر حذف شد و نشست‌های فعال او باطل شدند.');
      await load();
    } catch (error) {
      addToast('error', error instanceof Error ? error.message : 'حذف کاربر ناموفق بود.');
    }
  };

  const togglePermission = async (role: Role, permission: string) => {
    if (role.name === 'super-admin') return;
    const nextPermissions = role.permissions.includes(permission)
      ? role.permissions.filter((item) => item !== permission)
      : [...role.permissions, permission];
    try {
      await apiRequest(`/admin/roles/${role.id}`, {
        method: 'PUT',
        body: JSON.stringify({ permissions: nextPermissions }),
      });
      addToast('success', `دسترسی‌های نقش ${role.label_fa} بروزرسانی شد.`);
      await load();
    } catch (error) {
      addToast('error', error instanceof Error ? error.message : 'بروزرسانی دسترسی ناموفق بود.');
    }
  };

  const saveRole = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsed = roleFormSchema.safeParse(roleForm);
    if (!parsed.success) {
      addToast('error', parsed.error.issues[0]?.message ?? 'اطلاعات نقش معتبر نیست.');
      return;
    }
    try {
      await apiRequest(editingRole ? `/admin/roles/${editingRole.id}` : '/admin/roles', {
        method: editingRole ? 'PUT' : 'POST',
        body: JSON.stringify(parsed.data),
      });
      setRoleModalOpen(false);
      setEditingRole(null);
      setRoleForm(emptyRole);
      addToast('success', editingRole ? 'نقش بروزرسانی شد.' : 'نقش جدید ایجاد شد.');
      await load();
    } catch (error) {
      addToast('error', error instanceof Error ? error.message : 'ایجاد نقش ناموفق بود.');
    }
  };

  const deleteRole = async (role: Role) => {
    if (!window.confirm(`نقش «${role.label_fa}» حذف شود؟`)) return;
    try {
      await apiRequest(`/admin/roles/${role.id}`, { method: 'DELETE' });
      addToast('success', 'نقش حذف شد.');
      await load();
    } catch (error) {
      addToast('error', error instanceof Error ? error.message : 'حذف نقش ناموفق بود.');
    }
  };

  const openEditRole = (role: Role) => {
    setEditingRole(role);
    setRoleForm({
      name: role.name,
      label_fa: role.label_fa,
      label_en: role.label_en,
      permissions: role.permissions.filter((permission) => permission !== '*'),
    });
    setRoleModalOpen(true);
  };

  const openNewRole = () => {
    setEditingRole(null);
    setRoleForm(emptyRole);
    setRoleModalOpen(true);
  };

  const userCols: Column<User>[] = [
    { key: 'name', sortKey: 'name', header: 'نام کاربر', render: (user) => <span className="font-bold">{user.name}</span> },
    { key: 'email', sortKey: 'email', hideable: true, header: 'ایمیل', render: (user) => <span dir="ltr" className="text-xs">{user.email}</span> },
    {
      key: 'role',
      hideable: true,
      header: 'نقش کاربری',
      render: (user) => (
        <div className="w-44">
          <SearchableSelect
            disabled={isSuperAdminRole(user.role)}
            options={roles.map((role) => ({ value: role.name, label: role.label_fa }))}
            value={user.role}
            onChange={async (role) => {
              try {
                await apiRequest(`/admin/users/${user.id}`, { method: 'PUT', body: JSON.stringify({ role }) });
                addToast('success', 'نقش کاربر تغییر یافت.');
                await load();
              } catch (error) {
                addToast('error', error instanceof Error ? error.message : 'تغییر نقش ناموفق بود.');
              }
            }}
          />
        </div>
      ),
    },
    {
      key: 'active',
      hideable: true,
      header: 'وضعیت',
      render: (user) => (
        <button
          type="button"
          disabled={isSuperAdminRole(user.role)}
          onClick={async () => {
            try {
              await apiRequest(`/admin/users/${user.id}`, { method: 'PUT', body: JSON.stringify({ is_active: !user.is_active }) });
              addToast('success', user.is_active ? 'کاربر غیرفعال شد و نشست‌های او باطل شدند.' : 'کاربر فعال شد.');
              await load();
            } catch (error) {
              addToast('error', error instanceof Error ? error.message : 'تغییر وضعیت کاربر ناموفق بود.');
            }
          }}
          className={`text-xs font-semibold ${user.is_active ? 'text-emerald-600' : 'text-red-600'}`}
        >
          {user.is_active ? 'فعال' : 'غیرفعال'}
        </button>
      ),
    },
    {
      key: 'actions',
      header: 'عملیات',
      render: (user) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={isSuperAdminRole(user.role) && !isSuperAdminRole(currentUser?.role)}
            onClick={() => openEditUser(user)}
            title={isSuperAdminRole(user.role) && !isSuperAdminRole(currentUser?.role) ? 'فقط سوپر ادمین می‌تواند حساب سوپر ادمین را ویرایش کند.' : 'ویرایش کاربر'}
            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-slate-800"
            aria-label={`ویرایش کاربر ${user.name}`}
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button type="button" disabled={isSuperAdminRole(user.role)} onClick={() => void deleteUser(user)} className="rounded-md p-1.5 text-red-600 hover:bg-red-50 disabled:opacity-40 dark:hover:bg-red-950/30" aria-label="حذف کاربر">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  const permissionRows = permissions.map((permission) => ({ permission }));
  const permissionSearchKeys = [
    (row: { permission: string }) => row.permission,
    (row: { permission: string }) => permissionNamesFa[row.permission] || '',
    (row: { permission: string }) => permissionNamesEn[row.permission] || '',
  ];
  const permissionColumns: Column<{ permission: string }>[] = [
    {
      key: 'permission',
      header: language === 'fa' ? 'صفحه و دسترسی' : 'Page & permission',
      className: 'min-w-[220px]',
      render: ({ permission }) => (
        <div>
          <div className="font-semibold text-(--theme-text)">
            {language === 'fa'
              ? permissionNamesFa[permission] || permission
              : permissionNamesEn[permission] || permission}
          </div>
          {language === 'fa' && (
            <div dir="ltr" className="mt-0.5 text-start font-mono text-[10px] text-(--theme-text-muted)">
              {permission}
            </div>
          )}
        </div>
      ),
    },
    ...roles.map((role): Column<{ permission: string }> => ({
      key: `role-${role.id}`,
      hideable: true,
      visibilityLabel: role.label_fa,
      header: (
        <div className="min-w-28">
          <span>{role.label_fa}</span>
          {!systemRoles.includes(role.name) && (
            <button type="button" onClick={() => openEditRole(role)} className="ms-2 text-(--theme-text-muted) hover:text-(--theme-primary-ink)" aria-label={`ویرایش نقش ${role.label_fa}`}>
              <Pencil className="inline h-3.5 w-3.5" />
            </button>
          )}
          {!systemRoles.includes(role.name) && (
            <button type="button" onClick={() => void deleteRole(role)} disabled={(role.users_count ?? 0) > 0} className="ms-2 text-red-600 disabled:opacity-40" aria-label={`حذف نقش ${role.label_fa}`}>
              <Trash2 className="inline h-3.5 w-3.5" />
            </button>
          )}
        </div>
      ),
      align: 'center',
      className: 'min-w-28',
      render: ({ permission }) => {
        const checked = role.permissions.includes('*') || role.permissions.includes(permission);
        return (
          <input
            type="checkbox"
            disabled={role.name === 'super-admin'}
            checked={checked}
            onChange={() => void togglePermission(role, permission)}
            className="h-4 w-4 accent-(--theme-primary)"
            aria-label={`${permission} برای ${role.label_fa}`}
          />
        );
      },
    })),
  ];

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <AdminPageHeader
          icon={Users}
          eyebrow="User management"
          title="مدیریت کاربران سامانه"
          description="حساب‌های کاربری، نقش‌ها و دسترسی‌های سامانه را مدیریت کنید."
          actions={(
            <button type="button" onClick={openNewUser} className="inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-(--theme-btn-bg) px-4 py-2 text-sm font-semibold text-(--theme-btn-text) hover:bg-(--theme-btn-hover)">
              <Plus className="h-4 w-4" />
              <span>کاربر جدید</span>
            </button>
          )}
        />
        <DataTable
          data={users}
          columns={userCols}
          rowKey={(user) => user.id}
          tableLabel="فهرست کاربران"
          pageSize={perPage}
          pageSizeOptions={USER_PAGE_SIZES}
          onPageSizeChange={(size) => {
            setPerPage(size);
            setPage(1);
          }}
          currentPage={page}
          lastPage={lastPage}
          total={userTotal}
          onPageChange={setPage}
          searchValue={userSearch}
          onSearchChange={(value) => {
            setUserSearch(value);
            setPage(1);
          }}
          searchPlaceholder="جست‌وجوی نام یا ایمیل..."
          searchLabel="جست‌وجوی کاربران"
          sortBy={userSortBy}
          sortDirection={userSortOrder}
          onSortChange={(field, direction) => {
            setUserSortBy(field);
            setUserSortOrder(direction);
            setPage(1);
          }}
        />
      </div>

      <div className="rounded-2xl border border-(--theme-card-border) bg-(--theme-card-surface) p-5 shadow-(--theme-card-shadow)">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-base font-bold text-(--theme-text)">
            <Shield className="h-5 w-5 text-(--theme-primary-ink)" />
            <span>ماتریس نقش‌ها و دسترسی‌ها (Permission Matrix)</span>
          </h2>
          <button type="button" onClick={openNewRole} className="inline-flex items-center gap-1 rounded-lg border border-(--theme-border) bg-(--theme-surface) px-3 py-2 text-xs font-semibold text-(--theme-text) hover:bg-(--theme-surface-muted)">
            <Plus className="h-4 w-4" />
            <span>نقش جدید</span>
          </button>
        </div>
        <DataTable
          data={permissionRows}
          columns={permissionColumns}
          searchKeys={permissionSearchKeys}
          searchPlaceholder="جست‌وجوی عنوان یا شناسهٔ دسترسی..."
          searchLabel="جست‌وجوی دسترسی‌ها"
          rowKey={(row) => row.permission}
          tableLabel="ماتریس نقش‌ها و دسترسی‌ها"
          pageSize={10}
          pageSizeOptions={USER_PAGE_SIZES}
          emptyText="دسترسی‌ای برای نمایش وجود ندارد."
        />
      </div>

      <Modal open={userModalOpen} onClose={() => setUserModalOpen(false)} title={editingUser ? 'ویرایش کاربر' : 'ایجاد کاربر جدید'} size="md">
        <form onSubmit={saveUser} className="space-y-3">
          <label className="block space-y-1 text-xs font-medium text-(--theme-text)">
            <span className="block">نام و نام خانوادگی *</span>
            <input required maxLength={120} placeholder="نام و نام خانوادگی" value={userForm.name} onChange={(event) => setUserForm({ ...userForm, name: event.target.value })} className="w-full rounded-lg border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text) placeholder:text-(--theme-placeholder) outline-none focus:border-(--theme-primary)" />
          </label>
          <label className="block space-y-1 text-xs font-medium text-(--theme-text)">
            <span className="block">ایمیل *</span>
            <input required type="email" dir="ltr" placeholder="email@company.ir" value={userForm.email} onChange={(event) => setUserForm({ ...userForm, email: event.target.value })} className="w-full rounded-lg border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text) placeholder:text-(--theme-placeholder) outline-none focus:border-(--theme-primary)" />
          </label>
          <label className="block space-y-1 text-xs font-medium text-(--theme-text)">
            <span className="block">شماره تماس (اختیاری)</span>
            <input dir="ltr" maxLength={30} placeholder="شماره تماس" value={userForm.phone} onChange={(event) => setUserForm({ ...userForm, phone: event.target.value })} className="w-full rounded-lg border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text) placeholder:text-(--theme-placeholder) outline-none focus:border-(--theme-primary)" />
          </label>
          <SearchableSelect label="نقش" options={roles.map((role) => ({ value: role.name, label: role.label_fa }))} value={userForm.role} onChange={(role) => setUserForm({ ...userForm, role })} />
          <label className="block space-y-1 text-xs font-medium text-(--theme-text)">
            <span className="block">{editingUser ? 'رمز عبور جدید (اختیاری)' : 'رمز عبور *'}</span>
            <input required={!editingUser} minLength={8} type="password" dir="ltr" autoComplete="new-password" placeholder={editingUser ? 'حداقل ۸ کاراکتر' : 'حداقل ۸ کاراکتر'} value={userForm.password} onChange={(event) => setUserForm({ ...userForm, password: event.target.value })} className="w-full rounded-lg border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text) placeholder:text-(--theme-placeholder) outline-none focus:border-(--theme-primary)" />
          </label>
          <button type="submit" className="w-full rounded-lg bg-(--theme-btn-bg) py-2 text-xs font-semibold text-(--theme-btn-text) hover:bg-(--theme-btn-hover)">
            {editingUser ? 'ذخیره تغییرات' : 'ایجاد کاربر'}
          </button>
        </form>
      </Modal>

      <Modal open={roleModalOpen} onClose={() => { setRoleModalOpen(false); setEditingRole(null); setRoleForm(emptyRole); }} title={editingRole ? 'ویرایش نقش' : 'ایجاد نقش جدید'} size="md">
        <form onSubmit={saveRole} className="space-y-4">
          {!editingRole && (
            <label className="block space-y-1 text-xs font-medium text-(--theme-text)">
              <span className="block">شناسه نقش *</span>
              <input required pattern="[a-z][a-z0-9_-]*" maxLength={64} dir="ltr" placeholder="quality-reviewer" value={roleForm.name} onChange={(event) => setRoleForm({ ...roleForm, name: event.target.value })} className="w-full rounded-lg border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text) placeholder:text-(--theme-placeholder) outline-none focus:border-(--theme-primary)" />
            </label>
          )}
          <label className="block space-y-1 text-xs font-medium text-(--theme-text)">
            <span className="block">نام فارسی نقش *</span>
            <input required maxLength={120} placeholder="نام فارسی نقش" value={roleForm.label_fa} onChange={(event) => setRoleForm({ ...roleForm, label_fa: event.target.value })} className="w-full rounded-lg border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text) placeholder:text-(--theme-placeholder) outline-none focus:border-(--theme-primary)" />
          </label>
          <label className="block space-y-1 text-xs font-medium text-(--theme-text)">
            <span className="block">نام انگلیسی نقش *</span>
            <input required maxLength={120} dir="ltr" placeholder="Role label" value={roleForm.label_en} onChange={(event) => setRoleForm({ ...roleForm, label_en: event.target.value })} className="w-full rounded-lg border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text) placeholder:text-(--theme-placeholder) outline-none focus:border-(--theme-primary)" />
          </label>
          <fieldset className="max-h-56 space-y-2 overflow-y-auto rounded-lg border border-(--theme-border) bg-(--theme-surface-muted) p-3">
            <legend className="px-1 text-xs font-semibold text-(--theme-text)">دسترسی‌های نقش</legend>
            {permissions.map((permission) => (
              <label key={permission} className="flex items-center gap-2 text-xs text-(--theme-text)">
                <input
                  type="checkbox"
                  checked={roleForm.permissions.includes(permission)}
                  onChange={() => setRoleForm((current) => ({
                    ...current,
                    permissions: current.permissions.includes(permission)
                      ? current.permissions.filter((item) => item !== permission)
                      : [...current.permissions, permission],
                  }))}
                  className="h-4 w-4 accent-(--theme-primary)"
                />
                <span className="font-mono">{permission}</span>
              </label>
            ))}
          </fieldset>
          <button type="submit" className="w-full rounded-lg bg-(--theme-btn-bg) py-2 text-xs font-semibold text-(--theme-btn-text) hover:bg-(--theme-btn-hover)">{editingRole ? 'ذخیره نقش' : 'ایجاد نقش'}</button>
        </form>
      </Modal>
    </div>
  );
};
