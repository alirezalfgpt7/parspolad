import type { Language } from '../types/index.ts';

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

export function formatPersianDigits(value: string | number): string {
  const map = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(value).replace(/\d/g, (d) => map[Number(d)]);
}

export function formatLocalizedNumber(value: number, lang: Language): string {
  const formatted = new Intl.NumberFormat(lang === 'fa' ? 'fa-IR' : 'en-US').format(value);
  return formatted;
}

export const translations = {
  fa: {
    brandName: 'پارس پولاد آقایی',
    brandSubtitle: 'تجهیزات سرچاهی و درون‌چاهی صنعت نفت',
    requestQuote: 'درخواست همکاری',
    login: 'ورود به پرتال',
    adminPanel: 'پنل مدیریت',
    logout: 'خروج',
    searchPlaceholder: 'جستجو در پروژه‌ها، محصولات، استانداردها...',
    readMore: 'مشاهده جزئیات',
    downloadPdf: 'دریافت فایل فنی',
    loginRequiredDoc: 'نیازمند ورود برای دانلود',
    viewAll: 'مشاهده همه',
    sendRequest: 'ارسال درخواست',
    saveChanges: 'ذخیره تغییرات',
    cancel: 'انصراف',
    loading: 'در حال بارگذاری...',
    noResults: 'موردی با فیلترهای انتخاب‌شده یافت نشد.',
    installApp: 'نصب نسخه وب‌اپلیکیشن',
    offlineNotice: 'حالت آفلاین — نمایش اطلاعات ذخیره‌شده',
  },
  en: {
    brandName: 'Pars Poolad Aghaee',
    brandSubtitle: 'Oil & Gas Wellhead & Downhole Engineering',
    requestQuote: 'Request Quote',
    login: 'Portal Login',
    adminPanel: 'Admin Panel',
    logout: 'Sign Out',
    searchPlaceholder: 'Search projects, products, standards...',
    readMore: 'View Details',
    downloadPdf: 'Download Datasheet',
    loginRequiredDoc: 'Login Required to Download',
    viewAll: 'View All',
    sendRequest: 'Submit Request',
    saveChanges: 'Save Changes',
    cancel: 'Cancel',
    loading: 'Loading...',
    noResults: 'No matching records found.',
    installApp: 'Install App',
    offlineNotice: 'Offline Mode — Cached Data Active',
  },
} as const;

export function useT(lang: Language) {
  return translations[lang];
}
