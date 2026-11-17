<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="theme-color" content="#f4f7fb">
    <title>سرویس موقتاً در دسترس نیست</title>
    <style>
        :root {
            color-scheme: light;
            font-family: Tahoma, "Segoe UI", sans-serif;
            font-synthesis: none;
            text-rendering: optimizeLegibility;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            background: #f4f7fb;
            color: #172033;
        }

        * { box-sizing: border-box; }

        body {
            display: grid;
            min-height: 100vh;
            margin: 0;
            padding: 28px;
            place-items: center;
            background:
                radial-gradient(ellipse at 12% 12%, rgba(59, 130, 246, .10), transparent 34%),
                radial-gradient(ellipse at 88% 90%, rgba(14, 165, 233, .09), transparent 32%),
                #f4f7fb;
        }

        .card {
            width: min(100%, 560px);
            padding: clamp(30px, 7vw, 58px);
            border: 1px solid rgba(226, 232, 240, .9);
            border-radius: 28px;
            background: rgba(255, 255, 255, .94);
            box-shadow: 0 28px 80px rgba(30, 55, 90, .12), 0 4px 14px rgba(30, 55, 90, .04);
            text-align: center;
            animation: appear .5s ease-out both;
        }

        .icon {
            display: grid;
            width: 88px;
            height: 88px;
            margin: 0 auto 26px;
            place-items: center;
            border: 1px solid #dbeafe;
            border-radius: 26px;
            background: linear-gradient(145deg, #eff6ff, #f8fbff);
            color: #2563eb;
        }

        .status {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 16px;
            padding: 7px 12px;
            border: 1px solid #e2e8f0;
            border-radius: 999px;
            background: #f8fafc;
            color: #64748b;
            font-size: 12px;
            font-weight: 700;
        }

        .status::before {
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background: #f59e0b;
            content: "";
        }

        h1 {
            margin: 0;
            color: #172033;
            font-size: clamp(23px, 5vw, 30px);
            font-weight: 800;
            line-height: 1.7;
        }

        p {
            margin: 14px 0 0;
            color: #64748b;
            font-size: 14px;
            line-height: 2.1;
        }

        .actions {
            display: flex;
            justify-content: center;
            margin-top: 30px;
        }

        button {
            display: inline-flex;
            min-height: 48px;
            align-items: center;
            justify-content: center;
            gap: 9px;
            padding: 0 22px;
            border: 0;
            border-radius: 14px;
            background: #1d4ed8;
            box-shadow: 0 8px 18px rgba(29, 78, 216, .2);
            color: #fff;
            cursor: pointer;
            font: inherit;
            font-size: 14px;
            font-weight: 700;
            transition: background .2s ease, transform .2s ease, box-shadow .2s ease;
        }

        button:hover {
            transform: translateY(-1px);
            background: #1e40af;
            box-shadow: 0 11px 22px rgba(29, 78, 216, .26);
        }

        button:focus-visible {
            outline: 3px solid rgba(59, 130, 246, .35);
            outline-offset: 3px;
        }

        .footnote {
            margin-top: 28px;
            color: #94a3b8;
            font-size: 11px;
        }

        @keyframes appear {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        @media (prefers-reduced-motion: reduce) {
            *, *::before, *::after {
                animation-duration: .01ms !important;
                scroll-behavior: auto !important;
                transition-duration: .01ms !important;
            }
        }
    </style>
</head>
<body>
    <main class="card" role="main">
        <div class="icon" aria-hidden="true">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <ellipse cx="22" cy="12" rx="12" ry="5" stroke="currentColor" stroke-width="2.2"/>
                <path d="M10 12v8c0 2.8 5.4 5 12 5 1.1 0 2.2-.1 3.2-.2M34 12v5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
                <path d="M10 20v8c0 2.8 5.4 5 12 5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
                <circle cx="34" cy="29" r="9" fill="#fff" stroke="#f59e0b" stroke-width="2.2"/>
                <path d="M34 24v6M34 34h.01" stroke="#d97706" stroke-width="2.5" stroke-linecap="round"/>
            </svg>
        </div>
        <div class="status">خطای موقت سرویس · ۵۰۳</div>
        <h1>سرویس موقتاً در دسترس نیست</h1>
        <p>
            در حال حاضر ارتباط با پایگاه داده برقرار نمی‌شود.
            لطفاً کمی بعد دوباره تلاش کنید؛ اطلاعات شما محفوظ است.
        </p>
        <div class="actions">
            <button type="button" onclick="window.location.reload()">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M20 7v5h-5M4 17v-5h5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M5.6 9a7 7 0 0 1 11.6-2L20 12M4 12l2.8 5a7 7 0 0 0 11.6-2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                تلاش دوباره
            </button>
        </div>
        <div class="footnote">با برطرف شدن اختلال، سامانه به‌صورت عادی در دسترس خواهد بود.</div>
    </main>
</body>
</html>
