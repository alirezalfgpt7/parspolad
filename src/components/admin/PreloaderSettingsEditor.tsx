import React from 'react';
import { Monitor, Smartphone, Tablet } from 'lucide-react';
import type { PreloaderModeSettings, PreloaderSettings } from '../../types/index.ts';
import { EffectPreloader } from '../effects/EffectPreloader.tsx';
import { MediaUrlField } from '../ui/MediaUrlField.tsx';

interface PreloaderSettingsEditorProps {
  settings: PreloaderSettings;
  onChange: (settings: PreloaderSettings) => void;
}

const sizeFields = [
  { key: 'logo_size_mobile', label: 'اندازه لوگو در موبایل', icon: Smartphone, min: 32, max: 256, step: 8 },
  { key: 'logo_size_tablet', label: 'اندازه لوگو در تبلت', icon: Tablet, min: 32, max: 256, step: 8 },
  { key: 'logo_size_desktop', label: 'اندازه لوگو در دسکتاپ', icon: Monitor, min: 32, max: 256, step: 8 },
  { key: 'text_size_mobile', label: 'اندازه نوشته در موبایل', icon: Smartphone, min: 10, max: 28, step: 1 },
  { key: 'text_size_tablet', label: 'اندازه نوشته در تبلت', icon: Tablet, min: 10, max: 28, step: 1 },
  { key: 'text_size_desktop', label: 'اندازه نوشته در دسکتاپ', icon: Monitor, min: 10, max: 28, step: 1 },
] as const;

