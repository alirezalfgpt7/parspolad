import React, { useEffect, useState } from 'react';
import { Plus, Shield } from 'lucide-react';
import { apiRequest } from '../../services/api.ts';
import { useAppStore } from '../../store/useAppStore.ts';
import type { Role, User } from '../../types/index.ts';
import { DataTable, type Column } from '../../components/ui/DataTable.tsx';
import { Modal } from '../../components/ui/Modal.tsx';
import { SearchableSelect } from '../../components/ui/SearchableSelect.tsx';

const ALL_PERMISSIONS = [
  'projects.manage', 'contracts.manage', 'licenses.manage', 'slider.manage',
  'themes.manage', 'menus.manage', 'pages.manage', 'media.manage',
  'messages.manage', 'users.view', 'users.manage', 'reports.export', 'settings.manage',
];

export const UsersRolesAdminPage: React.FC = () => {
  const { addToast } = useAppStore();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', phone: '', role: 'content-manager', password: 'User@1404' });

  const load = () => {
    apiRequest<{ users: User[]; roles: Role[] }>('/admin/users')
      .then((r) => {
        setUsers(r.users);
        setRoles(r.roles);
      })
      .catch(() => {});
  };

  useEffect(() => {
    load();
  }, []);

  const togglePermission = async (role: Role, perm: string) => {
    if (role.name === 'super-admin') return;
    const has = role.permissions.includes(perm);
    const nextPerms = has ? role.permissions.filter((p) => p !== perm) : [...role.permissions, perm];
    await apiRequest(`/admin/roles/${role.id}`, {
      method: 'PUT',
      body: JSON.stringify({ permissions: nextPerms }),
    });
    addToast('success', `دسترسی‌های نقش ${role.label_fa} بروزرسانی شد.`);
    load();
  };

  const userCols: Column<User>[] = [
    { key: 'name', header: 'نام کاربر', render: (u) => <span className="font-bold">{u.name}</span> },
    { key: 'email', header: 'ایمیل', render: (u) => <span dir="ltr" className="text-xs">{u.email}</span> },
    {
      key: 'role',
      header: 'نقش کاربری',
      render: (u) => (
        <div className="w-44">
          <SearchableSelect
            disabled={u.role === 'super-admin'}
            options={roles.map((r) => ({ value: r.name, label: r.label_fa }))}
            value={u.role}
            onChange={async (role) => {
              await apiRequest(`/admin/users/${u.id}`, { method: 'PUT', body: JSON.stringify({ role }) });
              addToast('success', 'نقش کاربر تغییر یافت.');
              load();
            }}
          />
        </div>
      ),
    },
    {
      key: 'active',
      header: 'وضعیت',
      render: (u) => (
        <button
          type="button"
          disabled={u.role === 'super-admin'}
          onClick={async () => {
            await apiRequest(`/admin/users/${u.id}`, { method: 'PUT', body: JSON.stringify({ is_active: !u.is_active }) });
            load();
          }}
          className={`text-xs font-semibold ${u.is_active ? 'text-emerald-600' : 'text-red-600'}`}
        >
          {u.is_active ? 'فعال' : 'غیرفعال'}
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-extrabold">مدیریت کاربران سامانه</h1>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            style={{ backgroundColor: 'var(--theme-primary)' }}
            className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold text-white"
          >
            <Plus className="h-4 w-4" />
            <span>کاربر جدید</span>
          </button>
        </div>
        <DataTable data={users} columns={userCols} searchKeys={[(u) => u.name, (u) => u.email]} />
      </div>

      {/* RBAC Permission Matrix */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-4 flex items-center gap-2 text-base font-bold">
          <Shield className="h-5 w-5 text-[var(--theme-primary)]" />
          <span>ماتریس نقش‌ها و دسترسی‌ها (Permission Matrix)</span>
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <th className="py-2.5 text-start font-bold">مجوز (Permission)</th>
                {roles.map((r) => (
                  <th key={r.id} className="px-3 py-2.5 text-center font-bold">{r.label_fa}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {ALL_PERMISSIONS.map((perm) => (
                <tr key={perm}>
                  <td className="py-2.5 font-mono text-slate-600 dark:text-slate-300">{perm}</td>
                  {roles.map((r) => {
                    const checked = r.permissions.includes('*') || r.permissions.includes(perm);
                    return (
                      <td key={r.id} className="px-3 py-2.5 text-center">
                        <input
                          type="checkbox"
                          disabled={r.name === 'super-admin'}
                          checked={checked}
                          onChange={() => togglePermission(r, perm)}
                          className="h-4 w-4 accent-[var(--theme-primary)]"
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="ایجاد کاربر جدید" size="sm">
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            await apiRequest('/admin/users', { method: 'POST', body: JSON.stringify(newUser) });
            setModalOpen(false);
            load();
            addToast('success', 'کاربر جدید ایجاد شد.');
          }}
          className="space-y-3"
        >
          <input required placeholder="نام و نام خانوادگی" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
          <input required type="email" dir="ltr" placeholder="email@company.ir" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
          <SearchableSelect
            label="نقش"
            options={roles.map((r) => ({ value: r.name, label: r.label_fa }))}
            value={newUser.role}
            onChange={(role) => setNewUser({ ...newUser, role })}
          />
          <input required type="password" dir="ltr" placeholder="رمز عبور" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
          <button type="submit" style={{ backgroundColor: 'var(--theme-primary)' }} className="w-full rounded-lg py-2 text-xs font-semibold text-white">ایجاد کاربر</button>
        </form>
      </Modal>
    </div>
  );
};
