// =========================================
// 1. بخش کپچا
// =========================================
(function() {
    const fonts = ["cursive", "sans-serif", "serif", "monospace"];
    let captchaValue = "";

    function generateCaptcha() {
        let value = btoa(Math.random() * 1000000000);
        value = value.substr(0, 5 + Math.random() * 5);
        captchaValue = value;
    }

    function setCaptcha() {
        let html = captchaValue.split("").map((char) => {
            const rotate = -20 + Math.trunc(Math.random() * 30);
            const font = Math.trunc(Math.random() * fonts.length);
            return `<span style="transform: rotate(${rotate}deg); font-family: ${fonts[font]};">${char}</span>`;
        }).join("");
        
        // استفاده از ID درست برای پیش‌نمایش کپچا
        document.getElementById("captcha-preview").innerHTML = html;
    }

    // اجرای اولیه کپچا
    generateCaptcha();
    setCaptcha();

    // رویداد رفرش کپچا
    document.getElementById('captcha-refresh').addEventListener('click', function(e) {
        e.preventDefault();
        generateCaptcha();
        setCaptcha();
    });

    // بررسی کپچا هنگام کلیک روی دکمه لاگین
    document.getElementById('login-btn').addEventListener('click', function(e) {
        e.preventDefault();
        let inputCaptchaValue = document.getElementById('captcha-input').value;
        
        if (inputCaptchaValue === captchaValue) {
            swal('', 'Logging In!', 'success');
        } else {
            swal('Invalid captcha', 'Please try again!', 'error');
        }
    });
})();

// =========================================
// 2. بخش چرخش کارت
// =========================================
const flipContainer = document.getElementById('flip-container');
const toSignup = document.getElementById('to-signup');
const toLogin = document.getElementById('to-login');

// چرخش به فرم ثبت‌نام
toSignup.addEventListener('click', (e) => {
    e.preventDefault();
    flipContainer.classList.add('flipped');
});

// چرخش به فرم لاگین
toLogin.addEventListener('click', (e) => {
    e.preventDefault();
    flipContainer.classList.remove('flipped');
});

// =========================================
// 3. اعتبارسنجی فرم ثبت‌نام
// =========================================
document.getElementById('signup-btn').addEventListener('click', (e) => {
    e.preventDefault();
    
    const pass = document.getElementById('new-password').value;
    const confirmPass = document.getElementById('confirm-password').value;
    
    if(pass === "" || confirmPass === "") {
        swal('Error', 'Please fill all fields!', 'error');
    } else if(pass !== confirmPass) {
        swal('Error', 'Passwords do not match!', 'error');
    } else {
        swal('Success', 'Account created successfully!', 'success');
    }
});