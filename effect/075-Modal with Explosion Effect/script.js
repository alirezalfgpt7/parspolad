const modal = document.getElementById('modal');
const openBtn = document.getElementById('openBtn');
const closeBtn = document.getElementById('closeBtn');
const okayBtn = document.getElementById('okayBtn');

// باز کردن مودال
openBtn.addEventListener('click', () => {
    modal.classList.add('show');
});

// بستن مودال (با دکمه X)
closeBtn.addEventListener('click', () => {
    modal.classList.remove('show');
});

// بستن مودال (با دکمه Okay)
okayBtn.addEventListener('click', () => {
    modal.classList.remove('show');
});