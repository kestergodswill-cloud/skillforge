'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { auth, db, storage } from '@/lib/firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, query, where, getDocs, deleteDoc, doc, updateDoc, getDoc, setDoc, documentId } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { 
  HiOutlineUserCircle,
  HiOutlineCamera,
  HiOutlineTrash,
  HiOutlineUser,
  HiCheckBadge,
  HiOutlineShieldExclamation,
  HiOutlineMapPin,
  HiOutlineGlobeAlt,
  HiOutlineXMark,
  HiChevronLeft,
  HiOutlineSquares2X2,
  HiOutlineBookmark,
  HiOutlineTicket,
  HiOutlineCog8Tooth,
  HiHeart,
  HiOutlineHeart
} from 'react-icons/hi2';

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'editProfile' | 'settings'>('dashboard');
  const [gridTab, setGridTab] = useState<'published' | 'joined' | 'saved'>('published');
  
  const router = useRouter();

  const [myListings, setMyListings] = useState<any[]>([]);
  const [joinedEvents, setJoinedEvents] = useState<any[]>([]);
  const [savedEvents, setSavedEvents] = useState<any[]>([]);
  const [registrations, setRegistrations] = useState<{ [key: string]: any[] }>({});
  
  const [selectedEventView, setSelectedEventView] = useState<any | null>(null);
  
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [followModalType, setFollowModalType] = useState<'followers' | 'following' | null>(null);
  const [followList, setFollowList] = useState<any[]>([]);
  const [isLoadingFollow, setIsLoadingFollow] = useState(false);

  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newBio, setNewBio] = useState('');
  const [newSocial, setNewSocial] = useState('');
  const [newPhotoURL, setNewPhotoURL] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Authenticating...');
  const [showDeleteWarning, setShowDeleteWarning] = useState(false);

  const isSigningOutRef = useRef(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (isSigningOutRef.current) return;

      if (!currentUser) {
        router.push('/auth?next=/account');
      } else if (currentUser.isAnonymous) {
        alert("You need to create a free account to use this feature!");
        router.push('/auth?next=/account');
      } else {
        setUser(currentUser);

        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userSnap = await getDoc(userDocRef);
          let userData: any = {};
          
          if (userSnap.exists()) {
            userData = userSnap.data();
            setUserProfile(userData);
            setNewName(userData.name || currentUser.displayName || '');
            setNewPhone(userData.phone || currentUser.phoneNumber || '');
            setNewLocation(userData.location || '');
            setNewBio(userData.bio || '');
            setNewSocial(userData.social || '');
            setNewPhotoURL(userData.photoURL || currentUser.photoURL || '');
          } else {
            setNewName(currentUser.displayName || '');
            setNewPhotoURL(currentUser.photoURL || '');
          }

          const programsRef = collection(db, 'programs');
          const qPrograms = query(programsRef, where("hostId", "==", currentUser.uid));
          const programsSnap = await getDocs(qPrograms);
          const listings = programsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
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

          const qRegistrations = query(collection(db, 'registrations'), where("userId", "==", currentUser.uid));
          const registrationsSnap = await getDocs(qRegistrations);
          const joinedRegs = registrationsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          
          const joinedDetails = await Promise.all(
            joinedRegs.map(async (reg: any) => {
              if (!reg.programId) return null;
              const progSnap = await getDoc(doc(db, 'programs', reg.programId));
              if (progSnap.exists()) {
                return { registrationId: reg.id, status: reg.status, ...progSnap.data(), id: progSnap.id };
              }
              return null;
            })
          );
          setJoinedEvents(joinedDetails.filter(Boolean));

          const savedIds = userData.savedPrograms || [];
          if (savedIds.length > 0) {
            const chunks = [];
            for (let i = 0; i < savedIds.length; i += 10) {
              chunks.push(savedIds.slice(i, i + 10));
            }
            let fetchedSaved: any[] = [];
            for (const chunk of chunks) {
              const qSaved = query(collection(db, 'programs'), where(documentId(), "in", chunk));
              const snap = await getDocs(qSaved);
              fetchedSaved = [...fetchedSaved, ...snap.docs.map(d => ({ id: d.id, ...d.data() }))];
            }
            setSavedEvents(fetchedSaved);
          }

        } catch (error) {
          console.error("Error fetching account data:", error);
        } finally {
          setIsLoading(false);
        }
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleSignOut = async () => {
    isSigningOutRef.current = true;
    setLoadingMessage('Signing out...');
    setIsProcessing(true);
    try {
      await signOut(auth);
      setTimeout(() => {
        router.push('/auth');
      }, 1200);
    } catch (error) {
      console.error('Error signing out:', error);
      isSigningOutRef.current = false;
      setIsProcessing(false);
    }
  };

  const handleManualImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB.");
      return;
    }

    setUploadingImage(true);
    try {
      const storageRef = ref(storage, `profile_images/${user.uid}_${Date.now()}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      setNewPhotoURL(downloadURL);
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoadingMessage('Saving profile...');
    setIsProcessing(true);

    try {
      await setDoc(doc(db, 'users', user.uid), {
        name: newName,
        phone: newPhone,
        location: newLocation,
        bio: newBio,
        social: newSocial,
        photoURL: newPhotoURL,
        email: user.email,
        followers: userProfile?.followers || 0,
        following: userProfile?.following || 0,
        followerIds: userProfile?.followerIds || [],
        followingIds: userProfile?.followingIds || [],
      }, { merge: true });

      setTimeout(() => {
        setIsProcessing(false);
        setActiveTab('dashboard');
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setIsProcessing(false);
      alert('Failed to update profile.');
    }
  };

  const handleDeleteAccount = () => {
    setLoadingMessage('Deleting account...');
    setIsProcessing(true);
    setTimeout(() => {
      alert("Account deletion logic connecting to Firebase soon!");
      setShowDeleteWarning(false);
      setIsProcessing(false);
    }, 1500);
  };

  const handleCreateListingClick = () => {
    if (!userProfile?.isVerified) {
      setShowVerificationModal(true);
    } else {
      router.push('/host/create');
    }
  };

  const handleDeleteListing = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    try {
      await deleteDoc(doc(db, 'programs', id));
      setMyListings(prev => prev.filter(item => item.id !== id));
      setSelectedEventView(null);
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

  const openFollowModal = async (type: 'followers' | 'following') => {
    if (!userProfile) return;
    setFollowModalType(type);
    setIsLoadingFollow(true);
    setFollowList([]);
    
    try {
      const idsToFetch = type === 'followers' ? (userProfile.followerIds || []) : (userProfile.followingIds || []);
      if (idsToFetch.length === 0) {
        setIsLoadingFollow(false);
        return;
      }

      const usersData = await Promise.all(
        idsToFetch.map(async (id: string) => {
          const userDoc = await getDoc(doc(db, 'users', id));
          return userDoc.exists() ? { id: userDoc.id, ...userDoc.data() } : null;
        })
      );
      setFollowList(usersData.filter(Boolean));
    } catch (error) {
      console.error("Error fetching list:", error);
    } finally {
      setIsLoadingFollow(false);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-white dark:bg-slate-950 flex flex-col justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 dark:border-white"></div>
      </main>
    );
  }

  if (!user) return null; 

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 flex flex-col font-sans overflow-x-hidden">
      
      <div className="fixed top-0 w-full bg-white dark:bg-slate-950 z-40 border-b border-slate-200 dark:border-slate-800 px-4 h-[60px] flex items-center justify-between">
        <div className="flex-1 flex justify-start">
          <button 
            onClick={() => activeTab === 'dashboard' ? router.back() : setActiveTab('dashboard')} 
            className="text-slate-900 dark:text-white cursor-pointer p-1 -ml-1 hover:opacity-70 transition-opacity"
          >
            <HiChevronLeft className="text-3xl" />
          </button>
        </div>
        
        <div className="flex-1 flex justify-center">
          <span className="font-bold text-[16px] text-slate-900 dark:text-white capitalize">
            {activeTab === 'editProfile' ? 'Edit Profile' : activeTab === 'settings' ? 'Settings' : ''}
          </span>
        </div>

        <div className="flex-1 flex justify-end">
          {activeTab === 'dashboard' && (
            <button 
              onClick={() => setActiveTab('settings')} 
              className="text-slate-900 dark:text-white cursor-pointer p-1 -mr-1 hover:opacity-70 transition-opacity"
            >
              <HiOutlineCog8Tooth className="text-2xl" />
            </button>
          )}
        </div>
      </div>
      
      <div className="flex-1 w-full max-w-[800px] mx-auto pb-24 pt-[60px]">
        
        {activeTab === 'dashboard' && (
          <div>
            <div className="flex items-center justify-between px-4 sm:px-8 mt-5 mb-4">
              <div className="relative shrink-0">
                {newPhotoURL ? (
                  <img 
                    src={newPhotoURL} 
                    alt="Profile" 
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border border-slate-200 dark:border-slate-800 object-cover bg-slate-100 dark:bg-slate-900" 
                  />
                ) : (
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
                    <span className="text-3xl sm:text-4xl font-bold text-slate-400">{newName ? newName.charAt(0) : 'U'}</span>
                  </div>
                )}
                {userProfile?.isVerified && (
                  <div className="absolute bottom-0 right-0 bg-white dark:bg-slate-950 rounded-full p-0.5 shadow-sm">
                    <HiCheckBadge className="text-emerald-500 text-xl sm:text-2xl" />
                  </div>
                )}
              </div>

              <div className="flex flex-1 justify-around ml-6 sm:ml-10">
                <div className="flex flex-col items-center">
                  <span className="text-[16px] sm:text-lg font-bold text-slate-900 dark:text-white leading-none mb-1">{myListings.length}</span>
                  <span className="text-[13px] text-slate-500 dark:text-slate-400">hosted</span>
                </div>
                <div className="flex flex-col items-center cursor-pointer" onClick={() => openFollowModal('followers')}>
                  <span className="text-[16px] sm:text-lg font-bold text-slate-900 dark:text-white leading-none mb-1">{userProfile?.followers || 0}</span>
                  <span className="text-[13px] text-slate-500 dark:text-slate-400">followers</span>
                </div>
                <div className="flex flex-col items-center cursor-pointer" onClick={() => openFollowModal('following')}>
                  <span className="text-[16px] sm:text-lg font-bold text-slate-900 dark:text-white leading-none mb-1">{userProfile?.following || 0}</span>
                  <span className="text-[13px] text-slate-500 dark:text-slate-400">following</span>
                </div>
              </div>
            </div>

            <div className="px-4 sm:px-8 mb-4">
              <h1 className="text-[14px] sm:text-[15px] font-bold text-slate-900 dark:text-white leading-snug">
                {newName || user.displayName || 'Community Member'}
              </h1>
              <p className="text-[14px] text-slate-800 dark:text-slate-200 leading-snug mt-0.5 whitespace-pre-wrap">
                {newBio || "Add a bio to tell the community about yourself."}
              </p>
              
              <div className="mt-2 flex flex-col gap-1 text-[13px] text-slate-500 dark:text-slate-400 font-medium">
                {newLocation && (
                  <span className="flex items-center gap-1.5">
                    <HiOutlineMapPin className="text-[15px]" /> 
                    {newLocation}
                  </span>
                )}
                {newSocial && (
                  <a href={newSocial.startsWith('http') ? newSocial : `https://${newSocial}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 hover:underline w-fit">
                    <HiOutlineGlobeAlt className="text-[15px]" /> 
                    {newSocial.replace(/^https?:\/\//, '')}
                  </a>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 px-4 sm:px-8 mb-6">
              <button 
                onClick={() => setActiveTab('editProfile')} 
                className="flex-1 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-[13px] font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Edit profile
              </button>
              <button 
                onClick={handleCreateListingClick} 
                className="flex-1 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-[13px] font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Host event
              </button>
            </div>

            <div className="flex border-t border-slate-200 dark:border-slate-800 mb-0.5">
              <button 
                onClick={() => setGridTab('published')} 
                className={`flex-1 flex justify-center py-3 border-b border-transparent transition-colors cursor-pointer ${gridTab === 'published' ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white' : 'text-slate-400'}`}
              >
                <HiOutlineSquares2X2 className="text-2xl" />
              </button>
              <button 
                onClick={() => setGridTab('joined')} 
                className={`flex-1 flex justify-center py-3 border-b border-transparent transition-colors cursor-pointer ${gridTab === 'joined' ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white' : 'text-slate-400'}`}
              >
                <HiOutlineTicket className="text-2xl" />
              </button>
              <button 
                onClick={() => setGridTab('saved')} 
                className={`flex-1 flex justify-center py-3 border-b border-transparent transition-colors cursor-pointer ${gridTab === 'saved' ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white' : 'text-slate-400'}`}
              >
                <HiOutlineBookmark className="text-2xl" />
              </button>
            </div>

            <div>
              {gridTab === 'published' && (
                <div className="grid grid-cols-3 gap-[2px] sm:gap-1">
                  {myListings.length === 0 ? (
                    <div className="col-span-3 text-center py-16 text-[14px] text-slate-500">No events hosted yet.</div>
                  ) : (
                    myListings.map((item) => (
                      <div 
                        key={item.id} 
                        onClick={() => setSelectedEventView(item)}
                        className="aspect-square relative bg-slate-100 dark:bg-slate-800 cursor-pointer group"
                      >
                        <img 
                          src={item.mediaUrl || "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80"} 
                          alt={item.title} 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-1 right-1 bg-black/60 rounded px-1 text-[8px] font-bold text-white uppercase tracking-wider">
                          {item.status === 'approved' || item.status === 'live' ? 'Live' : 'Pending'}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {gridTab === 'joined' && (
                <div className="grid grid-cols-3 gap-[2px] sm:gap-1">
                  {joinedEvents.length === 0 ? (
                    <div className="col-span-3 text-center py-16 text-[14px] text-slate-500">No events joined yet.</div>
                  ) : (
                    joinedEvents.map((item) => (
                      <Link 
                        href="/skills" 
                        key={item.id} 
                        className="aspect-square relative bg-slate-100 dark:bg-slate-800 cursor-pointer"
                      >
                        <img 
                          src={item.image || item.mediaUrl || "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80"} 
                          alt={item.title} 
                          className="w-full h-full object-cover"
                        />
                      </Link>
                    ))
                  )}
                </div>
              )}

              {gridTab === 'saved' && (
                <div className="grid grid-cols-3 gap-[2px] sm:gap-1">
                  {savedEvents.length === 0 ? (
                    <div className="col-span-3 text-center py-16 text-[14px] text-slate-500">No saved events.</div>
                  ) : (
                    savedEvents.map((item) => (
                      <Link 
                        href="/skills" 
                        key={item.id} 
                        className="aspect-square relative bg-slate-100 dark:bg-slate-800 cursor-pointer"
                      >
                        <img 
                          src={item.image || item.mediaUrl || "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80"} 
                          alt={item.title} 
                          className="w-full h-full object-cover"
                        />
                      </Link>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'editProfile' && (
          <div className="px-4 sm:px-8 py-6 max-w-xl mx-auto">
            
            <div className="flex flex-col items-center mb-8">
              {newPhotoURL ? (
                <img src={newPhotoURL} alt="Avatar" className="w-24 h-24 rounded-full object-cover border border-slate-200 dark:border-slate-800 shadow-sm" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shadow-sm">
                  <HiOutlineUserCircle className="text-4xl text-slate-400" />
                </div>
              )}
              <label className="mt-3 text-[13px] font-bold text-emerald-600 dark:text-emerald-500 cursor-pointer hover:text-emerald-700 transition-colors">
                {uploadingImage ? 'Uploading...' : 'Change profile photo'}
                <input type="file" accept="image/*" onChange={handleManualImageUpload} className="hidden" />
              </label>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              
              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pl-1">Full Name</label>
                <input 
                  type="text" 
                  value={newName} 
                  onChange={(e) => setNewName(e.target.value)} 
                  required 
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3.5 text-[14px] text-slate-900 dark:text-white outline-none focus:border-slate-400 dark:focus:border-slate-600 transition-colors" 
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pl-1">Phone Number</label>
                <input 
                  type="tel" 
                  value={newPhone} 
                  onChange={(e) => setNewPhone(e.target.value)} 
                  placeholder="e.g. +234..."
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3.5 text-[14px] text-slate-900 dark:text-white outline-none focus:border-slate-400 dark:focus:border-slate-600 transition-colors" 
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pl-1">Location</label>
                <input 
                  type="text" 
                  value={newLocation} 
                  onChange={(e) => setNewLocation(e.target.value)} 
                  placeholder="City, Country"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3.5 text-[14px] text-slate-900 dark:text-white outline-none focus:border-slate-400 dark:focus:border-slate-600 transition-colors" 
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pl-1">Bio</label>
                <textarea 
                  value={newBio} 
                  onChange={(e) => setNewBio(e.target.value)} 
                  rows={3} 
                  placeholder="Tell people about yourself..."
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3.5 text-[14px] text-slate-900 dark:text-white outline-none focus:border-slate-400 dark:focus:border-slate-600 transition-colors resize-none" 
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pl-1">Social Link</label>
                <input 
                  type="text" 
                  value={newSocial} 
                  onChange={(e) => setNewSocial(e.target.value)} 
                  placeholder="instagram.com/username" 
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3.5 text-[14px] text-slate-900 dark:text-white outline-none focus:border-slate-400 dark:focus:border-slate-600 transition-colors" 
                />
              </div>

              <div className="pt-6">
                <button 
                  type="submit" 
                  disabled={isProcessing} 
                  className="w-full rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-3.5 text-[14px] font-bold hover:opacity-90 transition-opacity shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? 'Saving changes...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="px-4 sm:px-8 py-6 max-w-xl mx-auto space-y-8">
            
            <div className="space-y-4 mt-2">
               <button 
                 onClick={handleSignOut} 
                 className="w-full px-4 py-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-[15px] font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer text-center shadow-sm"
               >
                 Log Out
               </button>
               
               <button 
                 onClick={() => setShowDeleteWarning(true)} 
                 className="w-full px-4 py-4 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-900/10 text-rose-600 text-[15px] font-bold hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-colors cursor-pointer text-center shadow-sm"
               >
                 Delete Account
               </button>
            </div>

            {showDeleteWarning && (
              <div className="p-5 bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/50 rounded-2xl shadow-lg">
                <h4 className="text-[15px] font-bold text-rose-600 dark:text-rose-500 mb-2 text-center">Delete your account permanently?</h4>
                <p className="text-[13px] text-slate-600 dark:text-slate-400 mb-5 text-center leading-relaxed">
                  This action cannot be undone. All your data, events, and registrations will be permanently deleted.
                </p>
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={handleDeleteAccount} 
                    className="w-full py-3.5 bg-rose-600 text-white text-[14px] font-bold rounded-xl hover:bg-rose-700 transition-colors cursor-pointer"
                  >
                    Yes, Delete Everything
                  </button>
                  <button 
                    onClick={() => setShowDeleteWarning(false)} 
                    className="w-full py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[14px] font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {selectedEventView && (
        <div className="fixed inset-0 z-[100] flex flex-col justify-end bg-slate-900/60 backdrop-blur-sm transition-opacity font-sans">
          <div className="bg-white dark:bg-slate-900 w-full rounded-t-[2rem] shadow-2xl flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-10 duration-200">
            <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mt-3 shrink-0" />
            
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
              <h3 className="text-[16px] font-bold text-slate-900 dark:text-white truncate pr-4">{selectedEventView.title}</h3>
              <button onClick={() => setSelectedEventView(null)} className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 cursor-pointer">
                <HiOutlineXMark className="text-xl" />
              </button>
            </div>
            
            <div className="overflow-y-auto px-5 py-5 space-y-5">
              <div className="flex gap-4">
                <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-slate-100">
                  <img src={selectedEventView.mediaUrl || "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80"} alt="Event" className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col justify-center">
                  <p className="text-[13px] font-bold text-slate-900 dark:text-white">{selectedEventView.schedule}</p>
                  <p className="text-[12px] text-slate-500 mt-0.5">{selectedEventView.city}, {selectedEventView.country}</p>
                  <div className="mt-2 flex gap-2">
                    <button onClick={() => handleDeleteListing(selectedEventView.id)} className="px-3 py-1 bg-rose-50 text-rose-600 rounded-lg text-[11px] font-bold cursor-pointer"><HiOutlineTrash className="inline mr-1"/> Delete</button>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
                <h4 className="text-[14px] font-bold text-slate-900 dark:text-white mb-3">Applicants ({registrations[selectedEventView.id]?.length || 0})</h4>
                
                {(!registrations[selectedEventView.id] || registrations[selectedEventView.id].length === 0) ? (
                  <p className="text-[13px] text-slate-500 text-center py-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl">No applicants yet.</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {registrations[selectedEventView.id].map((applicant) => (
                      <div key={applicant.id} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0">
                              <HiOutlineUser className="text-sm text-slate-500" />
                            </div>
                            <div>
                              <Link href={`/profile/${applicant.userId}`} className="text-[13px] font-bold text-slate-900 dark:text-white hover:underline block leading-none">
                                {applicant.fullName}
                              </Link>
                              <a href={`tel:${applicant.phone}`} className="text-[11px] text-slate-500 mt-1 block leading-none">
                                {applicant.phone}
                              </a>
                            </div>
                          </div>
                          <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${applicant.status === 'accepted' ? 
                                'bg-emerald-100 text-emerald-700' : applicant.status === 'rejected' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                            {applicant.status || 'Pending'}
                          </span>
                        </div>

                        {applicant.note && (
                          <div className="mt-2 p-2 bg-white dark:bg-slate-900 rounded-lg text-[12px] text-slate-600
                               dark:text-slate-400 italic border border-slate-100 dark:border-slate-800">
                            "{applicant.note}"
                          </div>
                        )}

                        <div className="flex items-center gap-2 mt-2 w-full">
                          {(!applicant.status || applicant.status === 'pending') ? (
                            <>
                              <button onClick={() => handleUpdateApplicantStatus(applicant.id, selectedEventView.id, 'accepted')} 
                                      className="flex-1 py-1.5 rounded-lg bg-emerald-600 text-white text-[12px] font-bold cursor-pointer">Accept</button>
                              <button onClick={() => handleUpdateApplicantStatus(applicant.id, selectedEventView.id, 'rejected')} 
                                      className="flex-1 py-1.5 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-600 text-[12px] font-bold cursor-pointer">Reject</button>
                            </>
                          ) : (
                            <div className="flex-1 text-center py-1.5 text-[12px] font-bold text-slate-400 bg-white dark:bg-slate-900 
                                 rounded-lg border border-slate-200 dark:border-slate-800">Resolved</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

     
      {followModalType && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm p-0 sm:p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-t-[2rem] sm:rounded-3xl shadow-2xl flex flex-col max-h-[85vh] animate-in slide-in-from-bottom-10">
            <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mt-3 shrink-0" />
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-[16px] font-bold text-slate-900 dark:text-white capitalize">{followModalType}</h3>
              <button onClick={() => setFollowModalType(null)} className="p-1.5 bg-slate-50 dark:bg-slate-800 rounded-full cursor-pointer"><HiOutlineXMark className="text-xl" /></button>
            </div>
            <div className="overflow-y-auto p-2 flex-1">
              {isLoadingFollow ? (
                <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-slate-900 dark:border-white"></div></div>
              ) : followList.length === 0 ? (
                <div className="text-center py-10 text-[14px] text-slate-500">No {followModalType} found.</div>
              ) : (
                <div className="space-y-1">
                  {followList.map((userItem) => (
                    <Link href={`/profile/${userItem.id}`} key={userItem.id} onClick={() => setFollowModalType(null)} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer">
                      <img src={userItem.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(userItem.name || 'User')}&background=047857&color=fff`} alt={userItem.name} className="w-10 h-10 rounded-full object-cover shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-[14px] font-bold text-slate-900 dark:text-white truncate">{userItem.name}</h4>
                        <p className="text-[12px] text-slate-500 truncate">{userItem.bio || 'Community Member'}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </main>
  );
}