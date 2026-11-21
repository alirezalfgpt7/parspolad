import { describe, expect, it } from 'vitest';
import type { ColorMode, ThemePalette, ThemeScope } from '../types/index.ts';
import { DEFAULT_THEME_PALETTE } from './brandingDefaults.ts';
import {
  contrastRatio,
  ensureContrastAgainst,
  normalizeHex,
  pickReadableForeground,
  resolveThemeTokens,
} from './themeContrast.ts';

const TEST_PALETTES: Array<{ name: string; palette: Partial<ThemePalette> }> = [
  { name: 'industrial crimson default', palette: DEFAULT_THEME_PALETTE },
  {
    name: 'steel navy & amber',
    palette: {
      primary: '#0F4C81',
      secondary: '#1E293B',
      accent: '#F59E0B',
      background: '#F1F5F9',
      surface: '#FFFFFF',
      text: '#0F172A',
      headerBg: '#0F172A',
      headerText: '#F8FAFC',
      footerBg: '#020617',
      footerText: '#E2E8F0',
      buttonBg: '#0F4C81',
      buttonText: '#FFFFFF',
      link: '#0369A1',
    },
  },
  {
    name: 'adversarial bright yellow primary & near-white button',
    palette: {
      primary: '#FACC15',
      secondary: '#475569',
      accent: '#22D3EE',
      background: '#FFFFFF',
      surface: '#F8FAFC',
      text: '#0F172A',
      headerBg: '#FEF9C3',
      headerText: '#EAB308',
      footerBg: '#F8FAFC',
      footerText: '#CBD5E1',
      buttonBg: '#F8FAFC',
      buttonText: '#FFFFFF',
      link: '#FDE047',
    },
  },
  {
    name: 'adversarial dark obsidian & pastel accent',
    palette: {
      primary: '#1E1B4B',
      secondary: '#312E81',
      accent: '#C084FC',
      background: '#090D16',
      surface: '#111827',
      text: '#1E293B',
      headerBg: '#020617',
      headerText: '#334155',
      footerBg: '#030712',
      footerText: '#1F2937',
      buttonBg: '#111827',
      buttonText: '#1E293B',
      link: '#312E81',
    },
  },
];

describe('themeContrast WCAG contrast & token resolution', () => {
  it('normalizes shorthand and malformed hex strings safely', () => {
    expect(normalizeHex('#abc')).toBe('#AABBCC');
    expect(normalizeHex('  0f172a  ')).toBe('#0F172A');
    expect(normalizeHex('invalid', '#b91c1c')).toBe('#B91C1C');
  });

  it('picks readable foreground against bright and dark backgrounds', () => {
    expect(contrastRatio(pickReadableForeground('#FACC15', '#FFFFFF'), '#FACC15')).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(pickReadableForeground('#0F172A', '#1E293B'), '#0F172A')).toBeGreaterThanOrEqual(4.5);
  });

  it('adjusts low-contrast colors while staying above target ratio', () => {
    const fixedOnLight = ensureContrastAgainst('#FDE047', ['#FFFFFF', '#F8FAFC'], 4.5);
    expect(contrastRatio(fixedOnLight, '#FFFFFF')).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(fixedOnLight, '#F8FAFC')).toBeGreaterThanOrEqual(4.5);

    const fixedOnDark = ensureContrastAgainst('#1E293B', ['#0F172A', '#111827'], 4.5);
    expect(contrastRatio(fixedOnDark, '#0F172A')).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(fixedOnDark, '#111827')).toBeGreaterThanOrEqual(4.5);
  });

  it.each(['light', 'dark'] as ColorMode[])(
    'guarantees >= 4.5 WCAG contrast across all tokens in %s mode for preset and adversarial palettes',
    (mode) => {
      const scopes: ThemeScope[] = ['site', 'landing', 'admin'];
      for (const { palette } of TEST_PALETTES) {
        for (const scope of scopes) {
          const tokens = resolveThemeTokens({
            palette,
            mode,
            designStyle: 'modern',
            buttonShape: 'rounded',
            scope,
          });

          expect(contrastRatio(tokens.text, tokens.surface)).toBeGreaterThanOrEqual(4.5);
          expect(contrastRatio(tokens.text, tokens.bg)).toBeGreaterThanOrEqual(4.5);
          expect(contrastRatio(tokens.textMuted, tokens.surface)).toBeGreaterThanOrEqual(4.5);
          expect(contrastRatio(tokens.primaryInk, tokens.surface)).toBeGreaterThanOrEqual(4.5);
          expect(contrastRatio(tokens.primaryForeground, tokens.primary)).toBeGreaterThanOrEqual(4.5);
          expect(contrastRatio(tokens.accentInk, tokens.surface)).toBeGreaterThanOrEqual(4.5);
          expect(contrastRatio(tokens.accentForeground, tokens.accent)).toBeGreaterThanOrEqual(4.5);
          expect(contrastRatio(tokens.buttonText, tokens.buttonBg)).toBeGreaterThanOrEqual(4.5);
          expect(contrastRatio(tokens.link, tokens.surface)).toBeGreaterThanOrEqual(4.5);
          expect(contrastRatio(tokens.inputText, tokens.inputBg)).toBeGreaterThanOrEqual(4.5);
          expect(contrastRatio(tokens.placeholder, tokens.inputBg)).toBeGreaterThanOrEqual(4.5);
          expect(contrastRatio(tokens.headerText, tokens.headerBg)).toBeGreaterThanOrEqual(4.5);
          expect(contrastRatio(tokens.headerMuted, tokens.headerBg)).toBeGreaterThanOrEqual(4.5);
          expect(contrastRatio(tokens.headerInk, tokens.headerBg)).toBeGreaterThanOrEqual(4.5);
          expect(contrastRatio(tokens.footerText, tokens.footerBg)).toBeGreaterThanOrEqual(4.5);
          expect(contrastRatio(tokens.footerMuted, tokens.footerBg)).toBeGreaterThanOrEqual(4.5);
          expect(contrastRatio(tokens.footerAccent, tokens.footerBg)).toBeGreaterThanOrEqual(4.5);
          expect(contrastRatio(tokens.adminSidebarText, tokens.adminSidebarBg)).toBeGreaterThanOrEqual(4.5);
          expect(contrastRatio(tokens.adminSidebarMuted, tokens.adminSidebarBg)).toBeGreaterThanOrEqual(4.5);
          expect(contrastRatio(tokens.adminTopbarText, tokens.adminTopbarBg)).toBeGreaterThanOrEqual(4.5);
          expect(contrastRatio(tokens.adminTopbarMuted, tokens.adminTopbarBg)).toBeGreaterThanOrEqual(4.5);
          expect(contrastRatio(tokens.quickNavFg, tokens.quickNavBg)).toBeGreaterThanOrEqual(4.5);
          expect(contrastRatio(tokens.quickNavMuted, tokens.quickNavBg)).toBeGreaterThanOrEqual(4.5);
          expect(contrastRatio(tokens.quickNavIconFg, tokens.quickNavIconBg)).toBeGreaterThanOrEqual(4.5);
          expect(contrastRatio(tokens.quickNavActiveFg, tokens.quickNavActiveBg)).toBeGreaterThanOrEqual(4.5);
          expect(contrastRatio(tokens.quickNavCopyFg, tokens.quickNavCopyBg)).toBeGreaterThanOrEqual(4.5);
          expect(contrastRatio(tokens.quickNavCopyMuted, tokens.quickNavCopyBg)).toBeGreaterThanOrEqual(4.5);
        }
      }
    },
  );
});
