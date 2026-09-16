'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { HiOutlinePlus, HiOutlineChartBar, HiOutlineCalendar } from 'react-icons/hi2';
import Link from 'next/link';

export default function HostDashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserEmail(user.email || user.phoneNumber);
        setIsLoading(false);
      } else {
        router.push('/auth?next=/host');
      }
    });
    return () => unsubscribe();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Navbar />

      <section className="flex-1 max-w-5xl w-full mx-auto px-6 py-12 space-y-8">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">Host Dashboard</h1>
            <p className="text-slate-500 mt-1">Welcome back, {userEmail}</p>
          </div>
          
          <Link href="/host/create" className="flex items-center justify-center gap-2 bg-emerald-600 text-white px-5 
                py-2.5 rounded-xl font-bold hover:bg-emerald-500 transition-all shadow-md active:scale-95">
            <HiOutlinePlus className="text-xl" />
            Publish New Event
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="bg-emerald-100 p-3 rounded-xl text-emerald-600">
              <HiOutlineCalendar className="text-2xl" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Active Events</p>
              <p className="text-2xl font-bold text-slate-900">0</p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
              <HiOutlineChartBar className="text-2xl" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Bookings</p>
              <p className="text-2xl font-bold text-slate-900">0</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 border-dashed rounded-3xl p-12 text-center space-y-4">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
            <HiOutlineCalendar className="text-3xl" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">No events published yet</h3>
            <p className="text-slate-500 max-w-sm mx-auto mt-2">
              Share your skills with the community. Create your first workshop, class, or service offering.
            </p>
          </div>
        </div>

      </section>

      <Footer />
    </main>
  );
}
