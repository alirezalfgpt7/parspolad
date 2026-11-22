import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { apiRequest } from '../../services/api.ts';
import { useAppStore } from '../../store/useAppStore.ts';
import type { Project, ProjectCategory, ProjectStatus } from '../../types/index.ts';
import { ColorPicker } from '../../components/ui/ColorPicker.tsx';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog.tsx';
import { DataTable, type Column } from '../../components/ui/DataTable.tsx';
import { MediaUrlField } from '../../components/ui/MediaUrlField.tsx';
import { Modal } from '../../components/ui/Modal.tsx';
import { Pagination } from '../../components/ui/Pagination.tsx';
import { SearchableSelect } from '../../components/ui/SearchableSelect.tsx';
import { ZeroBrokenImage } from '../../components/ui/ZeroBrokenImage.tsx';
import { z } from 'zod';

const projectFormSchema = z.object({
  slug: z.string().max(160).nullish(),
  title_fa: z.string().trim().min(1, 'عنوان فارسی پروژه الزامی است.').max(255),
  title_en: z.string().trim().min(1, 'عنوان انگلیسی پروژه الزامی است.').max(255),
  category_id: z.number().int().positive('دسته‌بندی پروژه را انتخاب کنید.'),
  client_name_fa: z.string().trim().min(1, 'نام کارفرما الزامی است.').max(255),
  client_name_en: z.string().trim().min(1, 'نام انگلیسی کارفرما الزامی است.').max(255),
  contract_number: z.string().trim().min(1, 'شماره قرارداد الزامی است.').max(120),
  contract_type_fa: z.string().max(120).nullish(),
  contract_type_en: z.string().max(120).nullish(),
  location_fa: z.string().max(200).nullish(),
  location_en: z.string().max(200).nullish(),
  year: z.number().int().min(1348).max(1450),
  status: z.enum(['completed', 'in_progress', 'planned', 'contracted']),
  summary_fa: z.string().trim().min(1, 'خلاصه پروژه الزامی است.'),
  summary_en: z.string().nullish(),
  description_fa: z.string().nullish(),
  description_en: z.string().nullish(),
  cover_image: z.string().trim().min(1, 'تصویر کاور پروژه الزامی است.').max(255),
  is_featured: z.boolean().optional(),
});
const categoryFormSchema = z.object({
  slug: z.string().trim().min(1).max(120),
  name_fa: z.string().trim().min(1, 'نام فارسی دسته الزامی است.').max(255),
  name_en: z.string().trim().min(1, 'نام انگلیسی دسته الزامی است.').max(255),
  icon: z.string().max(80).nullish(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'رنگ دسته باید کد HEX معتبر باشد.'),
  description_fa: z.string().nullish(),
});

interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

type ProjectListRow = Pick<
  Project,
  'id' | 'slug' | 'title_fa' | 'category_id' | 'category' | 'client_name_fa' |
  'contract_number' | 'year' | 'status' | 'cover_image'
>;

const PROJECT_PAGE_SIZES = [10, 20, 50] as const;
const CATEGORY_PAGE_SIZE = 8;

