import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useLoading } from '../context/LoadingContext';
import Button from '../components/common/Button';
import BrandLogo from '../components/common/BrandLogo';
import {
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  ShieldCheck,
  Clock
} from 'lucide-react';

const LoginPage = () => {
  const { t, lang } = useLanguage();
  const { login, sessionNotice } = useAuth();
  const { withLoading } = useLoading();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Client-side rate limiting / cooldown protection against brute force
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const interval = setInterval(() => {
      setCooldownSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldownSeconds]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cooldownSeconds > 0) return;

    const trimmedUsername = username.trim();
    if (!trimmedUsername || !password.trim()) {
      setErrorMessage(t('loginError'));
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    await withLoading(
      lang === 'km' ? 'កំពុងផ្ទៀងផ្ទាត់គណនីចូលប្រព័ន្ធ...' : 'Authenticating Credentials...',
      async () => {
        try {
          const res = await login(trimmedUsername, password);
          if (res.success) {
            setFailedAttempts(0);
            navigate('/dashboard', { replace: true });
          } else {
            const nextAttempts = failedAttempts + 1;
            setFailedAttempts(nextAttempts);

            // If 5 failed attempts, impose 15s cooldown
            if (nextAttempts >= 5) {
              setCooldownSeconds(15);
              setErrorMessage(
                lang === 'km'
                  ? 'បានបរាជ័យច្រើនដងពេក។ សូមរង់ចាំ ១៥ វិនាទីសិន មុនព្យាយាមម្តងទៀត។'
                  : 'Too many failed login attempts. Please wait 15 seconds before trying again.'
              );
            } else {
              setErrorMessage(res.error || t('loginError'));
            }
          }
        } catch (err) {
          setErrorMessage(t('loginError'));
        }
      },
      700,
      lang === 'km'
        ? 'សូមរង់ចាំមួយភ្លែត ប្រព័ន្ធកំពុងផ្ទៀងផ្ទាត់សិទ្ធិប្រើប្រាស់។'
        : 'Please wait while verifying secure access and establishing session.'
    );

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#070a13] text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden select-none">
      {/* Background ambient radial gradients */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-blue-600/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-indigo-600/15 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Login Card */}
        <div className="bg-[#0d1527]/90 rounded-3xl p-7 sm:p-8 border border-slate-700/80 shadow-2xl relative overflow-hidden backdrop-blur-xl">
          {/* Subtle top light bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-400" />

          {/* Logo, Badge, Welcome Title & Subtitle inside the card */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center mb-3">
              <BrandLogo size="lg" />
            </div>

            <div className="mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/25 text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                <span>{lang === 'km' ? 'ប្រព័ន្ធគ្រប់គ្រងធនធានមនុស្ស & បៀវត្ស' : 'Enterprise HR & Payroll Portal'}</span>
              </span>
            </div>

            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              {t('welcomeTitle')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xs mx-auto">
              {t('welcomeSubtitle')}
            </p>
          </div>

          {/* Session Termination / Timeout Notice */}
          {sessionNotice && !errorMessage && (
            <div className="mb-5 p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-medium flex items-start gap-2 animate-in fade-in duration-200">
              <Clock className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
              <span>{sessionNotice}</span>
            </div>
          )}

          {/* Error Alert */}
          {errorMessage && (
            <div className="mb-5 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-start gap-2 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t('usernameLabel')}
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={t('usernamePlaceholder')}
                  required
                  autoComplete="username"
                  autoCapitalize="none"
                  spellCheck="false"
                  disabled={isLoading || cooldownSeconds > 0}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#080d1a] border border-slate-700/80 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-colors placeholder:text-slate-500 disabled:opacity-60"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t('passwordLabel')}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('passwordPlaceholder')}
                  required
                  autoComplete="current-password"
                  spellCheck="false"
                  disabled={isLoading || cooldownSeconds > 0}
                  className="w-full pl-10 pr-11 py-2.5 rounded-xl bg-[#080d1a] border border-slate-700/80 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-colors placeholder:text-slate-500 disabled:opacity-60"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button with Loading Spinner */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              disabled={cooldownSeconds > 0}
              className="w-full justify-center mt-2 font-semibold"
            >
              {cooldownSeconds > 0
                ? (lang === 'km' ? `សូមរង់ចាំ (${cooldownSeconds}វិ)...` : `Cooldown (${cooldownSeconds}s)...`)
                : (isLoading ? t('loggingIn') : t('loginButton'))}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
