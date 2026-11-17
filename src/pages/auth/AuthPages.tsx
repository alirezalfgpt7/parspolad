import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiRequest } from '../../services/api.ts';
import { useAppStore } from '../../store/useAppStore.ts';
import type { User } from '../../types/index.ts';
import { DEFAULT_LOGIN_SETTINGS } from '../../utils/brandingDefaults.ts';
import { BrandLogo } from '../../components/common/BrandLogo.tsx';
import { SeoHead } from '../../components/common/SeoHead.tsx';
import { SelfHostedCaptcha } from '../../components/forms/SelfHostedCaptcha.tsx';
import { PublicHoneypotField } from '../../components/forms/PublicHoneypotField.tsx';
import { InlineLoader } from '../../components/common/InlineLoader.tsx';
import { DynamicLucideIcon } from '../../components/ui/LucideIconMap.tsx';
import {
  AnimatedBackground,
  CssSlideshowEffect,
  DecorativeCube,
  EffectAction,
  EffectText,
  FlipAuthCardEffect,
  GlassPanelEffect,
} from '../../components/effects/index.ts';

const registerSchema = z.object({
  name: z.string().min(2, 'نام و نام خانوادگی را وارد کنید'),
  email: z.string().email('ایمیل معتبر وارد کنید'),
  phone: z.string().optional(),
  password: z.string().min(8, 'رمز عبور باید حداقل ۸ کاراکتر باشد'),
  captcha: z.string().min(1, 'کد امنیتی را وارد کنید'),
  website: z.string().optional(),
});
type RegisterFormValues = z.infer<typeof registerSchema>;

const loginSchema = z.object({
  email: z.string().email('ایمیل معتبر وارد کنید'),
  password: z.string().min(1, 'رمز عبور الزامی است'),
  captcha: z.string().min(1, 'کد امنیتی را وارد کنید'),
  website: z.string().optional(),
});
type LoginFormValues = z.infer<typeof loginSchema>;

const twoFactorSchema = z.string().regex(/^\d{6}$/, 'کد تایید باید ۶ رقم باشد.');

const FALLBACK_BG_SLIDES = [
  '/images/hero/slide-1.jpg',
  '/images/hero/slide-2.jpg',
  '/images/hero/slide-3.jpg',
];

