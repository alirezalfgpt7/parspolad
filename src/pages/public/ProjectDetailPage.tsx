import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Download, Lock } from 'lucide-react';
import { ApiError, apiRequest } from '../../services/api.ts';
import { useAppStore } from '../../store/useAppStore.ts';
import type { Project } from '../../types/index.ts';
import { SeoHead } from '../../components/common/SeoHead.tsx';
import { Breadcrumb } from '../../components/ui/Breadcrumb.tsx';
import { ZeroBrokenImage } from '../../components/ui/ZeroBrokenImage.tsx';
import { PagePreloader } from '../../components/common/PagePreloader.tsx';

export const ProjectDetailPage: React.FC = () => {
  const { slug } = useParams();
  const { language, user } = useAppStore();
  const [project, setProject] = useState<Project | null>(null);
  const [activeImage, setActiveImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    setProject(null);
    setLoadError(null);
    setLoading(true);

    if (!slug) {
      setLoadError(language === 'fa' ? 'شناسه پروژه معتبر نیست.' : 'Invalid project identifier.');
      setLoading(false);
      return () => {
        active = false;
      };
    }

    apiRequest<Project>(`/projects/${slug}`)
      .then((result) => {
        if (!active) return;
        setProject(result);
        setActiveImage(result.cover_image);
      })
      .catch((error: unknown) => {
        if (!active) return;
        console.error('Could not load project details:', error);
        setLoadError(
          error instanceof ApiError && error.status === 404
            ? (language === 'fa' ? 'پروژه موردنظر پیدا نشد.' : 'The requested project was not found.')
            : (language === 'fa' ? 'دریافت اطلاعات پروژه ناموفق بود. لطفاً دوباره تلاش کنید.' : 'Could not load project details. Please try again.'),
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [slug, language, reloadKey]);

  if (loading) {
    return <PagePreloader label="در حال دریافت اطلاعات پروژه..." />;
  }

  if (loadError || !project) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
        <div className="rounded-2xl border border-(--theme-card-border) bg-(--theme-card-surface) p-8 shadow-(--theme-card-shadow)">
          <h1 className="text-xl font-extrabold text-(--theme-text)">
            {loadError || (language === 'fa' ? 'پروژه در دسترس نیست.' : 'Project unavailable.')}
          </h1>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => setReloadKey((key) => key + 1)}
              className="rounded-xl bg-(--theme-btn-bg) px-4 py-2.5 text-sm font-semibold text-(--theme-btn-text) transition hover:bg-(--theme-btn-hover)"
            >
              {language === 'fa' ? 'تلاش دوباره' : 'Try again'}
            </button>
            <Link
              to="/projects"
              className="rounded-xl border border-(--theme-border) bg-(--theme-surface-muted) px-4 py-2.5 text-sm font-semibold text-(--theme-text) transition-colors hover:border-(--theme-primary-ink) hover:text-(--theme-primary-ink)"
            >
              {language === 'fa' ? 'بازگشت به پروژه‌ها' : 'Back to projects'}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <SeoHead
        title={language === 'fa' ? project.title_fa : project.title_en}
        description={language === 'fa' ? project.description_fa : project.description_en}
        image={project.cover_image}
        language={language}
      />
      <Breadcrumb
        items={[
          { label: language === 'fa' ? 'پروژه‌ها' : 'Projects', to: '/projects' },
          { label: language === 'fa' ? project.title_fa : project.title_en },
        ]}
      />

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Gallery & Video */}
        <div className="space-y-4 lg:col-span-7">
          <div className="h-[380px] overflow-hidden rounded-2xl border border-(--theme-card-border) bg-(--theme-surface-muted) shadow-(--theme-card-shadow)">
            <ZeroBrokenImage
              src={activeImage || project.cover_image}
              alt={project.title_fa}
              className="h-full w-full object-cover"
            />
          </div>

          {project.images.length > 1 && (
            <div className="flex flex-wrap gap-3">
              {project.images.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveImage(img)}
                  className={`h-20 w-28 overflow-hidden rounded-lg border-2 transition-colors ${
                    activeImage === img ? 'border-(--theme-primary)' : 'border-transparent'
                  }`}
                >
                  <ZeroBrokenImage src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {project.videos.length > 0 && (
            <div className="rounded-2xl border border-(--theme-card-border) bg-slate-950 p-3 shadow-(--theme-card-shadow)">
              <video src={project.videos[0]} controls className="max-h-80 w-full rounded-xl" />
            </div>
          )}
        </div>

        {/* Specs & Documents */}
        <div className="space-y-6 lg:col-span-5">
          <div className="rounded-2xl border border-(--theme-card-border) bg-(--theme-card-surface) p-6 shadow-(--theme-card-shadow)">
            <div className="flex flex-wrap items-center gap-2 text-xs text-(--theme-text-muted) tabular-nums">
              <span>{project.category?.name_fa}</span>
              <span>·</span>
              <span>سال {project.year}</span>
              <span>·</span>
              <span>{project.status === 'completed' ? 'تکمیل‌شده' : 'در حال اجرا'}</span>
            </div>
            <h1 className="mt-2 text-2xl font-extrabold text-(--theme-text)">
              {language === 'fa' ? project.title_fa : project.title_en}
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-(--theme-text-muted)">
              {language === 'fa' ? project.description_fa : project.description_en}
            </p>

            <dl className="mt-6 space-y-2.5 border-t border-(--theme-border) pt-4 text-xs text-(--theme-text) tabular-nums">
              <div className="flex justify-between gap-2">
                <dt className="text-(--theme-text-muted)">کارفرما</dt>
                <dd className="font-semibold">{project.client_name_fa}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-(--theme-text-muted)">شماره قرارداد</dt>
                <dd className="font-mono font-semibold">{project.contract_number}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-(--theme-text-muted)">نوع قرارداد</dt>
                <dd className="font-semibold">{project.contract_type_fa}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-(--theme-text-muted)">موقعیت جغرافیایی</dt>
                <dd className="font-semibold">{project.location_fa}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-(--theme-text-muted)">استانداردها</dt>
                <dd className="font-mono font-semibold">{project.standards.join(' · ')}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-2xl border border-(--theme-card-border) bg-(--theme-card-surface) p-6 shadow-(--theme-card-shadow)">
            <h2 className="text-base font-bold text-(--theme-text)">
              مدارک فنی و مستندات قابل دانلود
            </h2>
            {project.documents.length === 0 ? (
              <p className="mt-3 text-xs text-(--theme-text-muted)">
                فایل فنی عمومی برای این پروژه پیوست نشده است. جهت دریافت مدارک از فرم استعلام استفاده نمایید.
              </p>
            ) : (
              <div className="mt-4 space-y-2.5">
                {project.documents.map((doc) => {
                  const locked = doc.requires_auth && !user;
                  return locked ? (
                    <Link
                      key={doc.id}
                      to="/login"
                      className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50/70 px-4 py-3 text-xs font-semibold text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200"
                    >
                      <span>{doc.title_fa} (مخصوص کاربران ثبت‌نام‌شده)</span>
                      <Lock className="h-4 w-4 shrink-0" />
                    </Link>
                  ) : !doc.file_url ? (
                    <span
                      key={doc.id}
                      className="flex items-center justify-between rounded-xl border border-(--theme-border) px-4 py-3 text-xs text-(--theme-text-muted)"
                    >
                      <span>{doc.title_fa} · فایل محافظت‌شده در دسترس نیست</span>
                      <Lock className="h-4 w-4 shrink-0" />
                    </span>
                  ) : (
                    <a
                      key={doc.id}
                      href={doc.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between rounded-xl border border-(--theme-border) bg-(--theme-surface-muted) px-4 py-3 text-xs font-semibold text-(--theme-text) transition hover:border-(--theme-primary-ink) hover:text-(--theme-primary-ink)"
                    >
                      <span>{doc.title_fa} · {doc.file_type}</span>
                      <Download className="h-4 w-4 text-(--theme-primary-ink) shrink-0" />
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
