import React, { useEffect, useState } from 'react';
import { ChevronDown, GripVertical, PanelBottom, PanelTop, Plus, Save, Trash2 } from 'lucide-react';
import { apiRequest } from '../../services/api.ts';
import { useAppStore } from '../../store/useAppStore.ts';
import type { Menu, MenuItem } from '../../types/index.ts';
import { FileUploader } from '../../components/ui/FileUploader.tsx';
import { DynamicLucideIcon, LUCIDE_ICON_REGISTRY } from '../../components/ui/LucideIconMap.tsx';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog.tsx';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader.tsx';

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

type DraggedMenuItem =
  | { type: 'root'; menuId: number; index: number }
  | { type: 'child'; menuId: number; parentIndex: number; index: number };

const reorderItems = (items: MenuItem[], fromIndex: number, toIndex: number): MenuItem[] => {
  const reordered = [...items];
  const [moved] = reordered.splice(fromIndex, 1);
  if (!moved) return items;
  reordered.splice(toIndex, 0, moved);

  return reordered.map((item, index) => ({ ...item, sort_order: index + 1 }));
};

export const MegaMenuAdminPage: React.FC = () => {
  const { fetchBootstrap, addToast } = useAppStore();
  const [menus, setMenus] = useState<Menu[]>([]);
  const [selectedMenuId, setSelectedMenuId] = useState<number>(1);
  const [expandedItems, setExpandedItems] = useState<Set<number>>(() => new Set());
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'root'; index: number } | { type: 'child'; parentIndex: number; childIndex: number } | null>(null);
  const [draggedItem, setDraggedItem] = useState<DraggedMenuItem | null>(null);

  useEffect(() => {
    apiRequest<{ data: Menu[] }>('/admin/menus')
      .then((r) => setMenus(r.data))
      .catch((error: unknown) => addToast('error', error instanceof Error ? error.message : 'دریافت منو ناموفق بود.'));
  }, [addToast]);

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

  const startDragging = (event: React.DragEvent<HTMLButtonElement>, item: DraggedMenuItem) => {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', `${item.type}:${item.index}`);
    setDraggedItem(item);
  };

  const dropRootItem = (event: React.DragEvent<HTMLDivElement>, targetIndex: number) => {
    event.preventDefault();
    event.stopPropagation();
    if (
      !currentMenu
      || draggedItem?.type !== 'root'
      || draggedItem.menuId !== currentMenu.id
      || draggedItem.index === targetIndex
    ) {
      setDraggedItem(null);
      return;
    }

    setMenus((previous) => previous.map((menu) => (
      menu.id === currentMenu.id
        ? { ...menu, items: reorderItems(menu.items, draggedItem.index, targetIndex) }
        : menu
    )));
    setDraggedItem(null);
  };

  const dropChildItem = (
    event: React.DragEvent<HTMLDivElement>,
    parentIndex: number,
    targetIndex: number,
  ) => {
    event.preventDefault();
    event.stopPropagation();
    if (
      !currentMenu
      || draggedItem?.type !== 'child'
      || draggedItem.menuId !== currentMenu.id
      || draggedItem.parentIndex !== parentIndex
      || draggedItem.index === targetIndex
    ) {
      setDraggedItem(null);
      return;
    }

    setMenus((previous) => previous.map((menu) => {
      if (menu.id !== currentMenu.id) return menu;
      const parent = menu.items[parentIndex];
      if (!parent?.children) return menu;

      const items = [...menu.items];
      items[parentIndex] = {
        ...parent,
        children: reorderItems(parent.children, draggedItem.index, targetIndex),
      };
      return { ...menu, items };
    }));
    setDraggedItem(null);
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
      image: '',
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
    try {
      await apiRequest(`/admin/menus/${currentMenu.id}`, {
        method: 'PUT',
        body: JSON.stringify({ items: currentMenu.items }),
      });
      await fetchBootstrap();
      addToast('success', 'منو و مگا منو با موفقیت بروزرسانی شد.');
    } catch (error) {
      addToast('error', error instanceof Error ? error.message : 'ذخیره منو ناموفق بود.');
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        icon={PanelTop}
        eyebrow="Navigation & mega menu"
        title="مدیریت مگا منو و منوهای هدر/فوتر"
        description="زیرمنوها در مگا منوی سایت به‌شکل فهرست متنی نمایش داده می‌شوند؛ با رفتن نشانگر یا فوکوس روی هر مورد، تصویر و توضیح همان مورد در پیش‌نمایش دیده می‌شود. برای تغییر ترتیب، دستگیره کنار آیتم را بکشید و سپس منو را ذخیره کنید."
        actions={(
          <div className="flex flex-wrap items-center gap-3">
          <div role="group" aria-label="انتخاب منوی اصلی" className="flex flex-wrap gap-1 rounded-2xl border border-(--theme-border) bg-(--theme-surface-muted) p-1.5">
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
                      ? 'border-(--theme-card-border) bg-(--theme-surface) text-(--theme-text) shadow-sm'
                      : 'border-transparent text-(--theme-text-muted) hover:bg-(--theme-surface)/70 hover:text-(--theme-text)'
                  }`}
                >
                  <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${
                    isSelected
                      ? 'bg-(--theme-primary) text-(--theme-primary-foreground) shadow-sm'
                      : 'border border-(--theme-border) bg-(--theme-surface) text-(--theme-text-muted)'
                  }`}>
                    <MenuIcon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-xs font-bold">{m.title_fa}</span>
                    <span className={`mt-0.5 block text-[10px] ${isSelected ? 'text-(--theme-primary-ink)' : 'text-(--theme-text-muted)'}`}>
                      {m.key === 'header' ? 'منوی سربرگ سایت' : 'منوی پابرگ سایت'}
                    </span>
                  </span>
                  <span className={`ms-auto h-2 w-2 shrink-0 rounded-full ${
                    isSelected ? 'bg-(--theme-primary)' : 'bg-(--theme-border-strong)'
                  }`} />
                </button>
              );
            })}
          </div>
          <div aria-hidden="true" className="hidden h-10 w-px bg-(--theme-border) sm:block" />
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={addRootItem}
              className="inline-flex items-center gap-1.5 rounded-xl border border-(--theme-border) bg-(--theme-surface) px-3 py-2 text-xs font-semibold text-(--theme-text) transition-colors hover:bg-(--theme-surface-muted)"
            >
              <Plus className="h-4 w-4" />
              <span>آیتم اصلی جدید</span>
            </button>
            <button
              type="button"
              onClick={saveMenu}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700"
            >
              <Save className="h-4 w-4" />
              <span>ذخیره منو</span>
            </button>
          </div>
          </div>
        )}
      />

      {currentMenu && (
        <div className="space-y-4">
          {currentMenu.items.map((item, idx) => {
            const accent = menuItemAccents[idx % menuItemAccents.length];
            const isCollapsed = !expandedItems.has(item.id);
            return (
            <div
              key={item.id}
              onDragOver={(event) => {
                if (draggedItem?.type === 'root') event.preventDefault();
              }}
              onDrop={(event) => dropRootItem(event, idx)}
              className={`overflow-hidden rounded-2xl border border-(--theme-card-border) border-s-4 ${accent.border} bg-(--theme-card-surface) shadow-(--theme-card-shadow) ${draggedItem?.type === 'root' && draggedItem.index === idx ? 'opacity-50' : ''}`}
            >
              <div className={`flex items-center border-b ${accent.header}`}>
                <button
                  type="button"
                  aria-label={`${isCollapsed ? 'بازکردن' : 'بستن'} ${item.title_fa || `آیتم اصلی ${idx + 1}`}`}
                  aria-expanded={!isCollapsed}
                  onClick={() => toggleItemCollapsed(item.id)}
                  className="flex min-w-0 flex-1 items-center gap-3 px-5 py-2.5 text-start"
                >
                  <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg text-xs font-extrabold ${accent.badge}`}>
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <DynamicLucideIcon name={item.icon || undefined} fallback="Layers" className="h-4 w-4 shrink-0 text-(--theme-primary-ink)" />
                  <span className="truncate text-xs font-bold text-(--theme-text)">
                    {item.title_fa || `آیتم اصلی ${idx + 1}`}
                  </span>
                  <span className="ms-auto shrink-0 text-[10px] font-medium text-(--theme-text-muted)">آیتم منوی اصلی</span>
                  <ChevronDown className={`h-4 w-4 shrink-0 text-(--theme-text-muted) transition-transform duration-200 ${isCollapsed ? '-rotate-90' : ''}`} />
                </button>
                <button
                  type="button"
                  draggable
                  aria-label={`جابجایی آیتم اصلی ${item.title_fa}`}
                  title="برای تغییر ترتیب بکشید"
                  onDragStart={(event) => startDragging(event, { type: 'root', menuId: currentMenu.id, index: idx })}
                  onDragEnd={() => setDraggedItem(null)}
                  className="cursor-grab px-3 py-3 text-(--theme-text-muted) active:cursor-grabbing"
                >
                  <GripVertical className="h-4 w-4" />
                </button>
              </div>
              <div hidden={isCollapsed} className={isCollapsed ? 'hidden' : 'space-y-4 p-5'}>
                <div className="grid gap-3 sm:grid-cols-5">
                <label className="block space-y-1 text-xs font-medium text-(--theme-text)">
                  <span className="block">عنوان فارسی *</span>
                  <input value={item.title_fa} onChange={(e) => updateItem(idx, { title_fa: e.target.value })} placeholder="عنوان فارسی" className="w-full min-w-0 rounded-xl border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text) placeholder:text-(--theme-placeholder)" />
                </label>
                <label className="block space-y-1 text-xs font-medium text-(--theme-text)">
                  <span className="block">عنوان انگلیسی *</span>
                  <input dir="ltr" value={item.title_en} onChange={(e) => updateItem(idx, { title_en: e.target.value })} placeholder="English Title" className="w-full min-w-0 rounded-xl border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text) placeholder:text-(--theme-placeholder)" />
                </label>
                <label className="block space-y-1 text-xs font-medium text-(--theme-text)">
                  <span className="block">نشانی لینک *</span>
                  <input dir="ltr" value={item.url} onChange={(e) => updateItem(idx, { url: e.target.value })} placeholder="/url" className="w-full min-w-0 rounded-xl border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text) placeholder:text-(--theme-placeholder)" />
                </label>
                <label className="block min-w-0 space-y-1 text-xs font-medium text-(--theme-text)">
                  <span className="block">آیکن</span>
                  <span className="flex min-w-0 items-center gap-2 rounded-xl border border-(--theme-input-border) bg-(--theme-input-bg) px-2.5">
                    <DynamicLucideIcon name={item.icon || undefined} fallback="Layers" className="h-4 w-4 shrink-0 text-(--theme-primary-ink)" />
                    <select
                      aria-label={`آیکن ${item.title_fa}`}
                      value={item.icon || ''}
                      onChange={(event) => updateItem(idx, { icon: event.target.value || null })}
                      className="min-w-0 flex-1 bg-transparent py-2 text-xs text-(--theme-input-text) outline-none"
                    >
                      <option value="">بدون آیکن</option>
                      {Object.entries(LUCIDE_ICON_REGISTRY).map(([name, entry]) => (
                        <option key={name} value={name}>{entry.label}</option>
                      ))}
                    </select>
                  </span>
                </label>
                <div className="flex items-center justify-end gap-2">
                  <button type="button" onClick={() => setDeleteTarget({ type: 'root', index: idx })} aria-label="حذف آیتم اصلی" className="rounded-xl p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30">
                    <Trash2 className="h-4 w-4" />
                  </button>
                  {currentMenu.key === 'header' && (
                    <button type="button" onClick={() => addChild(idx)} className="inline-flex items-center gap-1 rounded-xl border border-(--theme-border) bg-(--theme-surface) px-3 py-2 text-xs font-semibold text-(--theme-text) hover:bg-(--theme-surface-muted)">
                      <Plus className="h-3.5 w-3.5" />
                      <span>زیرمنو تصویری</span>
                    </button>
                  )}
                </div>
              </div>

                {item.children && item.children.length > 0 && (
                  <div className="grid gap-3 border-t border-(--theme-border) pt-4 sm:grid-cols-2">
                    {item.children.map((ch, cIdx) => (
                    <div
                      key={ch.id}
                      onDragOver={(event) => {
                        if (
                          draggedItem?.type === 'root'
                          || (draggedItem?.type === 'child' && draggedItem.parentIndex === idx)
                        ) {
                          event.preventDefault();
                        }
                      }}
                      onDrop={(event) => draggedItem?.type === 'root'
                        ? dropRootItem(event, idx)
                        : dropChildItem(event, idx, cIdx)}
                      className={`space-y-2 rounded-xl border border-(--theme-border) bg-(--theme-surface-muted) p-3 ${draggedItem?.type === 'child' && draggedItem.parentIndex === idx && draggedItem.index === cIdx ? 'opacity-50' : ''}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <button
                          type="button"
                          draggable
                          aria-label={`جابجایی زیرمنوی ${ch.title_fa}`}
                          title="برای تغییر ترتیب بکشید"
                          onDragStart={(event) => startDragging(event, {
                            type: 'child',
                            menuId: currentMenu.id,
                            parentIndex: idx,
                            index: cIdx,
                          })}
                          onDragEnd={() => setDraggedItem(null)}
                          className="cursor-grab p-1 text-(--theme-text-muted) active:cursor-grabbing"
                        >
                          <GripVertical className="h-4 w-4" />
                        </button>
                        <label className="min-w-0 flex-1 space-y-1 text-xs font-medium text-(--theme-text)">
                          <span className="block">عنوان فارسی *</span>
                          <input
                            value={ch.title_fa}
                            onChange={(e) => {
                              const nextChildren = item.children!.map((c, j) => (j === cIdx ? { ...c, title_fa: e.target.value } : c));
                              updateItem(idx, { children: nextChildren });
                            }}
                            className="w-full min-w-0 rounded-lg border border-(--theme-input-border) bg-(--theme-input-bg) px-2.5 py-1.5 text-xs text-(--theme-input-text)"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget({ type: 'child', parentIndex: idx, childIndex: cIdx })}
                          aria-label={`حذف زیرمنوی ${ch.title_fa}`}
                          className="p-1 text-red-600 dark:text-red-400"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <label className="block space-y-1 text-xs font-medium text-(--theme-text)">
                        <span className="block">نشانی لینک *</span>
                        <input
                          dir="ltr"
                          aria-label={`لینک ${ch.title_fa}`}
                          value={ch.url}
                          onChange={(e) => {
                            const nextChildren = item.children!.map((c, j) => (j === cIdx ? { ...c, url: e.target.value } : c));
                            updateItem(idx, { children: nextChildren });
                          }}
                          placeholder="/projects?category=slug"
                          className="w-full rounded-lg border border-(--theme-input-border) bg-(--theme-input-bg) px-2.5 py-1.5 text-xs text-(--theme-input-text) placeholder:text-(--theme-placeholder)"
                        />
                      </label>
                      <p dir="ltr" className="text-[11px] text-(--theme-text-muted)">برای نمایش پروژه‌های یک دسته: /projects?category=slug</p>
                      <label className="block space-y-1 text-xs font-medium text-(--theme-text)">
                        <span className="block">عنوان انگلیسی *</span>
                        <input
                          dir="ltr"
                          aria-label={`عنوان انگلیسی ${ch.title_fa}`}
                          value={ch.title_en}
                          onChange={(e) => {
                            const nextChildren = item.children!.map((c, j) => (j === cIdx ? { ...c, title_en: e.target.value } : c));
                            updateItem(idx, { children: nextChildren });
                          }}
                          placeholder="English title"
                          className="w-full rounded-lg border border-(--theme-input-border) bg-(--theme-input-bg) px-2.5 py-1.5 text-xs text-(--theme-input-text) placeholder:text-(--theme-placeholder)"
                        />
                      </label>
                      <label className="block space-y-1 text-xs font-medium text-(--theme-text)">
                        <span className="block">توضیح کوتاه فارسی</span>
                        <textarea
                          aria-label={`توضیح کوتاه ${ch.title_fa}`}
                          value={ch.description_fa || ''}
                          onChange={(e) => {
                            const nextChildren = item.children!.map((c, j) => (j === cIdx ? { ...c, description_fa: e.target.value } : c));
                            updateItem(idx, { children: nextChildren });
                          }}
                          placeholder="توضیح کوتاه فارسی"
                          rows={2}
                          className="w-full rounded-lg border border-(--theme-input-border) bg-(--theme-input-bg) px-2.5 py-1.5 text-xs text-(--theme-input-text) placeholder:text-(--theme-placeholder)"
                        />
                      </label>
                      <label className="block space-y-1 text-xs font-medium text-(--theme-text)">
                        <span className="block">توضیح کوتاه انگلیسی</span>
                        <textarea
                          aria-label={`توضیح کوتاه انگلیسی ${ch.title_fa}`}
                          value={ch.description_en || ''}
                          onChange={(e) => {
                            const nextChildren = item.children!.map((c, j) => (j === cIdx ? { ...c, description_en: e.target.value } : c));
                            updateItem(idx, { children: nextChildren });
                          }}
                          placeholder="Short English description"
                          rows={2}
                          className="w-full rounded-lg border border-(--theme-input-border) bg-(--theme-input-bg) px-2.5 py-1.5 text-xs text-(--theme-input-text) placeholder:text-(--theme-placeholder)"
                        />
                      </label>
                      <p className="text-[11px] leading-5 text-(--theme-text-muted)">این تصویر هنگام انتخاب یا رفتن نشانگر روی زیرمنو در پیش‌نمایش سایت نمایش داده می‌شود.</p>
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