export const PreloaderSettingsEditor: React.FC<PreloaderSettingsEditorProps> = ({ settings, onChange }) => {
  const [mode, setMode] = React.useState<'initial' | 'internal'>('initial');
  const current = settings[mode];

  const update = (patch: Partial<PreloaderModeSettings>) => {
    onChange({ ...settings, [mode]: { ...current, ...patch } });
  };

  const updateColor = (key: 'background_color' | 'text_color', value: string) => {
    update({ [key]: value });
  };

  const colorInput = (
    label: string,
    value: string,
    onValue: (next: string) => void,
    fallback: string,
    allowTransparent = false,
  ) => (
    <label className="space-y-1 text-xs">
      <span className="block font-semibold text-(--theme-text-muted)">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={/^#[0-9a-f]{6}$/i.test(value) ? value : fallback}
          onChange={(event) => onValue(event.target.value)}
          className="h-9 w-10 cursor-pointer rounded border border-(--theme-input-border) bg-(--theme-input-bg) p-1"
          aria-label={label}
        />
        <input
          type="text"
          dir="ltr"
          value={value}
          onChange={(event) => onValue(event.target.value)}
          className="min-w-0 flex-1 rounded-lg border border-(--theme-input-border) bg-(--theme-input-bg) px-2.5 py-2 font-mono text-xs text-(--theme-input-text)"
          aria-label={`${label} کد رنگ`}
        />
        {allowTransparent && mode === 'internal' && (
          <button type="button" onClick={() => onValue('transparent')} className="rounded-lg border border-(--theme-border) px-2 py-2 text-[10px] font-semibold text-(--theme-text-muted)">
            شفاف
          </button>
        )}
      </div>
    </label>
  );

  return (
    <div className="space-y-5">
      <section className="space-y-4 rounded-2xl border border-(--theme-card-border) bg-(--theme-card-surface) p-5 shadow-(--theme-card-shadow)">
        <div>
          <h2 className="text-sm font-extrabold text-(--theme-text)">تنظیمات پریلودر</h2>
          <p className="mt-1 text-xs leading-5 text-(--theme-text-muted)">نمای اولیه و بارگذاری‌های داخلی جداگانه تنظیم می‌شوند. مقدارهای پیش‌فرض موجود تا زمان تغییر حفظ می‌شوند.</p>
        </div>

        <div className="grid grid-cols-2 gap-2 rounded-xl bg-(--theme-surface-muted) p-1.5">
          {([
            ['initial', 'لود اولیه سایت / صفحه'],
            ['internal', 'لود داخلی بخش‌ها'],
          ] as const).map(([key, title]) => (
            <button
              key={key}
              type="button"
              onClick={() => setMode(key)}
              aria-pressed={mode === key}
              className={`rounded-lg px-3 py-2.5 text-xs font-bold transition ${mode === key ? 'bg-(--theme-primary) text-(--theme-primary-foreground)' : 'text-(--theme-text-muted) hover:text-(--theme-text)'}`}
            >
              {title}
            </button>
          ))}
        </div>

        <label className="flex items-center gap-2 rounded-xl border border-(--theme-border) bg-(--theme-surface-muted) p-3 text-xs font-semibold text-(--theme-text)">
          <input type="checkbox" checked={current.enabled} onChange={(event) => update({ enabled: event.target.checked })} className="h-4 w-4 accent-(--theme-primary)" />
          نمایش این نوع پریلودر
        </label>
        {mode === 'initial' && (
          <label className="block space-y-1 rounded-xl border border-(--theme-border) bg-(--theme-surface-muted) p-3 text-xs">
            <span className="flex justify-between font-semibold text-(--theme-text-muted)">
              <span>مدت نمایش پریلودر ابتدای سایت</span>
              <span>{(settings.initial_display_duration_ms / 1000).toFixed(1)} ثانیه</span>
            </span>
            <input
              type="range"
              min="0"
              max="10000"
              step="250"
              value={settings.initial_display_duration_ms}
              onChange={(event) => onChange({
                ...settings,
                initial_display_duration_ms: Number(event.target.value),
              })}
              className="w-full accent-(--theme-primary)"
              aria-label="مدت نمایش پریلودر ابتدای سایت"
            />
            <span className="block text-[11px] leading-5 text-(--theme-text-muted)">
              حداقل زمان نمایش است؛ اگر آماده‌سازی سایت بیشتر طول بکشد، پریلودر تا پایان بارگذاری می‌ماند.
            </span>
          </label>
        )}

        <div className="space-y-2 rounded-xl border border-(--theme-border) p-3">
          <p className="text-xs font-bold text-(--theme-text)">چیدمان محتوای پریلودر</p>
          <div className="grid grid-cols-2 gap-2">
            {([
              ['full', 'نمایش اجزا'],
              ['background_only', 'فقط پس‌زمینه'],
            ] as const).map(([value, title]) => (
              <button
                key={value}
                type="button"
                onClick={() => update({ display_mode: value })}
                aria-pressed={current.display_mode === value}
                className={`rounded-lg border px-3 py-2.5 text-xs font-bold transition ${current.display_mode === value ? 'border-(--theme-primary) bg-(--theme-primary)/10 text-(--theme-primary-ink)' : 'border-(--theme-border) text-(--theme-text-muted) hover:text-(--theme-text)'}`}
              >
                {title}
              </button>
            ))}
          </div>
          {current.display_mode === 'background_only' && (
            <p className="text-[11px] leading-5 text-(--theme-text-muted)">در این حالت لوگو، حلقه، متن و نقطه‌ها نمایش داده نمی‌شوند؛ تنظیمات آن‌ها برای بازگشت به حالت کامل حفظ می‌شود.</p>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {colorInput('رنگ پس‌زمینه', current.background_color, (value) => updateColor('background_color', value), '#020617', true)}
          {colorInput('رنگ نوشته (خالی = افکت پیش‌فرض)', current.text_color, (value) => updateColor('text_color', value), '#F8FAFC')}
        </div>

        <MediaUrlField
          label={current.display_mode === 'background_only' ? 'رسانهٔ متحرک پس‌زمینه (GIF، MP4 یا WEBM)' : 'رسانهٔ پس‌زمینه (تصویر، GIF، MP4 یا WEBM)'}
          value={current.background_image}
          onChange={(background_image) => update({ background_image })}
          folder="preloaders"
          accept={current.display_mode === 'background_only' ? '.gif,.mp4,.webm' : '.png,.jpg,.jpeg,.webp,.gif,.mp4,.webm'}
          hint={current.display_mode === 'background_only' ? 'در حالت فقط پس‌زمینه، فایل‌های GIF، MP4 و WEBM را انتخاب کنید.' : 'GIF و ویدئو به‌صورت متحرک و تمام‌صفحه پخش می‌شوند.'}
        />
        <div className="grid gap-2 sm:grid-cols-2">
          <label className="flex items-center gap-2 rounded-xl border border-(--theme-border) bg-(--theme-surface-muted) p-3 text-xs font-semibold text-(--theme-text)">
            <input type="checkbox" checked={current.show_background_media} onChange={(event) => update({ show_background_media: event.target.checked })} className="h-4 w-4 accent-(--theme-primary)" />
            نمایش رسانهٔ پس‌زمینه
          </label>
        </div>
        {current.background_image && current.show_background_media && current.background_color !== 'transparent' && (
          <label className="block space-y-1 text-xs">
            <span className="flex justify-between font-semibold text-(--theme-text-muted)">
              <span>تیرگی روی تصویر</span><span>{current.background_overlay_opacity}%</span>
            </span>
            <input
              type="range"
              min="0"
              max="90"
              value={current.background_overlay_opacity}
              onChange={(event) => update({ background_overlay_opacity: Number(event.target.value) })}
              className="w-full accent-(--theme-primary)"
            />
          </label>
        )}

        <MediaUrlField
          label="لوگوی متحرک / تصویر لوگو"
          value={current.logo_url}
          onChange={(logo_url) => update({ logo_url })}
          folder="preloaders"
          showAnimatedPresets
          hint="GIF و ویدئوی MP4/WEBM پشتیبانی می‌شوند؛ خالی بماند، لوگوی فعلی پریلودر استفاده می‌شود."
        />
        <div className="space-y-2 rounded-xl border border-(--theme-border) p-3">
          <label className="flex items-center gap-2 text-xs font-semibold text-(--theme-text)">
            <input type="checkbox" checked={current.remove_logo_background} onChange={(event) => update({ remove_logo_background: event.target.checked })} className="h-4 w-4 accent-(--theme-primary)" />
            حذف زمینهٔ سفید، تیرگی و افکت از خودِ لوگو
          </label>
          <p className="text-[11px] leading-5 text-(--theme-text-muted)">
            این گزینه فقط روی تصویر یا ویدئوی لوگو اعمال می‌شود و رنگ و افکت پس‌زمینهٔ پریلودر را تغییر نمی‌دهد. برای نتیجهٔ بهتر، فایل لوگو با زمینهٔ روشن یا کانال شفافیت انتخاب کنید؛ حذف کامل هر رنگ از ویدئوی کدر ممکن نیست.
          </p>
        </div>

        <div className="space-y-2 rounded-xl border border-(--theme-border) p-3">
          <p className="text-xs font-bold text-(--theme-text)">اجزای قابل نمایش در حالت کامل</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {([
              ['show_logo', 'نمایش لوگو'],
              ['show_logo_frame', 'نمایش قاب و دایرهٔ سفید لوگو'],
              ['show_spinner', 'نمایش حلقهٔ متحرک'],
              ['show_text', 'نمایش متن'],
              ['show_dots', 'نمایش نقطه‌های متحرک'],
              ['show_particles', 'نمایش افکت‌های متحرک پس‌زمینه'],
            ] as const).map(([key, title]) => (
              <label key={key} className="flex items-center gap-2 rounded-xl border border-(--theme-border) bg-(--theme-surface-muted) p-3 text-xs font-semibold text-(--theme-text)">
                <input type="checkbox" checked={current[key]} onChange={(event) => update({ [key]: event.target.checked })} className="h-4 w-4 accent-(--theme-primary)" />
                {title}
              </label>
            ))}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1 text-xs">
            <span className="block font-semibold text-(--theme-text-muted)">متن فارسی (اختیاری)</span>
            <input value={current.text_fa} onChange={(event) => update({ text_fa: event.target.value })} className="w-full rounded-lg border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-xs text-(--theme-input-text)" />
          </label>
          <label className="space-y-1 text-xs">
            <span className="block font-semibold text-(--theme-text-muted)">Loading text (English, optional)</span>
            <input dir="ltr" value={current.text_en} onChange={(event) => update({ text_en: event.target.value })} className="w-full rounded-lg border border-(--theme-input-border) bg-(--theme-input-bg) px-3 py-2 text-xs text-(--theme-input-text)" />
          </label>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {sizeFields.map(({ key, label, icon: Icon, min, max, step }) => (
            <label key={key} className="space-y-1 rounded-xl border border-(--theme-border) bg-(--theme-surface-muted) p-3 text-xs">
              <span className="flex items-start justify-between gap-2 font-semibold text-(--theme-text)">
                <span className="flex min-w-0 items-center gap-1.5 text-[11px] leading-5">
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  <span>{label}</span>
                </span>
                <span dir="ltr" className="shrink-0 rounded-full bg-(--theme-surface) px-2 py-1 font-mono text-[10px] leading-none text-(--theme-text-muted)">
                  {key.startsWith('logo_size_')
                    ? `${Math.round(current[key] / 128 * 100)}٪`
                    : `${current[key]} px`}
                </span>
              </span>
              <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={current[key]}
                onChange={(event) => update({ [key]: Number(event.target.value) })}
                className="w-full accent-(--theme-primary)"
                aria-label={label}
              />
            </label>
          ))}
        </div>
        <p className="text-[11px] leading-5 text-(--theme-text-muted)">
          اندازهٔ لوگوی خروجی تمام‌صفحه بر اساس نمایشگر محاسبه می‌شود؛ بزرگ‌نمایی تا ۲۰۰٪ اندازهٔ پایه (حداکثر ۶۴٪ ارتفاع و ۹۰٪ عرض صفحه) قابل تنظیم است.
        </p>

      </section>

      <section className="space-y-3 rounded-2xl border border-(--theme-card-border) bg-(--theme-card-surface) p-5 shadow-(--theme-card-shadow)">
        <h3 className="text-xs font-extrabold text-(--theme-text)">پیش‌نمایش زنده · {mode === 'initial' ? 'لود اولیه' : 'لود داخلی'}</h3>
        <div
          className="overflow-hidden rounded-xl border border-(--theme-border)"
          style={{
            height: 'min(70dvh, 40rem)',
            minHeight: '28rem',
            backgroundColor: mode === 'internal' ? 'var(--theme-surface-muted)' : '#0f172a',
          }}
        >
          <EffectPreloader
            mode={mode}
            modeSettings={current}
            label="در حال آماده‌سازی نمونه..."
            fullScreen={false}
            className="h-full"
          />
        </div>
        <p className="text-[11px] leading-5 text-(--theme-text-muted)">پیش‌نمایش اندازه‌های مختلف را بر اساس عرض موبایل، تبلت و دسکتاپ در خروجی واقعی اعمال می‌کند.</p>
      </section>
    </div>
  );
};
