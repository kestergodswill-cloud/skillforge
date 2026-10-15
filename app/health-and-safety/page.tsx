'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import QuickRegistrationModal from '@/components/QuickRegistrationModal';
import { auth, db } from '@/lib/firebase';
import { collection, getDocs, query, where, addDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { 
  HiOutlinePhone, 
  HiOutlineCalendar, 
  HiOutlineMagnifyingGlass,
  HiOutlineCheckBadge,
  HiChevronDown,
  HiOutlineMapPin,
  HiOutlineClock,
  HiOutlineEnvelope
} from 'react-icons/hi2';

export default function HealthAndSafetyPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [applicationStatuses, setApplicationStatuses] = useState<{ [key: string]: 'pending' | 'approved' | 'rejected' }>({});
  const [expandedProgramId, setExpandedProgramId] = useState<string | null>(null);

  const [searchLocation, setSearchLocation] = useState('');
  const [livePrograms, setLivePrograms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProgramId, setSelectedProgramId] = useState('');
  const [selectedProgramTitle, setSelectedProgramTitle] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    let unsubscribeRegs: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);

      if (unsubscribeRegs) {
        unsubscribeRegs();
        unsubscribeRegs = null;
      }

      if (currentUser) {
        const regsRef = collection(db, 'registrations');
        const qRegs = query(regsRef, where('userId', '==', currentUser.uid));

        unsubscribeRegs = onSnapshot(
          qRegs,
          (regsSnap) => {
            const statusMap: { [key: string]: 'pending' | 'approved' | 'rejected' } = {};

            regsSnap.docs.forEach((d) => {
              const data = d.data();
              const rawStatus = String(data.status || 'pending').toLowerCase().trim();

              let normalizedStatus: 'pending' | 'approved' | 'rejected' = 'pending';
              if (rawStatus === 'approved' || rawStatus === 'accepted') {
                normalizedStatus = 'approved';
              } else if (rawStatus === 'rejected' || rawStatus === 'declined') {
                normalizedStatus = 'rejected';
              }

              if (data.programId) {
                statusMap[data.programId] = normalizedStatus;
              }
            });

            setApplicationStatuses(statusMap);
          },
          (error) => {
            console.error('Error listening to registrations:', error);
          }
        );
      } else {
        setApplicationStatuses({});
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeRegs) unsubscribeRegs();
    };
  }, []);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const programsRef = collection(db, 'programs');
        const q = query(programsRef, where("type", "==", "health"));
        const snapshot = await getDocs(q);
        
        const data = snapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          .filter((item: any) => 
            (item.status === 'approved' || item.status === 'live') &&
            item.isArchived !== true
          );
        
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
      program.state?.toLowerCase().includes(searchLower) ||
      program.country?.toLowerCase().includes(searchLower) ||
      program.title?.toLowerCase().includes(searchLower) ||
      program.organizer?.toLowerCase().includes(searchLower)
    );
  }, [livePrograms, searchLocation]);

  const handleRegisterClick = (program: any, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }

    if (!user) {
      router.push('/auth?next=/health-and-safety');
      return;
    }
    if (program.hostId === user.uid || applicationStatuses[program.id]) {
      return;
    }

    setSelectedProgramId(program.id);
    setSelectedProgramTitle(program.title);
    setIsSuccess(false);
    setIsModalOpen(true);
  };

  const toggleDetails = (program: any) => {
    const regStatus = applicationStatuses[program.id];
    const isHost = Boolean(user?.uid && program.hostId && user.uid === program.hostId);
    if (regStatus !== 'approved' && !isHost) return;

    setExpandedProgramId(prev => (prev === program.id ? null : program.id));
  };

  const handleFormSubmit = async (details: { fullName: string; phone: string; note?: string }) => {
    if (!user || !selectedProgramId) return;
    if (applicationStatuses[selectedProgramId]) return;
    
    setIsProcessing(true);
    try {
      await addDoc(collection(db, 'registrations'), {
        programId: selectedProgramId,
        userId: user.uid,
        fullName: details.fullName.trim(),
        phone: details.phone.trim(),
        note: (details.note || '').trim(),
        email: user.email || '',
        status: 'pending',
        appliedAt: serverTimestamp()
      });
      
      setApplicationStatuses(prev => ({ ...prev, [selectedProgramId]: 'pending' }));
      setExpandedProgramId(prev => (prev === selectedProgramId ? null : prev));
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

      <div className="flex-1 w-full max-w-[1400px] mx-auto px-5 pt-6 sm:pt-10 pb-24">
        
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
              {filteredPrograms.map((program) => {
                const regStatus = applicationStatuses[program.id];
                const isHost = Boolean(user?.uid && program.hostId && user.uid === program.hostId);
                const canViewDetails = regStatus === 'approved' || isHost;
                const isExpanded = canViewDetails && expandedProgramId === program.id;

                return (
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
                        <h3 className="text-[15px] font-bold text-slate-900 dark:text-white leading-tight truncate">
                          {program.city || 'TBA'}{program.country ? `, ${program.country}` : ''}
                        </h3>
                        <span className="text-[13px] font-bold shrink-0">
                          {regStatus === 'approved' ? (
                            <span className="text-emerald-600 dark:text-emerald-400">Approved</span>
                          ) : regStatus === 'rejected' ? (
                            <span className="text-rose-600 dark:text-rose-400">Rejected</span>
                          ) : regStatus === 'pending' ? (
                            <span className="text-amber-600 dark:text-amber-400">Pending</span>
                          ) : isHost ? (
                            <span className="text-slate-900 dark:text-white">Yours</span>
                          ) : (
                            <span className="flex items-center gap-1 text-[12px] font-semibold text-slate-500 dark:text-slate-400">
                              <HiOutlineCalendar className="text-emerald-600 dark:text-emerald-500" />
                              {program.schedule || 'Dates TBA'}
                            </span>
                          )}
                        </span>
                      </div>

                      <p className="text-[14px] font-bold text-slate-800 dark:text-slate-200 mt-0.5 truncate">{program.title}</p>
                      
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
                      
                      <div className={`mt-4 pt-1 ${canViewDetails ? 'grid grid-cols-2 gap-2' : ''}`}>
                        {canViewDetails && (
                          <button 
                            type="button"
                            onClick={() => toggleDetails(program)}
                            className="flex items-center justify-center gap-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 py-2.5 text-[13px] font-bold text-slate-900 dark:text-white transition-all hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 cursor-pointer"
                          >
                            Details
                            <HiChevronDown className={`text-slate-500 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={(e) => handleRegisterClick(program, e)}
                          disabled={!!regStatus || isHost}
                          className={`w-full rounded-lg py-2.5 text-[13px] font-bold transition-all ${
                            regStatus === 'approved'
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 cursor-default'
                              : regStatus === 'rejected'
                              ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60 cursor-default'
                              : regStatus === 'pending'
                              ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60 cursor-default'
                              : isHost
                              ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed'
                              : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-emerald-600 dark:hover:bg-emerald-500 hover:text-white dark:hover:text-white shadow-sm active:scale-95 cursor-pointer'
                          }`}
                        >
                          {regStatus === 'approved'
                            ? 'Approved'
                            : regStatus === 'rejected'
                            ? 'Rejected'
                            : regStatus === 'pending'
                            ? 'Pending'
                            : isHost
                            ? 'Yours'
                            : 'Register for Drive'}
                        </button>
                      </div>

                      {isExpanded && canViewDetails && (
                        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 text-[13px] text-slate-600 dark:text-slate-400 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                          <p className="leading-relaxed font-medium text-slate-800 dark:text-slate-200">
                            {program.description || 'Join this health and safety drive to learn critical preparedness skills directly from certified professionals.'}
                          </p>
                          
                          <div className="space-y-2">
                            <div className="flex items-start gap-2.5">
                              <HiOutlineMapPin className="text-lg text-slate-400 shrink-0 mt-0.5" />
                              <span>{program.address || program.location || program.venue || 'Exact meeting point provided by host'}</span>
                            </div>
                            
                            <div className="flex items-start gap-2.5">
                              <HiOutlineClock className="text-lg text-slate-400 shrink-0 mt-0.5" />
                              <span>{program.time || program.schedule || 'Schedule TBA'}</span>
                            </div>

                            {(program.contactEmail || program.contactPhone) && (
                              <>
                                <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800/50"></div>
                                {program.contactEmail && (
                                  <div className="flex items-center gap-2.5">
                                    <HiOutlineEnvelope className="text-lg text-slate-400 shrink-0" />
                                    <a href={`mailto:${program.contactEmail}`} className="hover:text-emerald-600 transition-colors">{program.contactEmail}</a>
                                  </div>
                                )}
                                {program.contactPhone && (
                                  <div className="flex items-center gap-2.5 mt-1.5">
                                    <HiOutlinePhone className="text-lg text-slate-400 shrink-0" />
                                    <a href={`tel:${program.contactPhone}`} className="hover:text-emerald-600 transition-colors">{program.contactPhone}</a>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      )}

                    </div>
                  </div>
                );
              })}
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
                onClick={() => handleRegisterClick({ id: 'request', title: 'Custom Regional Hub Request' })}
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
              href="mailto:support@skillforge.africa"
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