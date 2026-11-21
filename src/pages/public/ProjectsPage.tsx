import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { apiRequest } from '../../services/api.ts';
import { useAppStore } from '../../store/useAppStore.ts';
import type { Project } from '../../types/index.ts';
import { CmsPageIntro } from '../../components/common/CmsPageIntro.tsx';
import { Pagination } from '../../components/ui/Pagination.tsx';
import { SearchableSelect } from '../../components/ui/SearchableSelect.tsx';
import { ZeroBrokenImage } from '../../components/ui/ZeroBrokenImage.tsx';
import { PublicBanner } from '../../components/common/PublicBanner.tsx';

interface ProjectFilterOptions {
  categories: Array<{ id: number; slug: string; name_fa: string; name_en: string }>;
  years: number[];
  clients: Array<{ client_name_fa: string | null; client_name_en: string | null }>;
  locations: Array<{ location_fa: string | null; location_en: string | null }>;
  contract_types: Array<{ contract_type_fa: string | null; contract_type_en: string | null }>;
}

export const ProjectsPage: React.FC = () => {
  const { language, addToast, bootstrap } = useAppStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get('category') || '';
  const [filterOptions, setFilterOptions] = useState<ProjectFilterOptions>({
    categories: [],
    years: [],
    clients: [],
    locations: [],
    contract_types: [],
  });
  const [projects, setProjects] = useState<Project[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [year, setYear] = useState('');
  const [client, setClient] = useState('');
  const [location, setLocation] = useState('');
  const [contractType, setContractType] = useState('');
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');

  const updateCategory = (value: string) => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      if (value) {
        next.set('category', value);
      } else {
        next.delete('category');
      }
      return next;
    });
  };

  useEffect(() => {
    setPage(1);
  }, [category]);

  useEffect(() => {
    let active = true;
    apiRequest<{ data: ProjectFilterOptions }>('/projects/filters')
      .then((response) => {
        if (active) setFilterOptions(response.data);
      })
      .catch((error: unknown) => {
        if (active) addToast('error', error instanceof Error ? error.message : 'دریافت گزینه‌های فیلتر پروژه ناموفق بود.');
      });

    return () => {
      active = false;
    };
  }, [addToast]);

  useEffect(() => {
    const params = new URLSearchParams({ page: String(page), per_page: '6' });
    if (category) params.set('category', category);
    if (year) params.set('year', year);
    if (client) params.set('client', client);
    if (location) params.set('location', location);
    if (contractType) params.set('contract_type', contractType);
    if (status) params.set('status', status);
    if (q) params.set('q', q);

    setLoading(true);
    let active = true;
    const timer = window.setTimeout(() => {
      apiRequest<{ data: Project[]; meta: { last_page: number } }>(`/projects?${params.toString()}`)
      .then((res) => {
        if (active) {
          setProjects(res.data);
          setLastPage(res.meta.last_page);
        }
      })
      .catch((error: unknown) => {
        if (active) addToast('error', error instanceof Error ? error.message : 'دریافت فهرست پروژه‌ها ناموفق بود.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    }, 250);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [category, year, client, location, contractType, status, q, page, addToast]);

  const categoryOpts = useMemo(
    () => [
      { value: '', label: 'همه دسته‌های فنی' },
      ...filterOptions.categories.map((c) => ({ value: c.slug, label: language === 'fa' ? c.name_fa : c.name_en })),
    ],
    [filterOptions.categories, language]
  );

  const yearOpts = useMemo(() => {
    return [{ value: '', label: 'همه سال‌ها' }, ...filterOptions.years.map((value) => ({ value: String(value), label: String(value) }))];
  }, [filterOptions.years]);

  const clientOpts = useMemo(() => {
    return [
      { value: '', label: 'همه کارفرمایان' },
      ...filterOptions.clients.map((client) => {
        const value = client.client_name_fa || client.client_name_en || '';
        return { value: language === 'fa' ? client.client_name_fa || value : client.client_name_en || value, label: language === 'fa' ? client.client_name_fa || value : client.client_name_en || value };
      }),
    ];
  }, [filterOptions.clients, language]);

  const locationOpts = useMemo(() => {
    return [
      { value: '', label: 'همه موقعیت‌ها' },
      ...filterOptions.locations.map((location) => {
        const value = location.location_fa || location.location_en || '';
        return { value: language === 'fa' ? location.location_fa || value : location.location_en || value, label: language === 'fa' ? location.location_fa || value : location.location_en || value };
      }),
    ];
  }, [filterOptions.locations, language]);

  const typeOpts = useMemo(() => {
    return [
      { value: '', label: 'همه انواع قرارداد' },
      ...filterOptions.contract_types.map((contractType) => {
        const value = contractType.contract_type_fa || contractType.contract_type_en || '';
        return { value: language === 'fa' ? contractType.contract_type_fa || value : contractType.contract_type_en || value, label: language === 'fa' ? contractType.contract_type_fa || value : contractType.contract_type_en || value };
      }),
    ];
  }, [filterOptions.contract_types, language]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <CmsPageIntro slug="projects" className="mb-8" />
      {bootstrap?.banners?.filter((banner) => banner.placement === 'projects_top').map((banner) => (
        <PublicBanner key={banner.id} banner={banner} language={language} />
      ))}

      {/* Advanced SearchableSelect Filter Panel */}
      <div className="mb-8 rounded-2xl border border-(--theme-card-border) bg-(--theme-card-surface) p-5 shadow-(--theme-card-shadow)">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-(--theme-text-muted)">
              جستجوی متنی (عنوان یا شماره قرارداد)
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute inset-s-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--theme-placeholder)" />
              <input
                type="text"
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setPage(1);
                }}
                placeholder="جستجو..."
                className="h-10.5 w-full rounded-xl border border-(--theme-input-border) bg-(--theme-input-bg) pe-3 ps-9 text-sm text-(--theme-input-text) placeholder:text-(--theme-placeholder) focus:border-(--theme-primary) focus:outline-none"
              />
            </div>
          </div>
          <SearchableSelect label="دسته‌بندی فنی" options={categoryOpts} value={category} onChange={updateCategory} allowClear />
          <SearchableSelect label="سال اجرا" options={yearOpts} value={year} onChange={(v) => { setYear(v); setPage(1); }} allowClear />
          <SearchableSelect label="کارفرما" options={clientOpts} value={client} onChange={(v) => { setClient(v); setPage(1); }} allowClear />
          <SearchableSelect label="موقعیت جغرافیایی" options={locationOpts} value={location} onChange={(v) => { setLocation(v); setPage(1); }} allowClear />
          <SearchableSelect label="نوع قرارداد" options={typeOpts} value={contractType} onChange={(v) => { setContractType(v); setPage(1); }} allowClear />
          <SearchableSelect
            label="وضعیت پروژه"
            options={[
              { value: '', label: 'همه وضعیت‌ها' },
              { value: 'completed', label: 'تکمیل‌شده' },
              { value: 'in_progress', label: 'در حال اجرا' },
              { value: 'planned', label: 'در برنامه‌ریزی' },
              { value: 'contracted', label: 'قراردادشده' },
            ]}
            value={status}
            onChange={(value) => {
              setStatus(value);
              setPage(1);
            }}
            allowClear
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-80 animate-pulse rounded-2xl bg-(--theme-surface-muted)" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="rounded-2xl border border-(--theme-card-border) bg-(--theme-card-surface) p-12 text-center text-sm text-(--theme-text-muted) shadow-(--theme-card-shadow)">
          پروژه‌ای با فیلترهای انتخاب‌شده یافت نشد.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <Link
              key={p.id}
              to={`/projects/${p.slug}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-(--theme-card-border) bg-(--theme-card-surface) shadow-(--theme-card-shadow) transition-all hover:-translate-y-0.5 hover:border-(--theme-card-border-hover) hover:shadow-(--theme-card-shadow-hover)"
            >
              <div className="h-52 overflow-hidden bg-(--theme-surface-muted)">
                <ZeroBrokenImage
                  src={p.cover_image}
                  alt={p.title_fa}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-1 flex-col justify-between p-5">
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-(--theme-text-muted) tabular-nums">
                    <span>{p.category?.name_fa}</span>
                    <span>·</span>
                    <span>{p.year}</span>
                    <span>·</span>
                    <span>{p.location_fa}</span>
                  </div>
                  <h2 className="mt-2 text-base font-bold text-(--theme-text) group-hover:text-(--theme-primary-ink)">
                    {language === 'fa' ? p.title_fa : p.title_en}
                  </h2>
                  <p className="mt-2 line-clamp-2 text-xs text-(--theme-text-muted)">
                    {language === 'fa' ? p.summary_fa : p.summary_en}
                  </p>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-(--theme-border) pt-3 text-xs text-(--theme-text-muted)">
                  <span className="truncate">{p.client_name_fa}</span>
                  <span className="font-mono">{p.contract_number}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <Pagination page={page} lastPage={lastPage} onChange={setPage} />
    </div>
  );
};
