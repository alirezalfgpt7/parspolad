// 1. گرفتن کانواس و تنظیم ابعاد آن
const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// 2. تنظیمات ذرات
const particles = [];
const particleCount = 300; // تعداد ذرات (بیشتر از این، سنگین می‌شود)

// 3. تنظیمات متن
const text = "Welcome";
const fontSize = 100;
const fontFamily = "Montserrat";

// 4. تابع برای رسم ذرات روی متن
function drawTextParticles() {
    // تنظیم فونت و رسم متن روی یک کانواس مخفی
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    
    tempCtx.font = `${fontSize}px ${fontFamily}`;
    tempCtx.fillStyle = "#000";
    tempCtx.textAlign = "center";
    tempCtx.textBaseline = "middle";
    tempCtx.fillText(text, canvas.width / 2, canvas.height / 2);

    // گرفتن داده‌های پیکسلی متن
    const textCoordinates = tempCtx.getImageData(0, 0, canvas.width, canvas.height).data;

    // 5. ساخت ذرات بر اساس پیکسل‌های متن
    for (let y = 0; y < canvas.height; y += 4) {
        for (let x = 0; x < canvas.width; x += 4) {
            const index = (y * canvas.width + x) * 4;
            const alpha = textCoordinates[index + 3];
            
            // اگر پیکسل بخشی از متن بود (آلفا بزرگتر از 0)
            if (alpha > 128) {
                particles.push({
                    x: x,
                    y: y,
                    size: Math.random() * 2 + 1,
                    color: `rgba(0, 210, 255, ${Math.random()})`, // رنگ فیروزه‌ای
                    originalX: x,
                    originalY: y,
                    speedX: 0,
                    speedY: 0,
                    isHovered: false
                });
            }
        }
    }
}

// 6. رسم ذرات
function drawParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    particles.forEach(particle => {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();
    });
}

// 7. انیمیشن (تعامل با ماوس)
let mouse = { x: null, y: null, radius: 100 };

window.addEventListener('mousemove', (e) => {
    mouse.x = e.x;
    mouse.y = e.y;
});

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    particles.forEach(particle => {
        // محاسبه فاصله ذره تا ماوس
        let dx = mouse.x - particle.x;
        let dy = mouse.y - particle.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        
        // اگر ماوس نزدیک بود، ذره فرار می‌کند
        if (distance < mouse.radius) {
            let forceDirectionX = dx / distance;
            let forceDirectionY = dy / distance;
            let force = (mouse.radius - distance) / mouse.radius;
            
            particle.x -= forceDirectionX * force * 10;
            particle.y -= forceDirectionY * force * 10;
        } else {
            // بازگشت به موقعیت اصلی
            if (particle.x !== particle.originalX) {
                particle.x += (particle.originalX - particle.x) * 0.05;
            }
            if (particle.y !== particle.originalY) {
                particle.y += (particle.originalY - particle.y) * 0.05;
            }
        }
        
        // رسم ذره
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();
    });
    
    requestAnimationFrame(animateParticles);
}

// اجرای اولیه
drawTextParticles();
animateParticles();

// تنظیم مجدد ابعاد کانواس با تغییر اندازه صفحه
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    particles.length = 0; // پاک کردن ذرات قبلی
    drawTextParticles(); // ساخت ذرات جدید
});