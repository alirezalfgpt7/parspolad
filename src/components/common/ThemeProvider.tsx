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

function relativeLuminance(hex: string): number {
  const normalized = hex.replace('#', '');
  if (!/^[0-9a-f]{6}$/i.test(normalized)) return 0;
  const channels = [0, 2, 4].map((offset) => {
    const value = parseInt(normalized.slice(offset, offset + 2), 16) / 255;
    return value <= 0.03928 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
  });
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

function contrastRatio(first: string, second: string): number {
  const lighter = Math.max(relativeLuminance(first), relativeLuminance(second));
  const darker = Math.min(relativeLuminance(first), relativeLuminance(second));
  return (lighter + 0.05) / (darker + 0.05);
}

function readableText(preferred: string, background: string): string {
  if (contrastRatio(preferred, background) >= 4.5) return preferred;
  return relativeLuminance(background) > 0.45 ? '#0F172A' : '#FFFFFF';
}

function mixHex(first: string, second: string, firstWeight: number): string {
  const normalize = (hex: string) => /^#[0-9a-f]{6}$/i.test(hex) ? hex.slice(1) : '000000';
  const a = normalize(first);
  const b = normalize(second);
  const weight = Math.min(1, Math.max(0, firstWeight));
  const channels = [0, 2, 4].map((offset) => {
    const firstChannel = parseInt(a.slice(offset, offset + 2), 16);
    const secondChannel = parseInt(b.slice(offset, offset + 2), 16);
    return Math.round(firstChannel * weight + secondChannel * (1 - weight))
      .toString(16)
      .padStart(2, '0');
  });
  return `#${channels.join('')}`;
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
  root.dataset.colorMode = mode;
  root.style.setProperty('--theme-primary', colors.primary);
  root.style.setProperty('--theme-primary-hover', `color-mix(in srgb, ${colors.primary} 86%, black)`);
  root.style.setProperty('--theme-secondary', colors.secondary);
  root.style.setProperty('--theme-accent', colors.accent);
  root.style.setProperty('--theme-btn-bg', colors.buttonBg);
  root.style.setProperty('--theme-btn-text', readableText(colors.buttonText, colors.buttonBg));
  root.style.setProperty('--theme-link', colors.link);
  const quickNavPanel = mixHex(colors.primary, colors.headerBg, 0.42);
  const quickNavForeground = readableText(colors.headerText, quickNavPanel);
  root.style.setProperty('--quick-nav-foreground', quickNavForeground);

  if (scope === 'admin') {
    const adminSidebarBg = colors.primary;
    const adminSidebarText = readableText('#FFFFFF', adminSidebarBg);
    const adminTopbarBg = colors.primary;
    const adminTopbarText = readableText('#FFFFFF', adminTopbarBg);
    root.style.setProperty('--theme-admin-sidebar-bg', adminSidebarBg);
    root.style.setProperty('--theme-admin-sidebar-text', adminSidebarText);
    root.style.setProperty('--theme-admin-topbar-bg', adminTopbarBg);
    root.style.setProperty('--theme-admin-topbar-text', adminTopbarText);
    root.style.setProperty('--theme-admin-active-bg', `color-mix(in srgb, ${colors.primary} 28%, ${adminSidebarBg})`);
    root.style.setProperty('--theme-admin-active-text', readableText('#FFFFFF', colors.primary));
    root.style.setProperty('--theme-admin-icon-bg', `color-mix(in srgb, ${colors.primary} 18%, ${adminSidebarBg})`);
    const sidebar = document.querySelector<HTMLElement>('.admin-sidebar');
    const topbar = document.querySelector<HTMLElement>('.admin-topbar');
    if (sidebar) {
      sidebar.style.backgroundColor = adminSidebarBg;
      sidebar.style.color = adminSidebarText;
      sidebar.style.borderColor = `color-mix(in srgb, ${adminSidebarText} 18%, transparent)`;
    }
    if (topbar) {
      topbar.style.backgroundColor = adminTopbarBg;
      topbar.style.color = adminTopbarText;
      topbar.style.borderColor = `color-mix(in srgb, ${adminTopbarText} 18%, transparent)`;
    }
  } else {
    root.style.setProperty('--theme-admin-sidebar-bg', colors.surface);
    root.style.setProperty('--theme-admin-sidebar-text', readableText(colors.text, colors.surface));
    root.style.setProperty('--theme-admin-topbar-bg', colors.headerBg);
    root.style.setProperty('--theme-admin-topbar-text', readableText(colors.headerText, colors.headerBg));
  }

  if (mode === 'light') {
    root.style.setProperty('--theme-bg', colors.background);
    root.style.setProperty('--theme-surface', colors.surface);
    root.style.setProperty('--theme-text', readableText(colors.text, colors.surface));
    root.style.setProperty('--theme-header-bg', colors.headerBg);
    root.style.setProperty('--theme-header-text', readableText(colors.headerText, colors.headerBg));
    root.style.setProperty('--theme-footer-bg', colors.footerBg);
    root.style.setProperty('--theme-footer-text', readableText(colors.footerText, colors.footerBg));
    root.style.setProperty('--mode-bg', colors.background);
    root.style.setProperty('--mode-surface', colors.surface);
    root.style.setProperty('--mode-text', readableText(colors.text, colors.surface));
    root.style.setProperty('--mode-text-muted', readableText(colors.secondary, colors.surface));
    root.style.setProperty('--mode-border', `color-mix(in srgb, ${colors.primary} 16%, ${colors.surface})`);
    root.style.setProperty('--mode-glass-bg', `color-mix(in srgb, ${colors.headerBg} 78%, transparent)`);
    root.style.setProperty('--mode-glass-highlight', `color-mix(in srgb, ${colors.headerText} 18%, transparent)`);
    root.style.setProperty('--mode-glass-border', `color-mix(in srgb, ${colors.primary} 22%, transparent)`);
    root.style.setProperty('--mode-control-shadow', `color-mix(in srgb, ${colors.primary} 16%, transparent)`);
    root.style.setProperty('--mode-icon', readableText(colors.primary, colors.headerBg));
    root.style.setProperty('--mode-accent', readableText(colors.primary, colors.surface));
  } else {
    const darkBackground = '#0B1120';
    const darkSurface = '#111827';
    const darkText = '#F8FAFC';
    root.style.setProperty('--theme-bg', darkBackground);
    root.style.setProperty('--theme-surface', darkSurface);
    root.style.setProperty('--theme-text', darkText);
    root.style.setProperty('--theme-header-bg', colors.headerBg);
    root.style.setProperty('--theme-header-text', readableText(colors.headerText, colors.headerBg));
    root.style.setProperty('--theme-footer-bg', colors.footerBg);
    root.style.setProperty('--theme-footer-text', readableText(colors.footerText, colors.footerBg));
    root.style.setProperty('--mode-bg', darkBackground);
    root.style.setProperty('--mode-surface', darkSurface);
    root.style.setProperty('--mode-text', darkText);
    root.style.setProperty('--mode-text-muted', readableText(colors.secondary, darkSurface));
    root.style.setProperty('--mode-border', `color-mix(in srgb, ${colors.primary} 28%, ${darkSurface})`);
    root.style.setProperty('--mode-glass-bg', `color-mix(in srgb, ${darkSurface} 82%, ${colors.headerBg})`);
    root.style.setProperty('--mode-glass-highlight', `color-mix(in srgb, ${colors.headerText} 16%, transparent)`);
    root.style.setProperty('--mode-glass-border', `color-mix(in srgb, ${colors.primary} 38%, ${darkSurface})`);
    root.style.setProperty('--mode-control-shadow', `color-mix(in srgb, ${colors.primary} 24%, rgb(0 0 0 / 70%))`);
    root.style.setProperty('--mode-icon', readableText(colors.primary, darkSurface));
    root.style.setProperty('--mode-accent', readableText(colors.primary, darkSurface));
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
    document.documentElement.dataset.colorMode = effectiveMode;
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
