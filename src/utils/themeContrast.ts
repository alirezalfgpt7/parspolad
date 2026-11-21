import { DEFAULT_THEME_PALETTE } from './brandingDefaults.ts';
import type {
  ButtonShape,
  ColorMode,
  ThemeDesignStyle,
  ThemePalette,
  ThemeScope,
} from '../types/index.ts';

export interface ResolvedThemeTokens {
  palette: ThemePalette;
  mode: ColorMode;
  designStyle: ThemeDesignStyle;
  buttonShape: ButtonShape;
  scope: ThemeScope;
  primary: string;
  primaryHover: string;
  primaryForeground: string;
  primaryInk: string;
  secondary: string;
  accent: string;
  accentForeground: string;
  accentInk: string;
  bg: string;
  surface: string;
  surfaceMuted: string;
  text: string;
  textMuted: string;
  border: string;
  borderStrong: string;
  headerBg: string;
  headerText: string;
  headerMuted: string;
  headerBorder: string;
  headerInk: string;
  footerBg: string;
  footerText: string;
  footerMuted: string;
  footerAccent: string;
  footerSurface: string;
  footerBorder: string;
  footerLogoBg: string;
  buttonBg: string;
  buttonHover: string;
  buttonText: string;
  link: string;
  inputBg: string;
  inputBorder: string;
  inputText: string;
  placeholder: string;
  cardRadius: string;
  cardSurface: string;
  cardBorder: string;
  cardBorderHover: string;
  cardShadow: string;
  cardShadowHover: string;
  cardBlur: string;
  pageGlow: string;
  glassBg: string;
  glassHighlight: string;
  glassBorder: string;
  controlShadow: string;
  adminSidebarBg: string;
  adminSidebarText: string;
  adminSidebarMuted: string;
  adminSidebarBorder: string;
  adminSidebarSurface: string;
  adminSidebarControlBg: string;
  adminActiveBg: string;
  adminActiveText: string;
  adminIconBg: string;
  adminTopbarBg: string;
  adminTopbarText: string;
  adminTopbarMuted: string;
  adminTopbarBorder: string;
  adminTopbarControlBg: string;
  adminTopbarControlHover: string;
  quickNavBg: string;
  quickNavFg: string;
  quickNavMuted: string;
  quickNavBorder: string;
  quickNavIconBg: string;
  quickNavIconFg: string;
  quickNavActiveBg: string;
  quickNavActiveFg: string;
  quickNavCopyBg: string;
  quickNavCopyFg: string;
  quickNavCopyMuted: string;
}

const DARK_ANCHOR = '#0F172A';
const LIGHT_ANCHOR = '#FFFFFF';
const SLATE_50 = '#F8FAFC';

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function normalizeHex(value: string | undefined | null, fallback = '#000000'): string {
  const cleanFallback = /^#[\da-f]{6}$/i.test(fallback) ? `#${fallback.slice(1).toUpperCase()}` : '#000000';
  if (!value) return cleanFallback;
  const trimmed = value.trim();
  if (!trimmed || trimmed.toLowerCase() === 'undefined' || trimmed.toLowerCase() === 'null') {
    return cleanFallback;
  }
  const raw = trimmed.startsWith('#') ? trimmed.slice(1) : trimmed;
  if (/^[\da-f]{3}$/i.test(raw)) {
    const expanded = raw
      .split('')
      .map((ch) => `${ch}${ch}`)
      .join('')
      .toUpperCase();
    return `#${expanded}`;
  }
  if (/^[\da-f]{6}$/i.test(raw)) {
    return `#${raw.toUpperCase()}`;
  }
  return cleanFallback;
}

