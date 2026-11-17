// متن پیام ما
const originalTitle = "👋 Welcome to My Website | 🚀 (6) New Messages | Check it out! ";

// 1. طول پنجره‌ای که می‌خواهیم نمایش دهیم (تعداد کاراکترها)
const windowLength = 30;

// 2. برای جلوگیری از پرش، رشته را چند بار تکرار می‌کنیم تا یک نوار بی‌پایان بسازیم
const repeatingText = originalTitle.repeat(5);
let startIndex = 0;

// 3. تنظیم تایمر برای حرکت
const titleInterval = setInterval(() => {
    
    // 4. از ایندکس فعلی، به اندازه طول پنجره کاراکتر برمی‌داریم
    let currentText = repeatingText.substring(startIndex, startIndex + windowLength);
    
    // 5. عنوان را تنظیم می‌کنیم
    document.title = currentText;
    
    // 6. ایندکس را یکی جلو می‌بریم
    startIndex++;
    
    // 7. اگر به انتهای رشته تکرار شده رسیدیم، به اول برمی‌گردیم
    if (startIndex > repeatingText.length - windowLength) {
        startIndex = 0;
    }
    
}, 150); // سرعت حرکت

// 8. وقتی کاربر به تب برمی‌گردد، حرکت متوقف شود
document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
        clearInterval(titleInterval);
        document.title = "Scrolling Title Effect";
    }
});