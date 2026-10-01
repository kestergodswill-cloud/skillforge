'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Logo from '@/components/Logo';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  HiOutlineMapPin, 
  HiOutlineClock, 
  HiChevronLeft,
  HiOutlineEnvelope,
  HiOutlinePhone,
  HiChevronDown
} from 'react-icons/hi2';

export default function EventDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  const [eventData, setEventData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (!eventId) return;

    const fetchEvent = async () => {
      try {
        const docRef = doc(db, 'programs', eventId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setEventData({ id: docSnap.id, ...docSnap.data() });
        } else {
          setEventData(null);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  const handleBackNavigation = () => {
    if (window.history.length > 2) {
      router.back();
    } else {
      router.push('/skills');
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between transition-colors duration-300">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="relative flex items-center justify-center animate-pulse">
            <div className="absolute inset-0 bg-emerald-500/25 blur-2xl rounded-full scale-[2.0]"></div>
            <Logo size={65} theme="dark" className="relative z-10" />
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  if (!eventData) {
    return (
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between transition-colors duration-300">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center space-y-3">
          <h2 className="text-xl font-bold text-slate-700 dark:text-slate-300">Event Not Found</h2>
          <p className="text-[14px] text-slate-500 dark:text-slate-400">This event may have been removed.</p>
          <button 
            onClick={handleBackNavigation} 
            className="px-5 py-2 mt-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full text-[13px] font-bold hover:bg-emerald-600 transition-colors cursor-pointer"
          >
            Go Back
          </button>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 flex flex-col font-sans transition-colors duration-300">
      <Navbar />

      <div className="flex-1 w-full max-w-2xl mx-auto px-5 pt-4 pb-24">
        <button 
          onClick={handleBackNavigation}
          className="hidden sm:flex items-center gap-1 text-[13px] font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors mb-4 cursor-pointer w-fit"
        >
          <HiChevronLeft className="text-lg" /> Back
        </button>

        <div className="w-full h-48 sm:h-64 relative rounded-2xl overflow-hidden mb-5 bg-slate-100 dark:bg-slate-800">
          <img 
            src={eventData.mediaUrl || eventData.image || "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80"} 
            alt={eventData.title} 
            className="w-full h-full object-cover"
          />
          <div className="absolute top-3 left-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-2 py-1 rounded text-[10px] font-extrabold text-slate-900 dark:text-white shadow-sm uppercase tracking-wider">
            {eventData.category || 'Workshop'}
          </div>
        </div>

        <div className="flex justify-between items-start gap-4 mb-5">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-tight mb-1">
              {eventData.title}
            </h1>
            <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium">
              Hosted by <button onClick={() => router.push(`/host/${eventData.hostId}`)} className="font-bold text-slate-900 dark:text-white hover:text-emerald-600 transition-colors cursor-pointer">{eventData.organizer || 'Community Member'}</button>
            </p>
          </div>
          
          <span className="shrink-0 px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-bold text-[11px] border border-emerald-200 dark:border-emerald-800/50 uppercase tracking-wide">
            {eventData.price === 0 || !eventData.price ? 'Free' : `Paid`}
          </span>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex items-start gap-3">
            <HiOutlineClock className="text-lg text-slate-400 shrink-0 mt-0.5" />
            <span className="text-[14px] font-medium text-slate-700 dark:text-slate-300">
              {eventData.time || eventData.schedule || 'Schedule TBA'}
            </span>
          </div>

          <div className="flex items-start gap-3">
            <HiOutlineMapPin className="text-lg text-slate-400 shrink-0 mt-0.5" />
            <span className="text-[14px] font-medium text-slate-700 dark:text-slate-300">
              {eventData.address || eventData.location || eventData.meetingLink || eventData.venue || 'Virtual / Address not provided'}
              {(eventData.city || eventData.country) && (
                <span className="text-slate-400 dark:text-slate-500 block mt-0.5 text-[13px]">
                  {eventData.city}{eventData.city && eventData.country ? ', ' : ''}{eventData.country}
                </span>
              )}
            </span>
          </div>
        </div>

        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full flex items-center justify-between py-3.5 border-y border-slate-200 dark:border-slate-800 text-[14px] font-bold text-slate-900 dark:text-white cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors px-1"
        >
          <span>Event Details & Contact</span>
          <HiChevronDown className={`text-slate-500 text-lg transition-transform duration-300 ${showDetails ? 'rotate-180' : ''}`} />
        </button>

        {showDetails && (
          <div className="pt-5 pb-2 animate-in slide-in-from-top-2 fade-in duration-200 px-1 space-y-6">
            <div>
              <h3 className="text-[13px] font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2 text-slate-400">About this Event</h3>
              <div className="text-[14px] text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                {eventData.description || 'No detailed description provided for this event.'}
              </div>
            </div>

            <div>
              <h3 className="text-[13px] font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3 text-slate-400">Host Contact Info</h3>
              <div className="space-y-3">
                {eventData.contactEmail ? (
                  <div className="flex items-center gap-3">
                    <HiOutlineEnvelope className="text-lg text-slate-400" />
                    <a href={`mailto:${eventData.contactEmail}`} className="text-[14px] font-medium text-slate-600 dark:text-slate-300 hover:text-emerald-600 transition-colors">
                      {eventData.contactEmail}
                    </a>
                  </div>
                ) : (
                  <p className="text-[13px] text-slate-400 italic">No email provided</p>
                )}
                
                {eventData.contactPhone && (
                  <div className="flex items-center gap-3">
                    <HiOutlinePhone className="text-lg text-slate-400" />
                    <a href={`tel:${eventData.contactPhone}`} className="text-[14px] font-medium text-slate-600 dark:text-slate-300 hover:text-emerald-600 transition-colors">
                      {eventData.contactPhone}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>

      <Footer />
    </main>
  );
}