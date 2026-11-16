import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore.ts';
import type { ThemePalette } from '../../types/index.ts';

function applyPaletteToRoot(palette: ThemePalette, mode: 'light' | 'dark') {
  const root = document.documentElement;
  root.style.setProperty('--theme-primary', palette.primary);
  root.style.setProperty('--theme-primary-hover', palette.primary);
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
  const { bootstrap, colorMode, previewPalette, previewLandingPalette } = useAppStore();

  useEffect(() => {
    if (colorMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [colorMode]);

  useEffect(() => {
    const theme = bootstrap?.theme;
    if (!theme) return;
    const isLanding = location.pathname === '/';
    const palette = isLanding
      ? previewLandingPalette || (theme.landing_theme_enabled ? theme.landing_palette : theme.active_palette)
      : previewPalette || theme.active_palette;
    applyPaletteToRoot(palette, colorMode);
  }, [bootstrap, location.pathname, colorMode, previewPalette, previewLandingPalette]);

  return <>{children}</>;
};
