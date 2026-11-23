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
  PreloaderSettings,
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
  preloader?: Partial<PreloaderSettings>;
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
  previewPreloader: Partial<PreloaderSettings> | null;
  cachedPreloader: Partial<PreloaderSettings> | null;
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
    preloader?: Partial<PreloaderSettings> | null;
  } | null) => void;
  setSearchOpen: (open: boolean) => void;
  addToast: (type: ToastMessage['type'], text: string) => void;
  removeToast: (id: string) => void;
}

function applyDocumentColorMode(mode: ColorMode) {
  if (typeof document === 'undefined') return;
  document.documentElement.dataset.colorMode = mode;
  if (mode === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

function readSavedColorMode(): { mode: ColorMode; hasSaved: boolean } {
  try {
    const raw = localStorage.getItem('ppa_mode');
    if (raw === 'dark' || raw === 'light') {
      return { mode: raw, hasSaved: true };
    }
  } catch {
    // ignore storage errors
  }
  return { mode: 'light', hasSaved: false };
}

function readSavedPreloader(): Partial<PreloaderSettings> | null {
  try {
    const raw = localStorage.getItem('ppa_preloader');
    if (!raw) return null;
    const value: unknown = JSON.parse(raw);
    return value && typeof value === 'object' && !Array.isArray(value)
      ? value as Partial<PreloaderSettings>
      : null;
  } catch {
    return null;
  }
}

const savedLang = (() => {
  try {
    return (localStorage.getItem('ppa_lang') as Language) || 'fa';
  } catch {
    return 'fa';
  }
})();
const initialColorState = readSavedColorMode();
applyDocumentColorMode(initialColorState.mode);
const savedToken = (() => {
  try {
    return localStorage.getItem('ppa_token');
  } catch {
    return null;
  }
})();
const savedPreloader = readSavedPreloader();

export const useAppStore = create<AppState>((set, get) => ({
  loading: true,
  language: savedLang,
  colorMode: initialColorState.mode,
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
  previewPreloader: null,
  cachedPreloader: savedPreloader,
  searchOpen: false,
  toasts: [],

  setLanguage: (lang) => {
    try {
      localStorage.setItem('ppa_lang', lang);
    } catch {
      // ignore storage errors
    }
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
    set({ language: lang });
  },

  setColorMode: (mode) => {
    try {
      localStorage.setItem('ppa_mode', mode);
    } catch {
      // ignore storage errors
    }
    applyDocumentColorMode(mode);
    set({ colorMode: mode, previewMode: null });
  },

  toggleColorMode: () => {
    const current = get().previewMode || get().colorMode;
    const next: ColorMode = current === 'dark' ? 'light' : 'dark';
    get().setColorMode(next);
  },

  setAuth: (user, token) => {
    try {
      if (token) {
        localStorage.setItem('ppa_token', token);
      } else {
        localStorage.removeItem('ppa_token');
      }
    } catch {
      // ignore storage errors
    }
    set({ user, token });
  },

  logout: async () => {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    try {
      localStorage.removeItem('ppa_token');
    } catch {
      // ignore storage errors
    }
    set({ user: null, token: null });
  },

  fetchBootstrap: async () => {
    try {
      const data = await apiRequest<BootstrapPayload>('/bootstrap', { cache: 'no-store' });
      if (data?.preloader) {
        try {
          localStorage.setItem('ppa_preloader', JSON.stringify(data.preloader));
        } catch {
          // Ignore storage quota and privacy-mode failures.
        }
      }
      const { hasSaved } = readSavedColorMode();
      const bootstrapMode = data?.theme?.default_mode;
      if (!hasSaved && (bootstrapMode === 'light' || bootstrapMode === 'dark')) {
        applyDocumentColorMode(bootstrapMode);
        set({ bootstrap: data, cachedPreloader: data?.preloader ?? get().cachedPreloader, colorMode: bootstrapMode, loading: false });
      } else {
        set({ bootstrap: data, cachedPreloader: data?.preloader ?? get().cachedPreloader, loading: false });
      }
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
      try {
        localStorage.removeItem('ppa_token');
      } catch {
        // ignore storage errors
      }
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
          previewPreloader: null,
        }
      : {
          previewLogin: patch.login !== undefined ? patch.login : state.previewLogin,
          previewLogos: patch.logos !== undefined ? patch.logos : state.previewLogos,
          previewAppearance: patch.appearance !== undefined ? patch.appearance : state.previewAppearance,
          previewPagesConfig: patch.pages_config !== undefined ? patch.pages_config : state.previewPagesConfig,
          previewPreloader: patch.preloader !== undefined ? patch.preloader : state.previewPreloader,
        })),

  setSearchOpen: (open) => set({ searchOpen: open }),

  addToast: (type, text) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    set((s) => ({ toasts: [...s.toasts, { id, type, text }] }));
    setTimeout(() => get().removeToast(id), 4200);
  },

  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
