// گرفتن المان‌ها
const textElement = document.getElementById('3dText');
const buttons = document.querySelectorAll('.controls button');

// اضافه کردن رویداد کلیک به همه دکمه‌ها
buttons.forEach(button => {
    button.addEventListener('click', () => {
        
        // 1. حذف کلاس active از همه دکمه‌ها
        buttons.forEach(btn => btn.classList.remove('active'));
        
        // 2. اضافه کردن کلاس active به دکمه کلیک شده
        button.classList.add('active');
        
        // 3. گرفتن نام انیمیشن از ویژگی data-anim
        const animationName = button.getAttribute('data-anim');
        
        // 4. تغییر ویژگی animation در CSS متن
        // (مدت زمان 6 ثانیه، حرکت یکنواخت و تکرار بی‌نهایت)
        textElement.style.animation = `${animationName} 6s linear infinite`;
    });
});