const AuthShellPage: React.FC<{ initialMode: 'login' | 'register' }> = ({ initialMode }) => {
  const navigate = useNavigate();
  const { setAuth, addToast, bootstrap, previewLogin, language } = useAppStore();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [challengeToken, setChallengeToken] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [demoHint, setDemoHint] = useState('');
  const [loginCaptchaKey, setLoginCaptchaKey] = useState('');
  const [loginCaptchaRefresh, setLoginCaptchaRefresh] = useState(0);
  const [regCaptchaKey, setRegCaptchaKey] = useState('');
  const [regCaptchaRefresh, setRegCaptchaRefresh] = useState(0);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  const loginCfg = {
    ...DEFAULT_LOGIN_SETTINGS,
    ...(bootstrap?.login || {}),
    ...(previewLogin || {}),
  };

  const t = (faVal?: string, enVal?: string) => (language === 'fa' ? faVal : enVal) || faVal || '';
  const companyName =
    (language === 'fa' ? bootstrap?.company?.name_fa : bootstrap?.company?.name_en) ||
    (language === 'fa' ? 'پارس پولاد آقایی' : 'Pars Poolad Aghaee');
  const companySlogan =
    (language === 'fa' ? bootstrap?.company?.slogan_fa : bootstrap?.company?.slogan_en) ||
    'مهندسی دقیق، ساخت پایدار';

  const heroSlideImages =
    bootstrap?.sliders
      ?.flatMap((s) => s.slides)
      .map((s) => s.desktop_media)
      .filter((u): u is string => Boolean(u) && !/\.(mp4|webm)(\?.*)?$/i.test(u))
      .slice(0, 4) || [];
  const bgSlides = heroSlideImages.length > 0 ? heroSlideImages : FALLBACK_BG_SLIDES;

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', captcha: '', website: '' },
  });

  const regForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', phone: '', password: '', captcha: '', website: '' },
  });

  const refreshLoginCaptcha = () => {
    setLoginCaptchaKey('');
    setLoginCaptchaRefresh((token) => token + 1);
    loginForm.setValue('captcha', '', { shouldValidate: false });
  };

  const refreshRegCaptcha = () => {
    setRegCaptchaKey('');
    setRegCaptchaRefresh((token) => token + 1);
    regForm.setValue('captcha', '', { shouldValidate: false });
  };

  const handleLogin = async (values: LoginFormValues) => {
    if (!loginCaptchaKey) {
      addToast('error', 'تصویر کد امنیتی هنوز آماده نشده است.');
      return;
    }

    if (challengeToken) {
      const parsedCode = twoFactorSchema.safeParse(twoFactorCode);
      if (!parsedCode.success) {
        addToast('error', parsedCode.error.issues[0]?.message ?? 'کد تایید معتبر نیست.');
        return;
      }
    }

    try {
      const payload = {
        ...values,
        captcha_key: loginCaptchaKey,
        ...(challengeToken ? { two_factor_code: twoFactorCode } : {}),
      };
      const res = await apiRequest<{
        token?: string;
        user?: User;
        requires_2fa?: boolean;
        challenge_token?: string;
        demo_hint?: string;
      }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (res.requires_2fa) {
        setChallengeToken(res.challenge_token || 'pending');
        setDemoHint(res.demo_hint || '');
        refreshLoginCaptcha();
        addToast('info', 'لطفاً کد تایید دو مرحله‌ای را وارد نمایید.');
        return;
      }

      if (res.token && res.user) {
        setAuth(res.user, res.token);
        addToast('success', `خوش آمدید، ${res.user.name}`);
        navigate(res.user.role === 'user' ? '/admin/profile' : '/admin');
      }
    } catch (err) {
      refreshLoginCaptcha();
      addToast('error', err instanceof Error ? err.message : 'ورود ناموفق بود');
    }
  };

  const handleRegister = async (data: RegisterFormValues) => {
    if (!regCaptchaKey) {
      addToast('error', 'تصویر کد امنیتی هنوز آماده نشده است.');
      return;
    }
    try {
      const res = await apiRequest<{ token: string; user: User }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ ...data, captcha_key: regCaptchaKey }),
      });
      setAuth(res.user, res.token);
      addToast('success', 'ثبت‌نام شما با موفقیت انجام شد.');
      regForm.reset();
      refreshRegCaptcha();
      navigate('/admin/profile');
    } catch (err) {
      refreshRegCaptcha();
      addToast('error', err instanceof Error ? err.message : 'خطا در ثبت‌نام');
    }
  };

  const switchMode = (target: 'login' | 'register') => {
    setMode(target);
    if (!loginCfg.enable_3d_flip) {
      navigate(target === 'login' ? '/login' : '/register');
    }
  };

  const cardCustomStyle: React.CSSProperties = {
    backgroundColor: loginCfg.card_bg_color || undefined,
    color: loginCfg.text_color || '#F8FAFC',
  };
  const inputCustomStyle: React.CSSProperties = {
    backgroundColor: loginCfg.input_bg_color || undefined,
    color: loginCfg.text_color || '#F8FAFC',
  };
  const accentStyle: React.CSSProperties = {
    backgroundColor: loginCfg.accent_color || 'var(--theme-primary)',
  };

  const loginFace = (
    <GlassPanelEffect
      style={cardCustomStyle}
      className="login-glass-panel relative w-full rounded-2xl p-6 sm:p-8"
    >
      <div className="mb-6 flex items-center justify-between gap-4">
        <Link to="/" aria-label={companyName} className="flex min-w-0 items-center gap-3">
          <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl">
            <BrandLogo placement="about" alt={companyName} className="h-full w-full" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-extrabold">{companyName}</p>
            <p className="truncate text-[10px] opacity-75">{companySlogan}</p>
          </div>
        </Link>
        {loginCfg.show_decorative_cube && (
          <DecorativeCube size="sm" className="h-10 w-10 shrink-0 rounded-xl border border-white/10 bg-white/5" />
        )}
      </div>

      <div className="auth-security-badge">
        <DynamicLucideIcon name={loginCfg.badge_icon} fallback="ShieldCheck" className="h-3.5 w-3.5" />
        <span>{t(loginCfg.badge_text_fa, loginCfg.badge_text_en)}</span>
      </div>

      <h1 className="text-xl font-bold">
        <EffectText inverse>
          {challengeToken
            ? t(loginCfg.two_factor_title_fa, loginCfg.two_factor_title_en)
            : t(loginCfg.title_fa, loginCfg.title_en)}
        </EffectText>
      </h1>
      <p className="mt-1 text-xs opacity-75">
        {challengeToken
          ? demoHint || t(loginCfg.two_factor_hint_fa, loginCfg.two_factor_hint_en)
          : t(loginCfg.subtitle_fa, loginCfg.subtitle_en)}
      </p>

      <form onSubmit={loginForm.handleSubmit(handleLogin)} className="auth-glass-form mt-6 space-y-4">
        {!challengeToken ? (
          <>
            <PublicHoneypotField registration={loginForm.register('website')} />
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs opacity-85">
                <DynamicLucideIcon name={loginCfg.email_icon} fallback="Mail" className="h-3.5 w-3.5" />
                <span>{t(loginCfg.email_label_fa, loginCfg.email_label_en)}</span>
              </label>
              <input
                type="email"
                dir="ltr"
                style={inputCustomStyle}
                placeholder={t(loginCfg.email_placeholder_fa, loginCfg.email_placeholder_en)}
                {...loginForm.register('email')}
                className="auth-glass-input w-full rounded-lg px-3.5 py-2.5 text-sm"
              />
              {loginForm.formState.errors.email && (
                <p role="alert" className="mt-1 text-xs text-red-400">
                  {loginForm.formState.errors.email.message}
                </p>
              )}
            </div>
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs opacity-85">
                <DynamicLucideIcon name={loginCfg.password_icon} fallback="Lock" className="h-3.5 w-3.5" />
                <span>{t(loginCfg.password_label_fa, loginCfg.password_label_en)}</span>
              </label>
              <input
                type="password"
                dir="ltr"
                style={inputCustomStyle}
                placeholder={t(loginCfg.password_placeholder_fa, loginCfg.password_placeholder_en)}
                {...loginForm.register('password')}
                className="auth-glass-input w-full rounded-lg px-3.5 py-2.5 text-sm"
              />
              {loginForm.formState.errors.password && (
                <p role="alert" className="mt-1 text-xs text-red-400">
                  {loginForm.formState.errors.password.message}
                </p>
              )}
            </div>
          </>
        ) : (
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs opacity-85">
              <DynamicLucideIcon name={loginCfg.two_factor_icon} fallback="ShieldCheck" className="h-4 w-4 text-amber-400" />
              <span>{t(loginCfg.two_factor_title_fa, loginCfg.two_factor_title_en)}</span>
            </label>
            <input
              type="text"
              required
              dir="ltr"
              style={inputCustomStyle}
              value={twoFactorCode}
              onChange={(e) => setTwoFactorCode(e.target.value)}
              placeholder="482910"
              className="auth-glass-input w-full rounded-lg px-3.5 py-2.5 text-center font-mono text-lg tracking-widest"
            />
          </div>
        )}

        <SelfHostedCaptcha
          registration={loginForm.register('captcha')}
          refreshToken={loginCaptchaRefresh}
          onKeyChange={setLoginCaptchaKey}
          onRefresh={refreshLoginCaptcha}
          error={loginForm.formState.errors.captcha?.message}
          appearance="glass"
          mode="mixed"
        />

        <EffectAction
          type="submit"
          disabled={loginForm.formState.isSubmitting || (!challengeToken && !loginCaptchaKey)}
          style={accentStyle}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {loginForm.formState.isSubmitting ? (
            <InlineLoader label={language === 'fa' ? 'در حال بررسی...' : 'Signing in...'} className="justify-center" />
          ) : (
            <>
              <DynamicLucideIcon name={loginCfg.submit_icon} fallback="LogIn" className="h-4 w-4" />
              <span>
                {challengeToken
                  ? t(loginCfg.two_factor_submit_fa, loginCfg.two_factor_submit_en)
                  : t(loginCfg.submit_text_fa, loginCfg.submit_text_en)}
              </span>
            </>
          )}
        </EffectAction>
      </form>

      <div className="mt-5 flex items-center justify-between border-t border-white/15 pt-4 text-xs opacity-80">
        <button
          type="button"
          onClick={() => switchMode('register')}
          className="inline-flex items-center gap-1.5 hover:opacity-100 hover:underline"
        >
          <DynamicLucideIcon name={loginCfg.register_icon} fallback="UserPlus" className="h-3.5 w-3.5" />
          <span>{t(loginCfg.register_cta_fa, loginCfg.register_cta_en)}</span>
        </button>
        <Link to="/" className="inline-flex items-center gap-1 hover:opacity-100 hover:underline">
          <DynamicLucideIcon name={loginCfg.back_icon} fallback="ArrowRight" className="h-3.5 w-3.5" />
          <span>{t(loginCfg.back_home_fa, loginCfg.back_home_en)}</span>
        </Link>
      </div>
    </GlassPanelEffect>
  );

  const registerFace = (
    <GlassPanelEffect
      style={cardCustomStyle}
      className="login-glass-panel relative w-full rounded-2xl p-6 sm:p-8"
    >
      <div className="mb-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-white/15 bg-white/90 p-1 shadow-sm">
            <BrandLogo placement="register" alt={companyName} className="h-full w-full" />
          </div>
          <div>
            <h2 className="text-base font-extrabold">{t(loginCfg.register_title_fa, loginCfg.register_title_en)}</h2>
            <p className="text-[11px] opacity-75">{t(loginCfg.register_subtitle_fa, loginCfg.register_subtitle_en)}</p>
          </div>
        </div>
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
          <DynamicLucideIcon name={loginCfg.register_icon} fallback="UserPlus" className="h-4 w-4" />
        </span>
      </div>

      <form onSubmit={regForm.handleSubmit(handleRegister)} className="auth-glass-form space-y-3.5">
        <PublicHoneypotField registration={regForm.register('website')} />
        <div>
          <label className="mb-1 block text-xs opacity-85">
            {t(loginCfg.register_name_label_fa, loginCfg.register_name_label_en)}
          </label>
          <input
            {...regForm.register('name')}
            style={inputCustomStyle}
            className="auth-glass-input w-full rounded-lg px-3 py-2 text-sm"
          />
          {regForm.formState.errors.name && (
            <p className="mt-1 text-xs text-red-400">{regForm.formState.errors.name.message}</p>
          )}
        </div>
        <div>
          <label className="mb-1 flex items-center gap-1.5 text-xs opacity-85">
            <DynamicLucideIcon name={loginCfg.email_icon} fallback="Mail" className="h-3.5 w-3.5" />
            <span>{t(loginCfg.email_label_fa, loginCfg.email_label_en)}</span>
          </label>
          <input
            {...regForm.register('email')}
            type="email"
            dir="ltr"
            style={inputCustomStyle}
            placeholder={t(loginCfg.email_placeholder_fa, loginCfg.email_placeholder_en)}
            className="auth-glass-input w-full rounded-lg px-3 py-2 text-sm"
          />
          {regForm.formState.errors.email && (
            <p className="mt-1 text-xs text-red-400">{regForm.formState.errors.email.message}</p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-xs opacity-85">
            {t(loginCfg.register_phone_label_fa, loginCfg.register_phone_label_en)}
          </label>
          <input
            {...regForm.register('phone')}
            dir="ltr"
            style={inputCustomStyle}
            className="auth-glass-input w-full rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 flex items-center gap-1.5 text-xs opacity-85">
            <DynamicLucideIcon name={loginCfg.password_icon} fallback="Lock" className="h-3.5 w-3.5" />
            <span>{t(loginCfg.password_label_fa, loginCfg.password_label_en)}</span>
          </label>
          <input
            {...regForm.register('password')}
            type="password"
            dir="ltr"
            style={inputCustomStyle}
            className="auth-glass-input w-full rounded-lg px-3 py-2 text-sm"
          />
          {regForm.formState.errors.password && (
            <p className="mt-1 text-xs text-red-400">{regForm.formState.errors.password.message}</p>
          )}
        </div>
        <SelfHostedCaptcha
          registration={regForm.register('captcha')}
          refreshToken={regCaptchaRefresh}
          onKeyChange={setRegCaptchaKey}
          onRefresh={refreshRegCaptcha}
          error={regForm.formState.errors.captcha?.message}
          appearance="glass"
        />
        <EffectAction
          type="submit"
          disabled={regForm.formState.isSubmitting || !regCaptchaKey}
          style={accentStyle}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold text-white"
        >
          {regForm.formState.isSubmitting ? (
            <InlineLoader label={language === 'fa' ? 'در حال ثبت...' : 'Submitting...'} className="justify-center" />
          ) : (
            <>
              <DynamicLucideIcon name={loginCfg.register_icon} fallback="UserPlus" className="h-4 w-4" />
              <span>{t(loginCfg.register_submit_fa, loginCfg.register_submit_en)}</span>
            </>
          )}
        </EffectAction>
      </form>

      <div className="mt-5 flex items-center justify-between border-t border-white/15 pt-4 text-xs opacity-80">
        <button
          type="button"
          onClick={() => switchMode('login')}
          className="inline-flex items-center gap-1.5 hover:opacity-100 hover:underline"
        >
          <DynamicLucideIcon name={loginCfg.submit_icon} fallback="LogIn" className="h-3.5 w-3.5" />
          <span>{t(loginCfg.login_cta_fa, loginCfg.login_cta_en)}</span>
        </button>
        <Link to="/" className="inline-flex items-center gap-1 hover:opacity-100 hover:underline">
          <DynamicLucideIcon name={loginCfg.back_icon} fallback="ArrowRight" className="h-3.5 w-3.5" />
          <span>{t(loginCfg.back_home_fa, loginCfg.back_home_en)}</span>
        </Link>
      </div>
    </GlassPanelEffect>
  );

  return (
    <div
      className="auth-shell relative isolate flex min-h-screen items-center justify-center overflow-hidden p-4"
      style={{
        backgroundColor: loginCfg.backdrop_color || '#020617',
        color: loginCfg.text_color || '#F8FAFC',
      }}
    >
      <SeoHead
        title={mode === 'login' ? t(loginCfg.title_fa, loginCfg.title_en) : t(loginCfg.register_title_fa, loginCfg.register_title_en)}
      />

      {loginCfg.enable_bg_slideshow && bgSlides.length > 0 && (
        <div className="pointer-events-none absolute inset-0 opacity-20">
          <CssSlideshowEffect images={bgSlides} intervalPerSlideSeconds={6} />
        </div>
      )}
      <AnimatedBackground particles={loginCfg.enable_particles} />

      <div className="relative z-10 w-full max-w-lg">
        {loginCfg.enable_3d_flip ? (
          <FlipAuthCardEffect
            flipped={mode === 'register'}
            front={loginFace}
            back={registerFace}
          />
        ) : mode === 'login' ? (
          loginFace
        ) : (
          registerFace
        )}
      </div>
    </div>
  );
};

export const LoginPage: React.FC = () => <AuthShellPage initialMode="login" />;
export const RegisterPage: React.FC = () => <AuthShellPage initialMode="register" />;
