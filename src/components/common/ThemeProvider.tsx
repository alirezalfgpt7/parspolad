import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore.ts';
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
    if (!theme) return;
    const isLanding = location.pathname === '/';
    const routeScope: ThemeScope = isLanding && theme.landing_theme_enabled
      ? 'landing'
      : location.pathname.startsWith('/admin')
        ? 'admin'
        : 'site';
    const scope = previewScope || routeScope;
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
  }, [
    bootstrap,
    location.pathname,
    effectiveMode,
    previewTheme,
    previewScope,
    previewMode,
  ]);

  return <>{children}</>;
};
