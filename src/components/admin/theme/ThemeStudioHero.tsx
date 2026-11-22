import React from 'react';
import { Moon, Palette, Sun } from 'lucide-react';
import { useAppStore } from '../../../store/useAppStore.ts';
import { AdminPageHeader } from '../AdminPageHeader.tsx';

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
    <AdminPageHeader
      icon={Palette}
      eyebrow="Visual identity studio"
      title="استودیو هویت بصری"
      description="ظاهر صفحات عمومی، لندینگ و پنل مدیریت را مستقل طراحی کنید؛ تغییرات زنده پیش‌نمایش و ذخیره می‌شوند."
      actions={(
        <>
          <button
            type="button"
            onClick={toggleColorMode}
            className="inline-flex items-center gap-1.5 rounded-xl border border-(--theme-border) bg-(--theme-surface) px-3.5 py-2.5 text-xs font-semibold text-(--theme-text) hover:bg-(--theme-surface-muted)"
          >
            {effectiveMode === 'dark' ? <Sun className="h-3.5 w-3.5 text-amber-300" /> : <Moon className="h-3.5 w-3.5" />}
            <span>{effectiveMode === 'dark' ? 'حالت روشن' : 'حالت تاریک'}</span>
          </button>
          <button
            type="button"
            onClick={onPreview}
            className="inline-flex items-center rounded-xl bg-(--theme-btn-bg) px-4 py-2.5 text-xs font-bold text-(--theme-btn-text) hover:bg-(--theme-btn-hover)"
          >
            پیش‌نمایش انتخاب فعلی
          </button>
          <button
            type="button"
            onClick={onResetPreview}
            className="inline-flex items-center rounded-xl border border-(--theme-border) bg-(--theme-surface) px-3.5 py-2.5 text-xs font-semibold text-(--theme-text) hover:bg-(--theme-surface-muted)"
          >
            لغو پیش‌نمایش
          </button>
        </>
      )}
    />
  );
};
