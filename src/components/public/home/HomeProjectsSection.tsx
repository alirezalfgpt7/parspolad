import React from 'react';
import { Link } from 'react-router-dom';
import type { Language, Project } from '../../../types/index.ts';
import { EffectImage, Reveal } from '../../effects/index.ts';
import { HomeSectionHeading } from './HomeSectionHeading.tsx';
import { usePrefersReducedMotion } from '../../../hooks/usePrefersReducedMotion.ts';

interface HomeProjectsSectionProps {
  projects: Project[];
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
            <Link
              to={`/projects/${project.slug}`}
              className="group flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-0.5 hover:border-(--theme-primary) hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--theme-primary) dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="h-52 overflow-hidden bg-slate-100 dark:bg-slate-800">
                <EffectImage
                  src={project.cover_image}
                  alt={language === 'fa' ? project.title_fa : project.title_en}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex flex-1 flex-col justify-between p-5">
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                    <span>{project.category?.name_fa}</span>
                    <span aria-hidden="true">·</span>
                    <span>{project.year}</span>
                    <span aria-hidden="true">·</span>
                    <span>{project.status === 'completed' ? text('project_completed') : text('project_in_progress')}</span>
                  </div>
                  <h3 className="mt-2 text-base font-bold leading-snug text-slate-900 group-hover:text-(--theme-primary) dark:text-white">
                    {language === 'fa' ? project.title_fa : project.title_en}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                    {language === 'fa' ? project.summary_fa : project.summary_en}
                  </p>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-slate-800">
                  <span className="truncate">{language === 'fa' ? project.client_name_fa : project.client_name_en}</span>
                  <span className="font-mono shrink-0">{project.contract_number}</span>
                </div>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
};
