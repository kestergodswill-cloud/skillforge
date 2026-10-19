'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { db, auth } from '@/lib/firebase';
import { collection, query, where, onSnapshot, doc, getDoc, getDocs, addDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { HiOutlineChatBubbleLeftRight, HiOutlineTrash, HiOutlineArrowLeft, HiOutlineMagnifyingGlass } from 'react-icons/hi2';

export default function MessagesInboxPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [chats, setChats] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [groupTitle, setGroupTitle] = useState('');
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [activeMenuChatId, setActiveMenuChatId] = useState<string | null>(null);
  const [chatToDelete, setChatToDelete] = useState<any | null>(null);
  const [brokenImages, setBrokenImages] = useState<{ [key: string]: boolean }>({});

  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchQueryText, setSearchQueryText] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [startingChatUserId, setStartingChatUserId] = useState<string | null>(null);

  const userProfileCache = useRef<{ [key: string]: any }>({});
  const pressTimer = useRef<any>(null);
  const isLongPress = useRef(false);
  const isSigningOutRef = useRef(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (isSigningOutRef.current) return;

      if (!user) {
        router.push('/auth');
      } else if (user.isAnonymous) {
        setIsLoading(false);
        setShowGuestModal(true);
      } else {
        setCurrentUser(user);
        if (typeof window !== 'undefined') {
          const cached = sessionStorage.getItem(`inbox_chats_${user.uid}`);
          if (cached) {
            try {
              const parsed = JSON.parse(cached);
              if (Array.isArray(parsed) && parsed.length > 0) {
                setChats(parsed);
                setIsLoading(false);
              }
            } catch (e) {
              console.error(e);
            }
          }
        }
      }
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (!currentUser || currentUser.isAnonymous) return;

    const chatsRef = collection(db, 'chats');
    const q = query(
      chatsRef, 
      where('participants', 'array-contains', currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchChatData = async () => {
        const chatPromises = snapshot.docs.map(async (document) => {
          const chatData = document.data();
          const updatedAtMillis = chatData.updatedAt?.toMillis?.() || chatData.createdAt?.toMillis?.() || 0;
          
          if (chatData.isGroup) {
            return {
              id: document.id,
              ...chatData,
              updatedAtMillis,
              isGroup: true,
            };
          }

          const recipientId = chatData.participants?.find((id: string) => id !== currentUser.uid);
          let recipientData = { name: 'Community Member', photoURL: '', lastSeen: null };
          
          if (recipientId) {
            if (userProfileCache.current[recipientId]) {
              recipientData = userProfileCache.current[recipientId];
            } else {
              const userDoc = await getDoc(doc(db, 'users', recipientId));
              if (userDoc.exists()) {
                const rawUser = userDoc.data() as any;
                recipientData = {
                  ...rawUser,
                  name: rawUser.fullName || rawUser.name || rawUser.username || 'Community Member',
                  photoURL: rawUser.photoURL || rawUser.avatar || '',
                  lastSeen: rawUser.lastSeen || null
                };
                userProfileCache.current[recipientId] = recipientData;
              }
            }
          }

          const now = Date.now();
          const lastSeenVal: any = recipientData.lastSeen;
          const lastSeenTime = lastSeenVal?.toMillis ? lastSeenVal.toMillis() : (lastSeenVal?.seconds ? lastSeenVal.seconds * 1000 : 0);
          const isOnline = now - lastSeenTime < 45000;

          let lastSeenText = 'Offline';
          if (lastSeenTime > 0) {
            const lastSeenDate = new Date(lastSeenTime);
            const isToday = new Date().toDateString() === lastSeenDate.toDateString();
            const timeString = lastSeenDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            lastSeenText = isToday ? `Last seen at ${timeString}` : `Last seen ${lastSeenDate.toLocaleDateString()}`;
          }

          return {
            id: document.id,
            ...chatData,
            updatedAtMillis,
            isGroup: false,
            recipient: { ...recipientData, isOnline, lastSeenText },
          };
        });

        const resolvedChats = await Promise.all(chatPromises);
        
        resolvedChats.sort((a: any, b: any) => {
          return (b.updatedAtMillis || 0) - (a.updatedAtMillis || 0);
        });

        setChats(resolvedChats);
        setIsLoading(false);

        if (typeof window !== 'undefined') {
          try {
            sessionStorage.setItem(`inbox_chats_${currentUser.uid}`, JSON.stringify(resolvedChats));
          } catch (e) {
            console.error(e);
          }
        }
      };

      fetchChatData();
    });

    return () => unsubscribe();
  }, [currentUser]);

  useEffect(() => {
    const searchUsers = async () => {
      if (!searchQueryText.trim() || !currentUser) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const queryText = searchQueryText.toLowerCase().trim();
        const usersRef = collection(db, 'users');
        const snapshot = await getDocs(usersRef);

        const results: any[] = [];
        snapshot.docs.forEach((d) => {
          if (d.id === currentUser.uid) return;
          const data = d.data();

          const fullName = String(data.fullName || '').toLowerCase();
          const name = String(data.name || '').toLowerCase();
          const username = String(data.username || '').toLowerCase();
          const email = String(data.email || '').toLowerCase();

          if (
            fullName.includes(queryText) ||
            name.includes(queryText) ||
            username.includes(queryText) ||
            email.includes(queryText)
          ) {
            results.push({ id: d.id, ...data });
          }
        });

        setSearchResults(results);
      } catch (error) {
        console.error('Error searching users:', error);
      } finally {
        setIsSearching(false);
      }
    };

    const timer = setTimeout(searchUsers, 250);
    return () => clearTimeout(timer);
  }, [searchQueryText, currentUser]);

  const handleStartDirectChat = async (recipientId: string) => {
    if (!currentUser || startingChatUserId) return;

    setStartingChatUserId(recipientId);
    try {
      const chatsRef = collection(db, 'chats');
      const q = query(chatsRef, where('participants', 'array-contains', currentUser.uid));
      const snapshot = await getDocs(q);

      let existingChatId: string | null = null;
      snapshot.docs.forEach((d) => {
        const data = d.data();
        if (!data.isGroup && Array.isArray(data.participants) && data.participants.includes(recipientId)) {
          existingChatId = d.id;
        }
      });

      if (existingChatId) {
        setIsSearchModalOpen(false);
        setSearchQueryText('');
        setSearchResults([]);
        router.push(`/messages/room?id=${existingChatId}`);
        return;
      }

      const unreadMap: { [key: string]: number } = {
        [currentUser.uid]: 0,
        [recipientId]: 0
      };

      const newChatRef = await addDoc(collection(db, 'chats'), {
        isGroup: false,
        participants: [currentUser.uid, recipientId],
        lastMessage: 'Tap to start chatting',
        lastMessageSenderId: currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        unreadCount: unreadMap
      });

      setIsSearchModalOpen(false);
      setSearchQueryText('');
      setSearchResults([]);
      router.push(`/messages/room?id=${newChatRef.id}`);
    } catch (error) {
      console.error('Error starting direct chat:', error);
      alert('Failed to start conversation.');
    } finally {
      setStartingChatUserId(null);
    }
  };

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  const handleUpgradeAccount = async () => {
    isSigningOutRef.current = true;
    try {
      await signOut(auth);
      router.push('/auth');
    } catch (error) {
      console.error('Error signing out guest:', error);
      isSigningOutRef.current = false;
      router.push('/auth');
    }
  };

  const handleCreateGroupChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupTitle.trim() || !currentUser) return;

    setIsCreatingGroup(true);
    try {
      const allParticipants = [currentUser.uid];
      const unreadMap: { [key: string]: number } = { [currentUser.uid]: 0 };

      const chatRef = await addDoc(collection(db, 'chats'), {
        isGroup: true,
        title: groupTitle.trim(),
        createdBy: currentUser.uid,
        participants: allParticipants,
        admins: [currentUser.uid],
        lastMessage: `Group "${groupTitle.trim()}" created`,
        lastMessageSenderId: currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        unreadCount: unreadMap
      });

      setGroupTitle('');
      setIsGroupModalOpen(false);
      router.push(`/messages/room?id=${chatRef.id}`);
    } catch (error) {
      console.error('Error creating group chat:', error);
      alert('Failed to create group chat.');
    } finally {
      setIsCreatingGroup(false);
    }
  };

  const handlePressStart = (chatId: string) => {
    isLongPress.current = false;
    pressTimer.current = setTimeout(() => {
      isLongPress.current = true;
      setActiveMenuChatId(chatId);
    }, 500);
  };

  const handlePressEnd = () => {
    if (pressTimer.current) clearTimeout(pressTimer.current);
  };

  const handleChatClick = (chatId: string) => {
    if (isLongPress.current) return;
    router.push(`/messages/room?id=${chatId}`);
  };

  const confirmDeleteConversation = async () => {
    if (!chatToDelete) return;
    try {
      await deleteDoc(doc(db, 'chats', chatToDelete.id));
      const updated = chats.filter(c => c.id !== chatToDelete.id);
      setChats(updated);
      if (currentUser && typeof window !== 'undefined') {
        sessionStorage.setItem(`inbox_chats_${currentUser.uid}`, JSON.stringify(updated));
      }
      setChatToDelete(null);
      setActiveMenuChatId(null);
    } catch (error) {
      console.error('Error deleting conversation:', error);
      alert('Failed to delete conversation.');
    }
  };

  return (
    <main className="min-h-screen bg-white sm:bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 flex flex-col font-sans transition-colors duration-300">
      
      {showGuestModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-[360px] rounded-xl shadow-lg flex flex-col overflow-hidden">
            <div className="p-6 text-center">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Sign in to send messages
              </h3>
              <p className="text-[13px] text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                You need an account to connect with hosts and other members. It's completely free.
              </p>
              <div className="flex flex-col gap-2">
                <button 
                  onClick={handleUpgradeAccount} 
                  className="w-full bg-emerald-600 text-white py-2 rounded-lg text-[13px] font-semibold hover:bg-emerald-500 transition-colors cursor-pointer"
                >
                  Sign up / Log in
                </button>
                <button 
                  onClick={() => router.push('/')} 
                  className="w-full py-2 text-[13px] font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {(activeMenuChatId || chatToDelete) && (
        <div 
          className="fixed inset-0 z-40 bg-slate-950/10 backdrop-blur-[1px]" 
          onClick={() => { setActiveMenuChatId(null); setChatToDelete(null); }}
        />
      )}

      <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full sm:px-6 sm:py-6">
        
        <div className="sticky top-0 z-30 bg-white/95 dark:bg-slate-950/95 sm:bg-transparent dark:sm:bg-transparent backdrop-blur-md sm:backdrop-blur-none px-3 pt-3.5 pb-3 sm:px-0 sm:py-0 shrink-0 border-b border-slate-100 dark:border-slate-800 sm:border-none flex flex-col gap-2.5 sm:mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={handleBack}
                className="p-1.5 -ml-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Go back"
              >
                <HiOutlineArrowLeft className="text-lg" />
              </button>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Messages
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsSearchModalOpen(true)}
                className="hidden sm:flex items-center justify-center p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer shadow-sm"
                title="Search people"
              >
                <HiOutlineMagnifyingGlass className="text-sm" />
              </button>
              <button 
                type="button"
                onClick={() => setIsGroupModalOpen(true)}
                className="text-[12px] font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-3.5 py-1.5 rounded-lg hover:bg-emerald-600 dark:hover:bg-emerald-500 dark:hover:text-white transition-colors cursor-pointer shadow-sm shrink-0"
              >
                + New group
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsSearchModalOpen(true)}
            className="sm:hidden w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-500 text-[13px] font-medium hover:bg-slate-200/70 dark:hover:bg-slate-800/80 transition-colors cursor-pointer text-left"
          >
            <HiOutlineMagnifyingGlass className="text-base text-slate-400 shrink-0" />
            <span className="truncate">Search people by username or Gmail...</span>
          </button>
        </div>
        
        <div className="flex-1 bg-white dark:bg-slate-900 sm:rounded-xl sm:shadow-sm sm:border border-slate-200 dark:border-slate-800 overflow-hidden">
          {isLoading ? (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {[...Array(5)].map((_, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3.5 sm:p-4 animate-pulse">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between">
                      <div className="h-3.5 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
                      <div className="h-3 w-10 bg-slate-200 dark:bg-slate-800 rounded" />
                    </div>
                    <div className="h-3 w-40 bg-slate-200 dark:bg-slate-800 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : chats.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 py-16 text-center h-full">
              <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full flex items-center justify-center mb-3">
                <HiOutlineChatBubbleLeftRight className="text-xl text-emerald-600 dark:text-emerald-500" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">No Messages Yet</h3>
              <p className="text-[13px] text-slate-500 dark:text-slate-400 max-w-xs mt-1 leading-normal">
                Search for a member by username or Gmail, contact event hosts, or create a group to start chatting.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {chats.map((chat) => {
                const unreadCount = chat.unreadCount?.[currentUser?.uid || ''] || 0;
                const lastMessageText = chat.lastMessage || 'Tap to view conversation...';
                const isMe = chat.lastMessageSenderId === currentUser?.uid;
                const isMenuShowing = activeMenuChatId === chat.id;
                const dateLabel = chat.updatedAtMillis ? new Date(chat.updatedAtMillis).toLocaleDateString() : 'New';
                const hasValidPhoto = Boolean(chat.recipient?.photoURL && !brokenImages[chat.id]);

                return (
                  <div 
                    key={chat.id}
                    onClick={() => handleChatClick(chat.id)}
                    onMouseDown={() => handlePressStart(chat.id)}
                    onMouseUp={handlePressEnd}
                    onMouseLeave={handlePressEnd}
                    onTouchStart={() => handlePressStart(chat.id)}
                    onTouchEnd={handlePressEnd}
                    onTouchMove={handlePressEnd}
                    className={`relative flex items-center gap-3.5 p-3.5 sm:p-4 transition-colors cursor-pointer group select-none ${
                      isMenuShowing ? 'bg-slate-50 dark:bg-slate-800/50 z-50 shadow-sm' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="relative shrink-0">
                      {chat.isGroup ? (
                        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 font-bold text-sm border border-slate-200 dark:border-slate-700">
                          GRP
                        </div>
                      ) : hasValidPhoto ? (
                        <img 
                          src={chat.recipient.photoURL} 
                          alt={chat.recipient.name} 
                          onError={() => setBrokenImages(prev => ({ ...prev, [chat.id]: true }))}
                          className="w-11 h-11 sm:w-12 sm:h-12 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                        />
                      ) : (
                        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-bold text-base border border-emerald-200 dark:border-emerald-800">
                          {(chat.recipient?.name?.charAt(0) || 'U').toUpperCase()}
                        </div>
                      )}
                      
                      {!chat.isGroup && chat.recipient?.isOnline && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"></div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <h3 className={`text-[14px] sm:text-[15px] truncate transition-colors group-hover:text-emerald-600 dark:group-hover:text-emerald-400 ${unreadCount > 0 ? 'font-extrabold text-slate-900 dark:text-white' : 'font-bold text-slate-800 dark:text-slate-200'}`}>
                          {chat.isGroup ? chat.title : (chat.recipient?.name || 'Community Member')}
                        </h3>
                        <span className={`text-[11px] font-semibold ${unreadCount > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`}>
                          {dateLabel}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className={`text-[13px] truncate pr-3 ${unreadCount > 0 ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-500 dark:text-slate-400'}`}>
                          {chat.isGroup ? (
                            <span>{isMe ? <span className="text-slate-400 dark:text-slate-500 font-normal">You: </span> : ''}{lastMessageText}</span>
                          ) : chat.recipient?.isOnline ? (
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold">Online</span>
                          ) : (
                            <span>{isMe ? <span className="text-slate-400 dark:text-slate-500 font-normal">You: </span> : ''}{lastMessageText}</span>
                          )}
                        </p>
                        
                        {unreadCount > 0 && (
                          <div className="flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-emerald-500 text-white text-[10px] font-bold rounded-full shrink-0">
                            {unreadCount > 99 ? '99+' : unreadCount}
                          </div>
                        )}
                      </div>
                    </div>

                    {isMenuShowing && (
                      <div className="absolute left-16 bottom-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md rounded-lg overflow-hidden flex items-center z-50">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuChatId(null);
                            setChatToDelete(chat);
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-600 dark:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                        >
                          <HiOutlineTrash className="text-sm text-rose-500" /> Delete
                        </button>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {isSearchModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-3 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 w-full max-w-[380px] rounded-xl shadow-lg flex flex-col overflow-hidden border border-slate-100 dark:border-slate-800">
            
            <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Find Member</h3>
              <button 
                type="button"
                onClick={() => { setIsSearchModalOpen(false); setSearchQueryText(''); setSearchResults([]); }}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="p-3 border-b border-slate-100 dark:border-slate-800">
              <div className="relative flex items-center">
                <HiOutlineMagnifyingGlass className="absolute left-3 text-slate-400 text-base" />
                <input
                  type="text"
                  placeholder="Search by username, name, or Gmail..."
                  value={searchQueryText}
                  onChange={(e) => setSearchQueryText(e.target.value)}
                  autoFocus
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg py-2 pl-9 pr-3 text-[13px] text-slate-900 dark:text-white outline-none focus:border-emerald-500 transition-all"
                />
              </div>
            </div>

            <div className="max-h-[260px] overflow-y-auto p-1.5 divide-y divide-slate-100 dark:divide-slate-800/60">
              {isSearching ? (
                <div className="py-6 text-center text-xs text-slate-500">Searching...</div>
              ) : searchQueryText.trim() && searchResults.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-500">No matching users found.</div>
              ) : !searchQueryText.trim() ? (
                <div className="py-6 text-center text-xs text-slate-400">Enter a name, username, or Gmail address.</div>
              ) : (
                searchResults.map((foundUser) => {
                  const displayName = foundUser.fullName || foundUser.name || foundUser.username || 'Community Member';
                  const displayPhoto = foundUser.photoURL || foundUser.avatar || '';
                  const isStarting = startingChatUserId === foundUser.id;
                  const hasValidSearchPhoto = Boolean(displayPhoto && !brokenImages[foundUser.id]);

                  return (
                    <button
                      key={foundUser.id}
                      type="button"
                      disabled={isStarting}
                      onClick={() => handleStartDirectChat(foundUser.id)}
                      className="w-full flex items-center justify-between gap-2.5 p-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer text-left disabled:opacity-50"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {hasValidSearchPhoto ? (
                          <img
                            src={displayPhoto}
                            alt={displayName}
                            onError={() => setBrokenImages(prev => ({ ...prev, [foundUser.id]: true }))}
                            className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 font-bold flex items-center justify-center text-xs border border-emerald-200 dark:border-emerald-800 shrink-0">
                            {displayName.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <h4 className="text-[13px] font-bold text-slate-900 dark:text-white truncate">
                            {displayName}
                          </h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {foundUser.username ? `@${foundUser.username} · ` : ''}{foundUser.email || ''}
                          </p>
                        </div>
                      </div>
                      <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                        {isStarting ? 'Opening...' : 'Message'}
                      </span>
                    </button>
                  );
                })
              )}
            </div>

          </div>
        </div>
      )}

      {chatToDelete && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-3 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 w-full max-w-[320px] rounded-xl shadow-lg p-5 border border-slate-100 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">Delete conversation</h3>
            <p className="text-[13px] text-slate-500 dark:text-slate-400 mb-5 leading-normal">
              Are you sure you want to permanently delete your conversation with {chatToDelete.isGroup ? chatToDelete.title : chatToDelete.recipient?.name || 'this member'}?
            </p>
            <div className="flex items-center justify-end gap-2">
              <button 
                type="button"
                onClick={() => setChatToDelete(null)} 
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-[13px] cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={confirmDeleteConversation} 
                className="px-4 py-2 bg-rose-600 text-white font-semibold rounded-lg hover:bg-rose-500 transition-colors text-[13px] cursor-pointer shadow-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {isGroupModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-3 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 w-full max-w-[340px] rounded-xl shadow-lg p-5 border border-slate-100 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              New Group
            </h3>
            <p className="text-[13px] text-slate-500 dark:text-slate-400 mb-4 leading-normal">
              Create a space for your community.
            </p>

            <form onSubmit={handleCreateGroupChat}>
              <input 
                type="text" 
                value={groupTitle} 
                onChange={(e) => setGroupTitle(e.target.value)} 
                required 
                placeholder="Group name" 
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-[13px] rounded-lg py-2 px-3 outline-none focus:border-emerald-500 transition-all mb-5" 
              />
              <div className="flex items-center justify-end gap-2">
                <button 
                  type="button" 
                  onClick={() => setIsGroupModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[13px] font-semibold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={!groupTitle.trim() || isCreatingGroup} 
                  className="px-4 py-2 bg-emerald-600 text-white text-[13px] font-semibold rounded-lg hover:bg-emerald-500 transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  {isCreatingGroup ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}