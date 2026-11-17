import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore.ts';
import { DEFAULT_APPEARANCE_SETTINGS, FONT_CSS_MAP } from '../../utils/brandingDefaults.ts';
import type {
  ButtonShape,
  ThemeButtonEffect,
  ThemeDesignStyle,
  ThemePalette,
  ThemeScope,
  ThemeSettings,
} from '../../types/index.ts';

function applyPaletteToRoot(
  palette: ThemePalette,
  mode: 'light' | 'dark',
  designStyle: ThemeDesignStyle,
  buttonShape: ButtonShape,
  buttonEffect: ThemeButtonEffect,
  scope: ThemeScope
) {
  const root = document.documentElement;
  root.dataset.themeScope = scope;
  root.dataset.themeStyle = designStyle;
  root.dataset.buttonShape = buttonShape;
  root.dataset.buttonEffect = buttonEffect;
  root.style.setProperty('--theme-primary', palette.primary);
  root.style.setProperty('--theme-primary-hover', `color-mix(in srgb, ${palette.primary} 86%, black)`);
  root.style.setProperty('--theme-secondary', palette.secondary);
  root.style.setProperty('--theme-accent', palette.accent);
  root.style.setProperty('--theme-btn-bg', palette.buttonBg);
  root.style.setProperty('--theme-btn-text', palette.buttonText);
  root.style.setProperty('--theme-link', palette.link);

  if (mode === 'light') {
    root.style.setProperty('--theme-bg', palette.background);
    root.style.setProperty('--theme-surface', palette.surface);
    root.style.setProperty('--theme-text', palette.text);
    root.style.setProperty('--theme-header-bg', palette.headerBg);
    root.style.setProperty('--theme-header-text', palette.headerText);
    root.style.setProperty('--theme-footer-bg', palette.footerBg);
    root.style.setProperty('--theme-footer-text', palette.footerText);
  } else {
    root.style.setProperty('--theme-bg', '#0B1120');
    root.style.setProperty('--theme-surface', '#111827');
    root.style.setProperty('--theme-text', '#F8FAFC');
    root.style.setProperty('--theme-header-bg', '#0F172A');
    root.style.setProperty('--theme-header-text', '#F8FAFC');
    root.style.setProperty('--theme-footer-bg', '#060913');
    root.style.setProperty('--theme-footer-text', '#E2E8F0');
  }
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const {
    bootstrap,
    colorMode,
    previewTheme,
    previewScope,
    previewMode,
    previewAppearance,
  } = useAppStore();
  const hasSavedMode = localStorage.getItem('ppa_mode') !== null;
  const effectiveMode = previewMode || (hasSavedMode
    ? colorMode
    : previewTheme?.default_mode || bootstrap?.theme?.default_mode || colorMode);

  useEffect(() => {
    if (effectiveMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [effectiveMode]);

  useEffect(() => {
    const theme: ThemeSettings | undefined = previewTheme || bootstrap?.theme || undefined;
    const isLanding = location.pathname === '/';
    const routeScope: ThemeScope = isLanding && (theme?.landing_theme_enabled ?? true)
      ? 'landing'
      : location.pathname.startsWith('/admin')
        ? 'admin'
        : 'site';
    const scope = previewScope || routeScope;

    if (theme) {
      const palette = scope === 'landing'
        ? theme.landing_palette
        : scope === 'admin'
          ? theme.admin_palette || theme.active_palette
          : theme.active_palette;
      const designStyle = scope === 'landing'
        ? theme.landing_design_style || theme.design_style
        : scope === 'admin'
          ? theme.admin_design_style || theme.design_style
          : theme.design_style;
      const buttonShape = scope === 'landing'
        ? theme.landing_button_shape || theme.button_shape
        : scope === 'admin'
          ? theme.admin_button_shape || theme.button_shape
          : theme.button_shape;
      const buttonEffect = scope === 'landing'
        ? theme.landing_button_effect || theme.button_effect
        : scope === 'admin'
          ? theme.admin_button_effect || theme.button_effect
          : theme.button_effect;
      applyPaletteToRoot(
        palette,
        effectiveMode,
        designStyle,
        buttonShape,
        buttonEffect,
        scope
      );
    }

    const appearance = {
      ...DEFAULT_APPEARANCE_SETTINGS,
      ...(bootstrap?.appearance || {}),
      ...(previewAppearance || {}),
    };
    const root = document.documentElement;
    const activeBodyKey = isLanding
      ? appearance.font_landing
      : location.pathname.startsWith('/admin')
        ? appearance.font_admin
        : location.pathname === '/login' || location.pathname === '/register'
          ? appearance.font_login
          : appearance.font_site;
    const activeHeadingKey = isLanding
      ? appearance.font_landing_heading
      : location.pathname.startsWith('/admin')
        ? appearance.font_admin_heading
        : location.pathname === '/login' || location.pathname === '/register'
          ? appearance.font_login_heading
          : appearance.font_site_heading;

    root.style.setProperty('--font-active', FONT_CSS_MAP[activeBodyKey] || FONT_CSS_MAP.vazirmatn);
    root.style.setProperty('--font-heading', FONT_CSS_MAP[activeHeadingKey] || FONT_CSS_MAP.vazirmatn);
    root.style.setProperty('--font-navbar', FONT_CSS_MAP[appearance.font_navbar] || FONT_CSS_MAP.vazirmatn);
    root.style.setProperty('--font-footer', FONT_CSS_MAP[appearance.font_footer] || FONT_CSS_MAP.vazirmatn);
    root.style.setProperty('--font-login', FONT_CSS_MAP[appearance.font_login] || FONT_CSS_MAP['ibm-plex-arabic']);
    root.style.setProperty('--font-login-heading', FONT_CSS_MAP[appearance.font_login_heading] || FONT_CSS_MAP.vazirmatn);
    root.style.setProperty('--font-admin', FONT_CSS_MAP[appearance.font_admin] || FONT_CSS_MAP.vazirmatn);
    root.style.setProperty('--font-admin-heading', FONT_CSS_MAP[appearance.font_admin_heading] || FONT_CSS_MAP.vazirmatn);
    const clampedSize = Math.min(20, Math.max(13, Number(appearance.base_font_size) || 16));
    root.style.setProperty('--font-size-base', `${clampedSize}px`);
  }, [
    bootstrap,
    location.pathname,
    effectiveMode,
    previewTheme,
    previewScope,
    previewMode,
    previewAppearance,
  ]);

  return <>{children}</>;
};
