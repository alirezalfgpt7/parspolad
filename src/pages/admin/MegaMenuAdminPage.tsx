import React, { useEffect, useState } from 'react';
import { ChevronDown, PanelBottom, PanelTop, Plus, Save, Trash2 } from 'lucide-react';
import { apiRequest } from '../../services/api.ts';
import { useAppStore } from '../../store/useAppStore.ts';
import type { Menu, MenuItem } from '../../types/index.ts';
import { FileUploader } from '../../components/ui/FileUploader.tsx';
import { DynamicLucideIcon, LUCIDE_ICON_REGISTRY } from '../../components/ui/LucideIconMap.tsx';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog.tsx';

const menuItemAccents = [
  {
    border: 'border-sky-500',
    header: 'border-sky-200 bg-sky-50/80 dark:border-sky-900 dark:bg-sky-950/30',
    badge: 'bg-sky-100 text-sky-700 dark:bg-sky-900/70 dark:text-sky-300',
  },
  {
    border: 'border-emerald-500',
    header: 'border-emerald-200 bg-emerald-50/80 dark:border-emerald-900 dark:bg-emerald-950/30',
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/70 dark:text-emerald-300',
  },
  {
    border: 'border-amber-500',
    header: 'border-amber-200 bg-amber-50/80 dark:border-amber-900 dark:bg-amber-950/30',
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/70 dark:text-amber-300',
  },
  {
    border: 'border-violet-500',
    header: 'border-violet-200 bg-violet-50/80 dark:border-violet-900 dark:bg-violet-950/30',
    badge: 'bg-violet-100 text-violet-700 dark:bg-violet-900/70 dark:text-violet-300',
  },
];

