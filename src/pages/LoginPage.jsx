import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useLoading } from '../context/LoadingContext';
import LanguageSwitcher from '../components/common/LanguageSwitcher';
import {
  Lock,
  User,
  Users,
  Eye,
  EyeOff,
  AlertCircle,
  Clock,
  Loader2,
  LogIn,
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
      lang === 'km' ? 'កំពុងចូលផ្ទាំងគ្រប់គ្រង Dashboard...' : 'Entering Dashboard...',
      async () => {
        try {
          const res = await login(trimmedUsername, password);
          if (res.success) {
            setFailedAttempts(0);
            navigate('/dashboard', { replace: true });
          } else {
            const nextAttempts = failedAttempts + 1;
            setFailedAttempts(nextAttempts);

            // If 5 failed attempts, impose 5 minutes (300s) cooldown
            if (nextAttempts >= 5) {
              setCooldownSeconds(300);
              setErrorMessage(
                lang === 'km'
                  ? 'បានបរាជ័យច្រើនដងពេក។ សូមរង់ចាំ ៥ នាទីសិន មុនព្យាយាមម្តងទៀត។'
                  : 'Too many failed login attempts. Please wait 5 minutes before trying again.'
              );
            } else {
              setErrorMessage(res.error || t('loginError'));
            }
          }
        } catch (err) {
          setErrorMessage(t('loginError'));
        }
      },
      400,
      lang === 'km'
        ? 'សូមរង់ចាំមួយភ្លែត កំពុងរៀបចំទិន្នន័យ...'
        : 'Please wait while preparing your workspace...'
    );

    setIsLoading(false);
  };

  return (
    <div
      className="min-h-screen relative bg-slate-900 bg-cover bg-center text-slate-800 flex flex-col items-center justify-center p-4 select-none"
      style={{ backgroundImage: "url('/images/login-bg.jpg')" }}
    >
      {/* Subtle dark overlay for readability */}
      <div className="absolute inset-0 bg-slate-900/55 backdrop-blur-[1px]" />

      <div className="relative z-10 w-full flex flex-col items-center">
        {/* Classic Centered Login Box */}
        <div className="w-full max-w-[400px] bg-white rounded border border-slate-300 border-t-[3px] border-t-[#3c8dbc] shadow-lg p-6 sm:p-7">
          {/* Top Row: Brand Logo inside Form + Language Switcher */}
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-[#3c8dbc] text-white flex items-center justify-center shadow-sm">
                <Users className="w-4 h-4" />
              </div>
              <div className="text-lg font-bold text-slate-800 tracking-tight">
                HR &amp; <span className="font-normal text-slate-600">Payroll</span>
              </div>
            </div>
            <LanguageSwitcher variant="simple" />
          </div>

          {/* Centered Welcome Title & Subtitle */}
          <div className="text-center mb-5">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
              {t('welcomeTitle')}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {t('welcomeSubtitle')}
            </p>
          </div>

        {/* Session Termination / Timeout Notice */}
        {sessionNotice && !errorMessage && (
          <div className="mb-4 p-3 rounded bg-amber-50 border border-amber-300 text-amber-800 text-xs font-medium flex items-start gap-2">
            <Clock className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
            <span>{sessionNotice}</span>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded bg-rose-50 border border-rose-300 text-rose-800 text-xs font-medium flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Classic Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t('usernameLabel')}
            </label>
            <div className="relative">
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
                className="w-full pl-3 pr-9 py-2 rounded border border-slate-300 bg-white text-slate-800 text-sm focus:outline-none focus:border-[#3c8dbc] focus:ring-1 focus:ring-[#3c8dbc] placeholder:text-slate-400 disabled:bg-slate-100"
              />
              <User className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t('passwordLabel')}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('passwordPlaceholder')}
                required
                autoComplete="current-password"
                spellCheck="false"
                disabled={isLoading || cooldownSeconds > 0}
                className="w-full pl-3 pr-16 py-2 rounded border border-slate-300 bg-white text-slate-800 text-sm focus:outline-none focus:border-[#3c8dbc] focus:ring-1 focus:ring-[#3c8dbc] placeholder:text-slate-400 disabled:bg-slate-100"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || cooldownSeconds > 0}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded font-semibold text-sm text-white bg-[#3c8dbc] hover:bg-[#367fa9] active:bg-[#2f6f95] border border-[#367fa9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mt-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>{t('loggingIn')}</span>
              </>
            ) : cooldownSeconds > 0 ? (
              <span>
                {(() => {
                  const mins = Math.floor(cooldownSeconds / 60);
                  const secs = cooldownSeconds % 60;
                  const timeDisplay = mins > 0
                    ? `${mins}:${secs.toString().padStart(2, '0')}`
                    : `${secs}s`;
                  return lang === 'km'
                    ? `សូមរង់ចាំ (${timeDisplay})...`
                    : `Cooldown (${timeDisplay})...`;
                })()}
              </span>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>{t('loginButton')}</span>
              </>
            )}
          </button>
        </form>

        {/* Classic Card Footer */}
        <p className="text-[11px] text-slate-400 text-center mt-5 pt-4 border-t border-slate-200">
          © {new Date().getFullYear()} HR &amp; Payroll Management System
        </p>
      </div>
      </div>
    </div>
  );
};

export default LoginPage;
