import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { Banner, Language } from '../../types/index.ts';
import { ZeroBrokenImage } from '../ui/ZeroBrokenImage.tsx';

interface PublicBannerProps {
  banner: Banner;
  language: Language;
}

export const PublicBanner: React.FC<PublicBannerProps> = ({ banner, language }) => {
  const isPersian = language === 'fa';
  const title = isPersian ? banner.title_fa : banner.title_en;
  const subtitle = isPersian ? banner.subtitle_fa : banner.subtitle_en;
  const buttonText = isPersian ? banner.cta_text_fa : banner.cta_text_en;
  const ArrowIcon = isPersian ? ArrowLeft : ArrowRight;

  return (
    <section className="my-8">
      <div className="relative overflow-hidden rounded-2xl bg-slate-900 px-6 py-10 text-white sm:px-10 sm:py-12">
        <ZeroBrokenImage src={banner.image_url} alt={title} className="absolute inset-0 h-full w-full object-cover opacity-25" />
        <div className="relative z-10 flex flex-col items-start justify-between gap-5 lg:flex-row lg:items-center">
          <div className="max-w-2xl">
            <h2 className="text-xl font-extrabold sm:text-2xl">{title}</h2>
            {subtitle && <p className="mt-2.5 text-sm text-slate-200">{subtitle}</p>}
          </div>
          {buttonText && (
            <Link
              to={banner.cta_link}
              style={{ backgroundColor: 'var(--theme-btn-bg)', color: 'var(--theme-btn-text)' }}
              className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg px-5 py-3 text-sm font-semibold shadow-lg transition-transform hover:-translate-y-0.5"
            >
              <span>{buttonText}</span>
              <ArrowIcon className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
};