export function normalizePalette(palette?: Partial<ThemePalette> | null): ThemePalette {
  const source = palette || {};
  return {
    primary: normalizeHex(source.primary, DEFAULT_THEME_PALETTE.primary),
    secondary: normalizeHex(source.secondary, DEFAULT_THEME_PALETTE.secondary),
    accent: normalizeHex(source.accent, DEFAULT_THEME_PALETTE.accent),
    background: normalizeHex(source.background, DEFAULT_THEME_PALETTE.background),
    surface: normalizeHex(source.surface, DEFAULT_THEME_PALETTE.surface),
    text: normalizeHex(source.text, DEFAULT_THEME_PALETTE.text),
    headerBg: normalizeHex(source.headerBg, DEFAULT_THEME_PALETTE.headerBg),
    headerText: normalizeHex(source.headerText, DEFAULT_THEME_PALETTE.headerText),
    footerBg: normalizeHex(source.footerBg, DEFAULT_THEME_PALETTE.footerBg),
    footerText: normalizeHex(source.footerText, DEFAULT_THEME_PALETTE.footerText),
    buttonBg: normalizeHex(source.buttonBg, DEFAULT_THEME_PALETTE.buttonBg),
    buttonText: normalizeHex(source.buttonText, DEFAULT_THEME_PALETTE.buttonText),
    link: normalizeHex(source.link, DEFAULT_THEME_PALETTE.link),
  };
}

export function hexToRgb(hex: string): [number, number, number] {
  const normalized = normalizeHex(hex).slice(1);
  return [
    parseInt(normalized.slice(0, 2), 16),
    parseInt(normalized.slice(2, 4), 16),
    parseInt(normalized.slice(4, 6), 16),
  ];
}

export function rgbToHex(r: number, g: number, b: number): string {
  const toByte = (v: number) => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0').toUpperCase();
  return `#${toByte(r)}${toByte(g)}${toByte(b)}`;
}

export function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const rn = clamp(r / 255, 0, 1);
  const gn = clamp(g / 255, 0, 1);
  const bn = clamp(b / 255, 0, 1);
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) {
    return [0, 0, l * 100];
  }
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === rn) {
    h = (gn - bn) / d + (gn < bn ? 6 : 0);
  } else if (max === gn) {
    h = (bn - rn) / d + 2;
  } else {
    h = (rn - gn) / d + 4;
  }
  return [h * 60, s * 100, l * 100];
}

export function hslToHex(h: number, s: number, l: number): string {
  const hue = ((h % 360) + 360) % 360;
  const sat = clamp(s, 0, 100) / 100;
  const light = clamp(l, 0, 100) / 100;
  const c = (1 - Math.abs(2 * light - 1)) * sat;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = light - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;
  if (hue < 60) {
    r = c; g = x; b = 0;
  } else if (hue < 120) {
    r = x; g = c; b = 0;
  } else if (hue < 180) {
    r = 0; g = c; b = x;
  } else if (hue < 240) {
    r = 0; g = x; b = c;
  } else if (hue < 300) {
    r = x; g = 0; b = c;
  } else {
    r = c; g = 0; b = x;
  }
  return rgbToHex((r + m) * 255, (g + m) * 255, (b + m) * 255);
}

