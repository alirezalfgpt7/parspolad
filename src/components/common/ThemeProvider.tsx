import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore.ts';
import {
  DEFAULT_APPEARANCE_SETTINGS,
  DEFAULT_THEME_PALETTE,
  FONT_CSS_MAP,
} from '../../utils/brandingDefaults.ts';
import { resolveThemeTokens } from '../../utils/themeContrast.ts';
import type {
  ButtonShape,
  ColorMode,
  ThemeButtonEffect,
  ThemeDesignStyle,
  ThemePalette,
  ThemeScope,
  ThemeSettings,
} from '../../types/index.ts';

export function applyPaletteToRoot(
  palette: Partial<ThemePalette> | null | undefined,
  mode: ColorMode,
  designStyle: ThemeDesignStyle,
  buttonShape: ButtonShape,
  buttonEffect: ThemeButtonEffect,
  scope: ThemeScope,
) {
  const root = document.documentElement;
  const tokens = resolveThemeTokens({
    palette,
    mode,
    designStyle,
    buttonShape,
    scope,
  });

  root.dataset.themeScope = scope;
  root.dataset.themeStyle = designStyle;
  root.dataset.buttonShape = buttonShape;
  root.dataset.buttonEffect = buttonEffect;
  root.dataset.colorMode = mode;

  if (mode === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }

  // Core Brand & Chromatic Ink
  root.style.setProperty('--theme-primary', tokens.primary);
  root.style.setProperty('--theme-primary-hover', tokens.primaryHover);
  root.style.setProperty('--theme-primary-foreground', tokens.primaryForeground);
  root.style.setProperty('--theme-primary-ink', tokens.primaryInk);
  root.style.setProperty('--theme-secondary', tokens.secondary);
  root.style.setProperty('--theme-accent', tokens.accent);
  root.style.setProperty('--theme-accent-foreground', tokens.accentForeground);
  root.style.setProperty('--theme-accent-ink', tokens.accentInk);
  root.style.setProperty('--theme-link', tokens.link);

  // Canvas, Surfaces & Typography
  root.style.setProperty('--theme-bg', tokens.bg);
  root.style.setProperty('--theme-surface', tokens.surface);
  root.style.setProperty('--theme-surface-muted', tokens.surfaceMuted);
  root.style.setProperty('--theme-text', tokens.text);
  root.style.setProperty('--theme-text-muted', tokens.textMuted);
  root.style.setProperty('--theme-border', tokens.border);
  root.style.setProperty('--theme-border-strong', tokens.borderStrong);

  // Buttons
  root.style.setProperty('--theme-btn-bg', tokens.buttonBg);
  root.style.setProperty('--theme-btn-hover', tokens.buttonHover);
  root.style.setProperty('--theme-btn-text', tokens.buttonText);

  // Inputs & Placeholders
  root.style.setProperty('--theme-input-bg', tokens.inputBg);
  root.style.setProperty('--theme-input-border', tokens.inputBorder);
  root.style.setProperty('--theme-input-text', tokens.inputText);
  root.style.setProperty('--theme-placeholder', tokens.placeholder);

  // Header & Footer
  root.style.setProperty('--theme-header-bg', tokens.headerBg);
  root.style.setProperty('--theme-header-text', tokens.headerText);
  root.style.setProperty('--theme-header-muted', tokens.headerMuted);
  root.style.setProperty('--theme-header-border', tokens.headerBorder);
  root.style.setProperty('--theme-header-ink', tokens.headerInk);
  root.style.setProperty('--theme-footer-bg', tokens.footerBg);
  root.style.setProperty('--theme-footer-text', tokens.footerText);
  root.style.setProperty('--theme-footer-muted', tokens.footerMuted);
  root.style.setProperty('--theme-footer-accent', tokens.footerAccent);
  root.style.setProperty('--theme-footer-surface', tokens.footerSurface);
  root.style.setProperty('--theme-footer-border', tokens.footerBorder);
  root.style.setProperty('--theme-footer-logo-bg', tokens.footerLogoBg);

  // Cards, Elevation & Glass Layers
  root.style.setProperty('--theme-card-radius', tokens.cardRadius);
  root.style.setProperty('--theme-card-surface', tokens.cardSurface);
  root.style.setProperty('--theme-card-border', tokens.cardBorder);
  root.style.setProperty('--theme-card-border-hover', tokens.cardBorderHover);
  root.style.setProperty('--theme-card-shadow', tokens.cardShadow);
  root.style.setProperty('--theme-card-shadow-hover', tokens.cardShadowHover);
  root.style.setProperty('--theme-card-blur', tokens.cardBlur);
  root.style.setProperty('--theme-page-glow', tokens.pageGlow);

  // Mode Semantic Aliases
  root.style.setProperty('--mode-bg', tokens.bg);
  root.style.setProperty('--mode-surface', tokens.surface);
  root.style.setProperty('--mode-text', tokens.text);
  root.style.setProperty('--mode-text-muted', tokens.textMuted);
  root.style.setProperty('--mode-border', tokens.border);
  root.style.setProperty('--mode-glass-bg', tokens.glassBg);
  root.style.setProperty('--mode-glass-highlight', tokens.glassHighlight);
  root.style.setProperty('--mode-glass-border', tokens.glassBorder);
  root.style.setProperty('--mode-control-shadow', tokens.controlShadow);
  root.style.setProperty('--mode-icon', tokens.headerInk);
  root.style.setProperty('--mode-accent', tokens.primaryInk);

  // Admin Sidebar & Topbar Tokens
  root.style.setProperty('--theme-admin-sidebar-bg', tokens.adminSidebarBg);
  root.style.setProperty('--theme-admin-sidebar-text', tokens.adminSidebarText);
  root.style.setProperty('--theme-admin-sidebar-muted', tokens.adminSidebarMuted);
  root.style.setProperty('--theme-admin-sidebar-border', tokens.adminSidebarBorder);
  root.style.setProperty('--theme-admin-sidebar-surface', tokens.adminSidebarSurface);
  root.style.setProperty('--theme-admin-sidebar-control-bg', tokens.adminSidebarControlBg);
  root.style.setProperty('--theme-admin-active-bg', tokens.adminActiveBg);
  root.style.setProperty('--theme-admin-active-text', tokens.adminActiveText);
  root.style.setProperty('--theme-admin-icon-bg', tokens.adminIconBg);
  root.style.setProperty('--theme-admin-topbar-bg', tokens.adminTopbarBg);
  root.style.setProperty('--theme-admin-topbar-text', tokens.adminTopbarText);
  root.style.setProperty('--theme-admin-topbar-muted', tokens.adminTopbarMuted);
  root.style.setProperty('--theme-admin-topbar-border', tokens.adminTopbarBorder);
  root.style.setProperty('--theme-admin-topbar-control-bg', tokens.adminTopbarControlBg);
  root.style.setProperty('--theme-admin-topbar-control-hover', tokens.adminTopbarControlHover);

  // Landing Quick Nav Tokens
  root.style.setProperty('--quick-nav-bg', tokens.quickNavBg);
  root.style.setProperty('--quick-nav-foreground', tokens.quickNavFg);
  root.style.setProperty('--quick-nav-muted', tokens.quickNavMuted);
  root.style.setProperty('--quick-nav-border', tokens.quickNavBorder);
  root.style.setProperty('--quick-nav-icon-bg', tokens.quickNavIconBg);
  root.style.setProperty('--quick-nav-icon-fg', tokens.quickNavIconFg);
  root.style.setProperty('--quick-nav-active-bg', tokens.quickNavActiveBg);
  root.style.setProperty('--quick-nav-active-fg', tokens.quickNavActiveFg);
  root.style.setProperty('--quick-nav-copy-bg', tokens.quickNavCopyBg);
  root.style.setProperty('--quick-nav-copy-fg', tokens.quickNavCopyFg);
  root.style.setProperty('--quick-nav-copy-muted', tokens.quickNavCopyMuted);
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

  let hasSavedMode = false;
  try {
    hasSavedMode = localStorage.getItem('ppa_mode') !== null;
  } catch {
    hasSavedMode = false;
  }

  const effectiveMode: ColorMode = previewMode
    || (hasSavedMode ? colorMode : previewTheme?.default_mode || bootstrap?.theme?.default_mode || colorMode);

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
        scope,
      );
    } else {
      applyPaletteToRoot(
        DEFAULT_THEME_PALETTE,
        effectiveMode,
        'modern',
        'rounded',
        'shimmer',
        scope,
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
