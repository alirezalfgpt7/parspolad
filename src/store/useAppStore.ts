import { create } from 'zustand';
import { apiRequest } from '../services/api.ts';
import type {
  Banner,
  ColorMode,
  KPI,
  Language,
  Menu,
  PageContent,
  Partner,
  ProjectCategory,
  Service,
  SiteSettings,
  Slider,
  ThemePalette,
  ThemePreset,
  ThemeSettings,
  User,
} from '../types/index.ts';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  text: string;
}

interface BootstrapPayload {
  theme: ThemeSettings;
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
  is_authenticated: boolean;
}

interface AppState {
  loading: boolean;
  language: Language;
  colorMode: ColorMode;
  user: User | null;
  token: string | null;
  bootstrap: BootstrapPayload | null;
  previewPalette: ThemePalette | null;
  previewLandingPalette: ThemePalette | null;
  searchOpen: boolean;
  toasts: ToastMessage[];
  setLanguage: (lang: Language) => void;
  setColorMode: (mode: ColorMode) => void;
  toggleColorMode: () => void;
  setAuth: (user: User | null, token: string | null) => void;
  logout: () => Promise<void>;
  fetchBootstrap: () => Promise<void>;
  fetchMe: () => Promise<void>;
  setPreviewTheme: (palette: ThemePalette | null, landingPalette?: ThemePalette | null) => void;
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
  previewPalette: null,
  previewLandingPalette: null,
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
      const data = await apiRequest<BootstrapPayload>('/bootstrap');
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

  setPreviewTheme: (palette, landingPalette = null) =>
    set({ previewPalette: palette, previewLandingPalette: landingPalette }),

  setSearchOpen: (open) => set({ searchOpen: open }),

  addToast: (type, text) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    set((s) => ({ toasts: [...s.toasts, { id, type, text }] }));
    setTimeout(() => get().removeToast(id), 4200);
  },

  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