export function relativeLuminance(hex: string): number {
  const channels = hexToRgb(hex).map((channel) => {
    const value = channel / 255;
    return value <= 0.03928 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
  });
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

export function contrastRatio(first: string, second: string): number {
  const l1 = relativeLuminance(first);
  const l2 = relativeLuminance(second);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export function mixHex(first: string, second: string, firstWeight: number): string {
  const w = clamp(firstWeight, 0, 1);
  const [r1, g1, b1] = hexToRgb(first);
  const [r2, g2, b2] = hexToRgb(second);
  return rgbToHex(
    r1 * w + r2 * (1 - w),
    g1 * w + g2 * (1 - w),
    b1 * w + b2 * (1 - w),
  );
}

export function pickReadableForeground(
  background: string,
  preferred?: string,
  minRatio = 4.5,
): string {
  const bg = normalizeHex(background);
  if (preferred) {
    const pref = normalizeHex(preferred);
    if (contrastRatio(pref, bg) >= minRatio) {
      return pref;
    }
  }
  const whiteContrast = contrastRatio(LIGHT_ANCHOR, bg);
  const darkContrast = contrastRatio(DARK_ANCHOR, bg);
  return whiteContrast >= darkContrast ? LIGHT_ANCHOR : DARK_ANCHOR;
}

function minContrastAcross(foreground: string, backgrounds: string[]): number {
  return backgrounds.reduce(
    (lowest, bg) => Math.min(lowest, contrastRatio(foreground, bg)),
    Infinity,
  );
}

/**
 * Adjusts `candidate` along its HSL lightness axis so it satisfies at least `minRatio`
 * WCAG contrast against every background in `backgrounds`.
 */
export function ensureContrastAgainst(
  candidate: string,
  backgrounds: string[],
  minRatio = 4.5,
): string {
  const bgs = backgrounds.map((b) => normalizeHex(b));
  const base = normalizeHex(candidate);
  if (minContrastAcross(base, bgs) >= minRatio) {
    return base;
  }

  const [r, g, b] = hexToRgb(base);
  const [h, s, l] = rgbToHsl(r, g, b);
  const avgLum = bgs.reduce((acc, item) => acc + relativeLuminance(item), 0) / bgs.length;
  const preferLighter = avgLum < 0.35;

  const searchDirection = (goLighter: boolean): { hex: string; delta: number } | null => {
    const start = Math.round(l);
    const end = goLighter ? 98 : 4;
    const step = goLighter ? 1 : -1;
    for (let nextL = start; goLighter ? nextL <= end : nextL >= end; nextL += step) {
      // Gently preserve chromatic vividness when lifting dark colors into pastel range
      const tunedSat = s > 6 ? clamp(goLighter && nextL > 65 ? Math.max(s, 56) : s, 0, 96) : s;
      const attempt = hslToHex(h, tunedSat, nextL);
      if (minContrastAcross(attempt, bgs) >= minRatio) {
        return { hex: attempt, delta: Math.abs(nextL - l) };
      }
    }
    return null;
  };

  const primaryChoice = searchDirection(preferLighter);
  if (primaryChoice) return primaryChoice.hex;

  const fallbackChoice = searchDirection(!preferLighter);
  if (fallbackChoice) return fallbackChoice.hex;

  // Fallback to pure light/dark neutral
  const whiteScore = minContrastAcross(SLATE_50, bgs);
  const darkScore = minContrastAcross(DARK_ANCHOR, bgs);
  return whiteScore >= darkScore ? LIGHT_ANCHOR : DARK_ANCHOR;
}

export function shiftLuminanceHover(baseHex: string): string {
  const normalized = normalizeHex(baseHex);
  const lum = relativeLuminance(normalized);
  if (lum < 0.06) {
    return mixHex(LIGHT_ANCHOR, normalized, 0.16);
  }
  return mixHex('#020617', normalized, 0.14);
}

function adaptBrandSurfaceForDark(brandHex: string, targetLuminanceMix: number): string {
  const [r, g, b] = hexToRgb(brandHex);
  const [h, s] = rgbToHsl(r, g, b);
  const subtleSat = clamp(s * 0.45, 8, 34);
  const tinted = hslToHex(h, subtleSat, targetLuminanceMix);
  return tinted;
}

export function resolveThemeTokens(params: {
  palette?: Partial<ThemePalette> | null;
  mode: ColorMode;
  designStyle?: ThemeDesignStyle;
  buttonShape?: ButtonShape;
  scope?: ThemeScope;
}): ResolvedThemeTokens {
  const colors = normalizePalette(params.palette);
  const mode: ColorMode = params.mode === 'dark' ? 'dark' : 'light';
  const designStyle: ThemeDesignStyle = params.designStyle || 'modern';
  const buttonShape: ButtonShape = params.buttonShape || 'rounded';
  const scope: ThemeScope = params.scope || 'site';
  const isDark = mode === 'dark';

  // 1. Canvas & Surface resolution
  const rawBgLum = relativeLuminance(colors.background);
  const rawSurfaceLum = relativeLuminance(colors.surface);

  const bg = !isDark
    ? colors.background
    : rawBgLum <= 0.14
      ? colors.background
      : mixHex('#080D18', adaptBrandSurfaceForDark(colors.primary, 9), 0.78);

  const baseDarkSurface = rawSurfaceLum <= 0.16
    ? colors.surface
    : mixHex('#111827', adaptBrandSurfaceForDark(colors.primary, 14), 0.72);

  // Ensure surface sits subtly elevated above canvas in dark mode
  const surface = !isDark
    ? colors.surface
    : contrastRatio(baseDarkSurface, bg) >= 1.05
      ? baseDarkSurface
      : mixHex('#1E293B', baseDarkSurface, 0.22);

  const surfaceMuted = isDark
    ? mixHex('#FFFFFF', surface, 0.06)
    : contrastRatio(surface, bg) >= 1.04
      ? mixHex(bg, surface, 0.45)
      : mixHex(colors.secondary, surface, 0.05);

  // 2. Main typography & muted hierarchy
  const rawTextCandidate = isDark && relativeLuminance(colors.text) < 0.45
    ? SLATE_50
    : colors.text;
  const text = ensureContrastAgainst(rawTextCandidate, [surface, bg], 7.0);
  const textMuted = ensureContrastAgainst(
    mixHex(text, surface, isDark ? 0.68 : 0.64),
    [surface, bg, surfaceMuted],
    4.65,
  );

  // 3. Borders
  const border = isDark
    ? mixHex('#FFFFFF', surface, 0.13)
    : mixHex(colors.secondary, surface, 0.14);
  const borderStrong = isDark
    ? mixHex('#FFFFFF', surface, 0.24)
    : mixHex(colors.secondary, surface, 0.25);

  // 4. Form inputs & placeholders (strict >= 4.6 contrast on inputBg)
  const surfaceIsDark = relativeLuminance(surface) < 0.25;
  const inputBg = isDark || surfaceIsDark
    ? mixHex('#020617', surface, 0.34)
    : relativeLuminance(surface) > 0.96
      ? '#FFFFFF'
      : mixHex('#FFFFFF', surface, 0.65);
  const inputBorder = isDark || surfaceIsDark
    ? mixHex('#FFFFFF', inputBg, 0.18)
    : mixHex(colors.secondary, inputBg, 0.22);
  const inputText = ensureContrastAgainst(text, [inputBg], 7.0);
  const placeholder = ensureContrastAgainst(
    mixHex(inputText, inputBg, isDark || surfaceIsDark ? 0.56 : 0.54),
    [inputBg],
    4.6,
  );

  // 5. Brand primary, ink, accent & action buttons
  const primary = colors.primary;
  const primaryHover = shiftLuminanceHover(primary);
  const primaryForeground = pickReadableForeground(primary, LIGHT_ANCHOR, 4.55);
  const primaryInk = ensureContrastAgainst(primary, [surface, bg, surfaceMuted], 4.6);

  const accent = colors.accent;
  const accentForeground = pickReadableForeground(accent, LIGHT_ANCHOR, 4.55);
  const accentInk = ensureContrastAgainst(accent, [surface, bg, surfaceMuted], 4.6);

  // Keep buttonBg visible in dark mode if it closely matches the dark surface
  const buttonBg = isDark && contrastRatio(colors.buttonBg, surface) < 1.35
    ? ensureContrastAgainst(colors.buttonBg, [surface, bg], 2.2)
    : colors.buttonBg;
  const buttonHover = shiftLuminanceHover(buttonBg);
  const buttonText = pickReadableForeground(buttonBg, colors.buttonText, 4.6);

  const link = ensureContrastAgainst(colors.link, [surface, bg], 4.65);

  // 6. Header & Navigation resolution
  const headerBg = !isDark
    ? colors.headerBg
    : relativeLuminance(colors.headerBg) <= 0.2
      ? colors.headerBg
      : mixHex('#0B1120', adaptBrandSurfaceForDark(colors.secondary, 13), 0.72);
  const rawHeaderText = isDark && relativeLuminance(colors.headerText) < 0.45
    ? SLATE_50
    : colors.headerText;
  const headerText = ensureContrastAgainst(rawHeaderText, [headerBg], 7.0);
  const headerMuted = ensureContrastAgainst(
    mixHex(headerText, headerBg, 0.74),
    [headerBg],
    4.6,
  );
  const headerIsDark = relativeLuminance(headerBg) < 0.22;
  const headerBorder = headerIsDark
    ? mixHex('#FFFFFF', headerBg, 0.14)
    : mixHex(colors.secondary, headerBg, 0.15);
  const headerInk = ensureContrastAgainst(primary, [headerBg], 4.6);

  // 7. Footer resolution
  const footerBg = !isDark
    ? colors.footerBg
    : relativeLuminance(colors.footerBg) <= 0.22
      ? colors.footerBg
      : mixHex('#050914', adaptBrandSurfaceForDark(colors.secondary, 9), 0.8);
  const rawFooterText = isDark && relativeLuminance(colors.footerText) < 0.45
    ? '#E2E8F0'
    : colors.footerText;
  const footerText = ensureContrastAgainst(rawFooterText, [footerBg], 7.0);
  const footerMuted = ensureContrastAgainst(
    mixHex(footerText, footerBg, 0.78),
    [footerBg],
    4.6,
  );
  const footerIsDark = relativeLuminance(footerBg) < 0.25;
  const footerAccent = ensureContrastAgainst(colors.accent, [footerBg], 4.6);
  const footerSurface = footerIsDark
    ? mixHex('#FFFFFF', footerBg, 0.08)
    : mixHex(colors.secondary, footerBg, 0.07);
  const footerBorder = footerIsDark
    ? mixHex('#FFFFFF', footerBg, 0.14)
    : mixHex(colors.secondary, footerBg, 0.16);
  const footerLogoBg = footerIsDark ? '#FFFFFF' : mixHex(colors.secondary, footerBg, 0.06);

  // 8. Unified Design Style Cards, Shadows & Glass
  const cardRadius = designStyle === 'industrial'
    ? '0.75rem'
    : designStyle === 'modern'
      ? '1.125rem'
      : '1.25rem';

  const cardSurface = designStyle === 'glass'
    ? `color-mix(in srgb, ${surface} ${isDark ? '84%' : '90%'}, transparent)`
    : surface;

  const cardBorder = designStyle === 'industrial'
    ? borderStrong
    : designStyle === 'glass'
      ? `color-mix(in srgb, ${primaryInk} ${isDark ? '24%' : '18%'}, ${border})`
      : border;

  const cardBorderHover = `color-mix(in srgb, ${primaryInk} ${isDark ? '54%' : '45%'}, ${border})`;

  const cardShadow = isDark
    ? designStyle === 'industrial'
      ? '0 2px 10px rgb(2 6 23 / 42%), inset 0 1px rgb(255 255 255 / 4%)'
      : designStyle === 'modern'
        ? `0 12px 30px rgb(2 6 23 / 48%), 0 2px 8px color-mix(in srgb, ${primary} 12%, transparent), inset 0 1px rgb(255 255 255 / 5%)`
        : `0 16px 40px rgb(2 6 23 / 54%), inset 0 1px rgb(255 255 255 / 8%)`
    : designStyle === 'industrial'
      ? '0 2px 8px rgb(15 23 42 / 5%), 0 1px 2px rgb(15 23 42 / 4%)'
      : designStyle === 'modern'
        ? `0 10px 28px color-mix(in srgb, ${primary} 7%, rgb(15 23 42 / 6%)), 0 2px 6px rgb(15 23 42 / 4%)`
        : `0 14px 36px rgb(15 23 42 / 9%), inset 0 1px rgb(255 255 255 / 60%)`;

  const cardShadowHover = isDark
    ? `0 18px 42px rgb(2 6 23 / 64%), 0 0 0 1px color-mix(in srgb, ${primaryInk} 24%, transparent)`
    : `0 18px 38px color-mix(in srgb, ${primary} 12%, rgb(15 23 42 / 9%)), 0 4px 12px rgb(15 23 42 / 5%)`;

  const cardBlur = designStyle === 'glass' ? 'blur(16px)' : 'none';

  const pageGlow = designStyle === 'industrial'
    ? 'none'
    : designStyle === 'modern'
      ? `radial-gradient(ellipse at 8% 0%, color-mix(in srgb, ${primary} ${isDark ? '11%' : '6%'}, transparent), transparent 42%), radial-gradient(ellipse at 95% 28%, color-mix(in srgb, ${accent} ${isDark ? '8%' : '5%'}, transparent), transparent 36%)`
      : `radial-gradient(ellipse at 4% 2%, color-mix(in srgb, ${primary} ${isDark ? '14%' : '9%'}, transparent), transparent 40%), radial-gradient(ellipse at 98% 20%, color-mix(in srgb, ${accent} ${isDark ? '11%' : '7%'}, transparent), transparent 38%)`;

  const glassBg = isDark
    ? mixHex(surface, headerBg, 0.72)
    : `color-mix(in srgb, ${headerBg} 86%, ${surface})`;
  const glassHighlight = headerIsDark ? 'rgb(255 255 255 / 12%)' : 'rgb(255 255 255 / 55%)';
  const glassBorder = headerIsDark
    ? mixHex(primaryInk, headerBg, 0.34)
    : mixHex(primary, border, 0.24);
  const controlShadow = isDark
    ? '0 6px 16px rgb(2 6 23 / 46%)'
    : `0 4px 12px color-mix(in srgb, ${primary} 12%, rgb(15 23 42 / 6%))`;

  // 9. Admin Sidebar & Topbar Tokens
  const adminSidebarBg = scope === 'admin'
    ? isDark
      ? mixHex('#0B1120', primary, 0.68)
      : primary
    : surface;
  const adminSidebarIsDark = relativeLuminance(adminSidebarBg) < 0.25;
  const adminSidebarText = scope === 'admin'
    ? ensureContrastAgainst(LIGHT_ANCHOR, [adminSidebarBg], 6.5)
    : text;
  const adminSidebarMuted = scope === 'admin'
    ? ensureContrastAgainst(mixHex(adminSidebarText, adminSidebarBg, 0.76), [adminSidebarBg], 4.6)
    : textMuted;
  const adminSidebarBorder = scope === 'admin'
    ? adminSidebarIsDark
      ? mixHex('#FFFFFF', adminSidebarBg, 0.16)
      : mixHex('#0F172A', adminSidebarBg, 0.16)
    : border;
  const adminSidebarSurface = scope === 'admin'
    ? adminSidebarIsDark
      ? mixHex('#FFFFFF', adminSidebarBg, 0.08)
      : mixHex('#0F172A', adminSidebarBg, 0.08)
    : surfaceMuted;
  const adminSidebarControlBg = scope === 'admin'
    ? adminSidebarIsDark
      ? mixHex('#FFFFFF', adminSidebarBg, 0.1)
      : mixHex('#0F172A', adminSidebarBg, 0.1)
    : inputBg;
  const adminActiveBg = scope === 'admin'
    ? adminSidebarIsDark
      ? mixHex('#FFFFFF', adminSidebarBg, 0.18)
      : mixHex(LIGHT_ANCHOR, adminSidebarBg, 0.2)
    : `color-mix(in srgb, ${primary} ${isDark ? '20%' : '12%'}, ${surface})`;
  const adminActiveText = scope === 'admin'
    ? pickReadableForeground(
        scope === 'admin'
          ? (adminSidebarIsDark ? mixHex('#FFFFFF', adminSidebarBg, 0.18) : mixHex(LIGHT_ANCHOR, adminSidebarBg, 0.2))
          : adminSidebarBg,
        adminSidebarText,
        4.6,
      )
    : primaryInk;
  const adminIconBg = scope === 'admin'
    ? adminSidebarIsDark
      ? mixHex('#FFFFFF', adminSidebarBg, 0.14)
      : mixHex(LIGHT_ANCHOR, adminSidebarBg, 0.16)
    : `color-mix(in srgb, ${primary} 12%, transparent)`;

  const adminTopbarBg = scope === 'admin'
    ? isDark
      ? mixHex('#0E1628', primary, 0.74)
      : primary
    : headerBg;
  const adminTopbarIsDark = relativeLuminance(adminTopbarBg) < 0.25;
  const adminTopbarText = scope === 'admin'
    ? ensureContrastAgainst(LIGHT_ANCHOR, [adminTopbarBg], 6.5)
    : headerText;
  const adminTopbarMuted = scope === 'admin'
    ? ensureContrastAgainst(mixHex(adminTopbarText, adminTopbarBg, 0.78), [adminTopbarBg], 4.6)
    : headerMuted;
  const adminTopbarBorder = scope === 'admin'
    ? adminTopbarIsDark
      ? mixHex('#FFFFFF', adminTopbarBg, 0.18)
      : mixHex('#0F172A', adminTopbarBg, 0.18)
    : headerBorder;
  const adminTopbarControlBg = scope === 'admin'
    ? adminTopbarIsDark
      ? mixHex('#FFFFFF', adminTopbarBg, 0.1)
      : mixHex('#0F172A', adminTopbarBg, 0.1)
    : surfaceMuted;
  const adminTopbarControlHover = scope === 'admin'
    ? adminTopbarIsDark
      ? mixHex('#FFFFFF', adminTopbarBg, 0.18)
      : mixHex('#0F172A', adminTopbarBg, 0.18)
    : border;

  // 10. Home Quick Nav (landing floating quick nav tabs + flyout copy)
  const quickNavBg = isDark
    ? mixHex(surface, primary, 0.84)
    : mixHex(surface, primary, 0.9);
  const quickNavFg = ensureContrastAgainst(text, [quickNavBg], 7.0);
  const quickNavMuted = ensureContrastAgainst(mixHex(quickNavFg, quickNavBg, 0.74), [quickNavBg], 4.6);
  const quickNavBorder = isDark
    ? mixHex('#FFFFFF', quickNavBg, 0.18)
    : mixHex(primary, quickNavBg, 0.24);
  const quickNavIconBg = mixHex(primary, quickNavBg, isDark ? 0.22 : 0.14);
  const quickNavIconFg = ensureContrastAgainst(primary, [quickNavIconBg], 4.6);
  const quickNavActiveBg = primary;
  const quickNavActiveFg = primaryForeground;
  const quickNavCopyBg = isDark
    ? mixHex(surface, '#020617', 0.92)
    : mixHex('#FFFFFF', surface, 0.85);
  const quickNavCopyFg = ensureContrastAgainst(text, [quickNavCopyBg], 7.0);
  const quickNavCopyMuted = ensureContrastAgainst(
    mixHex(quickNavCopyFg, quickNavCopyBg, 0.72),
    [quickNavCopyBg],
    4.6,
  );

  return {
    palette: colors,
    mode,
    designStyle,
    buttonShape,
    scope,
    primary,
    primaryHover,
    primaryForeground,
    primaryInk,
    secondary: colors.secondary,
    accent,
    accentForeground,
    accentInk,
    bg,
    surface,
    surfaceMuted,
    text,
    textMuted,
    border,
    borderStrong,
    headerBg,
    headerText,
    headerMuted,
    headerBorder,
    headerInk,
    footerBg,
    footerText,
    footerMuted,
    footerAccent,
    footerSurface,
    footerBorder,
    footerLogoBg,
    buttonBg,
    buttonHover,
    buttonText,
    link,
    inputBg,
    inputBorder,
    inputText,
    placeholder,
    cardRadius,
    cardSurface,
    cardBorder,
    cardBorderHover,
    cardShadow,
    cardShadowHover,
    cardBlur,
    pageGlow,
    glassBg,
    glassHighlight,
    glassBorder,
    controlShadow,
    adminSidebarBg,
    adminSidebarText,
    adminSidebarMuted,
    adminSidebarBorder,
    adminSidebarSurface,
    adminSidebarControlBg,
    adminActiveBg,
    adminActiveText,
    adminIconBg,
    adminTopbarBg,
    adminTopbarText,
    adminTopbarMuted,
    adminTopbarBorder,
    adminTopbarControlBg,
    adminTopbarControlHover,
    quickNavBg,
    quickNavFg,
    quickNavMuted,
    quickNavBorder,
    quickNavIconBg,
    quickNavIconFg,
    quickNavActiveBg,
    quickNavActiveFg,
    quickNavCopyBg,
    quickNavCopyFg,
    quickNavCopyMuted,
  };
}
