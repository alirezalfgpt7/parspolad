import type {
  AppearanceSettings,
  BrandLogosSettings,
  FontFamilyKey,
  LoginPageSettings,
  PagesConfigSettings,
  ThemePalette,
} from '../types/index.ts';

export const DEFAULT_THEME_PALETTE: ThemePalette = {
  primary: '#B91C1C',
  secondary: '#1E293B',
  accent: '#D97706',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  text: '#0F172A',
  headerBg: '#FFFFFF',
  headerText: '#0F172A',
  footerBg: '#0F172A',
  footerText: '#F8FAFC',
  buttonBg: '#B91C1C',
  buttonText: '#FFFFFF',
  link: '#B91C1C',
};

export interface FontOption {
  key: FontFamilyKey;
  label_fa: string;
  label_en: string;
  cssFamily: string;
  sample: string;
}

export const BUNDLED_FONTS: FontOption[] = [
  {
    key: 'vazirmatn',
    label_fa: 'وزیرمتن (Vazirmatn) — پیش‌فرض رسمی فارسی/انگلیسی',
    label_en: 'Vazirmatn (Persian/Latin UI)',
    cssFamily: '"Vazirmatn", system-ui, -apple-system, sans-serif',
    sample: 'مهندسی دقیق و ساخت تجهیزات سرچاهی پارس پولاد',
  },
  {
    key: 'ibm-plex-arabic',
    label_fa: 'IBM Plex Sans Arabic — صنعتی مدرن و خوانا',
    label_en: 'IBM Plex Sans Arabic',
    cssFamily: '"IBM Plex Sans Arabic", "Vazirmatn", sans-serif',
    sample: 'استاندارد بین‌المللی API 6A / ISO 29001',
  },
  {
    key: 'noto-naskh',
    label_fa: 'نوتو نسخ عربی (Noto Naskh Arabic) — کلاسیک مستندات',
    label_en: 'Noto Naskh Arabic',
    cssFamily: '"Noto Naskh Arabic", "Vazirmatn", serif',
    sample: 'گزارش‌های فنی و اسناد قراردادی صنعت نفت',
  },
  {
    key: 'lalezar',
    label_fa: 'لاله‌زار (Lalezar) — تیترهای شاخص و صنعتی',
    label_en: 'Lalezar (Display Headings)',
    cssFamily: '"Lalezar", "Vazirmatn", sans-serif',
    sample: 'پارس پولاد آقایی',
  },
  {
    key: 'plus-jakarta',
    label_fa: 'Plus Jakarta Sans — انگلیسی مهندسی و تمیز',
    label_en: 'Plus Jakarta Sans (Modern Latin)',
    cssFamily: '"Plus Jakarta Sans", "Vazirmatn", sans-serif',
    sample: 'Precision Wellhead & Downhole Engineering',
  },
  {
    key: 'jetbrains-mono',
    label_fa: 'JetBrains Mono — اعداد، کدهای مدل و شناسه قرارداد',
    label_en: 'JetBrains Mono (Technical / Code)',
    cssFamily: '"JetBrains Mono", "Vazirmatn", monospace',
    sample: 'PPA-6A-15000PSI · ISO-9001',
  },
];

export const FONT_CSS_MAP: Record<FontFamilyKey, string> = Object.fromEntries(
  BUNDLED_FONTS.map((font) => [font.key, font.cssFamily]),
) as Record<FontFamilyKey, string>;

export const DEFAULT_LOGIN_SETTINGS: LoginPageSettings = {
  badge_text_fa: 'ورود امن به پرتال سازمانی',
  badge_text_en: 'Secure Organizational Portal',
  title_fa: 'ورود به سامانه یکپارچه',
  title_en: 'Portal Sign In',
  subtitle_fa: 'ورود سوپر ادمین، مدیران محتوا و کارفرمایان مجاز',
  subtitle_en: 'Access for administrators, engineers & clients',
  two_factor_title_fa: 'احراز هویت دو مرحله‌ای (2FA)',
  two_factor_title_en: 'Two-Factor Verification',
  two_factor_hint_fa: 'کد تایید ۶ رقمی خود را وارد کنید.',
  two_factor_hint_en: 'Enter your 6-digit authentication code.',
  email_label_fa: 'ایمیل سازمانی',
  email_label_en: 'Corporate Email',
  email_placeholder_fa: 'name@parspooladaghaei.ir',
  email_placeholder_en: 'name@parspooladaghaei.ir',
  password_label_fa: 'رمز عبور',
  password_label_en: 'Password',
  password_placeholder_fa: '••••••••',
  password_placeholder_en: '••••••••',
  captcha_label_fa: 'کد امنیتی تصویری',
  captcha_label_en: 'Security Captcha',
  submit_text_fa: 'ورود به حساب',
  submit_text_en: 'Sign In',
  two_factor_submit_fa: 'تایید و ورود',
  two_factor_submit_en: 'Verify & Continue',
  register_cta_fa: 'ایجاد حساب کاربری جدید',
  register_cta_en: 'Create New Account',
  back_home_fa: 'بازگشت به سایت',
  back_home_en: 'Back to Website',
  register_title_fa: 'ثبت‌نام کارفرمایان و کاربران',
  register_title_en: 'Client & Partner Registration',
  register_subtitle_fa: 'دسترسی به کاتالوگ‌های مهندسی، سوابق و تیکت پشتیبانی',
  register_subtitle_en: 'Access technical catalogs, contracts & support tickets',
  register_name_label_fa: 'نام و نام خانوادگی',
  register_name_label_en: 'Full Name',
  register_phone_label_fa: 'شماره تماس',
  register_phone_label_en: 'Phone Number',
  register_submit_fa: 'ایجاد حساب کاربری',
  register_submit_en: 'Register Account',
  login_cta_fa: 'قبلاً ثبت‌نام کرده‌اید؟ ورود',
  login_cta_en: 'Already registered? Sign In',
  badge_icon: 'ShieldCheck',
  email_icon: 'Mail',
  password_icon: 'Lock',
  captcha_icon: 'KeyRound',
  submit_icon: 'LogIn',
  register_icon: 'UserPlus',
  two_factor_icon: 'ShieldCheck',
  back_icon: 'ArrowRight',
  card_bg_color: 'rgba(15, 23, 42, 0.72)',
  backdrop_color: '#020617',
  accent_color: '#B91C1C',
  text_color: '#F8FAFC',
  input_bg_color: 'rgba(255, 255, 255, 0.06)',
  enable_3d_flip: true,
  show_decorative_cube: true,
  enable_particles: true,
  enable_bg_slideshow: true,
};

