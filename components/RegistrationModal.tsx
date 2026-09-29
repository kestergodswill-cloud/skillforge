
'use client';

import { useState, useEffect } from 'react';
import { HiOutlineCheckCircle, HiOutlineXMark } from 'react-icons/hi2';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitDetails: (details: { fullName: string; phone: string; note: string }) => void;
  title: string;
  itemTitle: string;
  isProcessing: boolean;
  isSuccess: boolean;
}

export default function RegistrationModal({
  isOpen,
  onClose,
  onSubmitDetails,
  itemTitle,
  isProcessing,
  isSuccess,
}: RegistrationModalProps) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setFullName('');
      setPhone('');
      setNote('');
      setErrorMessage('');
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

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
      setErrorMessage('Please fill out your name and phone number.');
      return;
    }
    setErrorMessage('');
    onSubmitDetails({ fullName, phone, note });
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-end sm:justify-center bg-slate-900/40 backdrop-blur-sm p-0 sm:p-4 font-sans animate-in fade-in duration-200">
      
      <div className="absolute inset-0 -z-10" onClick={onClose} />
      
      <div className="bg-white dark:bg-slate-900 w-full max-w-[400px] rounded-t-[2rem] sm:rounded-3xl shadow-2xl flex flex-col max-h-[90vh] sm:max-h-[85vh] animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-200 border border-slate-100 dark:border-slate-800">
        
        <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mt-3 sm:hidden shrink-0" />

        <div className="overflow-y-auto px-6 pb-6 pt-3 sm:pt-6">
          
          {isSuccess ? (
            <div className="text-center flex flex-col items-center py-4 animate-in fade-in duration-300">
              <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-4">
                <HiOutlineCheckCircle className="text-3xl" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">Request Sent</h3>
              <p className="text-[14px] text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                Your spot for <strong className="text-slate-900 dark:text-white">{itemTitle}</strong> has been requested. The host will reach out if approved.
              </p>
              <button
                onClick={onClose}
                className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-[14px] py-3 rounded-xl hover:opacity-90 transition-opacity active:scale-[0.98] cursor-pointer shadow-sm"
              >
                Done
              </button>
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-start mb-5">
                <div className="pr-4">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white leading-tight mb-1">
                    Reserve a spot
                  </h2>
                  <p className="text-[14px] font-medium text-slate-500 dark:text-slate-400 leading-snug">
                    {itemTitle}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 -mr-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors shrink-0 cursor-pointer"
                  aria-label="Close modal"
                >
                  <HiOutlineXMark className="text-lg" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                
                {errorMessage && (
                  <div className="text-[13px] font-medium text-rose-600 dark:text-rose-400 mb-2">
                    {errorMessage}
                  </div>
                )}
                
                <div>
                  <label className="block text-[13px] font-semibold text-slate-700 dark:text-slate-300 mb-1 pl-1">
                    Full name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (errorMessage) setErrorMessage('');
                    }}
                    className="w-full bg-slate-100 dark:bg-slate-800 border border-transparent px-4 py-2.5 rounded-xl text-[14px] font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:border-slate-900 dark:focus:border-slate-100 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-slate-700 dark:text-slate-300 mb-1 pl-1">
                    Phone number (WhatsApp)
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (errorMessage) setErrorMessage('');
                    }}
                    className="w-full bg-slate-100 dark:bg-slate-800 border border-transparent px-4 py-2.5 rounded-xl text-[14px] font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:border-slate-900 dark:focus:border-slate-100 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="flex justify-between items-center mb-1 pl-1 pr-1">
                    <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-300">Note to host</span>
                    <span className="text-[11px] text-slate-400">Optional</span>
                  </label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Any prior experience?"
                    rows={2}
                    className="w-full bg-slate-100 dark:bg-slate-800 border border-transparent px-4 py-2.5 rounded-xl text-[14px] font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:border-slate-900 dark:focus:border-slate-100 outline-none resize-none transition-all"
                  />
                </div>

                <div className="pt-2">
                  <p className="text-[12px] text-slate-500 dark:text-slate-400 leading-relaxed mb-4 text-center sm:text-left px-1">
                    Slots are limited. The host will contact you directly if your request is approved.
                  </p>
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-[14px] py-3 rounded-xl hover:bg-slate-800 dark:hover:bg-slate-200 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 transition-all shadow-sm cursor-pointer"
                  >
                    {isProcessing ? 'Sending...' : 'Request to join'}
                  </button>
                </div>

              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}