
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { db, auth } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { 
  HiOutlineUsers, 
  HiOutlineSparkles, 
  HiOutlineTrash, 
  HiOutlineCheckBadge, 
  HiOutlineShieldCheck,
  HiOutlineXMark,
  HiOutlineDocumentText,
  HiOutlineFlag,
  HiOutlineCog6Tooth,
  HiOutlineCheck,
  HiOutlineEye,
  HiOutlineIdentification,
  HiOutlineEllipsisHorizontal,
  HiOutlineEnvelope,
  HiOutlineXCircle,
  HiOutlineChatBubbleLeft,
  HiOutlinePhone,
  HiOutlineDevicePhoneMobile
} from 'react-icons/hi2';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState<'users' | 'events' | 'reports' | 'settings'>('users');
  
  const [usersList, setUsersList] = useState<any[]>([]);
  const [eventsList, setEventsList] = useState<any[]>([]);
  const [reportsList, setReportsList] = useState<any[]>([]);
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    requireHostVerification: true,
    allowNewRegistrations: true
  });
  
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  
  const [selectedEventToView, setSelectedEventToView] = useState<any | null>(null);
  const [selectedUserToView, setSelectedUserToView] = useState<any | null>(null);
  const [showEventDropdown, setShowEventDropdown] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/auth');
        return;
      }
      
      try {
        const idTokenResult = await user.getIdTokenResult(true);
        if (idTokenResult.claims.admin) {
          setCurrentUser(user);
          setIsAdmin(true);
          fetchAllData();
        } else {
          router.push('/'); 
        }
      } catch (error) {
        console.error("Admin verification failed:", error);
        router.push('/');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const fetchAllData = async () => {
    try {
      const usersRef = collection(db, 'users');
      const userSnapshot = await getDocs(usersRef);
      const fetchedUsers = userSnapshot.docs.map(document => ({
        id: document.id,
        ...document.data()
      }));
      fetchedUsers.sort((a: any, b: any) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
      setUsersList(fetchedUsers);

      const eventsRef = collection(db, 'programs');
      const eventSnapshot = await getDocs(eventsRef);
      const fetchedEvents = eventSnapshot.docs.map(document => ({
        id: document.id,
        ...document.data()
      }));
      fetchedEvents.sort((a: any, b: any) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
      setEventsList(fetchedEvents);

      const reportsRef = collection(db, 'reports');
      const reportsSnapshot = await getDocs(reportsRef);
      const fetchedReports = reportsSnapshot.docs.map(document => ({
        id: document.id,
        ...document.data()
      }));
      fetchedReports.sort((a: any, b: any) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
      setReportsList(fetchedReports);

      const settingsRef = doc(db, 'settings', 'global');
      const settingsSnap = await getDoc(settingsRef);
      if (settingsSnap.exists()) {
        setSettings(settingsSnap.data() as any);
      }

      setIsLoading(false);
    } catch (error) {
      console.error("Failed to fetch admin data:", error);
      setIsLoading(false);
    }
  };

  const toggleVerification = async (userId: string, currentStatus: boolean) => {
    setIsProcessing(userId);
    try {
      await updateDoc(doc(db, 'users', userId), { 
        isVerified: !currentStatus,
        verificationStatus: !currentStatus ? 'approved' : 'revoked'
      });
      
      setUsersList(prev => prev.map(u => u.id === userId ? { ...u, isVerified: !currentStatus, verificationStatus: !currentStatus ? 'approved' : 'revoked' } : u));
      
      if (selectedUserToView && selectedUserToView.id === userId) {
        setSelectedUserToView((prev: any) => ({ ...prev, isVerified: !currentStatus, verificationStatus: !currentStatus ? 'approved' : 'revoked' }));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(null);
    }
  };

  const updateEventStatus = async (eventId: string, newStatus: string) => {
    setIsProcessing(eventId);
    try {
      await updateDoc(doc(db, 'programs', eventId), { status: newStatus });
      setEventsList(prev => prev.map(e => e.id === eventId ? { ...e, status: newStatus } : e));
      if (selectedEventToView && selectedEventToView.id === eventId) {
        setSelectedEventToView((prev: any) => ({ ...prev, status: newStatus }));
      }
      setShowEventDropdown(false);
    } catch (error) {
      console.error("Failed to update event status:", error);
    } finally {
      setIsProcessing(null);
    }
  };

  const deleteUserRecord = async (userId: string) => {
    if (!window.confirm("Are you sure you want to delete this user's profile data?")) return;
    setIsProcessing(userId);
    try {
      await deleteDoc(doc(db, 'users', userId));
      setUsersList(prev => prev.filter(u => u.id !== userId));
      if (selectedUserToView && selectedUserToView.id === userId) {
        setSelectedUserToView(null);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(null);
    }
  };

  const deleteEventRecord = async (eventId: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this event?")) return;
    setIsProcessing(eventId);
    try {
      await deleteDoc(doc(db, 'programs', eventId));
      setEventsList(prev => prev.filter(e => e.id !== eventId));
      if (selectedEventToView && selectedEventToView.id === eventId) {
        setSelectedEventToView(null);
      }
      setShowEventDropdown(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(null);
    }
  };

  const deleteReportRecord = async (reportId: string) => {
    setIsProcessing(reportId);
    try {
      await deleteDoc(doc(db, 'reports', reportId));
      setReportsList(prev => prev.filter(r => r.id !== reportId));
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(null);
    }
  };

  const togglePlatformSetting = async (key: keyof typeof settings) => {
    setIsProcessing('settings');
    const newValue = !settings[key];
    try {
      await setDoc(doc(db, 'settings', 'global'), { [key]: newValue }, { merge: true });
      setSettings(prev => ({ ...prev, [key]: newValue }));
    } catch (error) {
      console.error("Failed to update settings:", error);
    } finally {
      setIsProcessing(null);
    }
  };

  if (isLoading) {
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

  if (!isAdmin) return null;

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 flex flex-col justify-between transition-colors duration-300 relative">
      <div>
        <Navbar />
        
        <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8 relative mt-16">
          
          <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 transition-colors">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold tracking-widest text-[10px] uppercase mb-1">
                <HiOutlineShieldCheck className="text-sm" />
                System Admin
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Command Center</h1>
            </div>
            
            <Link 
              href="/host/create"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-emerald-600 dark:hover:bg-emerald-500 dark:hover:text-white px-5 py-3 rounded-xl font-semibold transition-colors text-sm shadow-sm cursor-pointer"
            >
              <HiOutlineSparkles className="text-lg" />
              Publish Event
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <button 
              onClick={() => setActiveTab('users')}
              className={`text-left p-4 sm:p-5 rounded-2xl border shadow-sm transition-all active:scale-95 group cursor-pointer ${activeTab === 'users' ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 ring-1 ring-emerald-300' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-500'}`}
            >
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center mb-3 sm:mb-4 transition-colors ${activeTab === 'users' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white'}`}>
                <HiOutlineUsers className="text-lg sm:text-xl" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">Users</h3>
              <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1">{usersList.length} members</p>
            </button>

            <button 
              onClick={() => setActiveTab('events')}
              className={`text-left p-4 sm:p-5 rounded-2xl border shadow-sm transition-all active:scale-95 group cursor-pointer ${activeTab === 'events' ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-800 ring-1 ring-blue-300' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-500'}`}
            >
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center mb-3 sm:mb-4 transition-colors ${activeTab === 'events' ? 'bg-blue-600 text-white' : 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white'}`}>
                <HiOutlineDocumentText className="text-lg sm:text-xl" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">Events</h3>
              <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1">{eventsList.length} total</p>
            </button>

            <button 
              onClick={() => setActiveTab('reports')}
              className={`text-left p-4 sm:p-5 rounded-2xl border shadow-sm transition-all active:scale-95 group cursor-pointer ${activeTab === 'reports' ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 ring-1 ring-rose-300' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-rose-500'}`}
            >
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center mb-3 sm:mb-4 transition-colors ${activeTab === 'reports' ? 'bg-rose-600 text-white' : 'bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 group-hover:bg-rose-600 group-hover:text-white'}`}>
                <HiOutlineFlag className="text-lg sm:text-xl" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">Reports</h3>
              <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1">{reportsList.length} flagged</p>
            </button>

            <button 
              onClick={() => setActiveTab('settings')}
              className={`text-left p-4 sm:p-5 rounded-2xl border shadow-sm transition-all active:scale-95 group cursor-pointer ${activeTab === 'settings' ? 'bg-slate-100 dark:bg-slate-800 border-slate-400 dark:border-slate-600 ring-1 ring-slate-400' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-700'}`}
            >
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center mb-3 sm:mb-4 transition-colors ${activeTab === 'settings' ? 'bg-slate-700 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 group-hover:bg-slate-700 group-hover:text-white'}`}>
                <HiOutlineCog6Tooth className="text-lg sm:text-xl" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">Settings</h3>
              <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1">System config</p>
            </button>
          </div>

          <div className="mt-2">

            {activeTab === 'users' && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300 transition-colors">
                <div className="px-5 sm:px-6 py-4 sm:py-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">Community Roster</h2>
                    <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">{usersList.filter(u => u.isVerified).length} verified • {usersList.length} total users</p>
                  </div>
                </div>

                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50 dark:bg-slate-800/50 text-[10px] uppercase tracking-wider font-bold text-slate-400 border-b border-slate-100 dark:border-slate-800">
                        <th className="px-6 py-4">Member</th>
                        <th className="px-6 py-4">Contact</th>
                        <th className="px-6 py-4 text-center">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                      {usersList.map((userItem) => (
                        <tr key={userItem.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {userItem.photoURL ? (
                                <img src={userItem.photoURL} alt={userItem.name} className="w-9 h-9 rounded-full object-cover border border-slate-100 dark:border-slate-800 shrink-0" />
                              ) : (
                                <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold shrink-0 text-xs">
                                  {userItem.name?.charAt(0) || 'U'}
                                </div>
                              )}
                              <div>
                                <Link href={`/profile/${userItem.id}`} className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2 hover:text-emerald-600 transition-colors">
                                  {userItem.name || 'Unnamed Member'}
                                  {userItem.isAdmin && <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-widest">Admin</span>}
                                </Link>
                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[200px]">{userItem.bio || 'No bio provided'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm text-slate-700 dark:text-slate-300">{userItem.email || 'No email'}</p>
                            <p className="text-xs text-slate-400">{userItem.location || 'Unknown location'}</p>
                          </td>
                          <td className="px-6 py-4 text-center">
                            {userItem.verificationStatus === 'pending' && !userItem.isVerified ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                                <HiOutlineEye className="text-xs" /> Pending Review
                              </span>
                            ) : (
                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${userItem.isVerified ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' : 'bg-slate-50 dark:bg-slate-800 text-slate-400'}`}>
                                {userItem.isVerified ? <HiOutlineCheckBadge className="text-xs" /> : <HiOutlineXMark className="text-xs" />}
                                {userItem.isVerified ? 'Verified' : 'Unverified'}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setSelectedUserToView(userItem)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors cursor-pointer"
                                title="View User Details"
                              >
                                <HiOutlineEye className="text-base" />
                              </button>
                              
                              {!userItem.isAdmin && (
                                <button
                                  onClick={() => deleteUserRecord(userItem.id)}
                                  disabled={isProcessing === userItem.id}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors disabled:opacity-50 cursor-pointer"
                                >
                                  <HiOutlineTrash className="text-base" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="md:hidden divide-y divide-slate-50 dark:divide-slate-800">
                  {usersList.map((userItem) => (
                    <div key={userItem.id} className="p-4 sm:p-5 bg-white dark:bg-slate-900 flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                          {userItem.photoURL ? (
                            <img src={userItem.photoURL} alt={userItem.name} className="w-10 h-10 rounded-full object-cover border border-slate-100 dark:border-slate-800 shrink-0" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold shrink-0 text-sm">
                              {userItem.name?.charAt(0) || 'U'}
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <Link href={`/profile/${userItem.id}`} className="text-sm font-bold text-slate-900 dark:text-white truncate hover:text-emerald-600 transition-colors">
                                {userItem.name || 'Unnamed Member'}
                              </Link>
                              {userItem.isAdmin && (
                                <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[8px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider shrink-0">Admin</span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">{userItem.email}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-1 gap-2">
                        {userItem.verificationStatus === 'pending' && !userItem.isVerified ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                            Pending Review
                          </span>
                        ) : (
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider ${userItem.isVerified ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                            {userItem.isVerified ? <HiOutlineCheckBadge className="text-sm" /> : null}
                            {userItem.isVerified ? 'Verified Host' : 'Unverified'}
                          </span>
                        )}

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setSelectedUserToView(userItem)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors bg-slate-50 dark:bg-slate-800 rounded-lg cursor-pointer"
                          >
                            <HiOutlineEye className="text-lg" />
                          </button>

                          {!userItem.isAdmin && (
                            <button
                              onClick={() => deleteUserRecord(userItem.id)}
                              disabled={isProcessing === userItem.id}
                              className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors disabled:opacity-50 bg-slate-50 dark:bg-slate-800 rounded-lg cursor-pointer"
                            >
                              <HiOutlineTrash className="text-lg" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'events' && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300 transition-colors">
                <div className="px-5 sm:px-6 py-4 sm:py-5 border-b border-slate-100 dark:border-slate-800">
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">Platform Events & Listings</h2>
                  <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">{eventsList.length} total events</p>
                </div>

                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50 dark:bg-slate-800/50 text-[10px] uppercase tracking-wider font-bold text-slate-400 border-b border-slate-100 dark:border-slate-800">
                        <th className="px-6 py-4">Event Title</th>
                        <th className="px-6 py-4">Host</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                      {eventsList.length === 0 && (
                        <tr><td colSpan={4} className="text-center py-8 text-sm text-slate-400">No events found.</td></tr>
                      )}
                      {eventsList.map((eventItem) => {
                        const status = eventItem.status || 'pending';
                        return (
                          <tr key={eventItem.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                            <td className="px-6 py-4">
                              <p className="text-sm font-bold text-slate-900 dark:text-white">{eventItem.title || 'Untitled Event'}</p>
                              <p className="text-[10px] uppercase tracking-wider font-bold text-emerald-600 dark:text-emerald-400 mt-1">{eventItem.type || 'Event'}</p>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{eventItem.organizer || 'Unknown Host'}</p>
                              <p className="text-xs text-slate-400">{eventItem.location || eventItem.city || 'Location TBA'}</p>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                                status === 'approved' || status === 'live' 
                                  ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' 
                                  : status === 'rejected'
                                  ? 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                                  : 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                              }`}>
                                {status === 'approved' || status === 'live' ? 'Live' : status === 'rejected' ? 'Rejected' : 'Pending Review'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => { setSelectedEventToView(eventItem); setShowEventDropdown(false); }}
                                  className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-emerald-600 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold"
                                  title="Review Event"
                                >
                                  <HiOutlineEye className="text-base" /> Review & Manage
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="md:hidden divide-y divide-slate-50 dark:divide-slate-800">
                  {eventsList.length === 0 && (
                    <div className="text-center py-8 text-sm text-slate-400">No events found.</div>
                  )}
                  {eventsList.map((eventItem) => {
                    const status = eventItem.status || 'pending';
                    return (
                      <div key={eventItem.id} className="p-4 sm:p-5 bg-white dark:bg-slate-900 flex flex-col gap-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-[9px] uppercase tracking-wider font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">{eventItem.type || 'Event'}</span>
                            <p className="text-sm font-bold text-slate-900 dark:text-white mt-1.5">{eventItem.title || 'Untitled Event'}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Host: {eventItem.organizer || 'Unknown'}</p>
                          </div>
                          
                          <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                            status === 'approved' || status === 'live' 
                              ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' 
                              : status === 'rejected'
                              ? 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                              : 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                          }`}>
                            {status === 'approved' || status === 'live' ? 'Live' : status === 'rejected' ? 'Rejected' : 'Pending'}
                          </span>
                        </div>

                        <div className="flex items-center justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
                          <button
                            onClick={() => { setSelectedEventToView(eventItem); setShowEventDropdown(false); }}
                            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 dark:bg-slate-800 text-white hover:bg-emerald-600 transition-colors cursor-pointer flex items-center gap-2"
                          >
                            <HiOutlineEye className="text-base" /> Review Event
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'reports' && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300 transition-colors">
                <div className="px-5 sm:px-6 py-4 sm:py-5 border-b border-slate-100 dark:border-slate-800">
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">Moderation Reports</h2>
                  <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">Review user-submitted flags and issues</p>
                </div>

                <div className="divide-y divide-slate-50 dark:divide-slate-800">
                  {reportsList.length === 0 && (
                    <div className="text-center py-12 text-sm text-slate-400">No active reports. All clear!</div>
                  )}
                  {reportsList.map((report) => (
                    <div key={report.id} className="p-4 sm:p-6 bg-white dark:bg-slate-900 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <span className="text-[9px] uppercase tracking-wider font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded border border-rose-100 dark:border-rose-900">{report.type || 'Flagged Content'}</span>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{report.title || 'Reported Issue'}</p>
                        <p className="text-xs text-slate-600 dark:text-slate-300">{report.description || 'No description provided.'}</p>
                        <p className="text-[10px] text-slate-400">Reported by: {report.reporterEmail || 'Anonymous'}</p>
                      </div>
                      <button
                        onClick={() => deleteReportRecord(report.id)}
                        disabled={isProcessing === report.id}
                        className="px-4 py-2 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center gap-2 w-full sm:w-auto cursor-pointer"
                      >
                        <HiOutlineCheck className="text-lg" />
                        Resolve & Dismiss
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300 transition-colors">
                <div className="px-5 sm:px-6 py-4 sm:py-5 border-b border-slate-100 dark:border-slate-800">
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">Platform Settings</h2>
                  <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">Control global application behavior</p>
                </div>
                <div className="divide-y divide-slate-50 dark:divide-slate-800 p-2 sm:p-4">
                  
                  <div className="flex items-center justify-between p-3 sm:p-4">
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">Require Host Verification</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-sm">Only verified users can publish global platform events.</p>
                    </div>
                    <button 
                      onClick={() => togglePlatformSetting('requireHostVerification')}
                      disabled={isProcessing === 'settings'}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${settings.requireHostVerification ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.requireHostVerification ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 sm:p-4">
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">Allow New Registrations</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-sm">Toggle whether new users can create accounts on the platform.</p>
                    </div>
                    <button 
                      onClick={() => togglePlatformSetting('allowNewRegistrations')}
                      disabled={isProcessing === 'settings'}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${settings.allowNewRegistrations ? 'bg-blue-500' : 'bg-slate-200 dark:bg-slate-700'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.allowNewRegistrations ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 sm:p-4">
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">Maintenance Mode</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-sm">Disable access for non-admin users while updating the platform.</p>
                    </div>
                    <button 
                      onClick={() => togglePlatformSetting('maintenanceMode')}
                      disabled={isProcessing === 'settings'}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${settings.maintenanceMode ? 'bg-rose-500' : 'bg-slate-200 dark:bg-slate-700'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.maintenanceMode ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>

                </div>
              </div>
            )}

          </div>
        </div>

        {selectedUserToView && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-3 sm:p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
              
              <div className="shrink-0 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between rounded-t-2xl sm:rounded-t-3xl">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">User Profile</h3>
                <button onClick={() => setSelectedUserToView(null)} className="p-1.5 sm:p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer">
                  <HiOutlineXMark className="text-lg sm:text-xl" />
                </button>
              </div>
              
              <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto">
                <div className="flex items-center gap-4">
                  {selectedUserToView.photoURL ? (
                    <img src={selectedUserToView.photoURL} alt="Profile" className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-slate-100 dark:border-slate-800" />
                  ) : (
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-2xl sm:text-3xl">
                      {selectedUserToView.name?.charAt(0) || 'U'}
                    </div>
                  )}
                  <div>
                    <Link href={`/profile/${selectedUserToView.id}`} className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white hover:text-emerald-600 transition-colors">
                      {selectedUserToView.name || 'Unnamed Member'}
                    </Link>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{selectedUserToView.email}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                       <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${selectedUserToView.isVerified ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' : 'bg-slate-50 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700'}`}>
                         {selectedUserToView.isVerified ? <HiOutlineCheckBadge className="text-xs" /> : <HiOutlineXMark className="text-xs" />}
                         {selectedUserToView.isVerified ? 'Verified Host' : 'Unverified'}
                       </span>
                       {selectedUserToView.isAdmin && <span className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-widest">Admin</span>}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div className="sm:col-span-2">
                    <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5 sm:mb-1">Bio</p>
                    <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">{selectedUserToView.bio || 'No bio provided'}</p>
                  </div>
                  <div>
                    <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5 sm:mb-1">Location</p>
                    <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">{selectedUserToView.location || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5 sm:mb-1">Phone Number</p>
                    <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">{selectedUserToView.phoneNumber || 'Not specified'}</p>
                  </div>
                </div>

                <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Host Application Data</h4>
                  
                  {(selectedUserToView.verificationIdUrl || selectedUserToView.verificationSelfieUrl) ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {selectedUserToView.verificationIdUrl && (
                        <div className="space-y-1.5">
                          <p className="text-[10px] font-bold text-slate-500 uppercase">Government ID</p>
                          <a href={selectedUserToView.verificationIdUrl} target="_blank" rel="noopener noreferrer" className="block w-full h-32 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden hover:opacity-90 transition-opacity">
                            <img src={selectedUserToView.verificationIdUrl} alt="ID Document" className="w-full h-full object-cover" />
                          </a>
                        </div>
                      )}
                      {selectedUserToView.verificationSelfieUrl && (
                        <div className="space-y-1.5">
                          <p className="text-[10px] font-bold text-slate-500 uppercase">Selfie Match</p>
                          <a href={selectedUserToView.verificationSelfieUrl} target="_blank" rel="noopener noreferrer" className="block w-full h-32 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden hover:opacity-90 transition-opacity">
                            <img src={selectedUserToView.verificationSelfieUrl} alt="Selfie" className="w-full h-full object-cover" />
                          </a>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl p-6 text-center flex flex-col items-center">
                      <HiOutlineIdentification className="text-3xl text-slate-300 dark:text-slate-600 mb-2" />
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No Application Submitted</p>
                      <p className="text-xs text-slate-500 mt-1">This user has not uploaded identity documents yet.</p>
                    </div>
                  )}
                </div>

              </div>
              
              <div className="shrink-0 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 px-4 py-3 sm:px-6 sm:py-4 flex flex-col sm:flex-row items-center justify-end gap-2 sm:gap-3 rounded-b-2xl sm:rounded-b-3xl">
                 <button 
                   onClick={() => setSelectedUserToView(null)} 
                   className="w-full sm:w-auto px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700 order-3 sm:order-1 cursor-pointer"
                 >
                   Close
                 </button>
                 
                 {!selectedUserToView.isAdmin && (
                   <button 
                     onClick={() => deleteUserRecord(selectedUserToView.id)} 
                     className="w-full sm:w-auto px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 transition-colors flex justify-center items-center gap-1.5 border border-rose-100 dark:border-rose-900 order-2 sm:order-2 cursor-pointer"
                   >
                     <HiOutlineTrash className="text-sm sm:text-base" /> Delete
                   </button>
                 )}

                 <button
                    onClick={() => toggleVerification(selectedUserToView.id, selectedUserToView.isVerified)}
                    disabled={isProcessing === selectedUserToView.id}
                    className={`w-full sm:w-auto px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-colors disabled:opacity-50 flex justify-center items-center gap-1.5 shadow-sm order-1 sm:order-3 cursor-pointer ${selectedUserToView.isVerified ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200' : 'bg-emerald-600 text-white hover:bg-emerald-500'}`}
                  >
                    {isProcessing === selectedUserToView.id ? 'Processing...' : selectedUserToView.isVerified ? 'Revoke Host' : (
                      <><HiOutlineCheckBadge className="text-sm sm:text-base" /> Approve Host</>
                    )}
                 </button>
              </div>
            </div>
          </div>
        )}

        {selectedEventToView && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-3 sm:p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200 relative">
              
              <div className="shrink-0 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between rounded-t-2xl sm:rounded-t-3xl relative">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">Review Event</h3>
                
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <button 
                      onClick={() => setShowEventDropdown(prev => !prev)}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer flex items-center justify-center"
                      title="Actions"
                    >
                      <HiOutlineEllipsisHorizontal className="text-xl" />
                    </button>

                    {showEventDropdown && (
                      <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-50 animate-in fade-in zoom-in-95">
                        
                        <div className="px-4 py-1 text-[9px] font-bold uppercase tracking-wider text-slate-400">Moderation</div>
                        <button
                          onClick={() => updateEventStatus(selectedEventToView.id, 'approved')}
                          className="w-full text-left px-4 py-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 flex items-center gap-2 cursor-pointer"
                        >
                          <HiOutlineCheck className="text-base" /> Approve Event
                        </button>
                        
                        <button
                          onClick={() => updateEventStatus(selectedEventToView.id, 'rejected')}
                          className="w-full text-left px-4 py-2 text-xs font-bold text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/50 flex items-center gap-2 cursor-pointer"
                        >
                          <HiOutlineXCircle className="text-base" /> Reject Event
                        </button>

                        <div className="my-1 border-t border-slate-100 dark:border-slate-700"></div>

                        <div className="px-4 py-1 text-[9px] font-bold uppercase tracking-wider text-slate-400">Contact Host</div>
                        
                        <button
                          onClick={() => {
                            setShowEventDropdown(false);
                            router.push(`/messages/${selectedEventToView.hostId}`);
                          }}
                          className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 cursor-pointer"
                        >
                          <HiOutlineChatBubbleLeft className="text-base text-emerald-500" /> Inbuilt Message
                        </button>

                        {selectedEventToView.contactEmail && (
                          <a
                            href={`mailto:${selectedEventToView.contactEmail}?subject=Regarding your event "${selectedEventToView.title}"`}
                            onClick={() => setShowEventDropdown(false)}
                            className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 cursor-pointer"
                          >
                            <HiOutlineEnvelope className="text-base text-blue-500" /> Send Email
                          </a>
                        )}

                        {selectedEventToView.contactPhone && (
                          <>
                            <a
                              href={`tel:${selectedEventToView.contactPhone}`}
                              onClick={() => setShowEventDropdown(false)}
                              className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 cursor-pointer"
                            >
                              <HiOutlinePhone className="text-base text-purple-500" /> Call Phone
                            </a>
                            <a
                              href={`https://wa.me/${selectedEventToView.contactPhone.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => setShowEventDropdown(false)}
                              className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 cursor-pointer"
                            >
                              <HiOutlineDevicePhoneMobile className="text-base text-green-500" /> WhatsApp Chat
                            </a>
                          </>
                        )}

                        <div className="my-1 border-t border-slate-100 dark:border-slate-700"></div>

                        <button
                          onClick={() => deleteEventRecord(selectedEventToView.id)}
                          className="w-full text-left px-4 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 flex items-center gap-2 cursor-pointer"
                        >
                          <HiOutlineTrash className="text-base" /> Delete Event
                        </button>
                      </div>
                    )}
                  </div>

                  <button onClick={() => { setSelectedEventToView(null); setShowEventDropdown(false); }} className="p-1.5 sm:p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer">
                    <HiOutlineXMark className="text-lg sm:text-xl" />
                  </button>
                </div>
              </div>
              
              <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto">
                {selectedEventToView.mediaUrl && (
                  <div className="w-full h-40 sm:h-64 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden">
                     {selectedEventToView.mediaUrl.includes('video') || selectedEventToView.mediaUrl.endsWith('.mp4') ? (
                       <video src={selectedEventToView.mediaUrl} controls className="w-full h-full object-cover" />
                     ) : (
                       <img src={selectedEventToView.mediaUrl} alt="Event Media" className="w-full h-full object-cover" />
                     )}
                  </div>
                )}
                
                <div>
                  <div className="flex items-center gap-2 mb-2 sm:mb-3">
                    <span className="text-[9px] sm:text-[10px] uppercase tracking-widest font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-1 rounded border border-emerald-100 dark:border-emerald-800">
                      {selectedEventToView.type || 'Event'}
                    </span>
                    <span className={`text-[9px] sm:text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded border ${
                      selectedEventToView.status === 'approved' || selectedEventToView.status === 'live' 
                        ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' 
                        : selectedEventToView.status === 'rejected'
                        ? 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                        : 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                    }`}>
                      {selectedEventToView.status || 'Pending'}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white leading-tight">{selectedEventToView.title}</h2>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 sm:mt-3 whitespace-pre-wrap leading-relaxed">{selectedEventToView.description}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div>
                    <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5 sm:mb-1">Organizer / Host</p>
                    <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">{selectedEventToView.organizer || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5 sm:mb-1">Schedule</p>
                    <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">{selectedEventToView.schedule || 'Not specified'}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5 sm:mb-1">Location</p>
                    <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">
                      {selectedEventToView.location ? `${selectedEventToView.location}, ` : ''}
                      {selectedEventToView.city ? `${selectedEventToView.city}, ` : ''}
                      {selectedEventToView.state ? `${selectedEventToView.state}, ` : ''}
                      {selectedEventToView.country}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5 sm:mb-1">Contact Email</p>
                    <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white break-all">{selectedEventToView.contactEmail || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5 sm:mb-1">Contact Phone</p>
                    <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">{selectedEventToView.contactPhone || 'N/A'}</p>
                  </div>
                </div>

              </div>
              
              <div className="shrink-0 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between rounded-b-2xl sm:rounded-b-3xl">
                 <button onClick={() => { setSelectedEventToView(null); setShowEventDropdown(false); }} className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                   Close Preview
                 </button>

                 <p className="text-xs text-slate-400 italic">Click the **...** menu in the top right to moderate or contact host.</p>
              </div>
              
            </div>
          </div>
        )}

      </div>
      <Footer />
    </main>
  );
}