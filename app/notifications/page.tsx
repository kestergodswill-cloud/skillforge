
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { db, auth } from '@/lib/firebase';
import { collection, query, where, orderBy, onSnapshot, doc, deleteDoc, writeBatch, getDocs } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { HiOutlineArrowLeft, HiOutlineTrash, HiOutlineBellAlert, HiOutlineCheck } from 'react-icons/hi2';
import Link from 'next/link';

export default function NotificationsPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const pressTimer = useRef<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (!user) router.push('/auth');
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedNotifications = snapshot.docs.map(document => ({
        id: document.id,
        ...document.data()
      }));
      setNotifications(fetchedNotifications);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handlePressStart = (notificationId: string) => {
    pressTimer.current = setTimeout(() => {
      setDeleteTargetId(notificationId);
    }, 500);
  };

  const handlePressEnd = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
    }
  };

  const handleDeleteSingle = async (notificationId: string) => {
    try {
      await deleteDoc(doc(db, 'notifications', notificationId));
      setDeleteTargetId(null);
    } catch (error) {
      console.error("Failed to delete notification", error);
    }
  };

  const handleClearAll = async () => {
    if (!currentUser || notifications.length === 0) return;
    
    const confirmClear = window.confirm("Are you sure you want to clear your entire history?");
    if (!confirmClear) return;

    try {
      const q = query(collection(db, 'notifications'), where('userId', '==', currentUser.uid));
      const snapshot = await getDocs(q);
      
      const batch = writeBatch(db);
      snapshot.docs.forEach((document) => {
        batch.delete(document.ref);
      });
      
      await batch.commit();
    } catch (error) {
      console.error("Failed to clear notifications", error);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-white dark:bg-slate-950 flex flex-col justify-between font-sans">
        <Navbar />
        <div className="flex-1 flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 flex flex-col justify-between font-sans transition-colors duration-300">
      <div>
        <Navbar />

        {deleteTargetId && (
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setDeleteTargetId(null)}
            onTouchStart={() => setDeleteTargetId(null)}
          />
        )}

        <div className="max-w-[800px] mx-auto px-5 pt-[88px] sm:pt-[104px] pb-24">
          
          <div className="flex items-center justify-between mb-8 border-b border-slate-100 dark:border-slate-800 pb-6">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => router.back()}
                className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300 cursor-pointer border border-slate-200 dark:border-slate-800"
              >
                <HiOutlineArrowLeft className="text-lg" />
              </button>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Updates</h1>
            </div>
            
            {notifications.length > 0 && (
              <button 
                onClick={handleClearAll}
                className="text-[13px] font-bold text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 bg-slate-50 dark:bg-slate-900 hover:bg-rose-50 dark:hover:bg-rose-500/10 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer"
              >
                Clear all
              </button>
            )}
          </div>

          <div className="space-y-3">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-20 px-4 bg-slate-50 dark:bg-slate-900/40 rounded-3xl border border-slate-100 dark:border-slate-800/60">
                <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 shadow-sm border border-slate-200 dark:border-slate-700">
                  <HiOutlineCheck className="text-3xl text-slate-400 dark:text-slate-500" />
                </div>
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white mb-1">You're all caught up.</h2>
                <p className="text-[14px] text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
                  Whenever there's news about your events or important account activity, it will show up right here.
                </p>
              </div>
            ) : (
              <>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4 px-1">
                  Press and hold any update to delete it
                </p>
                {notifications.map((notif) => (
                  <div key={notif.id} className="relative z-0">
                    <Link 
                      href={notif.link || '#'}
                      className={`flex items-start gap-4 p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl transition-all duration-200 select-none shadow-sm ${
                        !notif.isRead ? 'border-l-4 border-l-emerald-500 bg-emerald-50/20 dark:bg-emerald-900/10' : ''
                      } ${deleteTargetId === notif.id ? 'scale-[0.98] ring-2 ring-rose-400 dark:ring-rose-500 z-50 relative shadow-md' : 'hover:border-slate-300 dark:hover:border-slate-700'}`}
                      onTouchStart={() => handlePressStart(notif.id)}
                      onTouchEnd={handlePressEnd}
                      onMouseDown={() => handlePressStart(notif.id)}
                      onMouseUp={handlePressEnd}
                      onMouseLeave={handlePressEnd}
                      onContextMenu={(e) => e.preventDefault()}
                      onClick={(e) => {
                        if (deleteTargetId === notif.id) e.preventDefault();
                      }}
                    >
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-100 dark:border-emerald-800/50">
                        <HiOutlineBellAlert className="text-xl" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-[15px] font-bold text-slate-900 dark:text-white leading-snug">{notif.title}</h3>
                        <p className="text-[14px] text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">{notif.message}</p>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2.5 uppercase font-bold tracking-wider">
                          {notif.createdAt?.toDate().toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) || 'Just now'}
                        </p>
                      </div>
                    </Link>

                    {deleteTargetId === notif.id && (
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 z-50 animate-in fade-in zoom-in-95 duration-100">
                        <button
                          onClick={() => handleDeleteSingle(notif.id)}
                          className="flex items-center gap-2 bg-rose-600 text-white px-4 py-2.5 rounded-xl shadow-xl hover:bg-rose-500 font-bold text-[12px] cursor-pointer transition-colors border border-rose-500"
                        >
                          <HiOutlineTrash className="text-base" /> Remove
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </>
            )}
          </div>

        </div>
      </div>

      <Footer />
    </main>
  );
}