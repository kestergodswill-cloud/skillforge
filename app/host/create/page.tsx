'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { HiOutlineDocumentPlus, HiOutlinePhoto, HiOutlineMapPin, HiOutlineInformationCircle, HiOutlineCheckBadge, 
       HiOutlineUser } from 'react-icons/hi2';

export default function HostPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [listingType, setListingType] = useState('workshop');
  const [user, setUser] = useState<User | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push('/auth?next=/host');
      } else {
        setUser(currentUser);
        setIsChecking(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    setTimeout(() => {
      alert("Success! Your " + listingType + " has been submitted for review.");
      setIsSubmitting(false);
    }, 1500);
  };

  if (isChecking) {
    return (
      <main className="min-h-screen bg-slate-50 flex flex-col justify-between">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse h-10 w-32 bg-slate-200 rounded-full" />
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      <div>
        <Navbar/>

        {/* Header Section */}
        <section className="bg-slate-900 text-white py-16 px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.15),transparent_50%)]"></div>
          <div className="mx-auto max-w-3xl text-center space-y-4 relative z-10">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold tracking-widest text-emerald-400 uppercase bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-800">
              <HiOutlineDocumentPlus className="text-sm"/> Partner With Us
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
              Publish a Community Event
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Empower your neighborhood by hosting a free workshop, organizing a cleanup, or leading a fitness group. 
              Fill out the details below to list it on SkillForge.
            </p>
          </div>
        </section>

        {/* Form Section */}
        <section className="mx-auto max-w-3xl px-6 py-12">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <form onSubmit={handleSubmit} className="p-6 sm:p-10 space-y-8">
              
              {/* Event Type Selection */}
              <div className="space-y-3 pb-6 border-b border-slate-100">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">What are you organizing?</label>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  {[
                    { id: 'workshop', label: 'Technical Workshop' },
                    { id: 'cleanup', label: 'Eco / Cleanup Drive' },
                    { id: 'health', label: 'Health & Safety Class' },
                    { id: 'workout', label: 'Group Workout' }
                  ].map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setListingType(type.id)}
                      className={`py-3 px-4 rounded-xl text-xs font-bold border transition-all ${
                        listingType === type.id 
                          ? 'bg-slate-900 text-white border-slate-900 shadow-md' 
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-emerald-600 font-bold border-b border-slate-100 pb-2">
                  <HiOutlineInformationCircle className="text-lg" />
                  <h3>Basic Information</h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      {listingType === 'workshop' ? 'Program Title' : 'Event Title'}
                    </label>
                    <input type="text" required 
                      placeholder={
                        listingType === 'workshop' ? "e.g., Advanced Tailoring & Fashion Design" :
                        listingType === 'cleanup' ? "e.g., Saturday Morning Market Cleanup" :
                        listingType === 'workout' ? "e.g., Sunrise Jogging Club" :
                        "e.g., Basic First-Aid & CPR Training"
                      } 
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium
                       text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all" 
                    />
                  </div>
                  
                  {listingType === 'workshop' && (
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Difficulty Level</label>
                      <select required className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 
                              text-sm font-medium text-slate-900 outline-none focus:border-emerald-500 focus:ring-2
                              focus:ring-emerald-500/20 transition-all">
                        <option value="beginner">Beginner Friendly</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                        <option value="all">All Levels Welcome</option>
                      </select>
                    </div>
                  )}

                  {(listingType === 'cleanup' || listingType === 'workout') && (
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Who can join?</label>
                      <input type="text" required placeholder="e.g., Open to everyone, Kid-friendly, etc." className="w-full 
                      rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none
                       focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all" />
                    </div>
                  )}
                </div>
              </div>

             <div className="space-y-4">
                <div className="flex items-center gap-2 text-emerald-600 font-bold border-b border-slate-100 pb-2">
                  <HiOutlineMapPin className="text-lg" />
                  <h3>Location & Schedule</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Country</label>
                    <input type="text" required placeholder="e.g., Nigeria" className="w-full rounded-xl border border-slate-200
                         bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:border-emerald-500" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">State / Region</label>
                    <input type="text" required placeholder="e.g., Delta State" className="w-full rounded-xl border
                          border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:border-emerald-500" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">City / Neighborhood</label>
                    <input type="text" required placeholder="e.g., Agbor" className="w-full rounded-xl border border-slate-200
                     bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:border-emerald-500" />
                  </div>
                  
                  <div className="space-y-1.5 sm:col-span-3">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Specific Address or Landmark</label>
                    <input type="text" required placeholder="e.g., Opposite the Central Mosque, or 12 Market Road" 
                           className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm 
                           font-medium text-slate-900 outline-none focus:border-emerald-500 transition-all" />
                  </div>

                  <div className="space-y-1.5 sm:col-span-3">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      {listingType === 'workshop' ? 'Duration & Schedule' : 'Date & Time'}
                    </label>
                    <input type="text" required 
                      placeholder={
                        listingType === 'workshop' ? "e.g., 4 Weeks (Saturdays 10am - 2pm)" :
                        "e.g., Every Saturday at 7:00 AM"
                      } 
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium
                       text-slate-900 outline-none focus:border-emerald-500" 
                    />
                  </div>
                </div>
             </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-emerald-600 font-bold border-b border-slate-100 pb-2">
                  <HiOutlinePhoto className="text-lg" />
                  <h3>Details & Media</h3>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Description</label>
                    <textarea required rows={3} 
                      placeholder={
                        listingType === 'cleanup' ? "Explain where you are meeting and what cleaning supplies to bring..." :
                        "Explain what participants will do or learn..."
                      } 
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:border-emerald-500 resize-none"
                    ></textarea>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Upload Cover Image</label>
                    <div className="mt-1 flex justify-center rounded-2xl border border-dashed border-slate-300 px-6 py-10
                         hover:bg-slate-50 transition-colors cursor-pointer relative">
                      <div className="text-center">
                        <HiOutlinePhoto className="mx-auto h-12 w-12 text-slate-300" aria-hidden="true" />
                        <div className="mt-4 flex text-sm leading-6 text-slate-600 justify-center">
                          <label htmlFor="file-upload" className="relative cursor-pointer rounded-md bg-white font-semibold
                               text-emerald-600 focus-within:outline-none hover:text-emerald-500">
                            <span>Upload a file</span>
                            <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/png, 
                                   image/jpeg, image/jpg" />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-slate-500">PNG, JPG up to 5MB</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-emerald-600 font-bold border-b border-slate-100 pb-2">
                  <HiOutlineUser className="text-lg" />
                  <h3>Organizer Details</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Host / Organization Name</label>
                    <input type="text" required placeholder="e.g., SkillForge Wellness Club or John Doe" className="w-full 
                          rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 
                          outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all" />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Contact Email</label>
                    <input type="email" required placeholder="e.g., hello@example.com" className="w-full rounded-xl border
                          border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none
                           focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all" />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Phone / WhatsApp (Optional)</label>
                    <input type="tel" placeholder="e.g., +234 800 000 0000" className="w-full rounded-xl border border-slate-200
                          bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none
                           focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all" />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
                <p className="text-[11px] text-slate-500 flex items-center gap-1 text-center sm:text-left">
                  <HiOutlineCheckBadge className="text-emerald-600 shrink-0" /> All submissions are manually reviewed.
                </p>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto rounded-full bg-emerald-600 px-8 py-3.5 text-sm font-bold text-white 
                  transition-all hover:bg-emerald-500 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed 
                  shadow-md shadow-emerald-900/20 whitespace-nowrap">
                  {isSubmitting ? 'Submitting...' : 'Publish Listing'}
                </button>
              </div>

            </form>
          </div>
        </section>
      </div>

      <Footer/>
    </main>
  );
}
