import type { Article, Banner, KPI, Partner, Product, Project, Service } from '../types/index.ts';

export type HomepageSectionKey = 'projects' | 'articles' | 'services' | 'products' | 'partners' | 'kpis' | 'banners';

export interface HomepageSelectedItem {
  id: number;
  label: string;
}

export interface HomepageSectionSetting {
  mode: string;
  limit: number;
  selected_items: HomepageSelectedItem[];
}

export type HomepageSectionsSettings = Record<HomepageSectionKey, HomepageSectionSetting>;

export type HomepageProject = Pick<
  Project,
  | 'id' | 'slug' | 'title_fa' | 'title_en' | 'category_id' | 'category'
  | 'client_name_fa' | 'client_name_en' | 'contract_number' | 'year'
  | 'status' | 'summary_fa' | 'summary_en' | 'cover_image'
>;
export type HomepageArticle = Pick<
  Article,
  | 'id' | 'slug' | 'title_fa' | 'title_en' | 'excerpt_fa' | 'excerpt_en'
  | 'category_fa' | 'category_en' | 'cover_image' | 'image_fit'
  | 'author_fa' | 'published_at' | 'read_minutes'
>;
export type HomepageService = Pick<
  Service,
  'id' | 'slug' | 'title_fa' | 'title_en' | 'summary_fa' | 'summary_en' | 'sort_order'
>;
export type HomepageProduct = Pick<
  Product,
  'id' | 'slug' | 'name_fa' | 'name_en' | 'category_fa' | 'category_en'
  | 'model_code' | 'summary_fa' | 'summary_en' | 'image_url' | 'catalog_url'
>;

export interface HomepageSectionData {
  projects: HomepageProject[];
  articles: HomepageArticle[];
  services: HomepageService[];
  products: HomepageProduct[];
  partners: Partner[];
  kpis: KPI[];
  banners: Banner[];
}

const sectionDefaults: Record<HomepageSectionKey, { mode: string; limit: number; modes: string[]; max: number }> = {
  projects: { mode: 'latest', limit: 6, modes: ['latest', 'oldest', 'featured', 'selected'], max: 12 },
  articles: { mode: 'latest', limit: 3, modes: ['latest', 'oldest', 'selected'], max: 12 },
  services: { mode: 'ordered', limit: 4, modes: ['ordered', 'selected'], max: 4 },
  products: { mode: 'ordered', limit: 4, modes: ['ordered', 'selected'], max: 12 },
  partners: { mode: 'ordered', limit: 50, modes: ['ordered', 'selected'], max: 50 },
  kpis: { mode: 'ordered', limit: 50, modes: ['ordered', 'selected'], max: 50 },
  banners: { mode: 'ordered', limit: 50, modes: ['ordered', 'selected'], max: 50 },
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export const defaultHomepageSectionsSettings = (): HomepageSectionsSettings => ({
  projects: { mode: 'latest', limit: 6, selected_items: [] },
  articles: { mode: 'latest', limit: 3, selected_items: [] },
  services: { mode: 'ordered', limit: 4, selected_items: [] },
  products: { mode: 'ordered', limit: 4, selected_items: [] },
  partners: { mode: 'ordered', limit: 50, selected_items: [] },
  kpis: { mode: 'ordered', limit: 50, selected_items: [] },
  banners: { mode: 'ordered', limit: 50, selected_items: [] },
});

export const normalizeHomepageSectionsSettings = (value: unknown): HomepageSectionsSettings => {
  const source = isRecord(value) ? value : {};

  return Object.fromEntries(
    Object.entries(sectionDefaults).map(([key, defaults]) => {
      const section = isRecord(source[key]) ? source[key] : {};
      const mode = typeof section.mode === 'string' && defaults.modes.includes(section.mode)
        ? section.mode
        : defaults.mode;
      const rawLimit = Number(section.limit);
      const limit = Number.isFinite(rawLimit)
        ? Math.max(0, Math.min(defaults.max, Math.floor(rawLimit)))
        : defaults.limit;
      const selectedItems = Array.isArray(section.selected_items)
        ? section.selected_items.flatMap((item): HomepageSelectedItem[] => {
            if (typeof item === 'number' && Number.isInteger(item) && item > 0) {
              return [{ id: item, label: `رکورد #${item}` }];
            }
            if (!isRecord(item) || typeof item.id !== 'number' || !Number.isInteger(item.id) || item.id < 1) return [];
            return [{
              id: Number(item.id),
              label: typeof item.label === 'string' && item.label.trim() ? item.label : `رکورد #${item.id}`,
            }];
          })
        : [];

      return [key, { mode, limit, selected_items: selectedItems }];
    }),
  ) as HomepageSectionsSettings;
};
