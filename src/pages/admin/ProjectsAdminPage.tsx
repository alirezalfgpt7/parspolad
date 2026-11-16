import React, { useEffect, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { apiRequest } from '../../services/api.ts';
import { useAppStore } from '../../store/useAppStore.ts';
import type { Project, ProjectCategory, ProjectStatus } from '../../types/index.ts';
import { ColorPicker } from '../../components/ui/ColorPicker.tsx';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog.tsx';
import { DataTable, type Column } from '../../components/ui/DataTable.tsx';
import { FileUploader } from '../../components/ui/FileUploader.tsx';
import { Modal } from '../../components/ui/Modal.tsx';
import { SearchableSelect } from '../../components/ui/SearchableSelect.tsx';

export const ProjectsAdminPage: React.FC = () => {
  const { addToast, fetchBootstrap } = useAppStore();
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<ProjectCategory[]>([]);
  const [editing, setEditing] = useState<Partial<Project> | null>(null);
  const [catModal, setCatModal] = useState<Partial<ProjectCategory> | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deletingProject, setDeletingProject] = useState(false);

  const load = async () => {
    const [pr, ct] = await Promise.all([
      apiRequest<{ data: Project[] }>('/admin/projects'),
      apiRequest<{ data: ProjectCategory[] }>('/admin/categories'),
    ]);
    setProjects(pr.data);
    setCategories(ct.data);
  };

  useEffect(() => {
    load().catch(() => {});
  }, []);

  const saveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    try {
      if (editing.id) {
        await apiRequest(`/admin/projects/${editing.id}`, { method: 'PUT', body: JSON.stringify(editing) });
      } else {
        await apiRequest('/admin/projects', { method: 'POST', body: JSON.stringify({ ...editing, images: [editing.cover_image || '/storage/hero/hero-rig.jpg'], videos: [], documents: [], standards: ['API 6A', 'ISO 9001'] }) });
      }
      setEditing(null);
      await load();
      addToast('success', 'پروژه ذخیره شد.');
    } catch (err) {
      addToast('error', err instanceof Error ? err.message : 'خطا در ذخیره');
    }
  };

  const saveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catModal) return;
    try {
      if (catModal.id) {
        await apiRequest(`/admin/categories/${catModal.id}`, { method: 'PUT', body: JSON.stringify(catModal) });
      } else {
        await apiRequest('/admin/categories', { method: 'POST', body: JSON.stringify(catModal) });
      }
      setCatModal(null);
      await load();
      await fetchBootstrap();
      addToast('success', 'دسته‌بندی فنی ذخیره شد.');
    } catch {
      addToast('error', 'خطا در ذخیره دسته‌بندی');
    }
  };

  const confirmDeleteProject = async () => {
    if (deleteId === null) return;

    setDeletingProject(true);
    try {
      await apiRequest(`/admin/projects/${deleteId}`, { method: 'DELETE' });
      setDeleteId(null);
      await load();
      addToast('success', 'پروژه حذف شد.');
    } catch (error) {
      addToast('error', error instanceof Error ? error.message : 'حذف پروژه ناموفق بود.');
    } finally {
      setDeletingProject(false);
    }
  };

  const cols: Column<Project>[] = [
    { key: 'title', header: 'عنوان پروژه', sortValue: (p) => p.title_fa, render: (p) => <span className="font-semibold">{p.title_fa}</span> },
    { key: 'client', header: 'کارفرما', render: (p) => <span>{p.client_name_fa}</span> },
    { key: 'contract', header: 'شماره قرارداد', render: (p) => <span className="font-mono text-xs">{p.contract_number}</span> },
    { key: 'year', header: 'سال', sortValue: (p) => p.year, render: (p) => <span>{p.year}</span> },
    {
      key: 'actions',
      header: 'عملیات',
      render: (p) => (
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setEditing(p)} className="rounded p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800"><Pencil className="h-4 w-4" /></button>
          <button type="button" onClick={() => setDeleteId(p.id)} className="rounded p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"><Trash2 className="h-4 w-4" /></button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-extrabold">مدیریت پروژه‌ها و دسته‌بندی‌های فنی</h1>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setCatModal({ name_fa: '', name_en: '', slug: `cat-${Date.now()}`, icon: 'Layers', color: '#B91C1C' })}
            className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold dark:border-slate-700 dark:bg-slate-900"
          >
            + دسته فنی جدید
          </button>
          <button
            type="button"
            onClick={() => setEditing({ slug: `proj-${Date.now()}`, title_fa: '', title_en: '', category_id: categories[0]?.id || 1, client_name_fa: '', client_name_en: '', contract_number: '', contract_type_fa: 'ساخت و تولید', contract_type_en: 'Manufacturing', location_fa: 'اهواز', location_en: 'Ahvaz', year: 1404, status: 'in_progress', summary_fa: '', summary_en: '', description_fa: '', description_en: '', cover_image: '/storage/hero/hero-rig.jpg', is_featured: true })}
            style={{ backgroundColor: 'var(--theme-primary)' }}
            className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold text-white"
          >
            <Plus className="h-4 w-4" />
            <span>پروژه جدید</span>
          </button>
        </div>
      </div>

      {/* Category Chips with Color */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((c) => (
          <div key={c.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="h-3.5 w-3.5 rounded shrink-0" style={{ backgroundColor: c.color }} />
              <span className="truncate text-xs font-bold">{c.name_fa}</span>
            </div>
            <button type="button" onClick={() => setCatModal(c)} className="text-xs text-[var(--theme-primary)] hover:underline shrink-0">ویرایش</button>
          </div>
        ))}
      </div>

      <DataTable data={projects} columns={cols} searchKeys={[(p) => p.title_fa, (p) => p.client_name_fa, (p) => p.contract_number]} />

      <Modal open={Boolean(editing)} onClose={() => setEditing(null)} title={editing?.id ? 'ویرایش پروژه' : 'افزودن پروژه جدید'} size="lg">
        {editing && (
          <form onSubmit={saveProject} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium">عنوان فارسی پروژه</label>
                <input required value={editing.title_fa || ''} onChange={(e) => setEditing({ ...editing, title_fa: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium">عنوان انگلیسی</label>
                <input dir="ltr" value={editing.title_en || ''} onChange={(e) => setEditing({ ...editing, title_en: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <SearchableSelect
                label="دسته فنی"
                options={categories.map((c) => ({ value: String(c.id), label: c.name_fa }))}
                value={String(editing.category_id || '')}
                onChange={(v) => setEditing({ ...editing, category_id: Number(v) })}
              />
              <div>
                <label className="mb-1 block text-xs font-medium">کارفرما</label>
                <input required value={editing.client_name_fa || ''} onChange={(e) => setEditing({ ...editing, client_name_fa: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium">شماره قرارداد</label>
                <input dir="ltr" value={editing.contract_number || ''} onChange={(e) => setEditing({ ...editing, contract_number: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-medium">سال اجرا</label>
                <input type="number" value={editing.year || 1404} onChange={(e) => setEditing({ ...editing, year: Number(e.target.value) })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium">موقعیت جغرافیایی</label>
                <input value={editing.location_fa || ''} onChange={(e) => setEditing({ ...editing, location_fa: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
              </div>
              <SearchableSelect
                label="وضعیت"
                options={[{ value: 'in_progress', label: 'در حال اجرا' }, { value: 'completed', label: 'تکمیل‌شده' }, { value: 'contracted', label: 'قرارداد شده' }]}
                value={editing.status || 'in_progress'}
                onChange={(v) => setEditing({ ...editing, status: v as ProjectStatus })}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium">خلاصه و شرح فنی</label>
              <textarea rows={3} value={editing.summary_fa || ''} onChange={(e) => setEditing({ ...editing, summary_fa: e.target.value, description_fa: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
            </div>
            <FileUploader folder="projects" label="آپلود تصویر کاور یا مدرک فنی پروژه" onUploaded={(url) => setEditing({ ...editing, cover_image: url })} />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setEditing(null)} className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold dark:border-slate-700">انصراف</button>
              <button type="submit" style={{ backgroundColor: 'var(--theme-primary)' }} className="rounded-lg px-5 py-2 text-xs font-semibold text-white">ذخیره پروژه</button>
            </div>
          </form>
        )}
      </Modal>

      <Modal open={Boolean(catModal)} onClose={() => setCatModal(null)} title="مدیریت دسته‌بندی فنی" size="sm">
        {catModal && (
          <form onSubmit={saveCategory} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium">نام فارسی دسته</label>
              <input required value={catModal.name_fa || ''} onChange={(e) => setCatModal({ ...catModal, name_fa: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium">نام انگلیسی</label>
              <input dir="ltr" value={catModal.name_en || ''} onChange={(e) => setCatModal({ ...catModal, name_en: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
            </div>
            <ColorPicker label="رنگ دسته فنی" value={catModal.color || '#B91C1C'} onChange={(c) => setCatModal({ ...catModal, color: c })} />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setCatModal(null)} className="rounded-lg border border-slate-200 px-4 py-2 text-xs dark:border-slate-700">انصراف</button>
              <button type="submit" style={{ backgroundColor: 'var(--theme-primary)' }} className="rounded-lg px-4 py-2 text-xs font-semibold text-white">ذخیره</button>
            </div>
          </form>
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        message="آیا از حذف این پروژه اطمینان دارید؟"
        onConfirm={confirmDeleteProject}
        loading={deletingProject}
      />
    </div>
  );
};
