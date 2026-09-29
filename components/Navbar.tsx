
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Logo from '@/components/Logo';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { 
  HiOutlineUser, 
  HiOutlineHome,
  HiOutlineBars3, 
  HiOutlineXMark, 
  HiOutlineMagnifyingGlass,
  HiOutlineSparkles,
  HiOutlineSun,
  HiOutlineMoon,
  HiArrowRightOnRectangle,
  HiChevronDown,
  HiOutlineHeart,
  HiOutlineBell,
  HiOutlineShieldCheck,
  HiOutlineChatBubbleOvalLeftEllipsis,
  HiOutlineQuestionMarkCircle
} from 'react-icons/hi2';
import { 
  MdOutlineHealthAndSafety, 
  MdOutlineVolunteerActivism
} from 'react-icons/md';
import { LuBookOpen } from 'react-icons/lu';

export default function Navbar() {
  const router = useRouter();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileAccountOpen, setMobileAccountOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
  const [notifications, setNotifications] = useState<any[]>([]);
  const [totalUnreadMessages, setTotalUnreadMessages] = useState(0);
  
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const tokenResult = await currentUser.getIdTokenResult();
          setIsAdmin(!!tokenResult.claims.admin);
        } catch (error) {
          console.error("Failed to parse token claims:", error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const notificationsCollection = collection(db, 'notifications');
    const q = query(
      notificationsCollection, 
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedNotifications = snapshot.docs.map(document => ({
        id: document.id,
        ...document.data()
      }));
      const filtered = fetchedNotifications.filter((n: any) => n.type !== 'message');
      setNotifications(filtered);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const chatsRef = collection(db, 'chats');
    const q = query(chatsRef, where('participants', 'array-contains', user.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let count = 0;
      snapshot.docs.forEach((docSnap) => {
        const data = docSnap.data();
        const unreadMap = data.unreadCount || {};
        count += (unreadMap[user.uid] || 0);
      });
      setTotalUnreadMessages(count);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    setMounted(true);
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'dark' || (!storedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    } else {
      setTheme('light');
      document.documentElement.classList.remove('dark');
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50); 
    }
  }, [searchOpen]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setProfileOpen(false);
      setMobileAccountOpen(false);
      setMobileMenuOpen(false);
      setNotificationsOpen(false);
      setIsAdmin(false);
    } catch (error) {
      console.error(error);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

  const handleNotificationClick = async (notif: any) => {
    if (!notif.isRead) {
      try {
        await updateDoc(doc(db, 'notifications', notif.id), { isRead: true });
      } catch (error) {
        console.error(error);
      }
    }
    setNotificationsOpen(false);
    router.push('/notifications');
  };

  const handleOpenSearch = () => {
    setMobileMenuOpen(false);
    setSearchOpen(true);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setMobileMenuOpen(false);
      setSearchQuery(''); 
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <>
      <header className="fixed left-0 top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md dark:bg-slate-900/95 dark:border-slate-800 transition-colors">

        <div className={`hidden lg:flex absolute inset-0 z-50 items-center bg-white/95 backdrop-blur-md px-4 sm:px-6 lg:px-8 dark:bg-slate-900/95 transition-all duration-200 ${searchOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
          <div className="mx-auto flex w-full max-w-4xl items-center gap-4">
            <button 
              onClick={() => setSearchOpen(false)} 
              className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white shrink-0 cursor-pointer rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <HiOutlineXMark className="text-2xl" />
            </button>
            <form onSubmit={handleSearchSubmit} className="flex-1 relative flex items-center">
              <input 
                ref={searchInputRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search hosts, skills, health drives, local activities..."
                className="w-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-full py-3 pl-5 pr-12 text-base outline-none focus:ring-2 focus:ring-emerald-500 transition-all shadow-inner"
              />
              <button 
                type="submit" 
                className="absolute right-3 p-2 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 cursor-pointer"
              >
                <HiOutlineMagnifyingGlass className="text-xl" />
              </button>
            </form>
          </div>
        </div>

        <div className={`mx-auto flex h-[72px] sm:h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 transition-opacity duration-200 ${searchOpen ? 'opacity-0' : 'opacity-100'}`}>
          
          <Link href="/" className="flex items-center shrink-0">
            <Logo size={44} />
          </Link>

          <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-[13px] xl:text-[14px] font-bold text-slate-700 dark:text-slate-200 mx-auto pl-8">
            <Link href="/skills" className="transition-colors hover:text-emerald-600 dark:hover:text-emerald-400">
              Skills
            </Link>
            <Link href="/health-and-safety" className="transition-colors hover:text-emerald-600 dark:hover:text-emerald-400">
              Health
            </Link>
            <Link href="/cleanups-workouts" className="transition-colors hover:text-emerald-600 dark:hover:text-emerald-400">
              Local Activities
            </Link>
            <Link href="/about" className="transition-colors hover:text-emerald-600 dark:hover:text-emerald-400">
              About
            </Link>
            <Link href="/faqs" className="transition-colors hover:text-emerald-600 dark:hover:text-emerald-400">
              FAQs
            </Link>
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 ml-auto lg:ml-0">

            <button
              type="button"
              onClick={handleOpenSearch}
              className="hidden lg:flex items-center justify-center h-10 w-10 rounded-full text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Search">
              <HiOutlineMagnifyingGlass className="text-xl" />
            </button>

            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center justify-center h-10 w-10 rounded-full text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
              {mounted && (theme === 'light' ? <HiOutlineMoon className="text-xl" /> : <HiOutlineSun className="text-xl" />)}
            </button>

            {user && (
              <>
                <Link
                  href="/messages"
                  className="flex items-center justify-center h-10 w-10 rounded-full text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative cursor-pointer"
                  aria-label="Messages">
                  <HiOutlineChatBubbleOvalLeftEllipsis className="text-[22px]" />
                  {totalUnreadMessages > 0 && (
                    <span className="absolute top-2 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-bold text-white ring-2 ring-white dark:ring-slate-900 animate-pulse">
                      {totalUnreadMessages > 9 ? '9+' : totalUnreadMessages}
                    </span>
                  )}
                </Link>

                <div className="relative" ref={notificationsRef}>
                  <button
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                    className="flex items-center justify-center h-10 w-10 rounded-full text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative cursor-pointer"
                    aria-label="Notifications">
                    <HiOutlineBell className="text-[22px]" />
                    {unreadCount > 0 && (
                      <span className="absolute top-2 right-2 flex h-3 w-3 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white ring-2 ring-white dark:ring-slate-900">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {notificationsOpen && (
                    <div className="absolute right-0 mt-4 w-80 rounded-2xl bg-white shadow-2xl border border-slate-100 dark:bg-slate-800 dark:border-slate-700 overflow-hidden z-50">
                      <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                        <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Notifications</h3>
                        {unreadCount > 0 && (
                          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">{unreadCount} new</span>
                        )}
                      </div>
                      
                      <div className="max-h-72 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center text-[14px] text-slate-500 dark:text-slate-400">
                            No new notifications.
                          </div>
                        ) : (
                          notifications.slice(0, 4).map((notif) => (
                            <div 
                              key={notif.id}
                              onClick={() => handleNotificationClick(notif)}
                              className={`p-4 border-b border-slate-50 dark:border-slate-700/50 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/80 transition-colors flex items-start gap-3 ${!notif.isRead ? 'bg-emerald-50/30 dark:bg-emerald-900/10' : ''}`}
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                                    {notif.type || 'Alert'}
                                  </span>
                                  {!notif.isRead && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                  )}
                                </div>
                                <h4 className="text-[14px] font-bold text-slate-900 dark:text-white line-clamp-1">{notif.title}</h4>
                                <p className="text-[13px] text-slate-600 dark:text-slate-400 mt-0.5 line-clamp-2">{notif.message}</p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {notifications.length > 0 && (
                        <div className="p-2 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700 text-center">
                          <Link 
                            href="/notifications" 
                            onClick={() => setNotificationsOpen(false)}
                            className="block w-full py-2.5 text-[13px] font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                          >
                            Read More
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}

            {user && (
              <Link
                href="/host"
                className="hidden lg:inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-4 py-2.5 ml-2 text-[13px] font-bold text-white shadow-sm transition-all hover:bg-emerald-500 active:scale-95 whitespace-nowrap cursor-pointer">
                <HiOutlineSparkles className="text-sm" />
                <span>Host / Publish</span>
              </Link>
            )}

            {user ? (
              <div className="hidden lg:block relative ml-2" ref={profileRef}>
                <button 
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2.5 rounded-full border border-slate-200 bg-white pl-1.5 pr-3 py-1.5 text-[13px] font-bold transition-all hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700 whitespace-nowrap cursor-pointer shadow-sm">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="Profile" className="h-7 w-7 rounded-full object-cover shadow-sm" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="h-7 w-7 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
                      <HiOutlineUser className="text-[14px] text-emerald-700 dark:text-emerald-400" />
                    </div>
                  )}
                  <span className="truncate max-w-24 text-slate-900 dark:text-white">
                    {user.displayName?.split(' ')[0] || 'Account'}
                  </span>
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-3 w-52 rounded-2xl bg-white p-2 shadow-2xl border border-slate-100 dark:bg-slate-800 dark:border-slate-700 z-50">
                    <div className="px-3 py-2.5 border-b border-slate-100 dark:border-slate-700 mb-1">
                      <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">Signed in as</p>
                      <p className="text-[13px] font-bold text-slate-900 dark:text-white truncate">
                        {user.email}
                      </p>
                    </div>
                    
                    {isAdmin && (
                      <Link href="/admin" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 
                            text-[14px] font-semibold text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-900/20 cursor-pointer">
                        <HiOutlineShieldCheck className="text-lg shrink-0" /> Command Center
                      </Link>
                    )}
                    
                    <Link href="/account" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 
                          text-[14px] font-semibold text-slate-700 hover:bg-slate-50 hover:text-emerald-600 dark:text-slate-300 dark:hover:bg-slate-700 cursor-pointer">
                        <HiOutlineUser className="text-lg shrink-0" /> View Account
                    </Link>
                    <Link href="/host" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] 
                          font-semibold text-slate-700 hover:bg-slate-50 hover:text-emerald-600 dark:text-slate-300 dark:hover:bg-slate-700 cursor-pointer">
                      <HiOutlineSparkles className="text-lg shrink-0" /> Host / Publish
                    </Link>
                    <button onClick={handleSignOut} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 cursor-pointer">
                      <HiArrowRightOnRectangle className="text-lg shrink-0" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link 
                href="/auth"
                className="hidden lg:inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-[14px] 
                font-bold text-slate-700 transition-all hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 whitespace-nowrap cursor-pointer ml-2 shadow-sm">
                <span>Sign In</span>
              </Link>
            )}

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex lg:hidden p-1.5 ml-1 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 focus:outline-none transition-colors cursor-pointer">
              {mobileMenuOpen ? <HiOutlineXMark className="text-[26px]"/> : <HiOutlineBars3 className="text-[26px]"/>}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 px-4 py-5 space-y-4 shadow-2xl max-h-[calc(100vh-72px)] overflow-y-auto">
  
            <form onSubmit={handleSearchSubmit} className="relative w-full mb-3">
              <HiOutlineMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-base"/>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search hosts, events, skills..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-[14px] font-medium text-slate-900 
                outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:focus:bg-slate-900"
              />
            </form>

            <div className="flex flex-col space-y-2">
              <Link href="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-3 text-[15px]
                   font-bold text-slate-900 hover:bg-slate-50 dark:text-white dark:hover:bg-slate-800 cursor-pointer">
                <HiOutlineHome className="text-xl text-slate-500 shrink-0" /> Home
              </Link>

              {user && (
                <>
                  <Link href="/messages" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between rounded-xl px-3 py-3 text-[15px]
                      font-bold text-slate-900 hover:bg-slate-50 dark:text-white dark:hover:bg-slate-800 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <HiOutlineChatBubbleOvalLeftEllipsis className="text-xl text-emerald-600 shrink-0" /> Messages
                    </div>
                    {totalUnreadMessages > 0 && (
                      <span className="bg-emerald-500 text-white text-[11px] px-2.5 py-0.5 rounded-full font-bold">
                        {totalUnreadMessages}
                      </span>
                    )}
                  </Link>

                  <Link href="/notifications" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between rounded-xl px-3 py-3 text-[15px]
                      font-bold text-slate-900 hover:bg-slate-50 dark:text-white dark:hover:bg-slate-800 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <HiOutlineBell className="text-xl text-amber-500 shrink-0" /> Notifications
                    </div>
                    {unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-[11px] px-2.5 py-0.5 rounded-full font-bold">
                        {unreadCount}
                      </span>
                    )}
                  </Link>
                </>
              )}

              <Link href="/skills" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-3 text-[15px]
                   font-bold text-slate-900 hover:bg-slate-50 dark:text-white dark:hover:bg-slate-800 cursor-pointer">
                <MdOutlineVolunteerActivism className="text-xl text-emerald-600 shrink-0" /> Explore Skills
              </Link>

              <Link href="/health-and-safety" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-3 
                    text-[15px] font-bold text-slate-900 hover:bg-slate-50 dark:text-white dark:hover:bg-slate-800 cursor-pointer">
                <MdOutlineHealthAndSafety className="text-xl text-rose-500 shrink-0" /> Health & Life-Saving
              </Link>

              <Link href="/cleanups-workouts" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-3 
                    text-[15px] font-bold text-slate-900 hover:bg-slate-50 dark:text-white dark:hover:bg-slate-800 cursor-pointer">
                <HiOutlineHeart className="text-xl text-blue-500 shrink-0" /> Local Activities
              </Link>

              <Link href="/about" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-3 text-[15px] 
                    font-bold text-slate-900 hover:bg-slate-50 dark:text-white dark:hover:bg-slate-800 cursor-pointer">
                <LuBookOpen className="text-xl text-slate-500 shrink-0" /> About
              </Link>

              <Link href="/faqs" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-3 text-[15px] 
                    font-bold text-slate-900 hover:bg-slate-50 dark:text-white dark:hover:bg-slate-800 cursor-pointer">
                <HiOutlineQuestionMarkCircle className="text-xl text-slate-500 shrink-0" /> FAQs
              </Link>

              {user ? (
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button 
                    onClick={() => setMobileAccountOpen(!mobileAccountOpen)}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-[15px] font-bold text-slate-900
                    hover:bg-slate-50 dark:text-white dark:hover:bg-slate-800 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      {user.photoURL ? (
                        <img src={user.photoURL} alt="Profile" className="h-7 w-7 rounded-full object-cover shrink-0 shadow-sm" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="h-7 w-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                          <HiOutlineUser className="text-[14px] text-slate-600 dark:text-slate-400"/>
                        </div>
                      )}
                      <span className="text-slate-900 dark:text-white">My Account</span>
                    </div>
                    <HiChevronDown className={`text-xl text-slate-400 transition-transform ${mobileAccountOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {mobileAccountOpen && (
                    <div className="mt-2 ml-5 flex flex-col space-y-1.5 border-l-2 border-slate-100 pl-4 dark:border-slate-800">
                      
                      {isAdmin && (
                        <Link href="/admin" onClick={() => { setMobileAccountOpen(false); setMobileMenuOpen(false); }} className="flex 
                              items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-bold text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-900/20 cursor-pointer">
                          <HiOutlineShieldCheck className="text-lg shrink-0" /> Admin Area
                        </Link>
                      )}

                      <Link href="/account" onClick={() => { setMobileAccountOpen(false); setMobileMenuOpen(false); }} className="flex 
                            items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-bold text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800 cursor-pointer">
                        <HiOutlineUser className="text-lg shrink-0" /> View Profile
                      </Link>
                      <Link href="/host" onClick={() => { setMobileAccountOpen(false); setMobileMenuOpen(false); }} className="flex items-center 
                            gap-3 rounded-xl px-3 py-2.5 text-[14px] font-bold text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800 cursor-pointer">
                        <HiOutlineSparkles className="text-lg shrink-0" /> Host / Publish
                      </Link>
                      <button onClick={handleSignOut} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 cursor-pointer">
                        <HiArrowRightOnRectangle className="text-lg shrink-0" /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link href="/auth" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-3 text-[15px] 
                      font-bold text-slate-900 hover:bg-slate-50 dark:text-white dark:hover:bg-slate-800 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 cursor-pointer">
                  <HiOutlineUser className="text-xl text-slate-500 dark:text-slate-400 shrink-0"/> Sign In / Register
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      <div className="h-[72px] sm:h-20 w-full shrink-0"></div>
    </>
  ); 
}