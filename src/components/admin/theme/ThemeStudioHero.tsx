import React from 'react';
import { Moon, Sparkles, Sun } from 'lucide-react';
import { AnimatedBackground } from '../../effects/AnimatedBackground.tsx';
import { DecorativeCube } from '../../effects/DecorativeCube.tsx';
import { EffectText } from '../../effects/EffectText.tsx';
import { useAppStore } from '../../../store/useAppStore.ts';

interface ThemeStudioHeroProps {
  onPreview: () => void;
  onResetPreview: () => void;
}

export const ThemeStudioHero: React.FC<ThemeStudioHeroProps> = ({
  onPreview,
  onResetPreview,
}) => {
  const { colorMode, previewMode, toggleColorMode } = useAppStore();
  const effectiveMode = previewMode || colorMode;

  return (
    <section className="theme-studio-hero">
      <AnimatedBackground />
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="hidden h-16 w-16 place-items-center rounded-2xl border border-white/10 bg-white/5 sm:grid">
            <DecorativeCube size="lg" />
          </div>
          <div>
            <div className="mb-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-rose-200/80">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Visual identity studio</span>
            </div>
            <h1 className="text-xl font-black sm:text-2xl">
              استودیو <EffectText inverse>هویت بصری</EffectText>
            </h1>
            <p className="mt-2 max-w-2xl text-xs leading-6 text-slate-300">
              ظاهر صفحات عمومی، لندینگ و پنل مدیریت را مستقل طراحی کنید؛ تغییرات زنده پیش‌نمایش و ذخیره می‌شوند.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={toggleColorMode}
            className="theme-studio-hero-button theme-studio-hero-button-muted inline-flex items-center gap-1.5"
          >
            {effectiveMode === 'dark' ? <Sun className="h-3.5 w-3.5 text-amber-300" /> : <Moon className="h-3.5 w-3.5" />}
            <span>{effectiveMode === 'dark' ? 'حالت روشن' : 'حالت تاریک'}</span>
          </button>
          <button type="button" onClick={onPreview} className="theme-studio-hero-button">
            پیش‌نمایش انتخاب فعلی
          </button>
          <button type="button" onClick={onResetPreview} className="theme-studio-hero-button theme-studio-hero-button-muted">
            لغو پیش‌نمایش
          </button>
        </div>
      </div>
    </section>
  );
};
