
'use client';

import { useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import Logo from './Logo';
import { HiOutlineWrenchScrewdriver } from 'react-icons/hi2';

export default function MaintenanceGuard({ children }: { children: React.ReactNode }) {
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const settingsRef = doc(db, 'settings', 'global');
    const unsubscribeSettings = onSnapshot(settingsRef, (docSnap) => {
      if (docSnap.exists()) {
        setIsMaintenance(docSnap.data().maintenanceMode === true);
      }
    });

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const token = await user.getIdTokenResult(true);
          setIsAdmin(!!token.claims.admin);
        } catch (error) {
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
      setIsLoading(false);
    });

    return () => {
      unsubscribeSettings();
      unsubscribeAuth();
    };
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  
  if (isMaintenance && !isAdmin) {
    return (
      <main className="min-h-screen bg-white dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center selection:bg-emerald-100 font-sans transition-colors duration-300">
        
  
        <div className="absolute top-8 left-8">
          <Logo size={44} />
        </div>
        
        <div className="flex flex-col items-center max-w-lg mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-900 border-4 border-slate-50 dark:border-slate-800 mb-8 shadow-sm">
            <HiOutlineWrenchScrewdriver className="text-4xl text-slate-600 dark:text-slate-400" />
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">
            We'll be right back.
          </h1>
          
          <p className="text-[15px] text-slate-600 dark:text-slate-400 leading-relaxed mb-8">
            SkillForge is currently undergoing scheduled maintenance to upgrade our platform and improve your experience. 
            Thank you for your patience—we will be back online shortly!
          </p>
          
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-4 py-2 rounded-full border border-emerald-100 dark:border-emerald-900/50">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            System Upgrades in Progress
          </div>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}