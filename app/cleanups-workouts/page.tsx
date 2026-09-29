
'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import QuickRegistrationModal from '@/components/QuickRegistrationModal';
import { auth, db } from '@/lib/firebase';
import { collection, getDocs, query, addDoc, serverTimestamp } from 'firebase/firestore';
import { 
  HiOutlineUserGroup, 
  HiOutlineCalendar, 
  HiOutlineMagnifyingGlass,
  HiOutlineCheckBadge
} from 'react-icons/hi2';

export default function CleanupsWorkoutsPage() {
  const router = useRouter();
  const [searchLocation, setSearchLocation] = useState('');
  
  const [liveEvents, setLiveEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [selectedEventTitle, setSelectedEventTitle] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const programsRef = collection(db, 'programs');
        const snapshot = await getDocs(programsRef);
        
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })).filter((item: any) => 
          (item.type === 'workout' || item.type === 'cleanup') && 
          (item.status === 'approved' || item.status === 'live')
        );
        
        setLiveEvents(data);
      } catch (error) {
        console.error("Error fetching local activities:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const filteredEvents = useMemo(() => {
    if (!searchLocation.trim()) return liveEvents;
    const searchLower = searchLocation.toLowerCase();
    
    return liveEvents.filter(event => 
      event.city?.toLowerCase().includes(searchLower) ||
      event.location?.toLowerCase().includes(searchLower) ||
      event.title?.toLowerCase().includes(searchLower) ||
      event.type?.toLowerCase().includes(searchLower) ||
      event.organizer?.toLowerCase().includes(searchLower)
    );
  }, [liveEvents, searchLocation]);

  const handleJoinClick = (event: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    const currentUser = auth.currentUser;
    if (!currentUser) {
      router.push('/auth?next=/cleanups-workouts');
      return;
    }
    if (event.hostId === currentUser.uid) {
      alert("You are the host of this event.");
      return;
    }
    setSelectedEventId(event.id);
    setSelectedEventTitle(event.title);
    setIsSuccess(false);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (details: { fullName: string; phone: string; note?: string }) => {
    const currentUser = auth.currentUser;
    if (!currentUser || !selectedEventId) return;

    setIsProcessing(true);
    try {
      await addDoc(collection(db, 'registrations'), {
        programId: selectedEventId,
        userId: currentUser.uid,
        fullName: details.fullName,
        phone: details.phone,
        note: details.note || '',
        email: currentUser.email,
        status: 'pending',
        appliedAt: serverTimestamp()
      });

      setIsSuccess(true);
    } catch (error) {
      console.error("Error registering for activity:", error);
      alert("Failed to submit registration. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const renderSkeletons = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10 mt-2">
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
        title="Local Activity Registration"
        itemTitle={selectedEventTitle}
        isProcessing={isProcessing}
        isSuccess={isSuccess}
      />

      <div className="flex-1 w-full max-w-[1400px] mx-auto px-5 pt-[88px] sm:pt-[104px] pb-24">
        
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
            Local Cleanups & Group Workouts
          </h1>
          
          <p className="text-[15px] sm:text-[16px] text-slate-600 dark:text-slate-400 mt-3 font-medium leading-relaxed">
            Find scheduled neighborhood cleanups, group workouts, and fitness meetups happening right in your local area.
          </p>

          <div className="relative max-w-lg mx-auto mt-8">
            <HiOutlineMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg pointer-events-none" />
            <input
              type="text"
              placeholder="Search by city, activity, or host..."
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-3.5 pl-11 pr-4 text-[14px] text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-emerald-500/50 transition-all shadow-sm"
            />
          </div>
        </div>

        <div>
          {isLoading ? (
            renderSkeletons()
          ) : filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
              {filteredEvents.map((event) => (
                <div key={event.id} className="group flex flex-col cursor-pointer" onClick={() => handleJoinClick(event)}>
                  
                  <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 mb-3 border border-slate-200/50 dark:border-slate-700/50">
                    <img 
                      src={event.mediaUrl || "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80"} 
                      alt={event.title} 
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    
                    <div className={`absolute top-3 left-3 px-2 py-1 rounded text-[10px] font-extrabold shadow-sm uppercase tracking-wider z-10 ${
                      event.type === 'workout' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-emerald-600 text-white'
                    }`}>
                      {event.type === 'workout' ? 'Workout' : 'Cleanup'}
                    </div>
                  </div>

                  <div className="flex flex-col flex-1 px-0.5">
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <h3 className="text-[14px] font-bold text-slate-900 dark:text-white leading-tight truncate">
                        {event.location || event.city || 'Location TBA'}
                      </h3>
                      <span className="flex items-center gap-1 text-[12px] font-semibold text-slate-500 dark:text-slate-400 shrink-0">
                        <HiOutlineCalendar className="text-emerald-600 dark:text-emerald-500" />
                        {event.schedule || 'Dates TBA'}
                      </span>
                    </div>

                    <p className="text-[14px] font-bold text-slate-800 dark:text-slate-200 mt-1 truncate">{event.title}</p>
                    
                    <div className="mt-1">
                      <Link 
                        href={`/profile/${event.hostId}`} 
                        onClick={(e) => e.stopPropagation()}
                        className="text-[13px] font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                      >
                        Organized by <span className="font-semibold">{event.organizer || 'Community Member'}</span>
                      </Link>
                    </div>

                    {event.audience && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                          <HiOutlineCheckBadge className="text-emerald-600 dark:text-emerald-500" />
                          {event.audience}
                        </span>
                      </div>
                    )}
                    
                    <div className="mt-4 pt-1">
                      <button
                        type="button"
                        onClick={(e) => handleJoinClick(event, e)}
                        className="w-full rounded-lg py-2.5 text-[13px] font-bold transition-all cursor-pointer bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-emerald-600 dark:hover:bg-emerald-500 hover:text-white dark:hover:text-white shadow-sm active:scale-95"
                      >
                        Join Activity
                      </button>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-24 max-w-md mx-auto">
              <HiOutlineMagnifyingGlass className="mx-auto text-4xl text-slate-300 dark:text-slate-700 mb-3" />
              <p className="text-[16px] text-slate-900 dark:text-white font-bold mb-1">No activities found</p>
              <p className="text-[14px] text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                We couldn't find any exact matches for "{searchLocation}".
              </p>
              <Link
                href="/host"
                className="inline-block rounded-xl bg-emerald-600 px-6 py-3 text-[13px] font-bold text-white hover:bg-emerald-500 transition-colors shadow-sm cursor-pointer"
              >
                Host a local event
              </Link>
            </div>
          )}
        </div>
      </div>
      
      <section className="bg-emerald-50 dark:bg-slate-900 py-16 px-5 border-t border-emerald-100 dark:border-slate-800 text-center">
        <div className="mx-auto max-w-2xl space-y-4">
          <div className="inline-flex p-3 bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 rounded-full text-xl shadow-sm border border-emerald-100 dark:border-slate-700">
            <HiOutlineUserGroup />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Host a Workout or Cleanup
          </h2>
          <p className="text-[14px] sm:text-[15px] text-slate-600 dark:text-slate-400 leading-relaxed max-w-md mx-auto">
            Passionate about fitness or environmental cleanliness? Partner with SkillForge to list your local group exercise or street sanitation drive for free.
          </p>
          <div className="pt-2">
            <Link 
              href="/host"
              className="inline-block rounded-lg bg-emerald-600 text-white px-6 py-3 text-[14px] font-bold hover:bg-emerald-700 transition-colors shadow-sm cursor-pointer"
            >
              Host an Event Now
            </Link>
          </div>
        </div>
      </section>

      <Footer/>
    </main>
  );
}