export const MegaMenuAdminPage: React.FC = () => {
  const { fetchBootstrap, addToast } = useAppStore();
  const [menus, setMenus] = useState<Menu[]>([]);
  const [selectedMenuId, setSelectedMenuId] = useState<number>(1);
  const [expandedItems, setExpandedItems] = useState<Set<number>>(() => new Set());
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'root'; index: number } | { type: 'child'; parentIndex: number; childIndex: number } | null>(null);

  useEffect(() => {
    apiRequest<{ data: Menu[] }>('/admin/menus').then((r) => setMenus(r.data)).catch(() => {});
  }, []);

  const currentMenu = menus.find((m) => m.id === selectedMenuId);

  const toggleItemCollapsed = (itemId: number) => {
    setExpandedItems((current) => {
      const next = new Set(current);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

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
      icon: 'Layers',
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
        <div className="flex flex-wrap items-center gap-3">
          <div role="group" aria-label="انتخاب منوی اصلی" className="flex flex-wrap gap-1 rounded-2xl border border-slate-200 bg-slate-100 p-1.5 dark:border-slate-700 dark:bg-slate-950/60">
            {menus.map((m) => {
              const isSelected = selectedMenuId === m.id;
              const MenuIcon = m.key === 'header' ? PanelTop : PanelBottom;
              return (
                <button
                  key={m.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setSelectedMenuId(m.id)}
                  className={`flex min-w-40 items-center gap-2.5 rounded-xl border px-3 py-2 text-start transition-all ${
                    isSelected
                      ? 'border-white bg-white text-slate-900 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white'
                      : 'border-transparent text-slate-600 hover:bg-white/70 dark:text-slate-400 dark:hover:bg-slate-800/70'
                  }`}
                >
                  <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${
                    isSelected
                      ? 'bg-(--theme-primary) text-white shadow-sm'
                      : 'bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                  }`}>
                    <MenuIcon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-xs font-bold">{m.title_fa}</span>
                    <span className={`mt-0.5 block text-[10px] ${isSelected ? 'text-(--theme-primary)' : 'text-slate-500 dark:text-slate-500'}`}>
                      {m.key === 'header' ? 'منوی سربرگ سایت' : 'منوی پابرگ سایت'}
                    </span>
                  </span>
                  <span className={`ms-auto h-2 w-2 shrink-0 rounded-full ${
                    isSelected ? 'bg-(--theme-primary)' : 'bg-slate-300 dark:bg-slate-700'
                  }`} />
                </button>
              );
            })}
          </div>
          <div aria-hidden="true" className="hidden h-10 w-px bg-slate-200 sm:block dark:bg-slate-700" />
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={addRootItem}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold transition-colors hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" />
              <span>آیتم اصلی جدید</span>
            </button>
            <button
              type="button"
              onClick={saveMenu}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700"
            >
              <Save className="h-4 w-4" />
              <span>ذخیره منو</span>
            </button>
          </div>
        </div>
      </div>

      {currentMenu && (
        <div className="space-y-4">
          {currentMenu.items.map((item, idx) => {
            const accent = menuItemAccents[idx % menuItemAccents.length];
            const isCollapsed = !expandedItems.has(item.id);
            return (
            <div key={item.id} className={`overflow-hidden rounded-xl border border-slate-200 border-s-4 ${accent.border} bg-white dark:border-slate-800 dark:bg-slate-900`}>
              <button
                type="button"
                aria-label={`${isCollapsed ? 'بازکردن' : 'بستن'} ${item.title_fa || `آیتم اصلی ${idx + 1}`}`}
                aria-expanded={!isCollapsed}
                onClick={() => toggleItemCollapsed(item.id)}
                className={`flex w-full items-center gap-3 border-b px-5 py-2.5 text-start ${accent.header}`}
              >
                <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg text-xs font-extrabold ${accent.badge}`}>
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <DynamicLucideIcon name={item.icon || undefined} fallback="Layers" className="h-4 w-4 shrink-0 text-(--theme-primary)" />
                <span className="truncate text-xs font-bold text-slate-800 dark:text-slate-100">
                  {item.title_fa || `آیتم اصلی ${idx + 1}`}
                </span>
                <span className="ms-auto shrink-0 text-[10px] font-medium text-slate-500 dark:text-slate-400">آیتم منوی اصلی</span>
                <ChevronDown className={`h-4 w-4 shrink-0 text-slate-500 transition-transform duration-200 ${isCollapsed ? '-rotate-90' : ''}`} />
              </button>
              <div hidden={isCollapsed} className={isCollapsed ? 'hidden' : 'space-y-4 p-5'}>
                <div className="grid gap-3 sm:grid-cols-5">
                <input value={item.title_fa} onChange={(e) => updateItem(idx, { title_fa: e.target.value })} placeholder="عنوان فارسی" className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
                <input dir="ltr" value={item.title_en} onChange={(e) => updateItem(idx, { title_en: e.target.value })} placeholder="English Title" className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
                <input dir="ltr" value={item.url} onChange={(e) => updateItem(idx, { url: e.target.value })} placeholder="/url" className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
                <label className="flex min-w-0 items-center gap-2 rounded-lg border border-slate-200 px-2.5 dark:border-slate-700">
                  <DynamicLucideIcon name={item.icon || undefined} fallback="Layers" className="h-4 w-4 shrink-0 text-(--theme-primary)" />
                  <select
                    aria-label={`آیکن ${item.title_fa}`}
                    value={item.icon || ''}
                    onChange={(event) => updateItem(idx, { icon: event.target.value || null })}
                    className="min-w-0 flex-1 bg-transparent py-2 text-xs outline-none dark:bg-slate-800"
                  >
                    <option value="">بدون آیکن</option>
                    {Object.entries(LUCIDE_ICON_REGISTRY).map(([name, entry]) => (
                      <option key={name} value={name}>{entry.label}</option>
                    ))}
                  </select>
                </label>
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
                        aria-label={`لینک ${ch.title_fa}`}
                        value={ch.url}
                        onChange={(e) => {
                          const nextChildren = item.children!.map((c, j) => (j === cIdx ? { ...c, url: e.target.value } : c));
                          updateItem(idx, { children: nextChildren });
                        }}
                        placeholder="/projects?category=slug"
                        className="w-full rounded border border-slate-200 px-2.5 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-900"
                      />
                      <p dir="ltr" className="text-[11px] text-slate-500">برای نمایش پروژه‌های یک دسته: /projects?category=slug</p>
                      <input
                        dir="ltr"
                        aria-label={`عنوان انگلیسی ${ch.title_fa}`}
                        value={ch.title_en}
                        onChange={(e) => {
                          const nextChildren = item.children!.map((c, j) => (j === cIdx ? { ...c, title_en: e.target.value } : c));
                          updateItem(idx, { children: nextChildren });
                        }}
                        placeholder="English title"
                        className="w-full rounded border border-slate-200 px-2.5 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-900"
                      />
                      <textarea
                        aria-label={`توضیح کوتاه ${ch.title_fa}`}
                        value={ch.description_fa || ''}
                        onChange={(e) => {
                          const nextChildren = item.children!.map((c, j) => (j === cIdx ? { ...c, description_fa: e.target.value } : c));
                          updateItem(idx, { children: nextChildren });
                        }}
                        placeholder="توضیح کوتاه فارسی"
                        rows={2}
                        className="w-full rounded border border-slate-200 px-2.5 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-900"
                      />
                      <textarea
                        aria-label={`توضیح کوتاه انگلیسی ${ch.title_fa}`}
                        value={ch.description_en || ''}
                        onChange={(e) => {
                          const nextChildren = item.children!.map((c, j) => (j === cIdx ? { ...c, description_en: e.target.value } : c));
                          updateItem(idx, { children: nextChildren });
                        }}
                        placeholder="Short English description"
                        rows={2}
                        className="w-full rounded border border-slate-200 px-2.5 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-900"
                      />
                      <FileUploader
                        folder="menus"
                        currentUrl={ch.image}
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
              </div>
              <ConfirmDialog
                open={Boolean(deleteTarget)}
                onClose={() => setDeleteTarget(null)}
                onConfirm={confirmDelete}
                message="این آیتم و زیرمنوهای وابسته از منو حذف خواهند شد. ادامه می‌دهید؟"
              />
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
