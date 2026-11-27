import React, { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, Search } from 'lucide-react';
import { apiRequest } from '../../services/api.ts';
import type {
  HomepageSectionKey,
  HomepageSectionSetting,
  HomepageSectionsSettings,
  HomepageSelectedItem,
} from '../../utils/homepageSections.ts';

interface HomepageSectionsSettingsEditorProps {
  settings: HomepageSectionsSettings;
  onChange: (settings: HomepageSectionsSettings) => void;
}

interface SectionDefinition {
  key: HomepageSectionKey;
  label: string;
  resource: string;
  modes: Array<{ value: string; label: string }>;
  max: number;
}

const sectionDefinitions: SectionDefinition[] = [
  {
    key: 'projects',
    label: 'کارنامهٔ اجرایی · پروژه‌ها',
    resource: 'projects',
    modes: [
      { value: 'latest', label: 'پروژه‌های جدیدتر' },
      { value: 'oldest', label: 'پروژه‌های قدیمی‌تر' },
      { value: 'featured', label: 'پروژه‌های ویژه' },
      { value: 'selected', label: 'انتخاب دستی' },
    ],
    max: 12,
  },
  {
    key: 'articles',
    label: 'اخبار و مقالات',
    resource: 'articles',
    modes: [
      { value: 'latest', label: 'جدیدترین' },
      { value: 'oldest', label: 'قدیمی‌ترین' },
      { value: 'selected', label: 'انتخاب دستی' },
    ],
    max: 12,
  },
  {
    key: 'services',
    label: 'مسیر خدمات و توانمندی‌ها',
    resource: 'services',
    modes: [
      { value: 'ordered', label: 'ترتیب ثبت‌شده در خدمات' },
      { value: 'selected', label: 'انتخاب دستی' },
    ],
    max: 4,
  },
  {
    key: 'products',
    label: 'زنجیرهٔ محصولات و تجهیزات',
    resource: 'products',
    modes: [
      { value: 'ordered', label: 'ترتیب ثبت‌شده در محصولات' },
      { value: 'selected', label: 'انتخاب دستی' },
    ],
    max: 12,
  },
  {
    key: 'partners',
    label: 'کارفرمایان و شرکا',
    resource: 'partners',
    modes: [
      { value: 'ordered', label: 'ترتیب ثبت‌شده' },
      { value: 'selected', label: 'انتخاب دستی' },
    ],
    max: 50,
  },
  {
    key: 'kpis',
    label: 'شاخص‌های عملکرد',
    resource: 'kpis',
    modes: [
      { value: 'ordered', label: 'ترتیب ثبت‌شده' },
      { value: 'selected', label: 'انتخاب دستی' },
    ],
    max: 50,
  },
  {
    key: 'banners',
    label: 'بنرهای میانی صفحهٔ خانه',
    resource: 'banners',
    modes: [
      { value: 'ordered', label: 'ترتیب ثبت‌شده' },
      { value: 'selected', label: 'انتخاب دستی' },
    ],
    max: 50,
  },
];

