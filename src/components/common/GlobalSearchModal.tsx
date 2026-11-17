import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, FileText, FolderKanban, Package, Search, Wrench } from 'lucide-react';
import { apiRequest } from '../../services/api.ts';
import { useAppStore } from '../../store/useAppStore.ts';
import type { Article, License, Product, Project, Service } from '../../types/index.ts';
import { Modal } from '../ui/Modal.tsx';
import { InlineLoader } from './InlineLoader.tsx';

interface SearchResult {
  projects: Project[];
  products: Product[];
  services: Service[];
  articles: Article[];
  licenses: License[];
}

export const GlobalSearchModal: React.FC = () => {
  const { searchOpen, setSearchOpen, language } = useAppStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await apiRequest<SearchResult>(`/search?q=${encodeURIComponent(query)}`);
        setResults(res);
      } catch {
        setResults(null);
      } finally {
        setLoading(false);
      }
    }, 220);
    return () => clearTimeout(timer);
  }, [query]);

  const go = (url: string) => {
    setSearchOpen(false);
    setQuery('');
    navigate(url);
  };

  return (
    <Modal
      open={searchOpen}
      onClose={() => setSearchOpen(false)}
      title={language === 'fa' ? 'جستجوی سراسری در سامانه پارس پولاد آقایی' : 'Global Site Search'}
      size="lg"
    >
      <div className="relative">
        <Search className="pointer-events-none absolute start-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={language === 'fa' ? 'نام پروژه، شماره قرارداد، محصول (مثل لاینر هنگر، سرچاهی، API 6FA)...' : 'Search projects, products, ISO certificates...'}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pe-4 ps-11 text-sm text-slate-900 focus:border-(--theme-primary) focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        />
      </div>

      <div className="mt-4 max-h-96 space-y-4 overflow-y-auto">
        {loading && <div className="flex justify-center py-6 text-xs text-slate-500"><InlineLoader label="در حال جستجو..." /></div>}

        {!loading && results && (
          <>
            {results.projects.length > 0 && (
              <div>
                <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                  <FolderKanban className="h-3.5 w-3.5" />
                  <span>پروژه‌ها</span>
                </h4>
                <div className="space-y-1">
                  {results.projects.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => go(`/projects/${p.slug}`)}
                      className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-start text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <span className="font-medium">{language === 'fa' ? p.title_fa : p.title_en}</span>
                      <span className="text-xs text-slate-400 tabular-nums">{p.contract_number}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {results.products.length > 0 && (
              <div>
                <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                  <Package className="h-3.5 w-3.5" />
                  <span>محصولات و تجهیزات</span>
                </h4>
                <div className="space-y-1">
                  {results.products.map((pr) => (
                    <button
                      key={pr.id}
                      type="button"
                      onClick={() => go('/products')}
                      className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-start text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <span className="font-medium">{language === 'fa' ? pr.name_fa : pr.name_en}</span>
                      {pr.model_code && <span className="text-xs text-slate-400 font-mono">{pr.model_code}</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {results.services.length > 0 && (
              <div>
                <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                  <Wrench className="h-3.5 w-3.5" />
                  <span>خدمات مهندسی</span>
                </h4>
                <div className="space-y-1">
                  {results.services.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => go('/services')}
                      className="block w-full rounded-lg px-3 py-2 text-start text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      {language === 'fa' ? s.title_fa : s.title_en}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {results.licenses.length > 0 && (
              <div>
                <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                  <Award className="h-3.5 w-3.5" />
                  <span>گواهینامه‌ها و استانداردها</span>
                </h4>
                <div className="space-y-1">
                  {results.licenses.map((l) => (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => go('/contracts-licenses')}
                      className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-start text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <span>{language === 'fa' ? l.title_fa : l.title_en}</span>
                      <span className="text-xs text-slate-400 font-mono">{l.code}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {results.articles.length > 0 && (
              <div>
                <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                  <FileText className="h-3.5 w-3.5" />
                  <span>مقالات فنی و اخبار</span>
                </h4>
                <div className="space-y-1">
                  {results.articles.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => go(`/news/${a.slug}`)}
                      className="block w-full rounded-lg px-3 py-2 text-start text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      {language === 'fa' ? a.title_fa : a.title_en}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {results.projects.length +
              results.products.length +
              results.services.length +
              results.articles.length +
              results.licenses.length ===
              0 && (
              <p className="py-8 text-center text-sm text-slate-500">
                نتیجه‌ای برای «{query}» یافت نشد.
              </p>
            )}
          </>
        )}
      </div>
    </Modal>
  );
};
