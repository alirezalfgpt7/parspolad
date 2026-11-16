# پورتال شرکتی و سامانه مدیریت یکپارچه پارس پولاد آقایی
**Pars Poolad Aghaee Knowledge-Based Co. — Wellhead & Downhole Engineering Portal**

وب‌سایت رسمی، کاتالوگ فنی تجهیزات سرچاهی و درون‌چاهی، مدیریت پروژه‌ها/قراردادها/گواهینامه‌ها و پنل مدیریت تم‌محور شرکت دانش‌بنیان **پارس پولاد آقایی**.

---

## ویژگی‌های کلیدی معماری
- **کاملاً بدون CDN و بدون هوش مصنوعی/چت‌بات:** تمامی فونت‌ها (`@fontsource/vazirmatn`)، آیکون‌ها (`lucide-react`)، نقشه‌ها (`leaflet`)، اسلایدر (`swiper`) و انیمیشن‌ها (`motion`, `aos`) به‌صورت محلی نصب و باندل می‌شوند.
- **موتور تم داینامیک (CSS Variables):** تم پیش‌فرض «قرمز صنعتی (#B91C1C)»، تم‌های آماده قابل انتخاب، تم مستقل صفحه نخست، پیش‌نمایش زنده و تغییر حالت Dark/Light.
- **اسلایدر پیشرفته Hero:** مدیریت ترتیب Drag & Drop، افکت‌های Ken Burns / Parallax / Zoom / Fade / Slide، انیمیشن متن، ذرات و پشتیبانی از ویدیو MP4 و تصویر مجزا برای دسکتاپ و موبایل.
- **SearchableSelect سراسری:** تمامی منوهای کشویی در بخش عمومی و پنل ادمین مجهز به فیلد جستجو در ردیف اول هستند.
- **ساختار منابع:** تمامی فایل‌های اولیه شرکت در پوشه `منابع سایت/` سازمان‌دهی شده‌اند.

---

## راه‌اندازی محیط فرانت‌اند + سرور اجرای سریع (Port 3000)

```bash
npm install
npm run dev
```

- آدرس سایت: `http://localhost:3000`
- آدرس پنل مدیریت: `http://localhost:3000/admin`
- مستندات OpenAPI: `backend/docs/openapi.yaml`

---

## راه‌اندازی بک‌اند Laravel 11+ (PHP 8.2+)

پروژه لاراول در پوشه `backend/` قرار دارد. می‌توانید دستور `composer install` را هم مستقیماً از ریشه پروژه (`D:\parspoolad`) اجرا کنید (به‌صورت خودکار به `backend` هدایت می‌شود) و هم وارد پوشه `backend` شوید:

```bash
cd backend
cp .env.example .env
composer install
php artisan key:generate
php artisan storage:link
php artisan migrate --seed
php artisan test
php artisan serve
```

> یا از ریشه پروژه:
> `composer install` و سپس `php backend/artisan portal:bootstrap` و `php backend/artisan serve`.

---

## اطلاعات ورود پیش‌فرض مدیر ارشد (Super Admin Bootstrap)

هنگام اجرای اولیه (دیتابیس خالی)، کاربر مدیر ارشد به‌صورت خودکار ایجاد می‌شود (قابل تغییر از `.env`):

- **ایمیل:** `admin@parspooladaghaei.ir`
- **رمز عبور:** `ParsPolad@1404`
- **مسیر ورود:** `/login` (و پنل ادمین در `/admin`)

> پس از اولین ورود، رمز عبور را از بخش پروفایل یا مدیریت کاربران تغییر دهید و در صورت نیاز احراز هویت دوعاملی (2FA) را فعال کنید.
