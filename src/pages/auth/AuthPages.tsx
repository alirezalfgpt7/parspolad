import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, ShieldCheck, UserPlus } from 'lucide-react';
import { motion } from 'motion/react';
import { apiRequest } from '../../services/api.ts';
import { useAppStore } from '../../store/useAppStore.ts';
import type { User } from '../../types/index.ts';
import { SeoHead } from '../../components/common/SeoHead.tsx';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { setAuth, addToast } = useAppStore();
  const [email, setEmail] = useState('admin@parspooladaghaei.ir');
  const [password, setPassword] = useState('ParsPolad@1404');
  const [challengeToken, setChallengeToken] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [demoHint, setDemoHint] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = challengeToken
        ? { challenge_token: challengeToken, two_factor_code: twoFactorCode }
        : { email, password };
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
    } finally {
      setLoading(false);
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
            <img src="/storage/logos/logo-small.png" alt="PPA" className="h-9 w-9 rounded bg-white p-1" />
            <span className="text-base font-extrabold">پارس پولاد آقایی</span>
          </Link>
          <Lock className="h-5 w-5 text-[var(--theme-primary)]" />
        </div>

        <h1 className="text-xl font-bold">
          {challengeToken ? 'احراز هویت دو مرحله‌ای (2FA)' : 'ورود به سامانه یکپارچه'}
        </h1>
        <p className="mt-1 text-xs text-slate-400">
          {challengeToken
            ? demoHint || 'کد تایید ۶ رقمی خود را وارد کنید.'
            : 'ورود سوپر ادمین، مدیران محتوا و کارفرمایان مجاز'}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {!challengeToken ? (
            <>
              <div>
                <label className="mb-1.5 block text-xs text-slate-300">ایمیل سازمانی</label>
                <input
                  type="email"
                  required
                  dir="ltr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm text-white focus:border-[var(--theme-primary)] focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs text-slate-300">رمز عبور</label>
                <input
                  type="password"
                  required
                  dir="ltr"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm text-white focus:border-[var(--theme-primary)] focus:outline-none"
                />
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
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-center font-mono text-lg tracking-widest text-white focus:border-[var(--theme-primary)] focus:outline-none"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{ backgroundColor: 'var(--theme-primary)' }}
            className="w-full rounded-lg py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {loading ? 'در حال بررسی...' : challengeToken ? 'تایید و ورود' : 'ورود به حساب'}
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
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiRequest<{ token: string; user: User }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, phone, password }),
      });
      setAuth(res.user, res.token);
      addToast('success', 'ثبت‌نام شما با موفقیت انجام شد.');
      navigate('/admin/profile');
    } catch (err) {
      addToast('error', err instanceof Error ? err.message : 'خطا در ثبت‌نام');
    } finally {
      setLoading(false);
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
          <UserPlus className="h-5 w-5 text-[var(--theme-primary)]" />
        </div>
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs text-slate-300">نام و نام خانوادگی</label>
            <input required value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-300">ایمیل</label>
            <input type="email" required dir="ltr" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-300">شماره تماس</label>
            <input dir="ltr" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-300">رمز عبور (حداقل ۶ کاراکتر)</label>
            <input type="password" required minLength={6} dir="ltr" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm" />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{ backgroundColor: 'var(--theme-primary)' }}
            className="w-full rounded-lg py-2.5 text-sm font-semibold text-white"
          >
            {loading ? 'در حال ثبت...' : 'ایجاد حساب'}
          </button>
        </form>
        <div className="mt-4 text-center text-xs text-slate-400">
          قبلاً ثبت‌نام کرده‌اید؟ <Link to="/login" className="text-white hover:underline">ورود</Link>
        </div>
      </motion.div>
    </div>
  );
};