export const DEFAULT_BRAND_LOGOS: BrandLogosSettings = {
  navbar: '/storage/logos/logo-small.png',
  footer: '/storage/logos/logo-main.png',
  admin_sidebar: '/storage/logos/logo-small.png',
  login: '/storage/logos/logo-small.png',
  register: '/storage/logos/logo-small.png',
  preloader: '/storage/logos/preloader.gif',
  about: '/storage/videos/logo-3d.mp4',
  favicon: '/storage/logos/logo-small.png',
  seo_share: '/storage/logos/logo-main.png',
};

export const DEFAULT_APPEARANCE_SETTINGS: AppearanceSettings = {
  font_site: 'vazirmatn',
  font_site_heading: 'vazirmatn',
  font_landing: 'vazirmatn',
  font_landing_heading: 'lalezar',
  font_login: 'ibm-plex-arabic',
  font_login_heading: 'vazirmatn',
  font_admin: 'vazirmatn',
  font_admin_heading: 'vazirmatn',
  font_navbar: 'vazirmatn',
  font_footer: 'vazirmatn',
  base_font_size: 16,
};

export const DEFAULT_PAGES_CONFIG: PagesConfigSettings = {
  error_404: {
    title_fa: 'صفحه مورد نظر یافت نشد',
    title_en: 'Page Not Found',
    subtitle_fa: 'مسیر درخواستی در سامانه وجود ندارد یا جابه‌جا شده است.',
    subtitle_en: 'The requested URL could not be located on this portal.',
    cta_fa: 'بازگشت به صفحه اصلی',
    cta_en: 'Return Home',
    logo_url: '/storage/logos/logo-small.png',
  },
  error_403: {
    title_fa: 'عدم دسترسی مجاز',
    title_en: 'Access Forbidden',
    subtitle_fa: 'دسترسی به این بخش محدود به سطوح کاربری مجاز است.',
    subtitle_en: 'You do not have permission to access this section.',
    cta_fa: 'بازگشت به صفحه اصلی',
    cta_en: 'Return Home',
    logo_url: '/storage/logos/logo-small.png',
  },
  error_500: {
    title_fa: 'خطای داخلی سرور',
    title_en: 'Server Error',
    subtitle_fa: 'بروز خطای غیرمنتظره در پردازش درخواست. لطفاً مجدداً تلاش کنید.',
    subtitle_en: 'An unexpected internal server error occurred.',
    cta_fa: 'بازگشت به صفحه اصلی',
    cta_en: 'Return Home',
    logo_url: '/storage/logos/logo-small.png',
  },
  maintenance: {
    title_fa: 'در حال بروزرسانی فنی سامانه',
    title_en: 'Scheduled Technical Maintenance',
    subtitle_fa: 'سامانه در حال ارتقای سرویس‌های مهندسی است. لطفاً دقایقی دیگر مراجعه نمایید.',
    subtitle_en: 'Portal services are temporarily undergoing scheduled upgrades.',
    logo_url: '/storage/logos/preloader.gif',
  },
  home_spotlight: {
    badge_fa: 'مهندسی و تولید بومی',
    badge_en: 'Indigenous Engineering',
    title_fa: 'پیشگام طراحی و ساخت تجهیزات سرچاهی و درون‌چاهی',
    title_en: 'Strategic Wellhead & Downhole Manufacturing',
    subtitle_fa: 'تلفیق دانش متالورژی، تست‌های هیدرواستاتیک و استانداردهای بین‌المللی API',
    subtitle_en: 'Combining metallurgy mastery, hydrostatic testing & API certification',
    logo_url: '/storage/videos/logo-3d.mp4',
  },
};

export const BUILTIN_BRAND_MEDIA_PRESETS = [
  { label: 'لوگوی متحرک سه‌بعدی (MP4)', url: '/storage/videos/logo-3d.mp4', type: 'video' },
  { label: 'آرم متحرک پیش‌بارگذاری (GIF)', url: '/storage/logos/preloader.gif', type: 'gif' },
  { label: 'لوگوی اصلی شرکت (PNG)', url: '/storage/logos/logo-main.png', type: 'image' },
  { label: 'لوگوی مربعی کوچک (PNG)', url: '/storage/logos/logo-small.png', type: 'image' },
  { label: 'ویدیو معرفی کارخانه (WEBM)', url: '/storage/videos/company-intro.webm', type: 'video' },
] as const;

export function isVideoMediaUrl(url?: string | null): boolean {
  if (!url) return false;
  return /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url.trim());
}

export function isAnimatedMediaUrl(url?: string | null): boolean {
  if (!url) return false;
  return /\.(mp4|webm|ogg|mov|gif)(\?.*)?$/i.test(url.trim());
}
