import React from 'react';
import { Waves } from 'lucide-react';
import type { PublicPageTitleSettings } from '../../../types/index.ts';
import { ColorPicker } from '../../ui/ColorPicker.tsx';
import { IconPicker } from '../../ui/IconPicker.tsx';
import { DynamicLucideIcon } from '../../ui/LucideIconMap.tsx';
import { WaveHeroEffect } from '../../effects/WaveHeroEffect.tsx';

interface PublicPageTitleSettingsEditorProps {
  settings: PublicPageTitleSettings;
  onChange: (settings: PublicPageTitleSettings) => void;
}

export const PublicPageTitleSettingsEditor: React.FC<PublicPageTitleSettingsEditorProps> = ({
  settings,
  onChange,
}) => {
  const update = (patch: Partial<PublicPageTitleSettings>) => {
    onChange({ ...settings, ...patch });
  };

  return (
    <section className="theme-editor-section space-y-5">
      <header>
        <h3 className="text-sm font-bold text-(--theme-text)">عنوان صفحات عمومی</h3>
        <p className="mt-1 text-xs leading-5 text-(--theme-text-muted)">
          پس‌زمینه، رنگ عنوان، موج، گوشه‌ها و آیکن سربرگ صفحات داخلی سایت را مستقل از لندینگ تنظیم کنید.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <ColorPicker
          label="رنگ پس‌زمینه"
          value={settings.background_color}
          onChange={(background_color) => update({ background_color })}
        />
        <ColorPicker
          label="رنگ عنوان"
          value={settings.title_color}
          onChange={(title_color) => update({ title_color })}
        />
        <ColorPicker
          label="رنگ زیرعنوان"
          value={settings.subtitle_color}
          onChange={(subtitle_color) => update({ subtitle_color })}
        />
        <ColorPicker
          label="رنگ حاشیه"
          value={settings.border_color}
          onChange={(border_color) => update({ border_color })}
        />
        <ColorPicker
          label="رنگ موج"
          value={settings.wave_color}
          onChange={(wave_color) => update({ wave_color })}
        />
        <ColorPicker
          label="رنگ آیکن"
          value={settings.icon_color}
          onChange={(icon_color) => update({ icon_color })}
        />
        <ColorPicker
          label="پس‌زمینه آیکن"
          value={settings.icon_background_color}
          onChange={(icon_background_color) => update({ icon_background_color })}
        />
        <IconPicker
          label="آیکن سربرگ صفحات"
          value={settings.icon_name}
          onChange={(icon_name) => update({ icon_name })}
        />
        <label className="text-xs font-semibold text-(--theme-text)">
          <span className="mb-2 flex items-center justify-between">
            <span>گردی گوشه‌های سربرگ</span>
            <span className="font-mono text-(--theme-text-muted)" dir="ltr">{settings.radius}px</span>
          </span>
          <input
            type="range"
            min="0"
            max="48"
            step="1"
            value={settings.radius}
            onChange={(event) => update({ radius: Number(event.target.value) })}
            className="w-full accent-(--theme-primary)"
            aria-label="گردی گوشه‌های سربرگ صفحات عمومی"
          />
        </label>
      </div>

      <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-semibold text-(--theme-text)">
        <input
          type="checkbox"
          checked={settings.wave_enabled}
          onChange={(event) => update({ wave_enabled: event.target.checked })}
          className="h-4 w-4 accent-(--theme-primary)"
        />
        <Waves className="h-4 w-4 text-(--theme-primary-ink)" />
        نمایش موج رنگی در پایین سربرگ
      </label>

      <div className="relative overflow-hidden border p-5 sm:p-7" style={{
        backgroundColor: settings.background_color,
        borderColor: settings.border_color,
        borderRadius: `${settings.radius}px`,
      }}>
        <div className="relative z-10 flex min-h-24 items-center justify-between gap-4">
          <div className="min-w-0">
            <span className="mb-1 block text-xs font-semibold" style={{ color: settings.wave_color }}>معرفی بخش</span>
            <h4 className="text-lg font-extrabold" style={{ color: settings.title_color }}>عنوان نمونه صفحه</h4>
            <p className="mt-1 text-xs leading-6" style={{ color: settings.subtitle_color }}>پیش‌نمایش عنوان و توضیح صفحهٔ عمومی</p>
          </div>
          <div
            className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border"
            style={{
              backgroundColor: settings.icon_background_color,
              borderColor: settings.border_color,
              color: settings.icon_color,
            }}
          >
            <DynamicLucideIcon name={settings.icon_name} className="h-7 w-7" />
          </div>
        </div>
        {settings.wave_enabled && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0">
            <WaveHeroEffect
              bottomFill="transparent"
              tintColor={settings.wave_color}
              heightClassName="!h-10"
            />
          </div>
        )}
      </div>
    </section>
  );
};
