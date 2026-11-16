import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { apiRequest } from '../../services/api.ts';
import { useAppStore } from '../../store/useAppStore.ts';
import type { Project } from '../../types/index.ts';
import { SeoHead } from '../../components/common/SeoHead.tsx';
import { Breadcrumb } from '../../components/ui/Breadcrumb.tsx';
import { Pagination } from '../../components/ui/Pagination.tsx';
import { SearchableSelect } from '../../components/ui/SearchableSelect.tsx';
import { ZeroBrokenImage } from '../../components/ui/ZeroBrokenImage.tsx';

export const ProjectsPage: React.FC = () => {
  const { bootstrap, language } = useAppStore();
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [category, setCategory] = useState('');
  const [year, setYear] = useState('');
  const [client, setClient] = useState('');
  const [location, setLocation] = useState('');
  const [contractType, setContractType] = useState('');
  const [q, setQ] = useState('');

  useEffect(() => {
    apiRequest<{ data: Project[] }>('/projects?per_page=100')
      .then((res) => setAllProjects(res.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const params = new URLSearchParams({ page: String(page), per_page: '6' });
    if (category) params.set('category', category);
    if (year) params.set('year', year);
    if (client) params.set('client', client);
    if (location) params.set('location', location);
    if (contractType) params.set('contract_type', contractType);
    if (q) params.set('q', q);

    setLoading(true);
    apiRequest<{ data: Project[]; meta: { last_page: number } }>(`/projects?${params.toString()}`)
      .then((res) => {
        setProjects(res.data);
        setLastPage(res.meta.last_page);
      })
      .finally(() => setLoading(false));
  }, [category, year, client, location, contractType, q, page]);

  const categoryOpts = useMemo(
    () => [
      { value: '', label: 'همه دسته‌های فنی' },
      ...(bootstrap?.categories || []).map((c) => ({ value: c.slug, label: c.name_fa })),
    ],
    [bootstrap]
  );

  const yearOpts = useMemo(() => {
    const years = Array.from(new Set(allProjects.map((p) => String(p.year)))).sort().reverse();
    return [{ value: '', label: 'همه سال‌ها' }, ...years.map((y) => ({ value: y, label: y }))];
  }, [allProjects]);

  const clientOpts = useMemo(() => {
    const clients = Array.from(new Set(allProjects.map((p) => p.client_name_fa)));
    return [{ value: '', label: 'همه کارفرمایان' }, ...clients.map((c) => ({ value: c, label: c }))];
  }, [allProjects]);

  const locationOpts = useMemo(() => {
    const locs = Array.from(new Set(allProjects.map((p) => p.location_fa)));
    return [{ value: '', label: 'همه موقعیت‌ها' }, ...locs.map((l) => ({ value: l, label: l }))];
  }, [allProjects]);

  const typeOpts = useMemo(() => {
    const types = Array.from(new Set(allProjects.map((p) => p.contract_type_fa)));
    return [{ value: '', label: 'همه انواع قرارداد' }, ...types.map((t) => ({ value: t, label: t }))];
  }, [allProjects]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <SeoHead title={language === 'fa' ? 'پروژه‌ها و سوابق اجرایی' : 'Projects'} />
      <Breadcrumb items={[{ label: language === 'fa' ? 'پروژه‌ها' : 'Projects' }]} />

      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
          {language === 'fa' ? 'پروژه‌ها و سوابق اجرایی صنعت نفت و گاز' : 'Oil & Gas Projects Portfolio'}
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          فیلترسازی پیشرفته بر اساس دسته‌بندی فنی، سال اجرا، کارفرما، موقعیت جغرافیایی و نوع قرارداد
        </p>
      </div>

      {/* Advanced SearchableSelect Filter Panel */}
      <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
              جستجوی متنی (عنوان یا شماره قرارداد)
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setPage(1);
                }}
                placeholder="جستجو..."
                className="h-[42px] w-full rounded-lg border border-slate-200 bg-white pe-3 ps-9 text-sm focus:border-[var(--theme-primary)] focus:outline-none dark:border-slate-700 dark:bg-slate-900"
              />
            </div>
          </div>
          <SearchableSelect label="دسته‌بندی فنی" options={categoryOpts} value={category} onChange={(v) => { setCategory(v); setPage(1); }} allowClear />
          <SearchableSelect label="سال اجرا" options={yearOpts} value={year} onChange={(v) => { setYear(v); setPage(1); }} allowClear />
          <SearchableSelect label="کارفرما" options={clientOpts} value={client} onChange={(v) => { setClient(v); setPage(1); }} allowClear />
          <SearchableSelect label="موقعیت جغرافیایی" options={locationOpts} value={location} onChange={(v) => { setLocation(v); setPage(1); }} allowClear />
          <SearchableSelect label="نوع قرارداد" options={typeOpts} value={contractType} onChange={(v) => { setContractType(v); setPage(1); }} allowClear />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-80 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900">
          پروژه‌ای با فیلترهای انتخاب‌شده یافت نشد.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <Link
              key={p.id}
              to={`/projects/${p.slug}`}
              className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-all hover:border-[var(--theme-primary)] dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="h-52 overflow-hidden bg-slate-100 dark:bg-slate-800">
                <ZeroBrokenImage
                  src={p.cover_image}
                  alt={p.title_fa}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-1 flex-col justify-between p-5">
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 tabular-nums">
                    <span>{p.category?.name_fa}</span>
                    <span>·</span>
                    <span>{p.year}</span>
                    <span>·</span>
                    <span>{p.location_fa}</span>
                  </div>
                  <h2 className="mt-2 text-base font-bold text-slate-900 group-hover:text-[var(--theme-primary)] dark:text-white">
                    {language === 'fa' ? p.title_fa : p.title_en}
                  </h2>
                  <p className="mt-2 line-clamp-2 text-xs text-slate-600 dark:text-slate-300">
                    {language === 'fa' ? p.summary_fa : p.summary_en}
                  </p>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-slate-800">
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
