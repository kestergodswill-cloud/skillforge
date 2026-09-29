
'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import QuickRegistrationModal from '@/components/QuickRegistrationModal';
import { auth, db } from '@/lib/firebase';
import { collection, getDocs, query, where, addDoc, serverTimestamp } from 'firebase/firestore';
import { 
  HiOutlinePhone, 
  HiOutlineCalendar, 
  HiOutlineMagnifyingGlass,
  HiOutlineCheckBadge
} from 'react-icons/hi2';

export default function HealthAndSafetyPage() {
  const router = useRouter();
  const [searchLocation, setSearchLocation] = useState('');
  
  const [livePrograms, setLivePrograms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProgramTitle, setSelectedProgramTitle] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const programsRef = collection(db, 'programs');
        const q = query(programsRef, where("type", "==", "health"));
        const snapshot = await getDocs(q);
        
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setLivePrograms(data);
      } catch (error) {
        console.error("Error fetching health programs:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrograms();
  }, []);

  const filteredPrograms = useMemo(() => {
    if (!searchLocation.trim()) return livePrograms;
    const searchLower = searchLocation.toLowerCase();
    
    return livePrograms.filter(program => 
      program.city?.toLowerCase().includes(searchLower) ||
      program.location?.toLowerCase().includes(searchLower) ||
      program.title?.toLowerCase().includes(searchLower) ||
      program.organizer?.toLowerCase().includes(searchLower)
    );
  }, [livePrograms, searchLocation]);

  const handleRegisterClick = (title: string) => {
    if (!auth.currentUser) {
      router.push('/auth?next=/health-and-safety');
      return;
    }
    setSelectedProgramTitle(title);
    setIsSuccess(false);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (details: { fullName: string; phone: string }) => {
    if (!auth.currentUser) return;
    
    setIsProcessing(true);
    try {
      await addDoc(collection(db, 'health_registrations'), {
        programTitle: selectedProgramTitle,
        userId: auth.currentUser.uid,
        fullName: details.fullName,
        phone: details.phone,
        email: auth.currentUser.email,
        status: 'pending',
        appliedAt: serverTimestamp()
      });
      
      setIsSuccess(true);
    } catch (error) {
      console.error("Error submitting health registration:", error);
      alert('Failed to submit application. Please check your connection and try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const renderSkeletons = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 gap-y-10 mt-2">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="flex flex-col gap-2 animate-pulse">
          <div className="aspect-[4/3] w-full rounded-xl bg-slate-200 dark:bg-slate-800"></div>
          <div className="flex justify-between items-start mt-1">
            <div className="h-4 w-1/3 bg-slate-200 dark:bg-slate-800 rounded"></div>
            <div className="h-4 w-1/4 bg-slate-200 dark:bg-slate-800 rounded"></div>
          </div>
          <div className="h-3 w-3/4 bg-slate-200 dark:bg-slate-800 rounded mt-1"></div>
          <div className="h-3 w-1/2 bg-slate-200 dark:bg-slate-800 rounded"></div>
          <div className="h-10 w-full bg-slate-200 dark:bg-slate-800 rounded-lg mt-2"></div>
        </div>
      ))}
    </div>
  );

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 flex flex-col font-sans transition-colors duration-300">
      <Navbar />

      <QuickRegistrationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmitDetails={handleFormSubmit}
        title="Health & Safety Program"
        itemTitle={selectedProgramTitle}
        isProcessing={isProcessing}
        isSuccess={isSuccess}
      />

      <div className="flex-1 w-full max-w-[1400px] mx-auto px-5 pt-[88px] sm:pt-[104px] pb-24">
        
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
            Health & Life-Saving Programs
          </h1>
          
          <p className="text-[15px] sm:text-[16px] text-slate-600 dark:text-slate-400 mt-3 font-medium leading-relaxed">
            Empowering grassroots communities with emergency preparedness, first-aid training, and public sanitation drives tailored to your location.
          </p>

          <div className="relative max-w-lg mx-auto mt-8">
            <HiOutlineMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg pointer-events-none" />
            <input
              type="text"
              placeholder="Search by city, town, or specific drive..."
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-3.5 pl-11 pr-4 text-[14px] text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-emerald-500/50 transition-all shadow-sm"
            />
          </div>
        </div>

        <div>
          {isLoading ? (
            renderSkeletons()
          ) : filteredPrograms.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
              {filteredPrograms.map((program) => (
                <div key={program.id} className="group flex flex-col">
                  
                  <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 mb-3 border border-slate-200/50 dark:border-slate-700/50">
                    <img 
                      src={program.mediaUrl || program.image || "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80"} 
                      alt={program.title} 
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-3 left-3 bg-white dark:bg-slate-900 px-2 py-1 rounded text-[10px] font-extrabold text-slate-900 dark:text-white shadow-sm uppercase tracking-wider z-10">
                      {program.category || 'General Health'}
                    </div>
                  </div>

                  <div className="flex flex-col flex-1 px-0.5">
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <h3 className="text-[14px] font-bold text-slate-900 dark:text-white leading-tight truncate">
                        {program.location || program.city || 'Location TBA'}
                      </h3>
                      <span className="flex items-center gap-1 text-[12px] font-semibold text-slate-500 dark:text-slate-400 shrink-0">
                        <HiOutlineCalendar className="text-emerald-600 dark:text-emerald-500" />
                        {program.schedule || 'Dates TBA'}
                      </span>
                    </div>

                    <p className="text-[14px] font-bold text-slate-800 dark:text-slate-200 mt-1 truncate">{program.title}</p>
                    
                    <div className="mt-1">
                      <Link 
                        href={`/profile/${program.hostId}`} 
                        className="text-[13px] font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                      >
                        Organized by <span className="font-semibold">{program.organizer || 'Community Member'}</span>
                      </Link>
                    </div>

                    {program.highlights && program.highlights.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {program.highlights.slice(0, 2).map((item: string, i: number) => (
                          <span key={i} className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                            <HiOutlineCheckBadge className="text-emerald-600 dark:text-emerald-500" />
                            {item}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <div className="mt-4 pt-1">
                      <button
                        type="button"
                        onClick={() => handleRegisterClick(program.title)}
                        className="w-full rounded-lg py-2.5 text-[13px] font-bold transition-all cursor-pointer bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-emerald-600 dark:hover:bg-emerald-500 hover:text-white dark:hover:text-white shadow-sm active:scale-95"
                      >
                        Register for Drive
                      </button>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-24 max-w-md mx-auto">
              <HiOutlineMagnifyingGlass className="mx-auto text-4xl text-slate-300 dark:text-slate-700 mb-3" />
              <p className="text-[16px] text-slate-900 dark:text-white font-bold mb-1">No safety drives found</p>
              <p className="text-[14px] text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                We couldn't find any exact matches for "{searchLocation}".
              </p>
              <button
                type="button"
                onClick={() => handleRegisterClick("Custom Regional Hub Request")}
                className="inline-block rounded-xl bg-emerald-600 px-6 py-3 text-[13px] font-bold text-white hover:bg-emerald-500 transition-colors shadow-sm cursor-pointer"
              >
                Request a local hub
              </button>
            </div>
          )}
        </div>
      </div>

      <section className="bg-emerald-50 dark:bg-slate-900 py-16 px-5 border-t border-emerald-100 dark:border-slate-800 text-center">
        <div className="mx-auto max-w-2xl space-y-4">
          <div className="inline-flex p-3 bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 rounded-full text-xl shadow-sm border border-emerald-100 dark:border-slate-700">
            <HiOutlinePhone />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Launch a program on your street.
          </h2>
          <p className="text-[14px] sm:text-[15px] text-slate-600 dark:text-slate-400 leading-relaxed max-w-md mx-auto">
            If your neighborhood needs emergency first-aid training or a sanitation drive, let our coordinators know. We bring the resources to you.
          </p>
          <div className="pt-2">
            <a 
              href="mailto:safety@skillforge.africa"
              className="inline-block rounded-lg bg-emerald-600 text-white px-6 py-3 text-[14px] font-bold hover:bg-emerald-700 transition-colors shadow-sm cursor-pointer"
            >
              Contact Safety Desk
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}