const labelForRecord = (record: Record<string, unknown>): string => {
  for (const field of ['title_fa', 'name_fa', 'label_fa', 'title_en', 'name_en', 'key']) {
    const value = record[field];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return `رکورد #${String(record.id ?? '')}`;
};

interface HomepageRecordPickerProps {
  resource: string;
  sectionLabel: string;
  selectedItems: HomepageSelectedItem[];
  onChange: (items: HomepageSelectedItem[]) => void;
}

const HomepageRecordPicker: React.FC<HomepageRecordPickerProps> = ({
  resource,
  sectionLabel,
  selectedItems,
  onChange,
}) => {
  const [search, setSearch] = useState('');
  const [options, setOptions] = useState<HomepageSelectedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams({ per_page: '20' });
      let path: string;
      if (resource === 'projects') {
        if (search.trim()) params.set('q', search.trim());
        path = `/projects?${params.toString()}`;
      } else {
        params.set('page', '1');
        if (search.trim()) params.set('search', search.trim());
        path = `/admin/${resource}?${params.toString()}`;
      }

      setLoading(true);
      setError('');
      apiRequest<{ data: Array<Record<string, unknown>> }>(path)
        .then((response) => {
          if (!Array.isArray(response.data)) {
            throw new TypeError('Homepage section picker response must include a data array.');
          }
          const records = response.data
            .filter((record) => resource !== 'banners' || (record.placement === 'landing_mid' && record.is_active === true))
            .filter((record) => resource !== 'partners' || record.is_active === true)
            .flatMap((record): HomepageSelectedItem[] => {
              const id = Number(record.id);
              return Number.isInteger(id) && id > 0 ? [{ id, label: labelForRecord(record) }] : [];
            });
          if (active) setOptions(records);
        })
        .catch((cause: unknown) => {
          if (!active) return;
          setOptions([]);
          setError(cause instanceof Error ? cause.message : 'دریافت گزینه‌ها ناموفق بود.');
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    }, 250);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [resource, search]);

  const toggleItem = (item: HomepageSelectedItem, checked: boolean) => {
    onChange(
      checked
        ? [...selectedItems.filter((selected) => selected.id !== item.id), item]
        : selectedItems.filter((selected) => selected.id !== item.id),
    );
  };

  const moveItem = (index: number, offset: -1 | 1) => {
    const target = index + offset;
    if (target < 0 || target >= selectedItems.length) return;
    const reordered = [...selectedItems];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    onChange(reordered);
  };

  return (
    <div className="space-y-3 rounded-xl border border-(--theme-border) bg-(--theme-surface) p-3">
      <label className="relative block">
        <Search className="pointer-events-none absolute inset-s-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--theme-placeholder)" />
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          aria-label={`جست‌وجو در گزینه‌های ${sectionLabel}`}
          placeholder={`جست‌وجوی ${sectionLabel}...`}
          className="w-full rounded-lg border border-(--theme-input-border) bg-(--theme-input-bg) py-2 ps-9 pe-3 text-xs text-(--theme-input-text) placeholder:text-(--theme-placeholder) outline-none focus:border-(--theme-primary)"
        />
      </label>

      {selectedItems.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[11px] font-bold text-(--theme-text-muted)">ترتیب نمایش انتخاب‌ها</p>
          <ol className="max-h-36 space-y-1 overflow-y-auto">
            {selectedItems.map((item, index) => (
              <li key={item.id} className="flex items-center gap-2 rounded-lg bg-(--theme-surface-muted) px-2 py-1.5">
                <span className="min-w-0 flex-1 truncate text-xs text-(--theme-text)">{item.label}</span>
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => moveItem(index, -1)}
                  aria-label={`انتقال ${item.label} به بالا`}
                  className="rounded p-1 text-(--theme-text-muted) hover:text-(--theme-primary-ink) disabled:opacity-40"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  disabled={index === selectedItems.length - 1}
                  onClick={() => moveItem(index, 1)}
                  aria-label={`انتقال ${item.label} به پایین`}
                  className="rounded p-1 text-(--theme-text-muted) hover:text-(--theme-primary-ink) disabled:opacity-40"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => toggleItem(item, false)}
                  aria-label={`حذف ${item.label} از انتخاب‌ها`}
                  className="rounded px-1.5 py-0.5 text-xs font-bold text-red-600 hover:bg-red-500/10"
                >
                  ×
                </button>
              </li>
            ))}
          </ol>
        </div>
      )}

      {loading ? (
        <p className="text-xs text-(--theme-text-muted)" role="status">در حال جست‌وجوی رکوردها...</p>
      ) : error ? (
        <p className="text-xs text-red-600" role="alert">{error}</p>
      ) : options.length > 0 ? (
        <div className="max-h-44 space-y-1 overflow-y-auto rounded-lg border border-(--theme-border) p-2">
          {options.map((option) => (
            <label key={option.id} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-xs text-(--theme-text) hover:bg-(--theme-surface-muted)">
              <input
                type="checkbox"
                checked={selectedItems.some((selected) => selected.id === option.id)}
                onChange={(event) => toggleItem(option, event.target.checked)}
                className="h-4 w-4 accent-(--theme-primary)"
              />
              <span className="min-w-0 flex-1 truncate">{option.label}</span>
            </label>
          ))}
        </div>
      ) : (
        <p className="text-xs text-(--theme-text-muted)">رکوردی برای این جست‌وجو پیدا نشد.</p>
      )}
    </div>
  );
};

export const HomepageSectionsSettingsEditor: React.FC<HomepageSectionsSettingsEditorProps> = ({
  settings,
  onChange,
}) => {
  const updateSection = (key: HomepageSectionKey, patch: Partial<HomepageSectionSetting>) => {
    onChange({ ...settings, [key]: { ...settings[key], ...patch } });
  };

  return (
    <section className="space-y-4 rounded-2xl border border-(--theme-card-border) bg-(--theme-card-surface) p-4 shadow-(--theme-card-shadow)">
      <header>
        <h3 className="text-sm font-extrabold text-(--theme-text)">منبع و تعداد نمایش بخش‌های صفحهٔ خانه</h3>
        <p className="mt-1 text-xs leading-5 text-(--theme-text-muted)">
          هر بخش فقط رکوردهای موردنیاز را از سرور می‌گیرد؛ در انتخاب دستی، ترتیب همین فهرست در سایت رعایت می‌شود.
          اسلایدر و محتوای معرفی صفحه تنظیمات اختصاصی خود را دارند.
        </p>
      </header>

      <div className="grid items-start gap-4 xl:grid-cols-2">
        {sectionDefinitions.map((definition) => {
          const setting = settings[definition.key];
          const isManual = setting.mode === 'selected';
          return (
            <article key={definition.key} className="space-y-3 rounded-xl border border-(--theme-border) bg-(--theme-surface-muted) p-3">
              <h4 className="text-xs font-bold text-(--theme-text)">{definition.label}</h4>
              <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_8rem]">
                <label className="space-y-1 text-[11px] font-semibold text-(--theme-text-muted)">
                  روش انتخاب
                  <select
                    value={setting.mode}
                    onChange={(event) => updateSection(definition.key, { mode: event.target.value })}
                    className="h-10 w-full rounded-lg border border-(--theme-input-border) bg-(--theme-input-bg) px-2 text-xs text-(--theme-input-text)"
                  >
                    {definition.modes.map((mode) => (
                      <option key={mode.value} value={mode.value}>{mode.label}</option>
                    ))}
                  </select>
                </label>
                <label className="space-y-1 text-[11px] font-semibold text-(--theme-text-muted)">
                  تعداد نمایش
                  <input
                    type="number"
                    min="0"
                    max={definition.max}
                    value={setting.limit}
                    onChange={(event) => {
                      const count = Number(event.target.value);
                      updateSection(definition.key, {
                        limit: Number.isFinite(count) ? Math.min(definition.max, Math.max(0, Math.floor(count))) : 0,
                      });
                    }}
                    className="h-10 w-full rounded-lg border border-(--theme-input-border) bg-(--theme-input-bg) px-3 text-sm text-(--theme-input-text)"
                  />
                </label>
              </div>
              {isManual && (
                <HomepageRecordPicker
                  resource={definition.resource}
                  sectionLabel={definition.label}
                  selectedItems={setting.selected_items}
                  onChange={(selected_items) => updateSection(definition.key, { selected_items })}
                />
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
};
