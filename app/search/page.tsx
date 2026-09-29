
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { HiOutlineMagnifyingGlass, HiOutlineMapPin, HiOutlineUser } from 'react-icons/hi2';

function SearchResults() {
  const searchParams = useSearchParams();
  const rawQuery = searchParams.get('q') || '';
  
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAndFilterData = async () => {
      if (!rawQuery.trim()) {
        setResults([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const programsRef = collection(db, 'programs');
        const snapshot = await getDocs(programsRef);
        
        const allPrograms = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        const searchTerm = rawQuery.toLowerCase();
        
        const filteredResults = allPrograms.filter((item: any) => {
          return JSON.stringify(item).toLowerCase().includes(searchTerm);
        });

        setResults(filteredResults);
      } catch (error) {
        console.error("Error fetching from Firebase:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAndFilterData();
  }, [rawQuery]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 flex flex-col pt-20 sm:pt-24 font-sans transition-colors duration-300">
      <div className="flex-1 max-w-7xl w-full mx-auto px-5 py-8">
        
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-2">
            Search Results
          </h1>
          <p className="text-[15px] text-slate-600 dark:text-slate-400">
            {isLoading ? (
              <span>Searching for "{rawQuery}"...</span>
            ) : (
              <span>Found {results.length} result{results.length === 1 ? '' : 's'} for "{rawQuery}"</span>
            )}
          </p>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 text-emerald-600 dark:text-emerald-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-current"></div>
          </div>
        ) : results.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center max-w-sm mx-auto animate-in fade-in duration-300">
            <HiOutlineMagnifyingGlass className="text-5xl text-slate-300 dark:text-slate-700 mb-4" />
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-2">
              No results for "{rawQuery}"
            </h3>
            <p className="text-[15px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Check the spelling or try a broader term to find what you're looking for.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {results.map((event) => (
              <Link 
                href={`/events/${event.id}`} 
                key={event.id}
                className="group flex flex-col bg-white dark:bg-slate-900 rounded-[1.5rem] border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-md transition-all cursor-pointer"
              >
                <div className="relative aspect-video w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  {event.mediaUrl || event.coverImage ? (
                    <img 
                      src={event.mediaUrl || event.coverImage} 
                      alt={event.title || 'Event Image'}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-700">
                      <HiOutlineMagnifyingGlass className="text-3xl" />
                    </div>
                  )}
                  {event.type && (
                    <div className="absolute top-3 left-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm px-2.5 py-1 rounded-md text-[11px] font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200 border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
                      {event.type}
                    </div>
                  )}
                </div>
                
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="text-[16px] font-bold text-slate-900 dark:text-white leading-snug mb-2 line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {event.title || 'Untitled Event'}
                  </h3>
                  
                  <div className="mt-auto space-y-2 pt-3">
                    {(event.organizer || event.hostName) && (
                      <div className="flex items-center gap-2 text-[13px] text-slate-600 dark:text-slate-400 font-medium">
                        <HiOutlineUser className="text-slate-400 shrink-0" />
                        <span className="truncate">By {event.organizer || event.hostName}</span>
                      </div>
                    )}
                    {(event.location || event.city) && (
                      <div className="flex items-center gap-2 text-[13px] text-slate-600 dark:text-slate-400 font-medium">
                        <HiOutlineMapPin className="text-slate-400 shrink-0" />
                        <span className="truncate">{event.location || event.city}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
      }>
        <SearchResults />
      </Suspense>
      <Footer />
    </>
  );
}