export const ProjectsAdminPage: React.FC = () => {
  const { addToast, fetchBootstrap } = useAppStore();
  const [projects, setProjects] = useState<ProjectListRow[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [projectTotal, setProjectTotal] = useState(0);
  const [perPage, setPerPage] = useState<number>(PROJECT_PAGE_SIZES[0]);
  const [projectSearch, setProjectSearch] = useState('');
  const [appliedProjectSearch, setAppliedProjectSearch] = useState('');
  const [projectRefresh, setProjectRefresh] = useState(0);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<ProjectCategory[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<ProjectCategory[]>([]);
  const [categorySelectSearch, setCategorySelectSearch] = useState('');
  const [appliedCategorySelectSearch, setAppliedCategorySelectSearch] = useState('');
  const [categoryOptionsLoading, setCategoryOptionsLoading] = useState(false);
  const [categoryPage, setCategoryPage] = useState(1);
  const [categoryLastPage, setCategoryLastPage] = useState(1);
  const [categoryTotal, setCategoryTotal] = useState(0);
  const [categorySearch, setCategorySearch] = useState('');
  const [appliedCategorySearch, setAppliedCategorySearch] = useState('');
  const [categoryRefresh, setCategoryRefresh] = useState(0);
  const [categoriesExpanded, setCategoriesExpanded] = useState(false);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [editing, setEditing] = useState<Partial<Project> | null>(null);
  const [editingLoading, setEditingLoading] = useState(false);
  const [catModal, setCatModal] = useState<Partial<ProjectCategory> | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deletingProject, setDeletingProject] = useState(false);
  const projectEditRequest = useRef(0);

  useEffect(() => {
    const timer = window.setTimeout(() => setAppliedProjectSearch(projectSearch.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [projectSearch]);

  useEffect(() => {
    let active = true;
    const params = new URLSearchParams({ page: String(page), per_page: String(perPage) });
    if (appliedProjectSearch) params.set('q', appliedProjectSearch);

    setLoading(true);
    apiRequest<PaginatedResponse<ProjectListRow>>(`/admin/projects?${params.toString()}`)
      .then((response) => {
        if (!active) return;
        if (page > response.meta.last_page) {
          setPage(Math.max(1, response.meta.last_page));
          return;
        }
        setProjects(response.data);
        setLastPage(response.meta.last_page);
        setProjectTotal(response.meta.total);
      })
      .catch((error: unknown) => {
        if (active) addToast('error', error instanceof Error ? error.message : 'بارگذاری پروژه‌ها ناموفق بود.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [page, perPage, appliedProjectSearch, projectRefresh, addToast]);

  useEffect(() => {
    const timer = window.setTimeout(() => setAppliedCategorySearch(categorySearch.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [categorySearch]);

  useEffect(() => {
    const timer = window.setTimeout(() => setAppliedCategorySelectSearch(categorySelectSearch.trim()), 250);
    return () => window.clearTimeout(timer);
  }, [categorySelectSearch]);

  useEffect(() => {
    let active = true;
    const params = new URLSearchParams({
      page: String(categoryPage),
      per_page: String(CATEGORY_PAGE_SIZE),
    });
    if (appliedCategorySearch) params.set('search', appliedCategorySearch);

    setCategoryLoading(true);
    apiRequest<PaginatedResponse<ProjectCategory>>(`/admin/categories?${params.toString()}`)
      .then((response) => {
        if (!active) return;
        if (categoryPage > response.meta.last_page) {
          setCategoryPage(Math.max(1, response.meta.last_page));
          return;
        }
        setCategories(response.data);
        setCategoryLastPage(response.meta.last_page);
        setCategoryTotal(response.meta.total);
      })
      .catch((error: unknown) => {
        if (active) addToast('error', error instanceof Error ? error.message : 'بارگذاری دسته‌بندی‌ها ناموفق بود.');
      })
      .finally(() => {
        if (active) setCategoryLoading(false);
      });

    return () => {
      active = false;
    };
  }, [categoryPage, appliedCategorySearch, categoryRefresh, addToast]);

  useEffect(() => {
    let active = true;
    const params = new URLSearchParams({ page: '1', per_page: '30' });
    if (appliedCategorySelectSearch) params.set('search', appliedCategorySelectSearch);

    setCategoryOptionsLoading(true);
    apiRequest<PaginatedResponse<ProjectCategory>>(`/admin/categories?${params.toString()}`)
      .then((response) => {
        if (active) setCategoryOptions(response.data);
      })
      .catch((error: unknown) => {
        if (active) {
          setCategoryOptions([]);
          addToast('error', error instanceof Error ? error.message : 'بارگذاری گزینه‌های دسته‌بندی ناموفق بود.');
        }
      })
      .finally(() => {
        if (active) setCategoryOptionsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [appliedCategorySelectSearch, categoryRefresh, addToast]);

  const openProjectEditor = async (project: ProjectListRow) => {
    const requestId = ++projectEditRequest.current;
    setEditing(null);
    setEditingLoading(true);
    try {
      const response = await apiRequest<{ data: Project }>(`/admin/projects/${project.id}`);
      if (projectEditRequest.current === requestId) setEditing(response.data);
    } catch (error) {
      if (projectEditRequest.current === requestId) {
        addToast('error', error instanceof Error ? error.message : 'بارگذاری جزئیات پروژه ناموفق بود.');
      }
    } finally {
      if (projectEditRequest.current === requestId) setEditingLoading(false);
    }
  };

  const closeProjectEditor = () => {
    projectEditRequest.current += 1;
    setEditing(null);
    setEditingLoading(false);
  };

  const saveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    const parsed = projectFormSchema.safeParse(editing);
    if (!parsed.success) {
      addToast('error', parsed.error.issues[0]?.message ?? 'اطلاعات پروژه معتبر نیست.');
      return;
    }
    try {
      if (editing.id) {
        await apiRequest(`/admin/projects/${editing.id}`, { method: 'PUT', body: JSON.stringify({ ...editing, ...parsed.data }) });
      } else {
        await apiRequest('/admin/projects', { method: 'POST', body: JSON.stringify({ ...editing, ...parsed.data, images: [parsed.data.cover_image], videos: [], documents: [], standards: ['API 6A', 'ISO 9001'] }) });
      }
      setEditing(null);
      setProjectRefresh((current) => current + 1);
      addToast('success', 'پروژه ذخیره شد.');
    } catch (err) {
      addToast('error', err instanceof Error ? err.message : 'خطا در ذخیره');
    }
  };

  const saveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catModal) return;
    const parsed = categoryFormSchema.safeParse(catModal);
    if (!parsed.success) {
      addToast('error', parsed.error.issues[0]?.message ?? 'اطلاعات دسته‌بندی معتبر نیست.');
      return;
    }
    try {
      if (catModal.id) {
        await apiRequest(`/admin/categories/${catModal.id}`, { method: 'PUT', body: JSON.stringify(parsed.data) });
      } else {
        await apiRequest('/admin/categories', { method: 'POST', body: JSON.stringify(parsed.data) });
      }
      setCatModal(null);
      setCategoryRefresh((current) => current + 1);
      await fetchBootstrap();
      addToast('success', 'دسته‌بندی فنی ذخیره شد.');
    } catch (error) {
      addToast('error', error instanceof Error ? error.message : 'خطا در ذخیره دسته‌بندی');
    }
  };

  const confirmDeleteProject = async () => {
    if (deleteId === null) return;

    setDeletingProject(true);
    try {
      await apiRequest(`/admin/projects/${deleteId}`, { method: 'DELETE' });
      setDeleteId(null);
      setProjectRefresh((current) => current + 1);
      addToast('success', 'پروژه حذف شد.');
    } catch (error) {
      addToast('error', error instanceof Error ? error.message : 'حذف پروژه ناموفق بود.');
    } finally {
      setDeletingProject(false);
    }
  };

  const cols: Column<ProjectListRow>[] = [
    {
      key: 'title',
      header: 'عنوان پروژه',
      className: 'min-w-[220px]',
      render: (p) => (
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-12 shrink-0 overflow-hidden rounded-md bg-(--theme-surface-muted)">
            <ZeroBrokenImage src={p.cover_image} alt={p.title_fa} className="h-full w-full object-cover" />
          </div>
          <span className="font-semibold text-(--theme-text)">{p.title_fa}</span>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'دسته فنی',
      className: 'min-w-[140px]',
      render: (p) => p.category ? (
        <span className="inline-flex max-w-48 items-center gap-2 rounded-full border border-(--theme-border) bg-(--theme-surface-muted) px-2.5 py-1 text-xs font-medium text-(--theme-text)">
          <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: p.category.color }} />
          <span className="truncate">{p.category.name_fa}</span>
        </span>
      ) : <span className="text-(--theme-text-muted)">بدون دسته</span>,
    },
    { key: 'client', header: 'کارفرما', className: 'hidden md:table-cell', render: (p) => <span>{p.client_name_fa}</span> },
    { key: 'contract', header: 'شماره قرارداد', className: 'hidden lg:table-cell', render: (p) => <span className="font-mono text-xs">{p.contract_number}</span> },
    { key: 'year', header: 'سال', className: 'hidden sm:table-cell', render: (p) => <span>{p.year}</span> },
    {
      key: 'actions',
      header: 'عملیات',
      className: 'whitespace-nowrap',
      render: (p) => (
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => openProjectEditor(p)} className="rounded p-1.5 text-(--theme-text-muted) hover:bg-(--theme-surface-muted) hover:text-(--theme-text)" aria-label={`ویرایش ${p.title_fa}`}><Pencil className="h-4 w-4" /></button>
          <button type="button" onClick={() => setDeleteId(p.id)} className="rounded p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40" aria-label={`حذف ${p.title_fa}`}><Trash2 className="h-4 w-4" /></button>
        </div>
      ),
    },
  ];

  const projectCategoryOptions = [
    ...(editing?.category ? [editing.category] : []),
    ...categoryOptions.filter((category) => category.id !== editing?.category?.id),
  ].map((category) => ({ value: String(category.id), label: category.name_fa }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-extrabold text-(--theme-text)">مدیریت پروژه‌ها و دسته‌بندی‌های فنی</h1>
          <p className="mt-1 text-xs text-(--theme-text-muted)">پروژه‌ها و دسته‌های فنی را جست‌وجو، مشاهده و مدیریت کنید.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setEditing({ slug: `proj-${Date.now()}`, title_fa: '', title_en: '', category_id: categoryOptions[0]?.id || categories[0]?.id || 0, client_name_fa: '', client_name_en: '', contract_number: '', contract_type_fa: 'ساخت و تولید', contract_type_en: 'Manufacturing', location_fa: 'اهواز', location_en: 'Ahvaz', year: 1404, status: 'in_progress', summary_fa: '', summary_en: '', description_fa: '', description_en: '', cover_image: '/storage/hero/hero-rig.jpg', is_featured: true })}
            className="inline-flex items-center gap-1.5 rounded-lg bg-(--theme-btn-bg) px-4 py-2 text-xs font-semibold text-(--theme-btn-text) hover:bg-(--theme-btn-hover)"
          >
            <Plus className="h-4 w-4" />
            <span>پروژه جدید</span>
          </button>
        </div>
      </div>

      <section className="overflow-hidden rounded-xl border border-(--theme-border) bg-(--theme-surface) shadow-(--theme-card-shadow)">
        <div className="flex flex-wrap items-center justify-between gap-3 p-4">
          <button
            type="button"
            aria-label={categoriesExpanded ? 'بستن فهرست دسته‌بندی‌های فنی' : 'نمایش فهرست دسته‌بندی‌های فنی'}
            aria-expanded={categoriesExpanded}
            aria-controls="project-category-manager"
            onClick={() => setCategoriesExpanded((expanded) => !expanded)}
            className="flex min-w-0 flex-1 items-center gap-2 text-start"
          >
            <ChevronDown className={`h-4 w-4 shrink-0 text-(--theme-text-muted) transition-transform ${categoriesExpanded ? 'rotate-180' : ''}`} />
            <span className="font-bold text-(--theme-text)">دسته‌بندی‌های فنی</span>
            <span className="rounded-full bg-(--theme-surface-muted) px-2 py-0.5 text-xs text-(--theme-text-muted)">{categoryTotal}</span>
          </button>
          <button
            type="button"
            onClick={() => setCatModal({ name_fa: '', name_en: '', slug: `cat-${Date.now()}`, icon: 'Layers', color: '#B91C1C' })}
            className="inline-flex items-center gap-1 rounded-lg border border-(--theme-border) bg-(--theme-surface) px-3 py-2 text-xs font-semibold text-(--theme-text) transition-colors hover:bg-(--theme-surface-muted)"
          >
            <Plus className="h-3.5 w-3.5" />
            دسته فنی جدید
          </button>
        </div>
        {categoriesExpanded && (
          <div id="project-category-manager" className="space-y-4 border-t border-(--theme-border) p-4">
            <div className="relative max-w-md">
              <Search className="pointer-events-none absolute inset-s-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--theme-placeholder)" />
              <input
                type="search"
                value={categorySearch}
                onChange={(event) => {
                  setCategorySearch(event.target.value);
                  setCategoryPage(1);
                }}
                placeholder="جست‌وجوی دسته فنی..."
                aria-label="جست‌وجوی دسته‌بندی فنی"
                className="w-full rounded-lg border border-(--theme-input-border) bg-(--theme-input-bg) py-2 pe-3 ps-9 text-sm text-(--theme-input-text) placeholder:text-(--theme-placeholder) outline-none transition-colors focus:border-(--theme-primary)"
              />
            </div>
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
              {categoryLoading ? (
                Array.from({ length: 4 }, (_, index) => (
                  <div key={index} className="h-[68px] animate-pulse rounded-lg border border-(--theme-border) bg-(--theme-surface-muted)" />
                ))
              ) : categories.length ? categories.map((category) => (
                <div key={category.id} className="flex min-w-0 items-center justify-between gap-3 rounded-lg border border-(--theme-border) bg-(--theme-surface) p-3">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: category.color }} />
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-(--theme-text)">{category.name_fa}</p>
                      <p dir="ltr" className="truncate text-[10px] text-(--theme-text-muted)">{category.slug}</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => setCatModal(category)} className="shrink-0 rounded p-1.5 text-(--theme-primary-ink) transition-colors hover:bg-(--theme-surface-muted)" aria-label={`ویرایش دسته ${category.name_fa}`}>
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                </div>
              )) : (
                <p className="col-span-full py-4 text-center text-sm text-(--theme-text-muted)">
                  {appliedCategorySearch ? 'دسته‌ای با این جست‌وجو پیدا نشد.' : 'هنوز دسته‌بندی فنی ثبت نشده است.'}
                </p>
              )}
            </div>
            <div className="flex flex-col items-center justify-between gap-2 border-t border-(--theme-border) pt-3 sm:flex-row">
              <p className="text-xs text-(--theme-text-muted)">
                نمایش {categories.length ? (categoryPage - 1) * CATEGORY_PAGE_SIZE + 1 : 0} تا {Math.min(categoryPage * CATEGORY_PAGE_SIZE, categoryTotal)} از {categoryTotal} دسته
              </p>
              <Pagination page={categoryPage} lastPage={categoryLastPage} onChange={setCategoryPage} />
            </div>
          </div>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search className="pointer-events-none absolute inset-s-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--theme-placeholder)" />
            <input
              type="search"
              value={projectSearch}
              onChange={(event) => {
                setProjectSearch(event.target.value);
                setPage(1);
              }}
              placeholder="جست‌وجوی عنوان، دسته، کارفرما یا قرارداد..."
              aria-label="جست‌وجوی پروژه‌ها"
              className="w-full rounded-lg border border-(--theme-input-border) bg-(--theme-input-bg) py-2 pe-3 ps-9 text-sm text-(--theme-input-text) placeholder:text-(--theme-placeholder) outline-none transition-colors focus:border-(--theme-primary)"
            />
          </div>
          <label className="flex shrink-0 items-center gap-2 text-xs text-(--theme-text-muted)">
            تعداد در هر صفحه
            <select
              value={perPage}
              onChange={(event) => {
                setPerPage(Number(event.target.value));
                setPage(1);
              }}
              aria-label="تعداد پروژه در هر صفحه"
              className="rounded-lg border border-(--theme-input-border) bg-(--theme-input-bg) px-2.5 py-2 text-sm text-(--theme-input-text) outline-none focus:border-(--theme-primary)"
            >
              {PROJECT_PAGE_SIZES.map((size) => <option key={size} value={size}>{size}</option>)}
            </select>
          </label>
        </div>
        <DataTable data={projects} columns={cols} pageSize={perPage} loading={loading} emptyText={appliedProjectSearch ? 'پروژه‌ای با این جست‌وجو پیدا نشد.' : 'هنوز پروژه‌ای ثبت نشده است.'} />
        <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
          <p className="text-xs text-(--theme-text-muted)">
            نمایش {projectTotal ? (page - 1) * perPage + 1 : 0} تا {Math.min(page * perPage, projectTotal)} از {projectTotal} پروژه
          </p>
          <Pagination page={page} lastPage={lastPage} onChange={setPage} />
        </div>
      </section>

      <Modal
        open={Boolean(editing) || editingLoading}
        onClose={closeProjectEditor}
        title={editingLoading ? 'بارگذاری پروژه' : editing?.id ? 'ویرایش پروژه' : 'افزودن پروژه جدید'}
        size="lg"
      >
        {editingLoading ? (
          <div className="py-12 text-center text-sm text-(--theme-text-muted)" role="status">در حال بارگذاری جزئیات پروژه...</div>
        ) : editing && (
          <form onSubmit={saveProject} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-(--theme-text)">عنوان فارسی پروژه</label>
                <input required value={editing.title_fa || ''} onChange={(e) => setEditing({ ...editing, title_fa: e.target.value })} className="w-full rounded-lg border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text) placeholder:text-(--theme-placeholder) outline-none focus:border-(--theme-primary)" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-(--theme-text)">عنوان انگلیسی</label>
                <input required dir="ltr" value={editing.title_en || ''} onChange={(e) => setEditing({ ...editing, title_en: e.target.value })} className="w-full rounded-lg border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text) placeholder:text-(--theme-placeholder) outline-none focus:border-(--theme-primary)" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-(--theme-text)">شناسهٔ لینک پروژه (slug)</label>
                <input dir="ltr" value={editing.slug || ''} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} className="w-full rounded-lg border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text) placeholder:text-(--theme-placeholder) outline-none focus:border-(--theme-primary)" />
                <p dir="ltr" className="mt-1 text-xs text-(--theme-text-muted)">/projects/{editing.slug || ':slug'}</p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <SearchableSelect
                label="دسته فنی"
                options={projectCategoryOptions}
                value={String(editing.category_id || '')}
                onChange={(v) => {
                  const selectedCategory = categoryOptions.find((category) => category.id === Number(v));
                  setEditing({
                    ...editing,
                    category_id: Number(v),
                    ...(selectedCategory ? { category: selectedCategory } : {}),
                  });
                }}
                serverSearch
                onSearchChange={setCategorySelectSearch}
                searchLoading={categoryOptionsLoading}
              />
              <div>
                <label className="mb-1 block text-xs font-medium text-(--theme-text)">کارفرما</label>
                <input required value={editing.client_name_fa || ''} onChange={(e) => setEditing({ ...editing, client_name_fa: e.target.value })} className="w-full rounded-lg border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text) placeholder:text-(--theme-placeholder) outline-none focus:border-(--theme-primary)" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-(--theme-text)">کارفرما (انگلیسی)</label>
                <input required dir="ltr" value={editing.client_name_en || ''} onChange={(e) => setEditing({ ...editing, client_name_en: e.target.value })} className="w-full rounded-lg border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text) placeholder:text-(--theme-placeholder) outline-none focus:border-(--theme-primary)" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-(--theme-text)">شماره قرارداد</label>
                <input required dir="ltr" value={editing.contract_number || ''} onChange={(e) => setEditing({ ...editing, contract_number: e.target.value })} className="w-full rounded-lg border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text) placeholder:text-(--theme-placeholder) outline-none focus:border-(--theme-primary)" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-(--theme-text)">سال اجرا</label>
                <input type="number" value={editing.year || 1404} onChange={(e) => setEditing({ ...editing, year: Number(e.target.value) })} className="w-full rounded-lg border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text) placeholder:text-(--theme-placeholder) outline-none focus:border-(--theme-primary)" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-(--theme-text)">موقعیت جغرافیایی</label>
                <input value={editing.location_fa || ''} onChange={(e) => setEditing({ ...editing, location_fa: e.target.value })} className="w-full rounded-lg border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text) placeholder:text-(--theme-placeholder) outline-none focus:border-(--theme-primary)" />
              </div>
              <SearchableSelect
                label="وضعیت"
                options={[{ value: 'in_progress', label: 'در حال اجرا' }, { value: 'completed', label: 'تکمیل‌شده' }, { value: 'contracted', label: 'قرارداد شده' }]}
                value={editing.status || 'in_progress'}
                onChange={(v) => setEditing({ ...editing, status: v as ProjectStatus })}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-(--theme-text)">خلاصه و شرح فنی</label>
              <textarea rows={3} value={editing.summary_fa || ''} onChange={(e) => setEditing({ ...editing, summary_fa: e.target.value, description_fa: e.target.value })} className="w-full rounded-lg border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text) placeholder:text-(--theme-placeholder) outline-none focus:border-(--theme-primary)" />
            </div>
            <MediaUrlField
              label="تصویر کاور یا مدرک فنی پروژه"
              value={editing.cover_image || ''}
              onChange={(url) => setEditing({ ...editing, cover_image: url })}
              folder="projects"
              placeholder="/storage/hero/hero-rig.jpg"
            />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setEditing(null)} className="rounded-lg border border-(--theme-border) bg-(--theme-surface) px-4 py-2 text-xs font-semibold text-(--theme-text) hover:bg-(--theme-surface-muted)">انصراف</button>
              <button type="submit" className="rounded-lg bg-(--theme-btn-bg) px-5 py-2 text-xs font-semibold text-(--theme-btn-text) hover:bg-(--theme-btn-hover)">ذخیره پروژه</button>
            </div>
          </form>
        )}
      </Modal>

      <Modal open={Boolean(catModal)} onClose={() => setCatModal(null)} title="مدیریت دسته‌بندی فنی" size="sm">
        {catModal && (
          <form onSubmit={saveCategory} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-(--theme-text)">نام فارسی دسته</label>
              <input required value={catModal.name_fa || ''} onChange={(e) => setCatModal({ ...catModal, name_fa: e.target.value })} className="w-full rounded-lg border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text) placeholder:text-(--theme-placeholder) outline-none focus:border-(--theme-primary)" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-(--theme-text)">نام انگلیسی</label>
              <input dir="ltr" value={catModal.name_en || ''} onChange={(e) => setCatModal({ ...catModal, name_en: e.target.value })} className="w-full rounded-lg border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text) placeholder:text-(--theme-placeholder) outline-none focus:border-(--theme-primary)" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-(--theme-text)">شناسهٔ لینک دسته (slug)</label>
              <input dir="ltr" required value={catModal.slug || ''} onChange={(e) => setCatModal({ ...catModal, slug: e.target.value })} className="w-full rounded-lg border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-sm text-(--theme-input-text) placeholder:text-(--theme-placeholder) outline-none focus:border-(--theme-primary)" />
              <p dir="ltr" className="mt-1 text-xs text-(--theme-text-muted)">/projects?category={catModal.slug || '<slug>'}</p>
            </div>
            <ColorPicker label="رنگ دسته فنی" value={catModal.color || '#B91C1C'} onChange={(c) => setCatModal({ ...catModal, color: c })} />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setCatModal(null)} className="rounded-lg border border-(--theme-border) bg-(--theme-surface) px-4 py-2 text-xs text-(--theme-text) hover:bg-(--theme-surface-muted)">انصراف</button>
              <button type="submit" className="rounded-lg bg-(--theme-btn-bg) px-4 py-2 text-xs font-semibold text-(--theme-btn-text) hover:bg-(--theme-btn-hover)">ذخیره</button>
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
