'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, query, where, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { 
  HiOutlineCalendar, 
  HiOutlineTrash, 
  HiOutlinePlus, 
  HiOutlineArrowLeft,
  HiOutlineUserGroup,
  HiOutlineUser,
  HiOutlinePencil,
  HiOutlineXMark,
  HiOutlineEllipsisHorizontal
} from 'react-icons/hi2';

export default function HostDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [myListings, setMyListings] = useState<any[]>([]);
  const [registrations, setRegistrations] = useState<{ [key: string]: any[] }>({});
  const [isLoading, setIsLoading] = useState(true);
  
  const [activeTabApplicants, setActiveTabApplicants] = useState<string | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'live' | 'pending'>('all');
  
  const [editingEvent, setEditingEvent] = useState<any | null>(null);
  const [isProcessingEdit, setIsProcessingEdit] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    schedule: '',
    city: '',
    country: '',
    description: ''
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push('/auth?next=/host');
      } else if (currentUser.isAnonymous) {
        alert("You need to create a free account to use this feature!");
        router.push('/auth?next=/host');
      } else {
        setUser(currentUser);
        setIsChecking(false);

        try {
          const programsRef = collection(db, 'programs');
          const q = query(programsRef, where("hostId", "==", currentUser.uid));
          const snapshot = await getDocs(q);
          
          const listings = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setMyListings(listings);

          if (listings.length > 0) {
            const programIds = listings.map(l => l.id);
            const chunks = [];
            for (let i = 0; i < programIds.length; i += 10) {
              chunks.push(programIds.slice(i, i + 10));
            }
            
            const regsMap: { [key: string]: any[] } = {};
            for (const chunk of chunks) {
              const qRegs = query(collection(db, 'registrations'), where("programId", "in", chunk));
              const regsSnap = await getDocs(qRegs);
              regsSnap.docs.forEach(d => {
                const data = d.data();
                const pId = data.programId;
                if (!regsMap[pId]) regsMap[pId] = [];
                regsMap[pId].push({ id: d.id, ...data });
              });
            }
            setRegistrations(regsMap);
          }

        } catch (error) {
          console.error("Error fetching user listings:", error);
        } finally {
          setIsLoading(false);
        }
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleDeleteListing = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this event?")) return;

    try {
      await deleteDoc(doc(db, 'programs', id));
      setMyListings(prev => prev.filter(item => item.id !== id));
      setOpenDropdownId(null);
    } catch (error) {
      console.error("Error deleting document: ", error);
      alert("Failed to delete listing.");
    }
  };

  const handleUpdateApplicantStatus = async (regId: string, programId: string, newStatus: 'accepted' | 'rejected') => {
    try {
      await updateDoc(doc(db, 'registrations', regId), { status: newStatus });
      setRegistrations(prev => ({
        ...prev,
        [programId]: prev[programId].map(reg => reg.id === regId ? { ...reg, status: newStatus } : reg)
      }));
    } catch (error) {
      console.error("Error updating applicant status:", error);
      alert("Failed to update status.");
    }
  };

  const handleSmartBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/account');
    }
  };

  const openEditModal = (item: any) => {
    setEditForm({
      title: item.title || '',
      schedule: item.schedule || '',
      city: item.city || '',
      country: item.country || '',
      description: item.description || ''
    });
    setEditingEvent(item);
    setOpenDropdownId(null);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;
    
    setIsProcessingEdit(true);
    try {
      const docRef = doc(db, 'programs', editingEvent.id);
      await updateDoc(docRef, editForm);
      
      setMyListings(prev => prev.map(item => item.id === editingEvent.id ? { ...item, ...editForm } : item));
      setEditingEvent(null);
    } catch (error) {
      console.error("Failed to update event:", error);
      alert("Failed to save changes.");
    } finally {
      setIsProcessingEdit(false);
    }
  };

  const totalEvents = myListings.length;
  const pendingEvents = myListings.filter(item => item.status === 'pending' || item.status === 'rejected' || !item.status).length;
  const liveEvents = myListings.filter(item => item.status === 'approved' || item.status === 'live').length;

  const displayedListings = myListings.filter(item => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'live') return item.status === 'approved' || item.status === 'live';
    if (filterStatus === 'pending') return item.status === 'pending' || item.status === 'rejected' || !item.status;
    return true;
  });

  if (isChecking || isLoading) {
    return (
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between transition-colors duration-300">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 flex flex-col justify-between font-sans transition-colors duration-300">
      <Navbar />
      
      <div className="flex-1 w-full max-w-[1400px] mx-auto pb-24 pt-6 sm:pt-8 px-5 sm:px-6">
        
        <div className="max-w-4xl mx-auto mb-6 lg:max-w-none">
          <button 
            onClick={handleSmartBack}
            className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white font-bold text-[13px] mb-3 transition-colors w-fit cursor-pointer"
          >
            <HiOutlineArrowLeft className="text-base" /> Back
          </button>
          
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Host Dashboard</h1>
            <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1">Manage your events and review applicants.</p>
          </div>
        </div>

        <div className="flex gap-6 sm:gap-8 border-b border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar mb-8 max-w-4xl mx-auto lg:max-w-none">
          <button 
            onClick={() => setFilterStatus('all')}
            className={`pb-3 text-[14px] font-bold whitespace-nowrap border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${filterStatus === 'all' ? 'border-slate-900 text-slate-900 dark:border-white dark:text-white' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            All Events 
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold transition-colors ${filterStatus === 'all' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
              {totalEvents}
            </span>
          </button>

          <button 
            onClick={() => setFilterStatus('live')}
            className={`pb-3 text-[14px] font-bold whitespace-nowrap border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${filterStatus === 'live' ? 'border-slate-900 text-slate-900 dark:border-white dark:text-white' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            Live 
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold transition-colors ${filterStatus === 'live' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
              {liveEvents}
            </span>
          </button>

          <button 
            onClick={() => setFilterStatus('pending')}
            className={`pb-3 text-[14px] font-bold whitespace-nowrap border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${filterStatus === 'pending' ? 'border-slate-900 text-slate-900 dark:border-white dark:text-white' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            Pending
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold transition-colors ${filterStatus === 'pending' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
              {pendingEvents}
            </span>
          </button>
        </div>

        <div className="flex items-center justify-between mb-4 max-w-4xl mx-auto lg:max-w-none">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Your Events
          </h2>
          <button
            onClick={() => router.push('/host/create')}
            className="flex items-center gap-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 rounded-xl text-[12px] font-bold hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors shadow-sm cursor-pointer"
          >
            <HiOutlinePlus className="text-base" /> Publish
          </button>
        </div>

        {displayedListings.length === 0 ? (
          <div className="text-center py-16 max-w-sm mx-auto">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
              <HiOutlineCalendar className="text-2xl text-slate-400 dark:text-slate-500" />
            </div>
            <h3 className="text-[15px] font-bold text-slate-900 dark:text-white mb-2">No events found</h3>
            <p className="text-[13px] text-slate-500 dark:text-slate-400 mb-6">
              You don't have any events matching this filter.
            </p>
            <button
              onClick={() => router.push('/host/create')}
              className="inline-block rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-5 py-2.5 text-[13px] font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Publish an Event
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-w-4xl mx-auto lg:max-w-none">
            {displayedListings.map((item) => {
              const status = item.status || 'pending';
              const itemApplicants = registrations[item.id] || [];
              const isViewingApplicants = activeTabApplicants === item.id;

              return (
                <div key={item.id} className="group flex flex-col gap-2.5 p-3 bg-white dark:bg-slate-900 rounded-[1.25rem] border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:border-slate-300 dark:hover:border-slate-700">
                  
                  <div className="relative aspect-video w-full rounded-[0.85rem] overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50">
                    <img 
                      src={item.mediaUrl || "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80"} 
                      alt={item.title} 
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    
                    <div className={`absolute top-2 left-2 px-2 py-1 rounded-md text-[9px] font-extrabold uppercase tracking-wider shadow-sm ${
                      status === 'approved' || status === 'live' ? 'bg-emerald-500 text-white' : 
                      status === 'rejected' ? 'bg-rose-500 text-white' : 'bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-white'
                    }`}>
                      {status === 'approved' || status === 'live' ? 'Live' : status === 'rejected' ? 'Rejected' : 'Pending'}
                    </div>

                    <div className="absolute top-2 right-2 z-30">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenDropdownId(openDropdownId === item.id ? null : item.id);
                        }}
                        className="p-1.5 bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-md shadow-sm hover:scale-105 transition-all cursor-pointer"
                        title="Actions"
                      >
                        <HiOutlineEllipsisHorizontal className="text-base" />
                      </button>

                      {openDropdownId === item.id && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setOpenDropdownId(null)}></div>
                          <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 z-50 animate-in fade-in zoom-in-95">
                            <button
                              onClick={() => openEditModal(item)}
                              className="w-full text-left px-4 py-2 text-[12px] font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-2 cursor-pointer"
                            >
                              <HiOutlinePencil className="text-sm" /> Edit Event
                            </button>
                            <button
                              onClick={() => handleDeleteListing(item.id)}
                              className="w-full text-left px-4 py-2 text-[12px] font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 flex items-center gap-2 cursor-pointer"
                            >
                              <HiOutlineTrash className="text-sm" /> Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col px-1">
                    <div className="flex justify-between items-start gap-2 mb-0.5 mt-1">
                      <h3 className="text-[14px] font-bold text-slate-900 dark:text-white leading-tight truncate">
                        {item.title}
                      </h3>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 shrink-0 mt-0.5">
                        {item.type}
                      </span>
                    </div>

                    <p className="text-[12px] font-medium text-slate-500 dark:text-slate-400 truncate">
                      {item.schedule || 'Flexible dates'}
                    </p>
                    <p className="text-[12px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {item.city || 'Location'}, {item.country || ''}
                    </p>

                    <button 
                      onClick={() => setActiveTabApplicants(isViewingApplicants ? null : item.id)} 
                      className="mt-3 w-full flex items-center justify-center gap-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 px-3 py-2.5 text-[12px] font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 hover:text-slate-900 dark:hover:bg-slate-700 dark:hover:text-white transition-colors cursor-pointer"
                    >
                      <HiOutlineUserGroup className="text-sm" /> 
                      {isViewingApplicants ? 'Hide Applicants' : `Review Applicants (${itemApplicants.length})`}
                    </button>

                    {isViewingApplicants && (
                      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                        {itemApplicants.length === 0 ? (
                          <p className="text-[12px] text-slate-500 dark:text-slate-400 text-center py-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg">No applicants yet.</p>
                        ) : (
                          <div className="flex flex-col gap-2">
                            {itemApplicants.map((applicant) => (
                              <div key={applicant.id} className="flex flex-col gap-2 p-2.5 rounded-[0.75rem] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-600">
                                      <HiOutlineUser className="text-sm text-slate-400" />
                                    </div>
                                    <div>
                                      <Link href={`/profile/${applicant.userId}`} className="text-[12px] font-bold text-slate-900 dark:text-white hover:text-emerald-600 transition-colors block leading-tight">
                                        {applicant.fullName}
                                      </Link>
                                      <a href={`tel:${applicant.phone}`} className="text-[11px] font-medium text-slate-500 dark:text-slate-400 hover:text-emerald-600 transition-colors">
                                        {applicant.phone}
                                      </a>
                                    </div>
                                  </div>
                                  
                                  <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                                    applicant.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' : 
                                    applicant.status === 'rejected' ? 'bg-rose-100 text-rose-700' : 
                                    'bg-amber-100 text-amber-700'
                                  }`}>
                                    {applicant.status || 'Pending'}
                                  </span>
                                </div>

                                {applicant.note && (
                                  <div className="px-2 py-1.5 bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-400 italic">
                                    "{applicant.note}"
                                  </div>
                                )}

                                <div className="flex items-center gap-1.5 pt-1 w-full">
                                  {(!applicant.status || applicant.status === 'pending') ? (
                                    <>
                                      <button onClick={() => handleUpdateApplicantStatus(applicant.id, item.id, 'accepted')} className="flex-1 px-2 py-1.5 rounded-md bg-emerald-600 text-white text-[11px] font-bold hover:bg-emerald-500 transition-colors cursor-pointer">
                                        Accept
                                      </button>
                                      <button onClick={() => handleUpdateApplicantStatus(applicant.id, item.id, 'rejected')} className="flex-1 px-2 py-1.5 rounded-md bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 text-[11px] font-bold hover:bg-rose-500 hover:text-white transition-colors cursor-pointer">
                                        Reject
                                      </button>
                                    </>
                                  ) : (
                                    <div className="flex-1 text-center py-1 text-[11px] font-bold text-slate-400 bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800">
                                      Resolved
                                    </div>
                                  )}
                                </div>

                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {editingEvent && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm p-0 sm:p-4 transition-opacity font-sans">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-t-[2rem] sm:rounded-3xl shadow-2xl flex flex-col max-h-[90vh] sm:max-h-[85vh] animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-200 border border-slate-100 dark:border-slate-800">
            
            <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mt-3 sm:hidden shrink-0" />
            
            <div className="px-6 py-4 flex justify-between items-center border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div>
                <h3 className="text-[18px] font-extrabold text-slate-900 dark:text-white">Edit Event</h3>
                <p className="text-[12px] font-medium text-slate-500 mt-0.5">Quickly update your listing details.</p>
              </div>
              <button 
                onClick={() => setEditingEvent(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 bg-slate-50 dark:bg-slate-800 rounded-full transition-colors cursor-pointer"
              >
                <HiOutlineXMark className="text-xl" />
              </button>
            </div>
            
            <div className="overflow-y-auto px-6 py-5">
              <form id="editForm" onSubmit={handleEditSubmit} className="space-y-4">
                
                <div>
                  <label className="block text-[13px] font-bold text-slate-800 dark:text-slate-200 mb-1.5">Event Title</label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                    required
                    className="w-full bg-slate-100 dark:bg-slate-800 border border-transparent px-4 py-3 rounded-xl text-[14px] font-medium text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-slate-800 dark:text-slate-200 mb-1.5">Schedule / Time</label>
                  <input
                    type="text"
                    value={editForm.schedule}
                    onChange={(e) => setEditForm({...editForm, schedule: e.target.value})}
                    required
                    className="w-full bg-slate-100 dark:bg-slate-800 border border-transparent px-4 py-3 rounded-xl text-[14px] font-medium text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 outline-none transition-all"
                  />
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-[13px] font-bold text-slate-800 dark:text-slate-200 mb-1.5">City</label>
                    <input
                      type="text"
                      value={editForm.city}
                      onChange={(e) => setEditForm({...editForm, city: e.target.value})}
                      required
                      className="w-full bg-slate-100 dark:bg-slate-800 border border-transparent px-4 py-3 rounded-xl text-[14px] font-medium text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 outline-none transition-all"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[13px] font-bold text-slate-800 dark:text-slate-200 mb-1.5">Country</label>
                    <input
                      type="text"
                      value={editForm.country}
                      onChange={(e) => setEditForm({...editForm, country: e.target.value})}
                      required
                      className="w-full bg-slate-100 dark:bg-slate-800 border border-transparent px-4 py-3 rounded-xl text-[14px] font-medium text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-slate-800 dark:text-slate-200 mb-1.5">Description</label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                    required
                    rows={4}
                    className="w-full bg-slate-100 dark:bg-slate-800 border border-transparent px-4 py-3 rounded-xl text-[14px] font-medium text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 outline-none resize-none transition-all"
                  />
                </div>

              </form>
            </div>

            <div className="shrink-0 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 px-6 py-4 flex justify-end gap-3 rounded-b-3xl">
              <button 
                onClick={() => setEditingEvent(null)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-[13px] font-bold text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="submit"
                form="editForm"
                disabled={isProcessingEdit}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-[13px] font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors disabled:opacity-50 shadow-sm cursor-pointer"
              >
                {isProcessingEdit ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
            
          </div>
        </div>
      )}

      <Footer />
    </main>
  );
}