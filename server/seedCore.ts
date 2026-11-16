import { encryptSensitive, hashPassword } from './crypto.ts';
import type { DatabaseSchema } from './types.ts';

export function buildCoreSeed(): Pick<
  DatabaseSchema,
  'users' | 'roles' | 'theme_presets' | 'theme_settings' | 'menus' | 'banners' | 'kpis' | 'settings'
> {
  const adminEmail = process.env.SUPER_ADMIN_EMAIL || 'admin@parspooladaghaei.ir';
  const adminPass = process.env.SUPER_ADMIN_PASSWORD || 'ParsPolad@1404';
  const now = new Date().toISOString();

  const roles = [
    {
      id: 1,
      name: 'super-admin',
      label_fa: 'سوپر ادمین (مدیر کل سامانه)',
      label_en: 'Super Admin',
      permissions: ['*'],
    },
    {
      id: 2,
      name: 'admin',
      label_fa: 'مدیر سیستم',
      label_en: 'Administrator',
      permissions: [
        'projects.manage', 'contracts.manage', 'licenses.manage', 'slider.manage',
        'themes.manage', 'menus.manage', 'pages.manage', 'media.manage',
        'messages.manage', 'users.view', 'reports.export', 'settings.manage',
      ],
    },
    {
      id: 3,
      name: 'content-manager',
      label_fa: 'مدیر محتوا',
      label_en: 'Content Manager',
      permissions: [
        'projects.manage', 'slider.manage', 'pages.manage', 'media.manage', 'messages.view',
      ],
    },
    {
      id: 4,
      name: 'operator',
      label_fa: 'اپراتور فنی',
      label_en: 'Technical Operator',
      permissions: ['projects.view', 'contracts.view', 'licenses.view', 'messages.manage'],
    },
    {
      id: 5,
      name: 'user',
      label_fa: 'کاربر ثبت‌نام‌شده',
      label_en: 'Registered User',
      permissions: ['documents.download_authorized', 'profile.manage', 'notifications.view'],
    },
  ];

  const users = [
    {
      id: 1,
      name: 'پرویز آقایی (مدیرعامل و سوپر ادمین)',
      email: adminEmail,
      phone: '06132907005',
      avatar: '/storage/logos/logo-small.png',
      role: 'super-admin',
      permissions: ['*'],
      two_factor_enabled: false,
      is_active: true,
      created_at: now,
      password_hash: hashPassword(adminPass),
    },
    {
      id: 2,
      name: 'سیده نجمه صالحپور (مدیر بازرگانی)',
      email: 'commercial@parspooladaghaei.ir',
      phone: '09369520082',
      avatar: '/storage/logos/logo-small.png',
      role: 'content-manager',
      permissions: roles[2].permissions,
      two_factor_enabled: false,
      is_active: true,
      created_at: now,
      password_hash: hashPassword('Content@1404'),
    },
    {
      id: 3,
      name: 'کارشناس فنی پیمانکاران',
      email: 'partner@nisoc-client.ir',
      phone: '09160001122',
      avatar: '/storage/logos/logo-small.png',
      role: 'user',
      permissions: roles[4].permissions,
      two_factor_enabled: false,
      is_active: true,
      created_at: now,
      password_hash: hashPassword('Client@1404'),
    },
  ];

  const crimsonPalette = {
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

  const theme_presets = [
    {
      id: 1,
      slug: 'industrial-crimson',
      name_fa: 'قرمز صنعتی پارس پولاد (پیش‌فرض)',
      name_en: 'Pars Polad Industrial Crimson',
      is_default: true,
      palette: crimsonPalette,
    },
    {
      id: 2,
      slug: 'offshore-navy',
      name_fa: 'سرمه‌ای فراساحل و مهندسی',
      name_en: 'Offshore Engineering Navy',
      is_default: false,
      palette: {
        ...crimsonPalette,
        primary: '#0F4C81',
        accent: '#E11D48',
        buttonBg: '#0F4C81',
        link: '#0F4C81',
      },
    },
    {
      id: 3,
      slug: 'petro-emerald',
      name_fa: 'سبز پتروشیمی و انرژی پایدار',
      name_en: 'Petrochemical Emerald',
      is_default: false,
      palette: {
        ...crimsonPalette,
        primary: '#047857',
        accent: '#D97706',
        buttonBg: '#047857',
        link: '#047857',
      },
    },
    {
      id: 4,
      slug: 'steel-amber',
      name_fa: 'فولادی تیره با تاکید کهربایی',
      name_en: 'Forged Steel & Amber',
      is_default: false,
      palette: {
        ...crimsonPalette,
        primary: '#B45309',
        secondary: '#0F172A',
        accent: '#DC2626',
        buttonBg: '#B45309',
        link: '#B45309',
      },
    },
  ];

  const theme_settings = {
    active_preset_slug: 'industrial-crimson',
    default_mode: 'light' as const,
    active_palette: crimsonPalette,
    landing_theme_enabled: true,
    landing_palette: {
      ...crimsonPalette,
      primary: '#B91C1C',
      secondary: '#0F172A',
      accent: '#F59E0B',
      footerBg: '#090D16',
    },
  };

  const menus = [
    {
      id: 1,
      key: 'header' as const,
      title_fa: 'منوی اصلی بالای صفحه',
      items: [
        {
          id: 1, menu_id: 1, parent_id: null, title_fa: 'صفحه اصلی', title_en: 'Home', url: '/', sort_order: 1, is_active: true,
        },
        {
          id: 2, menu_id: 1, parent_id: null, title_fa: 'توانمندی‌ها', title_en: 'Capabilities', url: '/services', sort_order: 2, is_active: true,
          children: [
            {
              id: 21, menu_id: 1, parent_id: 2, title_fa: 'تجهیزات سرچاهی (Wellhead)', title_en: 'Wellhead Equipment',
              url: '/products?cat=wellhead', image: '/storage/products/wellhead-api6a.png',
              description_fa: 'طراحی و ساخت درخت‌های سرچاهی و شیرآلات فشارقوی API 6A', description_en: 'API 6A Wellhead & Valves', sort_order: 1, is_active: true,
            },
            {
              id: 22, menu_id: 1, parent_id: 2, title_fa: 'ادوات درون‌چاهی (Liner Hanger)', title_en: 'Downhole Tools',
              url: '/products?cat=downhole', image: '/storage/products/liner-hanger.webp',
              description_fa: 'لاینر هنگر هیدرولیک، مکانیکی، چرخشی و پکرهای تولیدی', description_en: 'Hydraulic, Mechanical & Rotating Liner Hangers', sort_order: 2, is_active: true,
            },
            {
              id: 23, menu_id: 1, parent_id: 2, title_fa: 'خدمات مهندسی و نصب', title_en: 'Engineering Services',
              url: '/services', image: '/storage/hero/hero-deployment.jpg',
              description_fa: 'نصب، راه‌اندازی، مشاوره و مهندسی معکوس قطعات توربین', description_en: 'Installation & R&D', sort_order: 3, is_active: true,
            },
            {
              id: 24, menu_id: 1, parent_id: 2, title_fa: 'شبکه و متعلقات سیمانزنی', title_en: 'Cementing Tools',
              url: '/products?cat=cementing', image: '/storage/products/cementing-accessories.png',
              description_fa: 'تجهیزات کامل سیمان‌کاری و ایزولاسیون چاه‌های نفت و گاز', description_en: 'Well Cementing Accessories', sort_order: 4, is_active: true,
            },
          ],
        },
        {
          id: 3, menu_id: 1, parent_id: null, title_fa: 'پروژه‌ها', title_en: 'Projects', url: '/projects', sort_order: 3, is_active: true,
          children: [
            {
              id: 31, menu_id: 1, parent_id: 3, title_fa: 'پروژه‌های سرچاهی', title_en: 'Wellhead Projects',
              url: '/projects?category=wellhead', image: '/storage/products/wellhead-compact.jpg',
              description_fa: 'سوابق تحویل و نصب تجهیزات سرچاهی میادین جنوب و فلات قاره', description_en: 'Completed Wellhead Orders', sort_order: 1, is_active: true,
            },
            {
              id: 32, menu_id: 1, parent_id: 3, title_fa: 'پروژه‌های درون‌چاهی', title_en: 'Downhole Projects',
              url: '/projects?category=downhole', image: '/storage/products/rotating-hanger.webp',
              description_fa: 'اجرای عملیات راندن لاینر هنگر در پارس جنوبی، آزادگان و کیش', description_en: 'Downhole Field Operations', sort_order: 2, is_active: true,
            },
            {
              id: 33, menu_id: 1, parent_id: 3, title_fa: 'قراردادها و گواهینامه‌ها', title_en: 'Contracts & Licenses',
              url: '/contracts-licenses', image: '/storage/certificates/iso-29001.jpg',
              description_fa: 'گواهینامه‌های API 6FA، دانش‌بنیان و ایزوهای بین‌المللی', description_en: 'ISO, API & Knowledge-Based Certificates', sort_order: 3, is_active: true,
            },
          ],
        },
        {
          id: 4, menu_id: 1, parent_id: null, title_fa: 'درباره ما', title_en: 'About Us', url: '/about', sort_order: 4, is_active: true,
          children: [
            {
              id: 41, menu_id: 1, parent_id: 4, title_fa: 'تاریخچه و خط‌مشی کیفیت', title_en: 'History & Policy',
              url: '/about', image: '/storage/hero/hero-banner.jpg',
              description_fa: 'بیش از نیم قرن تجربه از ۱۳۴۸ تا پیشگامی دانش‌بنیان', description_en: 'Since 1969 Heritage', sort_order: 1, is_active: true,
            },
            {
              id: 42, menu_id: 1, parent_id: 4, title_fa: 'ساختار سازمانی', title_en: 'Org Chart',
              url: '/org-chart', image: '/storage/org/chart-org.svg',
              description_fa: 'ساختار مهندسی، کنترل کیفیت (QC/QA) و مدیریت اجرایی', description_en: 'Departments & Leadership', sort_order: 2, is_active: true,
            },
            {
              id: 43, menu_id: 1, parent_id: 4, title_fa: 'اخبار و مقالات فنی', title_en: 'News & Articles',
              url: '/news', image: '/storage/hero/hero-rig.jpg',
              description_fa: 'تازه‌ترین دستاوردهای مهندسی و گزارش‌های صنعت نفت', description_en: 'Technical Insights', sort_order: 3, is_active: true,
            },
          ],
        },
        {
          id: 5, menu_id: 1, parent_id: null, title_fa: 'تماس با ما', title_en: 'Contact', url: '/contact', sort_order: 5, is_active: true,
        },
      ],
    },
    {
      id: 2,
      key: 'footer' as const,
      title_fa: 'منوی فوتر',
      items: [
        { id: 101, menu_id: 2, parent_id: null, title_fa: 'پروژه‌های اجرایی', title_en: 'Projects', url: '/projects', sort_order: 1, is_active: true },
        { id: 102, menu_id: 2, parent_id: null, title_fa: 'گواهینامه‌ها و افتخارات', title_en: 'Certificates', url: '/contracts-licenses', sort_order: 2, is_active: true },
        { id: 103, menu_id: 2, parent_id: null, title_fa: 'درخواست همکاری (RFQ)', title_en: 'Request Quote', url: '/rfq', sort_order: 3, is_active: true },
        { id: 104, menu_id: 2, parent_id: null, title_fa: 'سوالات متداول', title_en: 'FAQ', url: '/faq', sort_order: 4, is_active: true },
        { id: 105, menu_id: 2, parent_id: null, title_fa: 'حریم خصوصی و قوانین', title_en: 'Legal', url: '/legal', sort_order: 5, is_active: true },
        { id: 106, menu_id: 2, parent_id: null, title_fa: 'نقشه سایت', title_en: 'Sitemap', url: '/sitemap', sort_order: 6, is_active: true },
      ],
    },
  ];

  const kpis = [
    { id: 1, key: 'projects', label_fa: 'پروژه موفق در میادین نفت و گاز', label_en: 'Completed Oil & Gas Projects', value: 1000, suffix_fa: '+', suffix_en: '+', sort_order: 1 },
    { id: 2, key: 'experience', label_fa: 'سال سابقه مهندسی و ساخت (از ۱۳۴۸)', label_en: 'Years of Industrial Heritage', value: 57, suffix_fa: 'سال', suffix_en: 'Yrs', sort_order: 2 },
    { id: 3, key: 'equipment', label_fa: 'دستگاه تحویلی با تضمین کیفیت به وزارت نفت', label_en: 'Critical Units Delivered', value: 200, suffix_fa: '+', suffix_en: '+', sort_order: 3 },
    { id: 4, key: 'self_sufficiency', label_fa: 'خودکفایی در طراحی و تولید بومی', label_en: 'Domestic Engineering Localization', value: 100, suffix_fa: '%', suffix_en: '%', sort_order: 4 },
  ];

  const banners = [
    {
      id: 1,
      title_fa: 'آماده همکاری در مناقصات و تأمین تجهیزات سرچاهی و درون‌چاهی',
      title_en: 'Ready for Oilfield Wellhead & Downhole Engineering Tenders',
      subtitle_fa: 'ساخت بومی مطابق با استانداردهای API 6A / API 6FA / ISO 29001 با یک‌دهم هزینه نمونه‌های خارجی',
      subtitle_en: 'API 6A & ISO 29001 certified manufacturing with full field installation support',
      cta_text_fa: 'ثبت درخواست همکاری و استعلام فنی',
      cta_text_en: 'Submit Technical RFQ',
      cta_link: '/rfq',
      image_url: '/storage/hero/hero-deployment.jpg',
      placement: 'landing_mid' as const,
      is_active: true,
    },
  ];

  const settings: DatabaseSchema['settings'] = {
    company: {
      name_fa: 'شرکت پارس پولاد آقایی',
      name_en: 'Pars Poolad Aghaee Co.',
      slogan_fa: 'پیشگام مهندسی، ساخت و اجرای تجهیزات استراتژیک سرچاهی و درون‌چاهی صنعت نفت و گاز',
      slogan_en: 'Pioneer in Engineering & Manufacturing of Strategic Wellhead and Downhole Oilfield Equipment',
      logo_url: '/storage/logos/logo-main.png',
      logo_small_url: '/storage/logos/logo-small.png',
      factory_address_fa: 'اهواز، شهرک صنعتی شماره ۳، خیابان ابتکار ۶',
      factory_address_en: 'Ebtekar 6 St., Industrial Zone No. 3, Ahvaz, Iran',
      factory_phone: '061-32907005-9',
      factory_email: 'Parspoolad.co@gmail.com',
      office_address_fa: 'اهواز، شهرک صنعتی شماره ۱، فاز ۳، واحد ۷',
      office_address_en: 'Unit 7, Phase 3, Industrial Zone No. 1, Ahvaz, Iran',
      office_phone: '061-34441968',
      office_email: 'info@parspooladaghaei.ir',
      commercial_phone: '09369520082',
      work_hours_fa: 'شنبه تا چهارشنبه ۸:۰۰ الی ۱۶:۰۰ | پنجشنبه‌ها ۸:۰۰ الی ۱۳:۰۰',
      work_hours_en: 'Sat–Wed 08:00–16:00 | Thu 08:00–13:00',
      linkedin_url: 'https://linkedin.com',
      instagram_url: 'https://instagram.com',
      aparat_url: 'https://aparat.com',
      footer_note_fa: 'کلیه حقوق مادی و معنوی این وب‌سایت متعلق به شرکت دانش‌بنیان پارس پولاد آقایی می‌باشد.',
      footer_note_en: 'All rights reserved © Pars Poolad Aghaee Knowledge-Based Industrial Co.',
      last_updated_fa: 'آبان ۱۴۰۴',
    },
    map: {
      factory_lat: 31.2682,
      factory_lng: 48.6251,
      office_lat: 31.3183,
      office_lng: 48.6706,
      zoom: 12,
    },
    seo: {
      site_title: 'پارس پولاد آقایی | تجهیزات سرچاهی و درون‌چاهی صنعت نفت',
      meta_description: 'طراحی، ساخت، تأمین و اجرای لاینر هنگر، تجهیزات سرچاهی API 6A، پکرهای تولیدی و متعلقات سیمان‌کاری در صنعت نفت، گاز و پتروشیمی.',
      keywords: 'پارس پولاد آقایی, تجهیزات سرچاهی, لاینر هنگر, ادوات درون چاهی, API 6A, پکر تولیدی, اهواز, نفت و گاز',
    },
    email: {
      smtp_host: process.env.MAIL_HOST || 'smtp.mailtrap.io',
      smtp_port: Number(process.env.MAIL_PORT || 587),
      smtp_user: process.env.MAIL_USERNAME || '',
      smtp_password_enc: encryptSensitive(process.env.MAIL_PASSWORD || ''),
      from_address: process.env.MAIL_FROM_ADDRESS || 'info@parspooladaghaei.ir',
      from_name: 'پارس پولاد آقایی',
    },
    sms: {
      provider: 'kavenegar',
      api_key_enc: encryptSensitive(process.env.SMS_API_KEY || ''),
      sender_line: process.env.SMS_SENDER_LINE || '10004346',
      enabled: false,
    },
    site: {
      maintenance_mode: false,
      maintenance_message_fa: 'سامانه در حال بروزرسانی فنی برنامه‌ریزی‌شده است. لطفاً دقایقی دیگر مراجعه فرمایید.',
      allow_registration: true,
    },
  };

  return { roles, users, theme_presets, theme_settings, menus, banners, kpis, settings };
}
