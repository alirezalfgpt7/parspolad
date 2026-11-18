import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore.ts';
import {
  DEFAULT_APPEARANCE_SETTINGS,
  DEFAULT_THEME_PALETTE,
  FONT_CSS_MAP,
} from '../../utils/brandingDefaults.ts';
import type {
  ButtonShape,
  ThemeButtonEffect,
  ThemeDesignStyle,
  ThemePalette,
  ThemeScope,
  ThemeSettings,
} from '../../types/index.ts';

function paletteColor(value: string | undefined, fallback: string): string {
  return value && value.trim() !== '' && value.trim().toLowerCase() !== 'undefined'
    ? value
    : fallback;
}

function applyPaletteToRoot(
  palette: Partial<ThemePalette>,
  mode: 'light' | 'dark',
  designStyle: ThemeDesignStyle,
  buttonShape: ButtonShape,
  buttonEffect: ThemeButtonEffect,
  scope: ThemeScope
) {
  const root = document.documentElement;
  const colors: ThemePalette = {
    primary: paletteColor(palette.primary, DEFAULT_THEME_PALETTE.primary),
    secondary: paletteColor(palette.secondary, DEFAULT_THEME_PALETTE.secondary),
    accent: paletteColor(palette.accent, DEFAULT_THEME_PALETTE.accent),
    background: paletteColor(palette.background, DEFAULT_THEME_PALETTE.background),
    surface: paletteColor(palette.surface, DEFAULT_THEME_PALETTE.surface),
    text: paletteColor(palette.text, DEFAULT_THEME_PALETTE.text),
    headerBg: paletteColor(palette.headerBg, DEFAULT_THEME_PALETTE.headerBg),
    headerText: paletteColor(palette.headerText, DEFAULT_THEME_PALETTE.headerText),
    footerBg: paletteColor(palette.footerBg, DEFAULT_THEME_PALETTE.footerBg),
    footerText: paletteColor(palette.footerText, DEFAULT_THEME_PALETTE.footerText),
    buttonBg: paletteColor(palette.buttonBg, DEFAULT_THEME_PALETTE.buttonBg),
    buttonText: paletteColor(palette.buttonText, DEFAULT_THEME_PALETTE.buttonText),
    link: paletteColor(palette.link, DEFAULT_THEME_PALETTE.link),
  };
  root.dataset.themeScope = scope;
  root.dataset.themeStyle = designStyle;
  root.dataset.buttonShape = buttonShape;
  root.dataset.buttonEffect = buttonEffect;
  root.style.setProperty('--theme-primary', colors.primary);
  root.style.setProperty('--theme-primary-hover', `color-mix(in srgb, ${colors.primary} 86%, black)`);
  root.style.setProperty('--theme-secondary', colors.secondary);
  root.style.setProperty('--theme-accent', colors.accent);
  root.style.setProperty('--theme-btn-bg', colors.buttonBg);
  root.style.setProperty('--theme-btn-text', colors.buttonText);
  root.style.setProperty('--theme-link', colors.link);

  if (mode === 'light') {
    root.style.setProperty('--theme-bg', colors.background);
    root.style.setProperty('--theme-surface', colors.surface);
    root.style.setProperty('--theme-text', colors.text);
    root.style.setProperty('--theme-header-bg', colors.headerBg);
    root.style.setProperty('--theme-header-text', colors.headerText);
    root.style.setProperty('--theme-footer-bg', colors.footerBg);
    root.style.setProperty('--theme-footer-text', colors.footerText);
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
