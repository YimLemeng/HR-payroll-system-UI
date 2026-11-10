import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useLoading } from '../../context/LoadingContext';
import Button from './Button';
import ModalPortal from './ModalPortal';
import { LogOut, X } from 'lucide-react';

const LogoutConfirmModal = ({ isOpen, onClose }) => {
  const { t, lang } = useLanguage();
  const { logout } = useAuth();
  const { withLoading } = useLoading();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  if (!isOpen) return null;

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    await withLoading(
      lang === 'km' ? 'កំពុងចាកចេញពីប្រព័ន្ធ...' : 'Signing Out...',
      async () => {
        try {
          await logout();
          onClose();
          // Replace history stack so Back button cannot return to Dashboard
          navigate('/login', { replace: true });
        } finally {
          setIsLoggingOut(false);
        }
      },
      700,
      lang === 'km'
        ? 'សូមរង់ចាំមួយភ្លែត ប្រព័ន្ធកំពុងបញ្ចប់សម័យការងាររបស់អ្នក។'
        : 'Please wait while closing active session securely.'
    );
  };

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
        <div 
          className="relative w-full max-w-md bg-[#0d1527] rounded-3xl shadow-2xl border border-slate-700/80 overflow-hidden text-slate-100 my-auto"
          onClick={(e) => e.stopPropagation()}
        >
        {/* Subtle top light bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-rose-400 to-amber-500" />

        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isLoggingOut}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-7">
          {/* Icon Badge */}
          <div className="w-12 h-12 mb-4 rounded-2xl bg-rose-500/15 text-rose-400 flex items-center justify-center border border-rose-500/30 shadow-lg shadow-rose-500/10">
            <LogOut className="w-6 h-6" />
          </div>

          {/* Title & Message */}
          <h3 className="text-xl font-bold text-white mb-2 tracking-tight">
            {t('logoutModalTitle')}
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-6">
            {t('logoutModalMessage')}
          </p>

          {/* Action Buttons: Yes / No */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800/80">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoggingOut}
            >
              {t('logoutConfirmNo')}
            </Button>

            <Button
              variant="danger"
              isLoading={isLoggingOut}
              onClick={handleConfirmLogout}
              icon={LogOut}
            >
              {isLoggingOut ? t('loggingOut') : t('logoutConfirmYes')}
            </Button>
          </div>
        </div>
      </div>
    </div>
    </ModalPortal>
  );
};

export default LogoutConfirmModal;
