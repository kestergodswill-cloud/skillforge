'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Logo from '@/components/Logo';
import { 
  HiOutlineLockClosed, 
  HiOutlineEye, 
  HiOutlineEyeSlash, 
  HiCheckCircle, 
  HiXCircle 
} from 'react-icons/hi2';
import Link from 'next/link';

function ResetPasswordHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const oobCode = searchParams.get('oobCode');
  const mode = searchParams.get('mode');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [status, setStatus] = useState<'verifying' | 'valid' | 'invalid' | 'submitting' | 'success'>('verifying');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!oobCode || mode !== 'resetPassword') {
      setStatus('invalid');
      setErrorMessage('Invalid or missing reset code. Please request a new password reset link.');
      return;
    }

    verifyPasswordResetCode(auth, oobCode)
      .then(() => {
        setStatus('valid');
      })
      .catch(() => {
        setStatus('invalid');
        setErrorMessage('This password reset link has expired or has already been used. Please request a new one.');
      });
  }, [oobCode, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setStatus('submitting');

    try {
      await confirmPasswordReset(auth, oobCode!, newPassword);
      setStatus('success');
      
      setTimeout(() => {
        router.push('/auth');
      }, 3000);
    } catch (error: any) {
      setStatus('valid');
      setErrorMessage(`Error: ${error.message.replace('Firebase: ', '')}`);
    }
  };

  return (
    <section className="flex-1 flex items-center justify-center px-6 py-12">
      <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-xl w-full max-w-md space-y-8">
        
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-6">
            <Logo size={48} theme="light" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Create New Password
          </h1>
          <p className="text-sm text-slate-500">
            {status === 'success' ? 'Password updated successfully!' : 'Please enter your new strong password below.'}
          </p>
        </div>

        {status === 'verifying' && (
          <div className="flex flex-col items-center justify-center py-8 gap-4 text-emerald-600">
            <svg className="animate-spin h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-sm font-bold tracking-widest uppercase">Verifying Link...</span>
          </div>
        )}

        {status === 'invalid' && (
          <div className="space-y-6 text-center animate-in fade-in zoom-in duration-300">
            <div className="flex justify-center">
              <HiXCircle className="text-6xl text-rose-500" />
            </div>
            <p className="text-sm text-slate-600 font-medium">{errorMessage}</p>
            <Link 
              href="/auth"
              className="inline-block w-full rounded-xl bg-slate-900 px-4 py-3.5 text-sm font-bold text-white transition-all hover:bg-slate-800 active:scale-95 shadow-md"
            >
              Back to Login
            </Link>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-6 text-center animate-in fade-in zoom-in duration-300">
            <div className="flex justify-center">
              <HiCheckCircle className="text-6xl text-emerald-500" />
            </div>
            <p className="text-sm text-slate-600 font-medium">Your password has been successfully reset. Redirecting you to login...</p>
            <Link 
              href="/auth"
              className="inline-block w-full rounded-xl bg-emerald-600 px-4 py-3.5 text-sm font-bold text-white transition-all hover:bg-emerald-500 active:scale-95 shadow-md"
            >
              Sign In Now
            </Link>
          </div>
        )}

        {(status === 'valid' || status === 'submitting') && (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2 animate-in fade-in duration-300">
            {errorMessage && (
              <div className="rounded-xl bg-rose-50 border border-rose-100 p-3 mb-4">
                <p className="text-xs text-rose-600 font-semibold text-center">{errorMessage}</p>
              </div>
            )}

            <div className="space-y-3">
              <div className="relative">
                <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  required 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New Password" 
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-12 text-sm font-medium outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <HiOutlineEyeSlash className="text-lg" /> : <HiOutlineEye className="text-lg" />}
                </button>
              </div>

              <div className="relative">
                <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                <input 
                  type={showConfirmPassword ? 'text' : 'password'} 
                  required 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm New Password" 
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-12 text-sm font-medium outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showConfirmPassword ? <HiOutlineEyeSlash className="text-lg" /> : <HiOutlineEye className="text-lg" />}
                </button>
              </div>
            </div>
            
            <button 
              type="submit"
              disabled={status === 'submitting'}
              className="w-full rounded-xl bg-emerald-600 px-4 py-3.5 text-sm font-bold text-white transition-all hover:bg-emerald-500 active:scale-95 shadow-md shadow-emerald-900/10 disabled:opacity-50 mt-4 flex justify-center items-center gap-2"
            >
              {status === 'submitting' ? (
                <>
                   <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                   </svg>
                   Updating...
                </>
              ) : 'Reset Password'}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

export default function ActionPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      <Navbar />
      <Suspense fallback={
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center gap-4">
             <div className="h-12 w-12 bg-emerald-200 rounded-full"></div>
             <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Loading...</p>
          </div>
        </div>
      }>
        <ResetPasswordHandler />
      </Suspense>
      <Footer />
    </main>
  );
}