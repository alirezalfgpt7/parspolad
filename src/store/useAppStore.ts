import { create } from 'zustand';
import { apiRequest } from '../services/api.ts';
import type {
  AppearanceSettings,
  Banner,
  BrandLogosSettings,
  ColorMode,
  KPI,
  Language,
  LoginPageSettings,
  Menu,
  PageContent,
  PagesConfigSettings,
  Partner,
  ProjectCategory,
  Service,
  SiteSettings,
  Slider,
  ThemePreset,
  ThemeScope,
  ThemeSettings,
  User,
} from '../types/index.ts';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  text: string;
}

export interface BootstrapPayload {
  theme: ThemeSettings | null;
  presets: ThemePreset[];
  menus: Menu[];
  sliders: Slider[];
  kpis: KPI[];
  banners: Banner[];
  categories: ProjectCategory[];
  partners: Partner[];
  services: Service[];
  pages: PageContent[];
  company: SiteSettings['company'];
  map: SiteSettings['map'];
  seo: SiteSettings['seo'];
  site: SiteSettings['site'];
  login?: Partial<LoginPageSettings>;
  appearance?: Partial<AppearanceSettings>;
  logos?: Partial<BrandLogosSettings>;
  pages_config?: PagesConfigSettings;
  is_authenticated: boolean;
}

interface AppState {
  loading: boolean;
  language: Language;
  colorMode: ColorMode;
  user: User | null;
  token: string | null;
  bootstrap: BootstrapPayload | null;
  previewTheme: ThemeSettings | null;
  previewScope: ThemeScope | null;
  previewMode: ColorMode | null;
  previewLogin: Partial<LoginPageSettings> | null;
  previewLogos: Partial<BrandLogosSettings> | null;
  previewAppearance: Partial<AppearanceSettings> | null;
  previewPagesConfig: PagesConfigSettings | null;
  searchOpen: boolean;
  toasts: ToastMessage[];
  setLanguage: (lang: Language) => void;
  setColorMode: (mode: ColorMode) => void;
  toggleColorMode: () => void;
  setAuth: (user: User | null, token: string | null) => void;
  logout: () => Promise<void>;
  fetchBootstrap: () => Promise<void>;
  fetchMe: () => Promise<void>;
  setPreviewTheme: (
    theme: ThemeSettings | null,
    scope?: ThemeScope | null,
    mode?: ColorMode | null
  ) => void;
  setPreviewBranding: (patch: {
    login?: Partial<LoginPageSettings> | null;
    logos?: Partial<BrandLogosSettings> | null;
    appearance?: Partial<AppearanceSettings> | null;
    pages_config?: PagesConfigSettings | null;
  } | null) => void;
  setSearchOpen: (open: boolean) => void;
  addToast: (type: ToastMessage['type'], text: string) => void;
  removeToast: (id: string) => void;
}

const savedLang = (localStorage.getItem('ppa_lang') as Language) || 'fa';
const savedMode = (localStorage.getItem('ppa_mode') as ColorMode) || 'light';
const savedToken = localStorage.getItem('ppa_token');

export const useAppStore = create<AppState>((set, get) => ({
  loading: true,
  language: savedLang,
  colorMode: savedMode,
  user: null,
  token: savedToken,
  bootstrap: null,
  previewTheme: null,
  previewScope: null,
  previewMode: null,
  previewLogin: null,
  previewLogos: null,
  previewAppearance: null,
  previewPagesConfig: null,
  searchOpen: false,
  toasts: [],

  setLanguage: (lang) => {
    localStorage.setItem('ppa_lang', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
    set({ language: lang });
  },

  setColorMode: (mode) => {
    localStorage.setItem('ppa_mode', mode);
    if (mode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    set({ colorMode: mode });
  },

  toggleColorMode: () => {
    const next = get().colorMode === 'dark' ? 'light' : 'dark';
    get().setColorMode(next);
  },

  setAuth: (user, token) => {
    if (token) {
      localStorage.setItem('ppa_token', token);
    } else {
      localStorage.removeItem('ppa_token');
    }
    set({ user, token });
  },

  logout: async () => {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    localStorage.removeItem('ppa_token');
    set({ user: null, token: null });
  },

  fetchBootstrap: async () => {
    try {
      const data = await apiRequest<BootstrapPayload>('/bootstrap', { cache: 'no-store' });
      set({ bootstrap: data, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  fetchMe: async () => {
    const token = get().token;
    if (!token) return;
    try {
      const res = await apiRequest<{ user: User }>('/auth/me');
      set({ user: res.user });
    } catch {
      localStorage.removeItem('ppa_token');
      set({ user: null, token: null });
    }
  },

  setPreviewTheme: (
    theme,
    scope = null,
    mode = null
  ) =>
    set({
      previewTheme: theme,
      previewScope: theme ? scope : null,
      previewMode: theme ? mode : null,
    }),

  setPreviewBranding: (patch) =>
    set((state) => (patch === null
      ? {
          previewLogin: null,
          previewLogos: null,
          previewAppearance: null,
          previewPagesConfig: null,
        }
      : {
          previewLogin: patch.login !== undefined ? patch.login : state.previewLogin,
          previewLogos: patch.logos !== undefined ? patch.logos : state.previewLogos,
          previewAppearance: patch.appearance !== undefined ? patch.appearance : state.previewAppearance,
          previewPagesConfig: patch.pages_config !== undefined ? patch.pages_config : state.previewPagesConfig,
        })),

  setSearchOpen: (open) => set({ searchOpen: open }),

  addToast: (type, text) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    set((s) => ({ toasts: [...s.toasts, { id, type, text }] }));
    setTimeout(() => get().removeToast(id), 4200);
  },

  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
