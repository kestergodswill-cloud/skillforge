'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Logo from '@/components/Logo';
import { db, auth } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, getDocs, setDoc, increment, arrayUnion, arrayRemove, addDoc, serverTimestamp, documentId } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { 
  HiOutlineUserPlus,
  HiOutlineUserMinus,
  HiCheckBadge,
  HiOutlineMapPin,
  HiStar,
  HiChevronLeft,
  HiOutlineXMark,
  HiOutlinePencil
} from 'react-icons/hi2';

export default function UserProfilePage() {
  const router = useRouter();
  const params = useParams();
  const profileId = params.id as string;

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'hosted' | 'joined' | 'reviews'>('hosted');
  const [isFollowing, setIsFollowing] = useState(false);
  const [expandedReviews, setExpandedReviews] = useState<{ [key: string]: boolean }>({});
  
  const [visibleReviewsCount, setVisibleReviewsCount] = useState(3);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const [profileUser, setProfileUser] = useState<any>(null);
  const [pastWorkshops, setPastWorkshops] = useState<any[]>([]);
  const [joinedWorkshops, setJoinedWorkshops] = useState<any[]>([]);
  const [allReviews, setAllReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMessaging, setIsMessaging] = useState(false);

  const [followModalType, setFollowModalType] = useState<'followers' | 'following' | null>(null);
  const [followList, setFollowList] = useState<any[]>([]);
  const [isLoadingFollow, setIsLoadingFollow] = useState(false);

  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [newReviewText, setNewReviewText] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!profileId) return;

    const fetchUserData = async () => {
      try {
        const userDocRef = doc(db, 'users', profileId);
        const userSnap = await getDoc(userDocRef);
        
        if (userSnap.exists()) {
          const data = userSnap.data();
          setProfileUser(data);
          
          if (currentUser && data.followerIds?.includes(currentUser.uid)) {
            setIsFollowing(true);
          }
        } else {
          setProfileUser({
            name: 'Community Member',
            bio: 'This member just joined the community and has not set up their profile yet.',
            followers: 0,
            following: 0,
            rating: 0,
            reviewsCount: 0,
            photoURL: '',
            isVerified: false,
            location: 'Location not set'
          });
        }

        const programsRef = collection(db, 'programs');
        const qPrograms = query(programsRef, where("hostId", "==", profileId));
        const programsSnap = await getDocs(qPrograms);
        const fetchedPrograms = programsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        setPastWorkshops(fetchedPrograms);

        const qRegs = query(collection(db, 'registrations'), where("userId", "==", profileId));
        const regsSnap = await getDocs(qRegs);
        const joinedProgramIds = regsSnap.docs.map(d => d.data().programId);

        if (joinedProgramIds.length > 0) {
          const uniqueIds = [...new Set(joinedProgramIds)];
          const chunks = [];
          for (let i = 0; i < uniqueIds.length; i += 10) {
            chunks.push(uniqueIds.slice(i, i + 10));
          }
          
          let fetchedJoined: any[] = [];
          for (const chunk of chunks) {
            const qJoined = query(collection(db, 'programs'), where(documentId(), "in", chunk));
            const snap = await getDocs(qJoined);
            fetchedJoined = [...fetchedJoined, ...snap.docs.map(d => ({ id: d.id, ...d.data() }))];
          }
          setJoinedWorkshops(fetchedJoined);
        }

        const reviewsRef = collection(db, 'reviews');
        const qReviews = query(reviewsRef, where("hostId", "==", profileId));
        const reviewsSnap = await getDocs(qReviews);
        const fetchedReviews = reviewsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        setAllReviews(fetchedReviews);

      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    if (currentUser !== undefined) {
      fetchUserData();
    }
  }, [profileId, currentUser]);

  const handleFollowToggle = async () => {
    if (!currentUser) {
      alert("Please sign in to follow members.");
      router.push('/auth');
      return;
    }
    
    if (currentUser.uid === profileId) return;

    const prevFollowing = isFollowing;
    setIsFollowing(!prevFollowing);
    
    setProfileUser((prev: any) => ({
      ...prev,
      followers: prev.followers + (prevFollowing ? -1 : 1)
    }));

    try {
      const targetUserRef = doc(db, 'users', profileId);
      const currentUserRef = doc(db, 'users', currentUser.uid);

      if (prevFollowing) {
        await setDoc(targetUserRef, {
          followers: increment(-1),
          followerIds: arrayRemove(currentUser.uid)
        }, { merge: true });
        await setDoc(currentUserRef, {
          following: increment(-1),
          followingIds: arrayRemove(profileId)
        }, { merge: true });
      } else {
        await setDoc(targetUserRef, {
          followers: increment(1),
          followerIds: arrayUnion(currentUser.uid)
        }, { merge: true });
        await setDoc(currentUserRef, {
          following: increment(1),
          followingIds: arrayUnion(profileId)
        }, { merge: true });
      }
    } catch (error: any) {
      console.error(error);
      setIsFollowing(prevFollowing);
      setProfileUser((prev: any) => ({
        ...prev,
        followers: prev.followers + (prevFollowing ? 1 : -1)
      }));
      alert(`Failed to update follow status. Error: ${error.message}`);
    }
  };

  const handleMessage = async () => {
    if (!currentUser) {
      alert("Please sign in to send messages.");
      router.push('/auth');
      return;
    }

    if (!isFollowing) {
      alert("You must follow this user to send them a direct message.");
      return;
    }

    if (currentUser.uid === profileId) return;

    setIsMessaging(true);

    try {
      const chatsRef = collection(db, 'chats');
      const q = query(chatsRef, where("participants", "array-contains", currentUser.uid));
      const querySnapshot = await getDocs(q);

      let existingChatId: string | null = null;
      querySnapshot.forEach((document) => {
        const data = document.data();
        if (data.participants && data.participants.includes(profileId)) {
          existingChatId = document.id;
        }
      });

      if (existingChatId) {
        router.push(`/messages/room?id=${existingChatId}`);
      } else {
        const newChatRef = await addDoc(collection(db, 'chats'), {
          participants: [currentUser.uid, profileId],
          updatedAt: serverTimestamp()
        });
        router.push(`/messages/room?id=${newChatRef.id}`);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to initiate chat.");
      setIsMessaging(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      alert("Please sign in to leave a review.");
      router.push('/auth');
      return;
    }
    if (!newReviewText.trim()) return;

    setIsSubmittingReview(true);
    try {
      const reviewData = {
        hostId: profileId,
        reviewerId: currentUser.uid,
        author: currentUser.displayName || currentUser.email?.split('@')[0] || 'Community Member',
        text: newReviewText.trim(),
        rating: Number(newReviewRating),
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'reviews'), reviewData);

      setAllReviews(prev => [reviewData, ...prev]);
      setNewReviewText('');
      setNewReviewRating(5);
      setReviewModalOpen(false);
      alert("Review posted successfully!");
    } catch (error) {
      console.error("Error posting review:", error);
      alert("Failed to submit review.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const openFollowModal = async (type: 'followers' | 'following') => {
    setFollowModalType(type);
    setIsLoadingFollow(true);
    setFollowList([]);
    
    try {
      const idsToFetch = type === 'followers' ? (profileUser.followerIds || []) : (profileUser.followingIds || []);
      
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

  const toggleReadMore = (id: string) => {
    setExpandedReviews(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleLoadMoreReviews = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleReviewsCount(prev => prev + 3);
      setIsLoadingMore(false);
    }, 600);
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between transition-colors duration-300">
        <Navbar />
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-6">
            <div className="relative flex items-center justify-center animate-pulse">
              <div className="absolute inset-0 bg-emerald-500/25 blur-2xl rounded-full scale-[2.0]"></div>
              <Logo size={85} theme="dark" className="relative z-10" />
            </div>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  if (!profileUser) {
    return (
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 flex flex-col transition-colors duration-300">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center space-y-4 pt-20">
          <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-300">User Profile Not Found</h2>
          <p className="text-slate-500 dark:text-slate-400">The member you are looking for does not exist.</p>
          <button onClick={() => router.back()} className="px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full font-bold hover:bg-emerald-600 dark:hover:bg-emerald-500 transition-colors">
            Go Back
          </button>
        </div>
        <Footer />
      </main>
    );
  }

  const socialLinkUrl = profileUser.social 
    ? (profileUser.social.startsWith('http') ? profileUser.social : `https://${profileUser.social}`)
    : null;

  const displayHandle = profileUser.social
    ? `@${profileUser.social.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}`
    : profileUser.email 
      ? `@${profileUser.email.split('@')[0]}` 
      : `@${profileUser.name?.replace(/\s+/g, '').toLowerCase() || 'member'}`;

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 flex flex-col font-sans overflow-x-hidden transition-colors duration-300">
      <Navbar />

      <div className="flex-1 w-full pt-0 mt-0 pb-24">
        
        <div className="w-full max-w-2xl mx-auto relative">
          
          <div className="relative w-full h-32 sm:h-48 bg-slate-900 sm:rounded-b-[2rem] overflow-hidden shadow-sm">
            <img 
              src="/image/hero-bg.jpeg" 
              alt="Cover" 
              className="w-full h-full object-cover opacity-60" 
            />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 to-transparent z-10" />
            
            <button 
              onClick={() => router.back()}
              className="hidden sm:flex absolute top-20 left-4 sm:top-24 sm:left-6 z-30 items-center justify-center h-10 w-10 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white transition-colors cursor-pointer border border-white/10 shadow-md"
              aria-label="Go Back"
            >
              <HiChevronLeft className="text-2xl pr-0.5" />
            </button>
          </div>

          <div className="px-5 sm:px-8">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="relative shrink-0 -mt-10 sm:-mt-14 z-30">
                {profileUser.photoURL ? (
                  <img 
                    src={profileUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(profileUser.name || 'User')}&background=047857&color=fff&size=200`} 
                    alt={profileUser.name || 'User'} 
                    className="w-20 h-20 sm:w-28 sm:h-28 rounded-full border-4 border-slate-50 dark:border-slate-950 object-cover shadow-sm bg-slate-100 dark:bg-slate-900"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full border-4 border-slate-50 dark:border-slate-950 bg-slate-100 dark:bg-slate-900 flex items-center justify-center shadow-sm">
                    <span className="text-3xl sm:text-4xl font-bold text-slate-400 dark:text-slate-500">{profileUser.name ? profileUser.name.charAt(0) : 'U'}</span>
                  </div>
                )}
                {profileUser.isVerified && (
                  <div className="absolute bottom-1 right-0 sm:bottom-2 sm:right-1 bg-slate-50 dark:bg-slate-950 rounded-full p-0.5 shadow-sm">
                    <HiCheckBadge className="text-emerald-500 text-xl sm:text-2xl drop-shadow-sm" />
                  </div>
                )}
              </div>

              <div className="flex flex-1 justify-around ml-4 sm:ml-8 mt-2 sm:mt-4 z-20">
                <div className="flex flex-col items-center">
                  <span className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-none mb-1">{pastWorkshops.length}</span>
                  <span className="text-[12px] sm:text-[13px] text-slate-500 dark:text-slate-400 font-medium">Hosted</span>
                </div>
                <div className="flex flex-col items-center cursor-pointer hover:opacity-70 transition-opacity" onClick={() => openFollowModal('followers')}>
                  <span className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-none mb-1">{profileUser.followers || 0}</span>
                  <span className="text-[12px] sm:text-[13px] text-slate-500 dark:text-slate-400 font-medium">Followers</span>
                </div>
                <div className="flex flex-col items-center cursor-pointer hover:opacity-70 transition-opacity" onClick={() => openFollowModal('following')}>
                  <span className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-none mb-1">{profileUser.following || 0}</span>
                  <span className="text-[12px] sm:text-[13px] text-slate-500 dark:text-slate-400 font-medium">Following</span>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between">
                <h1 className="text-[16px] sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
                  {profileUser.name || 'Community Member'}
                </h1>

                {currentUser?.uid !== profileId && (
                  <button 
                    onClick={() => setReviewModalOpen(true)}
                    className="px-3 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer shadow-sm"
                  >
                    <HiStar className="text-amber-400 text-sm" /> Leave review
                  </button>
                )}
              </div>

              {socialLinkUrl ? (
                <a href={socialLinkUrl} target="_blank" rel="noopener noreferrer" className="text-[13px] text-blue-500 dark:text-blue-400 hover:text-blue-600 font-medium inline-block mt-0.5 transition-colors">
                  {displayHandle}
                </a>
              ) : (
                <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                  {displayHandle}
                </p>
              )}

              <p className="mt-3 text-[14px] sm:text-[15px] text-slate-800 dark:text-slate-200 leading-snug whitespace-pre-wrap">
                {profileUser.bio || "This community member hasn't added a bio yet."}
              </p>

              {profileUser.location && (
                <div className="mt-3 flex items-center gap-1.5 text-[13px] text-slate-500 dark:text-slate-400 font-medium">
                  <HiOutlineMapPin className="text-[16px]" /> 
                  {profileUser.location}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 mb-8">
              {currentUser?.uid === profileId ? (
                <Link 
                  href="/account"
                  className="flex-1 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-[13px] font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <HiOutlinePencil className="text-[15px]" /> Edit Profile
                </Link>
              ) : (
                <>
                  <button 
                    onClick={handleFollowToggle}
                    className={`flex-1 py-1.5 rounded-lg text-[13px] font-bold transition-colors flex items-center justify-center cursor-pointer ${
                      isFollowing 
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700' 
                        : 'bg-emerald-600 text-white hover:bg-emerald-500'
                    }`}
                  >
                    {isFollowing ? <HiOutlineUserMinus className="text-[15px] mr-1.5" /> : <HiOutlineUserPlus className="text-[15px] mr-1.5" />}
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                  <button 
                    onClick={() => {
                      if (!isFollowing) {
                        alert("You must follow this user to send them a message.");
                        return;
                      }
                      handleMessage();
                    }}
                    disabled={isMessaging || !isFollowing}
                    className={`flex-1 py-1.5 rounded-lg text-[13px] font-bold transition-colors flex items-center justify-center ${
                      !isFollowing
                        ? 'bg-slate-50 dark:bg-slate-900/50 text-slate-400 dark:text-slate-600 cursor-not-allowed border border-transparent'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-transparent hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer'
                    }`}
                  >
                    Message
                  </button>
                </>
              )}
            </div>

            <div className="flex justify-around border-b border-slate-200 dark:border-slate-800 mb-4">
              <button 
                onClick={() => setActiveTab('hosted')} 
                className={`flex-1 pb-3 text-[14px] font-bold transition-colors relative cursor-pointer ${activeTab === 'hosted' ? 'text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
              >
                Hosted
                {activeTab === 'hosted' && <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-slate-900 dark:bg-white"></span>}
              </button>
              <button 
                onClick={() => setActiveTab('joined')} 
                className={`flex-1 pb-3 text-[14px] font-bold transition-colors relative cursor-pointer ${activeTab === 'joined' ? 'text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
              >
                Joined
                {activeTab === 'joined' && <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-slate-900 dark:bg-white"></span>}
              </button>
              <button 
                onClick={() => setActiveTab('reviews')} 
                className={`flex-1 pb-3 text-[14px] font-bold transition-colors relative cursor-pointer ${activeTab === 'reviews' ? 'text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
              >
                Reviews
                {activeTab === 'reviews' && <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-slate-900 dark:bg-white"></span>}
              </button>
            </div>

            <div className="min-h-[300px]">
              
              {activeTab === 'hosted' && (
                <div>
                  {pastWorkshops.length === 0 ? (
                    <div className="py-16 text-center">
                      <p className="text-[14px] text-slate-500 dark:text-slate-400">No events hosted yet.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-1 sm:gap-4">
                      {pastWorkshops.map((workshop) => (
                        <Link href={`/skills/${workshop.id}`} key={workshop.id} className="relative aspect-square w-full bg-slate-100 dark:bg-slate-800 overflow-hidden cursor-pointer group rounded-sm sm:rounded-xl">
                          <img 
                            src={workshop.mediaUrl || "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80"} 
                            alt={workshop.title} 
                            className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                          />
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'joined' && (
                <div>
                  {joinedWorkshops.length === 0 ? (
                    <div className="py-16 text-center">
                      <p className="text-[14px] text-slate-500 dark:text-slate-400">No events joined recently.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-1 sm:gap-4">
                      {joinedWorkshops.map((workshop) => (
                        <Link href={`/skills/${workshop.id}`} key={workshop.id} className="relative aspect-square w-full bg-slate-100 dark:bg-slate-800 overflow-hidden cursor-pointer group rounded-sm sm:rounded-xl">
                          <img 
                            src={workshop.mediaUrl || "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80"} 
                            alt={workshop.title} 
                            className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                          />
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'reviews' && (
                <div>
                  {allReviews.length === 0 ? (
                    <div className="py-16 text-center">
                      <p className="text-[14px] text-slate-500 dark:text-slate-400">No reviews yet.</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4 pt-2">
                      {allReviews.slice(0, visibleReviewsCount).map((review) => {
                        const isExpanded = expandedReviews[review.id];
                        const shouldTruncate = review.text.length > 120;

                        return (
                          <div key={review.id} className="flex flex-col gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-4">
                            <div className="flex items-start justify-between">
                              <Link href={`/host/${review.reviewerId}`} className="flex items-center gap-2.5 group">
                                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 font-bold border border-slate-200 dark:border-slate-700">
                                  {review.author?.charAt(0) || 'U'}
                                </div>
                                <div>
                                  <span className="text-[13px] font-bold text-slate-900 dark:text-white group-hover:underline decoration-slate-400 underline-offset-2 block leading-none">
                                    {review.author}
                                  </span>
                                  <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block leading-none">
                                    {review.date || 'Recent'}
                                  </span>
                                </div>
                              </Link>

                              <div className="flex items-center gap-0.5 text-amber-400">
                                {[...Array(review.rating || 5)].map((_, i) => (
                                  <HiStar key={i} className="text-[13px]" />
                                ))}
                              </div>
                            </div>

                            <div className="text-[13px] text-slate-800 dark:text-slate-200 leading-snug pl-10 mt-1">
                              <p>
                                "{shouldTruncate && !isExpanded ? `${review.text.substring(0, 120)}...` : review.text}"
                              </p>
                              {shouldTruncate && (
                                <button
                                  onClick={() => toggleReadMore(review.id)}
                                  className="mt-1 text-[12px] font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer">
                                  {isExpanded ? 'Show less' : 'Read more'}
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}

                      {visibleReviewsCount < allReviews.length && (
                        <button
                          onClick={handleLoadMoreReviews}
                          disabled={isLoadingMore}
                          className="mt-2 text-center w-full py-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 text-[13px] font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:bg-slate-800 transition-colors disabled:opacity-50 cursor-pointer"
                        >
                          {isLoadingMore ? 'Loading...' : 'Show More Reviews'}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {reviewModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-xl p-6 border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Leave a Review</h3>
              <button onClick={() => setReviewModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer">
                <HiOutlineXMark className="text-xl" />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Rating</label>
                <select 
                  value={newReviewRating} 
                  onChange={(e) => setNewReviewRating(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-3 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value={5}>⭐⭐⭐⭐⭐ (5/5)</option>
                  <option value={4}>⭐⭐⭐⭐ (4/5)</option>
                  <option value={3}>⭐⭐⭐ (3/5)</option>
                  <option value={2}>⭐⭐ (2/5)</option>
                  <option value={1}>⭐ (1/5)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Your Review</label>
                <textarea 
                  rows={4}
                  required
                  value={newReviewText}
                  onChange={(e) => setNewReviewText(e.target.value)}
                  placeholder="Share your experience with this host..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>

              <button 
                type="submit" 
                disabled={isSubmittingReview || !newReviewText.trim()}
                className="w-full py-3 bg-emerald-600 text-white font-bold text-sm rounded-xl hover:bg-emerald-500 transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
              >
                {isSubmittingReview ? 'Submitting...' : 'Post Review'}
              </button>
            </form>
          </div>
        </div>
      )}

      {followModalType && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm p-0 sm:p-4 transition-opacity font-sans">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-t-[2rem] sm:rounded-2xl shadow-2xl flex flex-col max-h-[85vh] animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-200 border border-slate-100 dark:border-slate-800">
            
            <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mt-3 sm:hidden shrink-0" />
            
            <div className="px-6 py-4 flex justify-between items-center border-b border-slate-100 dark:border-slate-800 shrink-0">
              <h3 className="text-[15px] font-bold text-slate-900 dark:text-white capitalize">
                {followModalType === 'followers' ? 'Followers' : 'Following'}
              </h3>
              <button 
                onClick={() => setFollowModalType(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 bg-slate-50 dark:bg-slate-800 rounded-full transition-colors cursor-pointer"
              >
                <HiOutlineXMark className="text-xl" />
              </button>
            </div>
            
            <div className="overflow-y-auto px-4 py-2 flex-1">
              {isLoadingFollow ? (
                <div className="flex justify-center items-center py-10">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-slate-900 dark:border-white"></div>
                </div>
              ) : followList.length === 0 ? (
                <div className="text-center py-10 text-[13px] text-slate-500">
                  No {followModalType} found.
                </div>
              ) : (
                <div className="space-y-1">
                  {followList.map((userItem) => (
                    <Link 
                      href={`/host/${userItem.id}`} 
                      key={userItem.id}
                      onClick={() => setFollowModalType(null)}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer"
                    >
                      <img 
                        src={userItem.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(userItem.name || 'User')}&background=047857&color=fff`} 
                        alt={userItem.name || 'User'} 
                        className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-[13px] font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors truncate">
                          {userItem.name || 'Community Member'}
                        </h4>
                        <p className="text-[12px] text-slate-500 dark:text-slate-400 truncate">
                          {userItem.bio || 'SkillForge Member'}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </main>
  );
}