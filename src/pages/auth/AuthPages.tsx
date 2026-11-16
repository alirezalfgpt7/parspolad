import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, ShieldCheck, UserPlus } from 'lucide-react';
import { motion } from 'motion/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiRequest } from '../../services/api.ts';
import { ZeroBrokenImage } from '../../components/ui/ZeroBrokenImage.tsx';
import { useAppStore } from '../../store/useAppStore.ts';
import type { User } from '../../types/index.ts';
import { SeoHead } from '../../components/common/SeoHead.tsx';
import { SelfHostedCaptcha } from '../../components/forms/SelfHostedCaptcha.tsx';
import { PublicHoneypotField } from '../../components/forms/PublicHoneypotField.tsx';

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
});
type LoginFormValues = z.infer<typeof loginSchema>;
const twoFactorSchema = z.string().regex(/^\d{6}$/, 'کد تایید باید ۶ رقم باشد.');

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { setAuth, addToast } = useAppStore();
  const [challengeToken, setChallengeToken] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [demoHint, setDemoHint] = useState('');
  const {
    register,
    handleSubmit: submitLogin,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: 'admin@parspooladaghaei.ir', password: 'ParsPolad@1404' },
  });

  const handleSubmit = async (values: LoginFormValues) => {
    if (challengeToken) {
      const parsedCode = twoFactorSchema.safeParse(twoFactorCode);
      if (!parsedCode.success) {
        addToast('error', parsedCode.error.issues[0]?.message ?? 'کد تایید معتبر نیست.');
        return;
      }
    }
    try {
      const payload = challengeToken
        ? { challenge_token: challengeToken, two_factor_code: twoFactorCode }
        : values;
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

      if (res.requires_2fa && res.challenge_token) {
        setChallengeToken(res.challenge_token);
        setDemoHint(res.demo_hint || '');
        addToast('info', 'لطفاً کد تایید دو مرحله‌ای را وارد نمایید.');
        return;
      }

      if (res.token && res.user) {
        setAuth(res.user, res.token);
        addToast('success', `خوش آمدید، ${res.user.name}`);
        navigate(res.user.role === 'user' ? '/admin/profile' : '/admin');
      }
    } catch (err) {
      addToast('error', err instanceof Error ? err.message : 'ورود ناموفق بود');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
      <SeoHead title="ورود به پرتال و پنل مدیریت" />
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-7 text-white shadow-2xl"
      >
        <div className="mb-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <ZeroBrokenImage src="/storage/logos/logo-small.png" alt="PPA" className="h-9 w-9 rounded bg-white p-1" />
            <span className="text-base font-extrabold">پارس پولاد آقایی</span>
          </Link>
          <Lock className="h-5 w-5 text-(--theme-primary)" />
        </div>

        <h1 className="text-xl font-bold">
          {challengeToken ? 'احراز هویت دو مرحله‌ای (2FA)' : 'ورود به سامانه یکپارچه'}
        </h1>
        <p className="mt-1 text-xs text-slate-400">
          {challengeToken
            ? demoHint || 'کد تایید ۶ رقمی خود را وارد کنید.'
            : 'ورود سوپر ادمین، مدیران محتوا و کارفرمایان مجاز'}
        </p>

        <form onSubmit={submitLogin(handleSubmit)} className="mt-6 space-y-4">
          {!challengeToken ? (
            <>
              <div>
                <label className="mb-1.5 block text-xs text-slate-300">ایمیل سازمانی</label>
                <input
                  type="email"
                  dir="ltr"
                  {...register('email')}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm text-white focus:border-(--theme-primary) focus:outline-none"
                />
                {errors.email && <p role="alert" className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
              </div>
              <div>
                <label className="mb-1.5 block text-xs text-slate-300">رمز عبور</label>
                <input
                  type="password"
                  dir="ltr"
                  {...register('password')}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm text-white focus:border-(--theme-primary) focus:outline-none"
                />
                {errors.password && <p role="alert" className="mt-1 text-xs text-red-400">{errors.password.message}</p>}
              </div>
            </>
          ) : (
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs text-slate-300">
                <ShieldCheck className="h-4 w-4 text-amber-400" />
                <span>کد ۶ رقمی تایید دو مرحله‌ای</span>
              </label>
              <input
                type="text"
                required
                dir="ltr"
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value)}
                placeholder="482910"
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-center font-mono text-lg tracking-widest text-white focus:border-(--theme-primary) focus:outline-none"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            style={{ backgroundColor: 'var(--theme-primary)' }}
            className="w-full rounded-lg py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {isSubmitting ? 'در حال بررسی...' : challengeToken ? 'تایید و ورود' : 'ورود به حساب'}
          </button>
        </form>

        <div className="mt-5 flex items-center justify-between border-t border-slate-800 pt-4 text-xs text-slate-400">
          <Link to="/register" className="hover:text-white hover:underline">ایجاد حساب کاربری جدید</Link>
          <Link to="/" className="hover:text-white hover:underline">بازگشت به سایت</Link>
        </div>
      </motion.div>
    </div>
  );
};

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { setAuth, addToast } = useAppStore();
  const [captchaKey, setCaptchaKey] = useState('');
  const [captchaRefreshToken, setCaptchaRefreshToken] = useState(0);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { captcha: '', website: '' },
  });

  const refreshCaptcha = () => {
    setCaptchaKey('');
    setCaptchaRefreshToken((token) => token + 1);
    setValue('captcha', '', { shouldValidate: false });
  };

  const handleRegister = async (data: RegisterFormValues) => {
    try {
      const res = await apiRequest<{ token: string; user: User }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ ...data, captcha_key: captchaKey }),
      });
      setAuth(res.user, res.token);
      addToast('success', 'ثبت‌نام شما با موفقیت انجام شد.');
      reset();
      refreshCaptcha();
      navigate('/admin/profile');
    } catch (err) {
      refreshCaptcha();
      addToast('error', err instanceof Error ? err.message : 'خطا در ثبت‌نام');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
      <SeoHead title="ثبت‌نام در پرتال پارس پولاد آقایی" />
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-7 text-white shadow-2xl"
      >
        <div className="mb-5 flex items-center justify-between">
          <span className="text-base font-extrabold">ثبت‌نام کارفرمایان و کاربران</span>
          <UserPlus className="h-5 w-5 text-(--theme-primary)" />
        </div>
        <form onSubmit={handleSubmit(handleRegister)} className="space-y-4">
          <PublicHoneypotField registration={register('website')} />
          <div>
            <label className="mb-1 block text-xs text-slate-300">نام و نام خانوادگی</label>
            <input {...register('name')} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm" />
            {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>}
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-300">ایمیل</label>
            <input {...register('email')} type="email" dir="ltr" className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm" />
            {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-300">شماره تماس</label>
            <input {...register('phone')} dir="ltr" className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-300">رمز عبور (حداقل ۸ کاراکتر)</label>
            <input {...register('password')} type="password" dir="ltr" className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm" />
            {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>}
          </div>
          <SelfHostedCaptcha
            registration={register('captcha')}
            refreshToken={captchaRefreshToken}
            onKeyChange={setCaptchaKey}
            onRefresh={refreshCaptcha}
            error={errors.captcha?.message}
          />
          <button
            type="submit"
            disabled={isSubmitting || !captchaKey}
            style={{ backgroundColor: 'var(--theme-primary)' }}
            className="w-full rounded-lg py-2.5 text-sm font-semibold text-white"
          >
            {isSubmitting ? 'در حال ثبت...' : 'ایجاد حساب'}
          </button>
        </form>
        <div className="mt-4 text-center text-xs text-slate-400">
          قبلاً ثبت‌نام کرده‌اید؟ <Link to="/login" className="text-white hover:underline">ورود</Link>
        </div>
      </motion.div>
    </div>
  );
};
