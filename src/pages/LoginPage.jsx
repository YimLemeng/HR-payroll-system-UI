import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useLoading } from '../context/LoadingContext';
import Button from '../components/common/Button';
import BrandLogo from '../components/common/BrandLogo';
import LanguageSwitcher from '../components/common/LanguageSwitcher';
import {
  Lock,
  User,
  Users,
  Eye,
  EyeOff,
  AlertCircle,
  Clock,
  ArrowRight,
  Loader2,
  CalendarCheck,
  DollarSign
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
    <div className="min-h-screen bg-[#f4f7fa] text-slate-800 flex items-center justify-center p-0 lg:p-6 relative overflow-hidden select-none">
      {/* Subtle Background Ambient Imagery & Radial Lights */}
      <div 
        className="absolute inset-0 bg-cover bg-center pointer-events-none opacity-[0.06] filter blur-[1px]"
        style={{ backgroundImage: "url('/images/login-bg.jpg')" }}
      />
      <div className="absolute -top-40 -left-40 w-[550px] h-[550px] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-[550px] h-[550px] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />

      {/* Main Unified Split Showcase Card (Admindek Slate + Crisp White) */}
      <div className="w-full max-w-5xl lg:rounded-2xl border-0 lg:border border-slate-200/90 shadow-2xl shadow-slate-900/10 overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative z-10 min-h-screen lg:min-h-[640px] bg-white">
        
        {/* ======================================================== */}
        {/* Left Side: Dark Slate Hero Banner (#1c2434 matching Sidebar) */}
        {/* ======================================================== */}
        <div className="lg:col-span-7 relative flex flex-col justify-between p-8 sm:p-12 overflow-hidden bg-[#1c2434]">
          {/* Background Image inside Left Panel */}
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-105 opacity-35"
            style={{ backgroundImage: "url('/images/login-hero.jpg')" }}
          />
          {/* Rich Dark Slate Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#131a29] via-[#1c2434]/90 to-[#1e293b]/80" />
          <div className="absolute inset-0 bg-blue-600/10 mix-blend-overlay" />

          {/* Top Brand Tag */}
          <div className="relative z-10 flex items-center gap-3">
            <BrandLogo size="md" className="shadow-blue-500/40" />
            <div>
              <span className="text-base font-extrabold tracking-tight text-white block">
                HR & PAYROLL ENTERPRISE
              </span>
              <span className="text-[11px] text-blue-300/80 font-medium tracking-wide">
                Human Capital & Compensation Management
              </span>
            </div>
          </div>

          {/* Showcase Content (Shifted Up) */}
          <div className="relative z-10 mt-6 sm:mt-8 mb-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold mb-4 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              <span>Next-Gen Enterprise Platform</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
              {lang === 'km'
                ? 'គ្រប់គ្រងធនធានមនុស្ស និងប្រាក់បៀវត្ស ដោយទំនុកចិត្ត និងសុក្រឹតភាព'
                : 'Intelligent Workforce Governance & Precision Payroll Engine'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-3 max-w-lg leading-relaxed">
              {lang === 'km'
                ? 'ប្រព័ន្ធស្វ័យប្រវត្តកម្រិតខ្ពស់សម្រាប់តាមដានវត្តមាន គណនាប្រាក់ខែ គ្រប់គ្រងច្បាប់ឈប់សម្រាក និងចេញរបាយការណ៍ A4 ស្របតាមច្បាប់ការងារ។'
                : 'Automated end-to-end management for employee records, time tracking, automated payroll processing, and official audit reporting.'}
            </p>

            {/* Core Capability Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-7">
              <div className="p-3.5 rounded-2xl bg-white/[0.05] border border-white/10 backdrop-blur-md hover:bg-white/[0.08] transition-all">
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400 mb-2.5">
                  <Users className="w-4 h-4" />
                </div>
                <div className="text-white text-xs font-bold">
                  {lang === 'km' ? 'គ្រប់គ្រងបុគ្គលិក' : 'Workforce'}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                  {lang === 'km' ? 'ប្រវត្តិរូប & ផ្នែកការងារ' : 'Profiles & Structure'}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.05] border border-white/10 backdrop-blur-md hover:bg-white/[0.08] transition-all">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 mb-2.5">
                  <CalendarCheck className="w-4 h-4" />
                </div>
                <div className="text-white text-xs font-bold">
                  {lang === 'km' ? 'វត្តមាន & ច្បាប់' : 'Attendance'}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                  {lang === 'km' ? 'តាមដាន & អនុម័តរហ័ស' : 'Real-time Tracking'}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.05] border border-white/10 backdrop-blur-md hover:bg-white/[0.08] transition-all">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400 mb-2.5">
                  <DollarSign className="w-4 h-4" />
                </div>
                <div className="text-white text-xs font-bold">
                  {lang === 'km' ? 'ប្រាក់បៀវត្ស' : 'Payroll Engine'}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                  {lang === 'km' ? 'គណនាស្វ័យប្រវត្ត & A4' : 'Automated & Reports'}
                </div>
              </div>
            </div>
          </div>



        </div>

        {/* ======================================================== */}
        {/* Right Side: Clean White Authentication Form (5 cols on lg) */}
        {/* ======================================================== */}
        <div className="lg:col-span-5 flex flex-col justify-between p-8 sm:p-10 bg-white relative z-10">
          {/* Top Right Language Switcher */}
          <div className="flex justify-end mb-2">
            <LanguageSwitcher variant="simple" />
          </div>

          <div className="my-auto">
            {/* Header */}
            <div className="text-center mb-7">
              <div className="inline-flex items-center justify-center mb-3.5">
                <BrandLogo size="lg" className="shadow-blue-600/20" />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {t('welcomeTitle')}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
                {t('welcomeSubtitle')}
              </p>
            </div>

            {/* Session Termination / Timeout Notice */}
            {sessionNotice && !errorMessage && (
              <div className="mb-5 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs font-medium flex items-start gap-2.5 animate-in fade-in duration-200">
                <Clock className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
                <span>{sessionNotice}</span>
              </div>
            )}

            {/* Error Alert */}
            {errorMessage && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-start gap-2.5 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username Field */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {t('usernameLabel')}
                </label>
                <div className="relative group">
                  <User className="w-4 h-4 text-slate-400 group-focus-within:text-blue-600 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors" />
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
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50/70 focus:bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 transition-all placeholder:text-slate-400 disabled:opacity-60"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {t('passwordLabel')}
                </label>
                <div className="relative group">
                  <Lock className="w-4 h-4 text-slate-400 group-focus-within:text-blue-600 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('passwordPlaceholder')}
                    required
                    autoComplete="current-password"
                    spellCheck="false"
                    disabled={isLoading || cooldownSeconds > 0}
                    className="w-full pl-10 pr-11 py-2.5 rounded-xl bg-slate-50/70 focus:bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 transition-all placeholder:text-slate-400 disabled:opacity-60"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Sign In Submit Button */}
              <button
                type="submit"
                disabled={isLoading || cooldownSeconds > 0}
                className="group relative w-full flex items-center justify-center gap-2.5 py-2.5 px-6 rounded-xl font-semibold text-sm text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-md shadow-blue-600/20 hover:shadow-lg hover:shadow-blue-600/25 transition-all duration-200 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed select-none overflow-hidden cursor-pointer mt-4"
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
                    <span className="tracking-wide">{t('loginButton')}</span>
                    <ArrowRight className="w-4 h-4 text-white/90 group-hover:translate-x-1 transition-transform duration-200" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Simple Clean Production Footer */}
          <div className="mt-8 pt-4 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-400">
              © {new Date().getFullYear()} HR & Payroll Enterprise. All rights reserved.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
