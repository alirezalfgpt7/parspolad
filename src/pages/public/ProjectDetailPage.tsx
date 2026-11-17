import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Download, Lock } from 'lucide-react';
import { apiRequest } from '../../services/api.ts';
import { useAppStore } from '../../store/useAppStore.ts';
import type { Project } from '../../types/index.ts';
import { SeoHead } from '../../components/common/SeoHead.tsx';
import { Breadcrumb } from '../../components/ui/Breadcrumb.tsx';
import { ZeroBrokenImage } from '../../components/ui/ZeroBrokenImage.tsx';

export const ProjectDetailPage: React.FC = () => {
  const { slug } = useParams();
  const { language, user } = useAppStore();
  const [project, setProject] = useState<Project | null>(null);
  const [activeImage, setActiveImage] = useState('');

  useEffect(() => {
    if (!slug) return;
    apiRequest<{ data: Project }>(`/projects/${slug}`)
      .then((res) => {
        setProject(res.data);
        setActiveImage(res.data.cover_image);
      })
      .catch(() => setProject(null));
  }, [slug]);

  if (!project) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center text-sm text-slate-500">
        در حال بارگذاری اطلاعات پروژه...
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
          <div className="h-[380px] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900">
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
            <div className="rounded-2xl border border-slate-200 bg-slate-950 p-3 dark:border-slate-800">
              <video src={project.videos[0]} controls className="max-h-80 w-full rounded-xl" />
            </div>
          )}
        </div>

        {/* Specs & Documents */}
        <div className="space-y-6 lg:col-span-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 tabular-nums">
              <span>{project.category?.name_fa}</span>
              <span>·</span>
              <span>سال {project.year}</span>
              <span>·</span>
              <span>{project.status === 'completed' ? 'تکمیل‌شده' : 'در حال اجرا'}</span>
            </div>
            <h1 className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">
              {language === 'fa' ? project.title_fa : project.title_en}
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              {language === 'fa' ? project.description_fa : project.description_en}
            </p>

            <dl className="mt-6 space-y-2.5 border-t border-slate-100 pt-4 text-xs dark:border-slate-800 tabular-nums">
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">کارفرما</dt>
                <dd className="font-semibold">{project.client_name_fa}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">شماره قرارداد</dt>
                <dd className="font-mono font-semibold">{project.contract_number}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">نوع قرارداد</dt>
                <dd className="font-semibold">{project.contract_type_fa}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">موقعیت جغرافیایی</dt>
                <dd className="font-semibold">{project.location_fa}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">استانداردها</dt>
                <dd className="font-mono font-semibold">{project.standards.join(' · ')}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              مدارک فنی و مستندات قابل دانلود
            </h2>
            {project.documents.length === 0 ? (
              <p className="mt-3 text-xs text-slate-500">
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
                      className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-xs text-slate-500 dark:border-slate-700"
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
                      className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-xs font-semibold hover:border-(--theme-primary) dark:border-slate-700"
                    >
                      <span>{doc.title_fa} · {doc.file_type}</span>
                      <Download className="h-4 w-4 text-(--theme-primary) shrink-0" />
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
