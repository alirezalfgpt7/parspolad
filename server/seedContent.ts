import type { DatabaseSchema } from './types.ts';

export function buildContentSeed(): Pick<
  DatabaseSchema,
  | 'sliders'
  | 'departments'
  | 'team_members'
  | 'partners'
  | 'articles'
  | 'pages'
  | 'messages'
  | 'notifications'
  | 'notification_templates'
  | 'media'
  | 'activity_logs'
> {
  const now = new Date().toISOString();

  const sliders: DatabaseSchema['sliders'] = [
    {
      id: 1,
      key: 'landing_hero',
      title_fa: 'اسلایدر اصلی صفحه نخست',
      title_en: 'Main Landing Hero Slider',
      page_slug: 'home',
      is_active: true,
      slides: [
        {
          id: 1,
          slider_id: 1,
          title_fa: 'پیشگام مهندسی و ساخت تجهیزات سرچاهی و درون‌چاهی صنعت نفت',
          title_en: 'Strategic Wellhead & Downhole Oilfield Engineering',
          subtitle_fa: 'شرکت دانش‌بنیان پارس پولاد آقایی؛ بیش از ۵۷ سال تجربه در بومی‌سازی تجهیزات API 6A، لاینر هنگر و قطعات توربین با تضمین کیفیت بین‌المللی.',
          subtitle_en: 'Over 57 years of industrial excellence delivering API 6A wellheads, liner hangers & critical turbine components.',
          cta_text_fa: 'مشاهده پروژه‌ها و سوابق',
          cta_text_en: 'Explore Projects',
          cta_link: '/projects',
          media_type: 'image',
          desktop_media: '/storage/hero/hero-rig.jpg',
          mobile_media: '/storage/hero/hero-rig.jpg',
          text_position: 'right',
          text_color: '#FFFFFF',
          button_color: '#B91C1C',
          overlay_gradient: 'linear-gradient(90deg, rgba(10,15,28,0.88) 0%, rgba(15,23,42,0.58) 55%, rgba(15,23,42,0.28) 100%)',
          duration_ms: 6500,
          effect: 'ken-burns',
          text_animation: 'fade-up',
          particles_enabled: true,
          sort_order: 1,
          is_active: true,
        },
        {
          id: 2,
          slider_id: 1,
          title_fa: 'بومی‌سازی ۱۰۰٪ ادوات درون‌چاهی و لاینر هنگرهای چرخشی',
          title_en: '100% Localized Downhole Liner Hangers & Production Packers',
          subtitle_fa: 'اجرای موفق بیش از ۱۰۰۰ پروژه در میادین پارس جنوبی، آزادگان، کیش و مناطق نفت‌خیز جنوب با استاندارد API 19LH.',
          subtitle_en: 'Over 1,000 successful field deployments across South Pars, Azadegan, Kish & NISOC oilfields.',
          cta_text_fa: 'کاتالوگ محصولات فنی',
          cta_text_en: 'Technical Products',
          cta_link: '/products',
          media_type: 'video',
          desktop_media: '/storage/videos/oil-gas-1.mp4',
          mobile_media: '/storage/hero/hero-liner.jpg',
          text_position: 'right',
          text_color: '#FFFFFF',
          button_color: '#D97706',
          overlay_gradient: 'linear-gradient(90deg, rgba(15,23,42,0.88) 0%, rgba(15,23,42,0.52) 60%, rgba(15,23,42,0.25) 100%)',
          duration_ms: 8000,
          effect: 'parallax',
          text_animation: 'mask-reveal',
          particles_enabled: false,
          sort_order: 2,
          is_active: true,
        },
        {
          id: 3,
          slider_id: 1,
          title_fa: 'آزمون فشار ۱۵۰۰۰ PSI و گواهینامه تست آتش API 6FA',
          title_en: '15,000 PSI Hydrostatic Testing & API 6FA Fire-Safe Valves',
          subtitle_fa: 'دارای گواهینامه‌های ISO 29001:2020، ISO 10423:2022 و تاییدیه رسمی شرکت دانش‌بنیان.',
          subtitle_en: 'Certified under ISO 29001:2020, ISO 10423:2022, API 6FA and National Knowledge-Based accreditation.',
          cta_text_fa: 'مشاهده گواهینامه‌ها',
          cta_text_en: 'View Certifications',
          cta_link: '/contracts-licenses',
          media_type: 'image',
          desktop_media: '/storage/hero/hero-deployment.jpg',
          mobile_media: '/storage/hero/hero-deployment.jpg',
          text_position: 'center',
          text_color: '#FFFFFF',
          button_color: '#B91C1C',
          overlay_gradient: 'linear-gradient(180deg, rgba(15,23,42,0.45) 0%, rgba(15,23,42,0.82) 100%)',
          duration_ms: 6000,
          effect: 'zoom-in',
          text_animation: 'split-text',
          particles_enabled: true,
          sort_order: 3,
          is_active: true,
        },
      ],
    },
  ];

  const departments: DatabaseSchema['departments'] = [
    { id: 1, parent_id: null, name_fa: 'مدیریت عامل', name_en: 'Executive Board (CEO)', head_name_fa: 'مهندس پرویز آقایی', head_name_en: 'Eng. Parviz Aghaee', head_title_fa: 'مدیرعامل و رئیس هیئت مدیره', head_title_en: 'CEO & Chairman', color: '#B91C1C', member_count: 3 },
    { id: 2, parent_id: 1, name_fa: 'مدیریت مهندسی، طراحی و R&D', name_en: 'Engineering & R&D', head_name_fa: 'دکتر رضا کریمی', head_name_en: 'Dr. Reza Karimi', head_title_fa: 'معاون مهندسی و تحقیق و توسعه', head_title_en: 'VP of Engineering & R&D', color: '#0F4C81', member_count: 14 },
    { id: 3, parent_id: 1, name_fa: 'مدیریت تولید و ماشین‌کاری CNC', name_en: 'Production & CNC Machining', head_name_fa: 'مهندس حمید موسوی', head_name_en: 'Eng. Hamid Mousavi', head_title_fa: 'مدیر کارخانه شهرک صنعتی ۳', head_title_en: 'Plant Director', color: '#334155', member_count: 42 },
    { id: 4, parent_id: 1, name_fa: 'کنترل کیفیت، تضمین و HSE (QC/QA/HSE)', name_en: 'QC / QA / HSE', head_name_fa: 'مهندس مریم حسینی', head_name_en: 'Eng. Maryam Hosseini', head_title_fa: 'مدیر تضمین کیفیت و ایمنی', head_title_en: 'QHSE Manager', color: '#047857', member_count: 11 },
    { id: 5, parent_id: 1, name_fa: 'مدیریت بازرگانی و مناقصات', name_en: 'Commercial & Tenders', head_name_fa: 'سیده نجمه صالحپور', head_name_en: 'Najmeh Salehpour', head_title_fa: 'مدیر بازرگانی', head_title_en: 'Commercial Manager', color: '#D97706', member_count: 8 },
    { id: 6, parent_id: 1, name_fa: 'عملیات میدانی و خدمات چاه', name_en: 'Field Operations & Well Services', head_name_fa: 'مهندس علیرضا شریفی', head_name_en: 'Eng. Alireza Sharifi', head_title_fa: 'رئیس عملیات سر دکل', head_title_en: 'Field Ops Lead', color: '#7C2D12', member_count: 18 },
  ];

  const team_members: DatabaseSchema['team_members'] = [
    { id: 1, department_id: 1, name_fa: 'پرویز آقایی', name_en: 'Parviz Aghaee', role_fa: 'مدیرعامل', role_en: 'Chief Executive Officer', experience_years: 32, email: 'ceo@parspooladaghaei.ir' },
    { id: 2, department_id: 5, name_fa: 'سیده نجمه صالحپور', name_en: 'Najmeh Salehpour', role_fa: 'مدیر بازرگانی', role_en: 'Commercial Manager', experience_years: 14, email: 'commercial@parspooladaghaei.ir', phone: '09369520082' },
    { id: 3, department_id: 2, name_fa: 'مهندس رضا کریمی', name_en: 'Reza Karimi', role_fa: 'سرپرست طراحی سرچاهی و درون‌چاهی', role_en: 'Lead Wellhead Design Engineer', experience_years: 16 },
    { id: 4, department_id: 4, name_fa: 'مهندس مریم حسینی', name_en: 'Maryam Hosseini', role_fa: 'مسئول تضمین کیفیت و ممیزی API/ISO', role_en: 'QA & ISO Lead Auditor', experience_years: 12 },
    { id: 5, department_id: 6, name_fa: 'مهندس علیرضا شریفی', name_en: 'Alireza Sharifi', role_fa: 'سرپرست عملیات نصب و راندن لاینر', role_en: 'Field Liner Running Supervisor', experience_years: 15 },
  ];

  const partners: DatabaseSchema['partners'] = [
    { id: 1, name_fa: 'شرکت ملی مناطق نفت‌خیز جنوب (NISOC)', name_en: 'NISOC', logo_url: '/storage/partners/nisoc.png', sector_fa: 'بهره‌برداری و تولید نفت', is_active: true },
    { id: 2, name_fa: 'شرکت ملی حفاری ایران (NIDC)', name_en: 'NIDC', logo_url: '/storage/partners/nidc.png', sector_fa: 'حفاری خشکی و دریایی', is_active: true },
    { id: 3, name_fa: 'شرکت مهندسی و ساخت تأسیسات دریایی (IOEC)', name_en: 'IOEC', logo_url: '/storage/partners/ioec.png', sector_fa: 'تأسیسات فراساحلی', is_active: true },
    { id: 4, name_fa: 'شرکت نفت فلات قاره ایران (IOOC)', name_en: 'IOOC', logo_url: '/storage/partners/iooc.png', sector_fa: 'میادین دریایی خلیج فارس', is_active: true },
    { id: 5, name_fa: 'شرکت مپنا دریلینگ', name_en: 'MAPNA Drilling', logo_url: '/storage/partners/mapna.png', sector_fa: 'حفاری و تکمیل چاه', is_active: true },
    { id: 6, name_fa: 'شرکت توسعه حفاری تدبیر', name_en: 'Tadbir Drilling', logo_url: '/storage/partners/tadbir.png', sector_fa: 'توسعه میادین نفتی', is_active: true },
    { id: 7, name_fa: 'شرکت توسعه پترو ایران (PEDCO)', name_en: 'PEDCO', logo_url: '/storage/partners/pedco.png', sector_fa: 'مهندسی و توسعه میادین', is_active: true },
    { id: 8, name_fa: 'مدیریت اکتشاف شرکت ملی نفت ایران', name_en: 'NIOC Exploration', logo_url: '/storage/partners/nioc-exp.png', sector_fa: 'اکتشاف منابع هیدروکربوری', is_active: true },
    { id: 9, name_fa: 'شرکت نفت مناطق مرکزی ایران (ICOFC)', name_en: 'ICOFC', logo_url: '/storage/partners/icofc.jpg', sector_fa: 'میادین گازی و نفتی مرکزی', is_active: true },
    { id: 10, name_fa: 'شرکت خدمات مهندسی پژواک انرژی', name_en: 'Pezhvak Energy', logo_url: '/storage/partners/pezhvak.png', sector_fa: 'خدمات مهندسی انرژی', is_active: true },
  ];

  const articles: DatabaseSchema['articles'] = [
    {
      id: 1,
      slug: 'rotary-liner-hanger-cementing-efficiency',
      title_fa: 'نقش لاینر هنگرهای چرخشی در افزایش کیفیت سیمان‌کاری چاه‌های زاویه‌دار',
      title_en: 'How Rotating Liner Hangers Improve Cement Bond Quality in Deviated Wells',
      excerpt_fa: 'تحلیل مهندسی تأثیر چرخش آستری حین جابجایی دوغاب سیمان و جلوگیری از کانال‌زنی سیالات سازندی در فضای حلقوی.',
      excerpt_en: 'Engineering study on liner rotation during cementing displacement to prevent gas migration and channeling.',
      content_fa: '<p>وجود بیرینگ‌های کف‌گرد با ظرفیت باربری بالا در هنگرهای چرخشی پارس پولاد آقایی این امکان را فراهم می‌سازد که بدنه لاینر هنگر بر روی مخروط سلیپس حین عملیات سیمان‌کاری بچرخد.</p><p>این مکانیزم باعث توزیع یکنواخت سیمان در پشت آستری شده، راندمان جابجایی را در چاه‌های انحرافی و با فضای حلقوی کم افزایش داده و از مهاجرت سیال سازند جلوگیری می‌کند.</p>',
      content_en: '<p>High-capacity thrust bearings inside Pars Poolad rotating liner hangers allow continuous rotation during cement placement, enhancing mud removal and zonal isolation.</p>',
      category_fa: 'مقالات فنی درون‌چاهی',
      category_en: 'Downhole Engineering',
      cover_image: '/storage/products/rotating-hanger.webp',
      author_fa: 'واحد تحقیق و توسعه پارس پولاد آقایی',
      published_at: '1404/07/22',
      read_minutes: 5,
    },
    {
      id: 2,
      slug: 'api-6fa-fire-test-wellhead-valves',
      title_fa: 'الزامات استاندارد API 6FA در آزمون آتش شیرآلات سرچاهی ۵۰۰۰ PSI',
      title_en: 'API 6FA Fire Test Standards for 5000 PSI Wellhead Gate Valves',
      excerpt_fa: 'بررسی استانداردهای آب‌بندی فلز-به-فلز و حفظ فشار در دمای ۷۶۰ درجه سانتی‌گراد برای شیرهای دروازه‌ای سرچاهی.',
      excerpt_en: 'Evaluating metal-to-metal sealing integrity under 760°C fire exposure for API 6A/6FA gate valves.',
      content_fa: '<p>شیرآلات سرچاهی ساخته‌شده در شرکت پارس پولاد آقایی با گذراندن موفقیت‌آمیز آزمون آتش API 6FA، ایمنی بهره‌برداری در شرایط اضطراری سکوها و سرچاه‌ها را تضمین می‌کنند.</p>',
      content_en: '<p>Pars Poolad gate valves pass rigorous API 6FA burn and cool-down pressure containment cycles ensuring critical well safety.</p>',
      category_fa: 'استانداردها و کنترل کیفیت',
      category_en: 'Standards & QC',
      cover_image: '/storage/products/wellhead-api6a.png',
      author_fa: 'تیم تضمین کیفیت (QA)',
      published_at: '1404/06/14',
      read_minutes: 4,
    },
    {
      id: 3,
      slug: 'production-packers-well-integrity',
      title_fa: 'اصول انتخاب پکرهای تولیدی دائمی و قابل بازیابی در تکمیل چاه',
      title_en: 'Selecting Permanent vs. Retrievable Production Packers in Well Completion',
      excerpt_fa: 'بررسی اجزای کلیدی پکر شامل مندرل، اسلیپس، المنت آب‌بندی و حلقه قفل در عملیات تحریک اسیدی و تولید.',
      excerpt_en: 'Comparing mandrel, slips, packing elements and lock rings across acidizing, fracturing and production.',
      content_fa: '<p>پکرهای تولیدی ابزارهای حیاتی درون‌چاهی هستند که با ایجاد عایق‌بندی میان لوله تولیدی (Tubing) و جداره (Casing)، از خوردگی جداره جلوگیری کرده و ایمنی عملیات را تضمین می‌کنند.</p>',
      content_en: '<p>Production packers isolate the tubing-casing annulus from high-pressure corrosive fluids, extending well life.</p>',
      category_fa: 'دانش فنی حفاری',
      category_en: 'Drilling Knowledge',
      cover_image: '/storage/products/packer.png',
      author_fa: 'واحد مهندسی تکمیل چاه',
      published_at: '1404/05/03',
      read_minutes: 6,
    },
  ];

  const pages: DatabaseSchema['pages'] = [
    {
      id: 1,
      slug: 'about',
      title_fa: 'درباره شرکت پارس پولاد آقایی',
      title_en: 'About Pars Poolad Aghaee Co.',
      subtitle_fa: 'بیش از نیم قرن تجربه از ۱۳۴۸ در مهندسی، ساخت و خودکفایی تجهیزات صنعت نفت، گاز و فولاد',
      subtitle_en: 'Over half a century of engineering excellence since 1969 in oil, gas & steel industries',
      content_fa: '<p>شرکت پارس پولاد آقایی با بیش از نیم قرن تجربه ارزشمند، در سال ۱۳۴۸ تأسیس شد و از سال ۱۳۸۲ با هویتی نوین مسیر تازه‌ای در صنایع سنگین کشور گشود. آغاز فعالیت با تولید قطعات یدکی مجتمع عظیم فولاد خوزستان رقم خورد و به تولید بیش از ۱۴۰ قلم قطعه حیاتی توربین و کمپرسورهای برندهای Ruston، Rolls-Royce، Elliott و Sulzer گسترش یافت.</p><p>در دوران تحریم‌ها، این شرکت با تمرکز بر بومی‌سازی تجهیزات سرچاهی (Wellhead) و ادوات درون‌چاهی (Liner Hanger & Packer)، نمونه‌های پیچیده خارجی را با دقت مهندسی برابر و یک‌دهم هزینه تمام‌شده تولید و بیش از ۲۰۰ دستگاه به وزارت نفت تحویل داد.</p>',
      content_en: '<p>Founded in 1969 and restructured in 2003, Pars Poolad Aghaee is a Knowledge-Based pioneer manufacturing strategic API 6A wellheads, downhole liner hangers, production packers, and precision turbine bearings.</p>',
      meta_title: 'درباره پارس پولاد آقایی | پیشگام تجهیزات نفت و گاز',
      meta_description: 'تاریخچه، دستاوردهای دانش‌بنیان، خط‌مشی کیفیت و اهداف آرمانی شرکت پارس پولاد آقایی.',
      updated_at: now,
    },
    {
      id: 2,
      slug: 'faq',
      title_fa: 'سوالات متداول فنی و بازرگانی',
      title_en: 'Frequently Asked Questions',
      subtitle_fa: 'پاسخ به پرسش‌های رایج کارفرمایان، پیمانکاران حفاری و واحدهای تدارکات',
      subtitle_en: 'Common technical, QA and procurement questions',
      content_fa: '',
      content_en: '',
      meta_title: 'سوالات متداول | پارس پولاد آقایی',
      meta_description: 'پاسخ سوالات متداول درباره استاندارد API، زمان تحویل، خدمات نصب و مدارک فنی.',
      updated_at: now,
    },
    {
      id: 3,
      slug: 'legal',
      title_fa: 'حریم خصوصی، قوانین استفاده و سیاست کوکی‌ها',
      title_en: 'Privacy Policy, Terms & Cookies',
      subtitle_fa: 'چارچوب حفاظت از اطلاعات فنی، اسناد مناقصات و داده‌های کاربران در سامانه پارس پولاد آقایی',
      subtitle_en: 'Data protection, NDA compliance and cookie policy',
      content_fa: '<p>تمامی اطلاعات فنی، نقشه‌های مهندسی و اسناد مناقصه ارسال‌شده از طریق فرم درخواست همکاری (RFQ) تحت تعهد محرمانگی کامل (NDA) شرکت پارس پولاد آقایی نگهداری و رمزنگاری می‌شوند.</p><p>این وب‌سایت صرفاً از کوکی‌های ضروری نشست (Session) و ذخیره تنظیمات ظاهری (تم و زبان) در مرورگر شما استفاده می‌کند.</p>',
      content_en: '<p>All RFQ technical files and tender inquiries are stored securely under strict non-disclosure standards.</p>',
      meta_title: 'حریم خصوصی و قوانین | پارس پولاد آقایی',
      meta_description: 'قوانین استفاده، حریم خصوصی و سیاست کوکی‌های وب‌سایت شرکت پارس پولاد آقایی.',
      updated_at: now,
    },
  ];

  const messages: DatabaseSchema['messages'] = [
    {
      id: 1,
      name: 'مهندس سعید محمدی',
      email: 's.mohammadi@nisoc-ops.ir',
      phone: '09161112233',
      company: 'مدیریت عملیات حفاری جنوب',
      subject: 'استعلام قیمت و زمان تحویل لاینر هنگر ۷ اینچ L-80',
      message: 'با سلام، لطفاً مشخصات فنی و زمان ساخت ۱۰ ست لاینر هنگر هیدرولیک چرخشی ۷ اینچ گرید L-80 را ارسال بفرمایید.',
      type: 'rfq',
      status: 'new',
      created_at: now,
    },
    {
      id: 2,
      name: 'شرکت خدمات مهندسی پتروپارس',
      email: 'procurement@petro-example.ir',
      phone: '02188990011',
      company: 'پتروپارس',
      subject: 'درخواست کاتالوگ شیرآلات سرچاهی ۵۰۰۰ PSI',
      message: 'احتراماً فایل کاتالوگ و گواهینامه API 6FA شیرآلات دروازه‌ای مورد نیاز است.',
      type: 'contact',
      status: 'reviewed',
      created_at: now,
    },
  ];

  const notifications: DatabaseSchema['notifications'] = [
    {
      id: 1,
      user_id: null,
      title_fa: 'انتشار گواهینامه دانش‌بنیان ۱۴۰۳-۱۴۰۵',
      title_en: 'Knowledge-Based Certificate Renewed',
      body_fa: 'گواهینامه رسمی شرکت دانش‌بنیان در بخش قراردادها و لایسنس‌ها با موفقیت بارگذاری شد.',
      body_en: 'Official Knowledge-Based enterprise certificate is now available in the Licenses portal.',
      channel: 'in_app',
      is_read: false,
      created_at: now,
    },
    {
      id: 2,
      user_id: 1,
      title_fa: 'استعلام فنی جدید (RFQ) ثبت شد',
      title_en: 'New Technical RFQ Received',
      body_fa: 'درخواست استعلام لاینر هنگر ۷ اینچ از سوی مدیریت عملیات حفاری جنوب ثبت گردید.',
      body_en: 'New RFQ inquiry submitted for 7-inch L-80 Rotating Liner Hanger.',
      channel: 'email',
      is_read: false,
      created_at: now,
    },
  ];

  const notification_templates: DatabaseSchema['notification_templates'] = [
    {
      id: 1,
      event_key: 'rfq_received',
      name_fa: 'تایید دریافت استعلام همکاری (RFQ)',
      channel: 'email',
      subject_fa: 'ثبت موفق درخواست استعلام فنی در پارس پولاد آقایی',
      body_html: '<h3>درخواست شما با موفقیت ثبت شد</h3><p>کارشناسان بازرگانی و مهندسی شرکت پارس پولاد آقایی حداکثر ظرف ۲۴ ساعت کاری با شما تماس می‌گیرند.</p>',
      sms_text: 'پارس پولاد آقایی: درخواست همکاری/استعلام شما ثبت شد. کد پیگیری: {{code}}',
      is_active: true,
    },
    {
      id: 2,
      event_key: 'user_welcome',
      name_fa: 'خوش‌آمدگویی ثبت‌نام کاربر',
      channel: 'sms',
      subject_fa: 'خوش آمدید به پرتال فنی پارس پولاد آقایی',
      body_html: '<p>حساب کاربری شما در سامانه پارس پولاد آقایی فعال گردید. هم‌اکنون می‌توانید به اسناد و کاتالوگ‌های فنی دسترسی داشته باشید.</p>',
      sms_text: 'پارس پولاد آقایی: حساب کاربری شما فعال شد.',
      is_active: true,
    },
  ];

  const media: DatabaseSchema['media'] = [
    { id: 1, name: 'لوگو اصلی شرکت', url: '/storage/logos/logo-main.png', mime_type: 'image/png', extension: 'png', size_bytes: 30177, folder: 'logos', requires_auth: false, created_at: now },
    { id: 2, name: 'تصویر دکل حفاری هیرو', url: '/storage/hero/hero-rig.jpg', mime_type: 'image/jpeg', extension: 'jpg', size_bytes: 635089, folder: 'hero', requires_auth: false, created_at: now },
    { id: 3, name: 'تجهیزات سرچاهی API 6A', url: '/storage/products/wellhead-api6a.png', mime_type: 'image/png', extension: 'png', size_bytes: 216078, folder: 'products', requires_auth: false, created_at: now },
    { id: 4, name: 'لاینر هنگر چرخشی', url: '/storage/products/rotating-hanger.webp', mime_type: 'image/webp', extension: 'webp', size_bytes: 212370, folder: 'products', requires_auth: false, created_at: now },
    { id: 5, name: 'گواهی تست آتش API 6FA', url: '/storage/documents/api-6fa-fire-test.pdf', mime_type: 'application/pdf', extension: 'pdf', size_bytes: 475535, folder: 'documents', requires_auth: false, created_at: now },
    { id: 6, name: 'گواهینامه دانش‌بنیان', url: '/storage/documents/danesh-bonyan-cert.pdf', mime_type: 'application/pdf', extension: 'pdf', size_bytes: 80459, folder: 'documents', requires_auth: false, created_at: now },
    { id: 7, name: 'لیست پروژه‌های سرچاهی پایان یافته', url: '/storage/documents/wellhead-completed-projects.pdf', mime_type: 'application/pdf', extension: 'pdf', size_bytes: 651005, folder: 'documents', requires_auth: false, created_at: now },
    { id: 8, name: 'لیست تجهیزات کنترل کیفیت', url: '/storage/documents/qc-equipment-list.pdf', mime_type: 'application/pdf', extension: 'pdf', size_bytes: 469145, folder: 'documents', requires_auth: true, created_at: now },
    { id: 9, name: 'ویدیو عملیات نفت و گاز', url: '/storage/videos/oil-gas-1.mp4', mime_type: 'video/mp4', extension: 'mp4', size_bytes: 3713156, folder: 'videos', requires_auth: false, created_at: now },
  ];

  const activity_logs: DatabaseSchema['activity_logs'] = [
    {
      id: 1,
      user_name: 'پرویز آقایی (سوپر ادمین)',
      user_email: 'admin@parspooladaghaei.ir',
      action: 'system.bootstrap',
      subject_type: 'Database',
      subject_label: 'راه‌اندازی اولیه پایگاه داده و ایجاد سوپر ادمین',
      ip_address: '127.0.0.1',
      created_at: now,
    },
  ];

  return {
    sliders,
    departments,
    team_members,
    partners,
    articles,
    pages,
    messages,
    notifications,
    notification_templates,
    media,
    activity_logs,
  };
}
