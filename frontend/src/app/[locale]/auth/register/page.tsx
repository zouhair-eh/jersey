/**
 * @file page.tsx (Register)
 * @description Premium registration page for Jersey Marocco.
 * Route: /[locale]/auth/register
 */

'use client';

import { useState }          from 'react';
import { useTranslations }   from 'next-intl';
import { Link, useRouter }   from '@/i18n/routing';
import { useAuth }           from '@/lib/auth-context';
import { Eye, EyeOff, UserPlus, Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const t      = useTranslations('auth.register');
  const router = useRouter();
  const { register } = useAuth();

  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [role,     setRole]     = useState<'client' | 'expert'>('client');
  const [showPw,   setShowPw]   = useState(false);
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(name, email, password, [role]);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center px-6 py-20">
      {/* Background gradient */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-[15%] right-[20%] h-[400px] w-[400px] rounded-full opacity-20 blur-[100px]"
          style={{ background: 'radial-gradient(circle, #a855f7, transparent 70%)' }}
        />
        <div className="absolute bottom-[15%] left-[10%] h-[300px] w-[300px] rounded-full opacity-15 blur-[80px]"
          style={{ background: 'radial-gradient(circle, #6366f1, transparent 70%)' }}
        />
      </div>

      {/* Card */}
      <div className="w-full max-w-md rounded-2xl border border-white/[0.06] bg-white/[0.03] p-8 backdrop-blur-sm sm:p-10"
        style={{ animation: 'fadeUp 0.5s ease both' }}
      >
        {/* Header */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <span className="text-2xl">⚽</span>
            <span className="text-lg font-extrabold"
              style={{
                background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Jersey Marocco
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-white">{t('heading')}</h1>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-400 text-center">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div>
            <label htmlFor="reg-name" className="block text-xs font-medium text-white/50 mb-2">
              {t('name_label')}
            </label>
            <input
              id="reg-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.06] px-4 py-3 text-sm text-white placeholder:text-white/25 focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition-colors"
              placeholder="Votre nom complet"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="reg-email" className="block text-xs font-medium text-white/50 mb-2">
              {t('email_label')}
            </label>
            <input
              id="reg-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.06] px-4 py-3 text-sm text-white placeholder:text-white/25 focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition-colors"
              placeholder="email@example.com"
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="reg-password" className="block text-xs font-medium text-white/50 mb-2">
              {t('password_label')}
            </label>
            <div className="relative">
              <input
                id="reg-password"
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.06] px-4 py-3 pe-11 text-sm text-white placeholder:text-white/25 focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition-colors"
                placeholder="Min. 8 caractères"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute end-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                tabIndex={-1}
              >
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Role toggle */}
          <div>
            <label className="block text-xs font-medium text-white/50 mb-2">
              {t('role_label')}
            </label>
            <div className="flex gap-2">
              {(['client', 'expert'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`flex-1 rounded-xl py-2.5 text-sm font-medium transition-all ${
                    role === r
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-900/30'
                      : 'border border-white/[0.08] bg-white/[0.04] text-white/50 hover:bg-white/[0.08] hover:text-white/70'
                  }`}
                >
                  {t(r === 'client' ? 'role_client' : 'role_expert')}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-900/30 transition-all hover:shadow-xl hover:brightness-110 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <UserPlus className="h-4 w-4" />
            )}
            {loading ? 'Création...' : t('submit')}
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center gap-4">
          <div className="flex-1 h-px bg-white/[0.08]" />
          <span className="text-xs text-white/25">ou</span>
          <div className="flex-1 h-px bg-white/[0.08]" />
        </div>

        {/* Login link */}
        <p className="text-center text-sm text-white/40">
          {t('have_account')}{' '}
          <Link href="/auth/login" className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
            {t('login_link')}
          </Link>
        </p>
      </div>
    </main>
  );
}
