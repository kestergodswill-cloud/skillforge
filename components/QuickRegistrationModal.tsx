
'use client';

import { useState, useEffect } from 'react';
import { HiOutlineCheckBadge, HiOutlineXMark } from 'react-icons/hi2';

interface QuickRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitDetails: (details: { fullName: string; phone: string }) => void;
  title: string;
  itemTitle: string;
  isProcessing: boolean;
  isSuccess: boolean;
}

export default function QuickRegistrationModal({
  isOpen,
  onClose,
  onSubmitDetails,
  title,
  itemTitle,
  isProcessing,
  isSuccess,
}: QuickRegistrationModalProps) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Reset inputs and lock background scroll when opened
  useEffect(() => {
    if (isOpen) {
      setFullName('');
      setPhone('');
      setErrorMessage('');
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Close on ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim()) {
      setErrorMessage('Please complete the form.');
      return;
    }
    setErrorMessage('');
    onSubmitDetails({ fullName, phone });
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-end sm:justify-center bg-slate-900/40 backdrop-blur-sm p-0 sm:p-4 font-sans animate-in fade-in duration-200">
      
      <div className="absolute inset-0 -z-10" onClick={onClose} />

      <div className="relative w-full max-w-[400px] rounded-t-[2rem] sm:rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-100 dark:bg-slate-900 dark:border-slate-800 space-y-6 animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-200">
        
        <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto -mt-2 sm:hidden shrink-0" />

        <button 
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <HiOutlineXMark className="text-xl" />
        </button>

        {!isSuccess ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <span className="inline-block text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full border border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20">
                {title}
              </span>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white pt-1">
                {itemTitle}
              </h3>
              <p className="text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed">
                Please provide your name and contact info so the coordinator can reach you.
              </p>
            </div>

            {errorMessage && (
              <p className="text-[13px] font-bold text-rose-500 animate-pulse">
                {errorMessage}
              </p>
            )}

            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Samuel Adebayo"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-[14px] font-medium text-slate-900 outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-white transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Phone Number / WhatsApp *</label>
                <input
                  type="tel"
                  placeholder="e.g. +234 801 234 5678"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-[14px] font-medium text-slate-900 outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-white transition-all"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full rounded-xl bg-emerald-600 py-3.5 text-[14px] font-bold text-white hover:bg-emerald-500 transition-colors shadow-sm disabled:opacity-50 cursor-pointer active:scale-[0.98]"
              >
                {isProcessing ? 'Submitting...' : 'Submit Registration'}
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center py-6 space-y-4 animate-in fade-in duration-300">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
              <HiOutlineCheckBadge className="text-4xl" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">You're Registered!</h3>
              <p className="text-[14px] text-slate-600 dark:text-slate-300 leading-relaxed">
                Your details have been recorded for <strong className="text-slate-900 dark:text-white">{itemTitle}</strong>.
              </p>
            </div>
            <div className="pt-4">
              <button
                onClick={onClose}
                className="w-full rounded-xl bg-slate-900 py-3.5 text-[14px] font-bold text-white hover:bg-slate-800 transition-colors dark:bg-slate-800 dark:hover:bg-slate-700 cursor-pointer shadow-sm active:scale-[0.98]"
              >
                Done
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}