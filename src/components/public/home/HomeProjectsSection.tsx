import React from 'react';
import { Link } from 'react-router-dom';
import type { Language } from '../../../types/index.ts';
import type { HomepageProject } from '../../../utils/homepageSections.ts';
import { EffectImage, Reveal } from '../../effects/index.ts';
import { HomeSectionHeading } from './HomeSectionHeading.tsx';
import { usePrefersReducedMotion } from '../../../hooks/usePrefersReducedMotion.ts';
import '../../effects/FlipCard.css';

interface HomeProjectsSectionProps {
  projects: HomepageProject[];
  language: Language;
  text: (key: string) => string;
}

export const HomeProjectsSection: React.FC<HomeProjectsSectionProps> = ({ projects, language, text }) => {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <section id="home-projects" className="home-page-snap-section mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <HomeSectionHeading
        eyebrow={text('projects_eyebrow')}
        title={text('projects_title')}
        actionLabel={text('projects_all')}
        actionTo="/projects"
        language={language}
      />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.slice(0, 6).map((project, index) => (
          <Reveal key={project.id} delay={reducedMotion ? 0 : index * 0.045} className="h-full">
            <div className="flip-card-container group/flip h-full">
              <div className="flip-card h-full">
                <Link
                  to={`/projects/${project.slug}`}
                  className="flip-card-face flip-card-face--front group flex h-full flex-col border border-(--theme-card-border) bg-(--theme-card-surface) shadow-(--theme-card-shadow) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--theme-primary-ink)"
                >
                  <div className="h-48 overflow-hidden bg-(--theme-surface-muted)">
                    <EffectImage
                      src={project.cover_image}
                      alt={language === 'fa' ? project.title_fa : project.title_en}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover/flip:scale-105"
                    />
                  </div>
                  <div className="flex flex-1 flex-col justify-between p-5">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-(--theme-text-muted) tabular-nums">
                        <span>{project.category?.name_fa}</span>
                        <span aria-hidden="true">·</span>
                        <span>{project.year}</span>
                        <span aria-hidden="true">·</span>
                        <span>{project.status === 'completed' ? text('project_completed') : text('project_in_progress')}</span>
                      </div>
                      <h3 className="mt-2 text-base font-bold leading-snug text-(--theme-text) group-hover/flip:text-(--theme-primary-ink)">
                        {language === 'fa' ? project.title_fa : project.title_en}
                      </h3>
                      <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-(--theme-text-muted)">
                        {language === 'fa' ? project.summary_fa : project.summary_en}
                      </p>
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-(--theme-border) pt-3 text-xs text-(--theme-text-muted)">
                      <span className="truncate">{language === 'fa' ? project.client_name_fa : project.client_name_en}</span>
                      <span className="shrink-0 font-mono">{project.contract_number}</span>
                    </div>
                  </div>
                </Link>
                <Link
                  to={`/projects/${project.slug}`}
                  className="flip-card-face flip-card-face--back relative min-h-72 border border-(--theme-card-border) bg-(--theme-surface-muted) p-5 text-start focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--theme-primary-ink)"
                >
                  <span className="absolute inset-e-5 top-2 font-mono text-6xl font-black text-(--theme-primary)/10" aria-hidden="true">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className="relative flex h-full flex-col">
                    <span className="mb-4 h-1 w-12 rounded-full bg-(--theme-primary)" />
                    <h3 className="text-base font-extrabold leading-7 text-(--theme-text)">
                      {language === 'fa' ? project.title_fa : project.title_en}
                    </h3>
                    <p className="mt-3 line-clamp-4 text-xs leading-6 text-(--theme-text-muted)">
                      {language === 'fa' ? project.summary_fa : project.summary_en}
                    </p>
                    <dl className="mt-4 space-y-2 border-t border-(--theme-border) pt-3 text-xs">
                      <div className="flex justify-between gap-3">
                        <dt className="text-(--theme-text-muted)">{language === 'fa' ? 'کارفرما' : 'Client'}</dt>
                        <dd className="truncate font-semibold text-(--theme-text)">{language === 'fa' ? project.client_name_fa : project.client_name_en}</dd>
                      </div>
                      <div className="flex justify-between gap-3">
                        <dt className="text-(--theme-text-muted)">{language === 'fa' ? 'شماره قرارداد' : 'Contract'}</dt>
                        <dd className="font-mono font-semibold text-(--theme-text)">{project.contract_number}</dd>
                      </div>
                    </dl>
                    <span className="mt-auto pt-4 text-xs font-bold text-(--theme-primary-ink)">
                      {language === 'fa' ? 'مشاهدهٔ جزئیات پروژه' : 'View project details'}
                    </span>
                  </div>
                </Link>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
};
