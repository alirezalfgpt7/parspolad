import React, { useEffect, useState } from 'react';
import { Plus, Save, Trash2 } from 'lucide-react';
import { apiRequest } from '../../services/api.ts';
import { useAppStore } from '../../store/useAppStore.ts';
import type { Menu, MenuItem } from '../../types/index.ts';
import { FileUploader } from '../../components/ui/FileUploader.tsx';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog.tsx';

export const MegaMenuAdminPage: React.FC = () => {
  const { fetchBootstrap, addToast } = useAppStore();
  const [menus, setMenus] = useState<Menu[]>([]);
  const [selectedMenuId, setSelectedMenuId] = useState<number>(1);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'root'; index: number } | { type: 'child'; parentIndex: number; childIndex: number } | null>(null);

  useEffect(() => {
    apiRequest<{ data: Menu[] }>('/admin/menus').then((r) => setMenus(r.data)).catch(() => {});
  }, []);

  const currentMenu = menus.find((m) => m.id === selectedMenuId);

  const updateItem = (idx: number, patch: Partial<MenuItem>) => {
    if (!currentMenu) return;
    const nextItems = currentMenu.items.map((item, i) => (i === idx ? { ...item, ...patch } : item));
    setMenus((prev) => prev.map((m) => (m.id === currentMenu.id ? { ...m, items: nextItems } : m)));
  };

  const addChild = (idx: number) => {
    if (!currentMenu) return;
    const parent = currentMenu.items[idx];
    const child: MenuItem = {
      id: Date.now(),
      menu_id: currentMenu.id,
      parent_id: parent.id,
      title_fa: 'زیرمنو جدید',
      title_en: 'New Submenu',
      url: '/products',
      image: '/storage/products/liner-hanger.webp',
      description_fa: 'توضیح کوتاه مگا منو',
      sort_order: (parent.children?.length || 0) + 1,
      is_active: true,
    };
    updateItem(idx, { children: [...(parent.children || []), child] });
  };

  const addRootItem = () => {
    if (!currentMenu) return;
    const item: MenuItem = {
      id: Date.now(),
      menu_id: currentMenu.id,
      parent_id: null,
      title_fa: 'آیتم منوی جدید',
      title_en: 'New Menu Item',
      url: '/',
      image: '',
      description_fa: '',
      sort_order: currentMenu.items.length + 1,
      is_active: true,
    };
    setMenus((prev) => prev.map((menu) => (
      menu.id === currentMenu.id ? { ...menu, items: [...menu.items, item] } : menu
    )));
  };

  const removeRootItem = (idx: number) => {
    if (!currentMenu) return;
    setMenus((prev) => prev.map((menu) => (
      menu.id === currentMenu.id
        ? { ...menu, items: menu.items.filter((_, itemIndex) => itemIndex !== idx) }
        : menu
    )));
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === 'root') {
      removeRootItem(deleteTarget.index);
    } else {
      const parent = currentMenu?.items[deleteTarget.parentIndex];
      if (parent) {
        updateItem(deleteTarget.parentIndex, {
          children: (parent.children || []).filter((_, idx) => idx !== deleteTarget.childIndex),
        });
      }
    }
    setDeleteTarget(null);
  };

  const saveMenu = async () => {
    if (!currentMenu) return;
    await apiRequest(`/admin/menus/${currentMenu.id}`, {
      method: 'PUT',
      body: JSON.stringify({ items: currentMenu.items }),
    });
    await fetchBootstrap();
    addToast('success', 'منو و مگا منو با موفقیت بروزرسانی شد.');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div>
          <h1 className="text-lg font-extrabold">مدیریت مگا منو و منوهای هدر/فوتر</h1>
          <p className="mt-1 text-xs text-slate-500">تعریف آیتم‌های منو و زیرمنوهای تصویری مگا منو</p>
        </div>
        <div className="flex gap-2">
          {menus.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setSelectedMenuId(m.id)}
              className={`rounded-lg px-3.5 py-2 text-xs font-semibold ${
                selectedMenuId === m.id ? 'bg-[var(--theme-primary)] text-white' : 'border border-slate-200 dark:border-slate-700'
              }`}
            >
              {m.title_fa}
            </button>
          ))}
          <button
            type="button"
            onClick={addRootItem}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold dark:border-slate-700"
          >
            <Plus className="h-4 w-4" />
            <span>آیتم اصلی جدید</span>
          </button>
          <button
            type="button"
            onClick={saveMenu}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white"
          >
            <Save className="h-4 w-4" />
            <span>ذخیره منو</span>
          </button>
        </div>
      </div>

      {currentMenu && (
        <div className="space-y-4">
          {currentMenu.items.map((item, idx) => (
            <div key={item.id} className="rounded-xl border border-slate-200 bg-white p-5 space-y-4 dark:border-slate-800 dark:bg-slate-900">
              <div className="grid gap-3 sm:grid-cols-4">
                <input value={item.title_fa} onChange={(e) => updateItem(idx, { title_fa: e.target.value })} placeholder="عنوان فارسی" className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
                <input dir="ltr" value={item.title_en} onChange={(e) => updateItem(idx, { title_en: e.target.value })} placeholder="English Title" className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
                <input dir="ltr" value={item.url} onChange={(e) => updateItem(idx, { url: e.target.value })} placeholder="/url" className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
                <div className="flex items-center justify-end gap-2">
                  <button type="button" onClick={() => setDeleteTarget({ type: 'root', index: idx })} aria-label="حذف آیتم اصلی" className="rounded-lg p-2 text-red-600 hover:bg-red-50">
                    <Trash2 className="h-4 w-4" />
                  </button>
                  {currentMenu.key === 'header' && (
                    <button type="button" onClick={() => addChild(idx)} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold dark:border-slate-700">
                      <Plus className="h-3.5 w-3.5" />
                      <span>زیرمنو تصویری</span>
                    </button>
                  )}
                </div>
              </div>

              {item.children && item.children.length > 0 && (
                <div className="grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2 dark:border-slate-800">
                  {item.children.map((ch, cIdx) => (
                    <div key={ch.id} className="space-y-2 rounded-lg border border-slate-100 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-800/40">
                      <div className="flex items-center justify-between gap-2">
                        <input
                          value={ch.title_fa}
                          onChange={(e) => {
                            const nextChildren = item.children!.map((c, j) => (j === cIdx ? { ...c, title_fa: e.target.value } : c));
                            updateItem(idx, { children: nextChildren });
                          }}
                          className="flex-1 rounded border border-slate-200 px-2.5 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-900"
                        />
                        <button
                          type="button"
                          onClick={() => setDeleteTarget({ type: 'child', parentIndex: idx, childIndex: cIdx })}
                          className="text-red-600 p-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <input
                        dir="ltr"
                        value={ch.url}
                        onChange={(e) => {
                          const nextChildren = item.children!.map((c, j) => (j === cIdx ? { ...c, url: e.target.value } : c));
                          updateItem(idx, { children: nextChildren });
                        }}
                        className="w-full rounded border border-slate-200 px-2.5 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-900"
                      />
                      <FileUploader
                        folder="menus"
                        label={ch.image ? 'تغییر تصویر آیتم مگامنو' : 'آپلود تصویر مگامنو'}
                        onUploaded={(url) => {
                          const nextChildren = item.children!.map((c, j) => (j === cIdx ? { ...c, image: url } : c));
                          updateItem(idx, { children: nextChildren });
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
              <ConfirmDialog
                open={Boolean(deleteTarget)}
                onClose={() => setDeleteTarget(null)}
                onConfirm={confirmDelete}
                message="این آیتم و زیرمنوهای وابسته از منو حذف خواهند شد. ادامه می‌دهید؟"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
