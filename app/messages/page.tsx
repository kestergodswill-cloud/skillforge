'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { db, auth } from '@/lib/firebase';
import { collection, query, where, onSnapshot, doc, getDoc, addDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { HiOutlineChatBubbleLeftRight, HiOutlineTrash } from 'react-icons/hi2';

export default function MessagesInboxPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [chats, setChats] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [groupTitle, setGroupTitle] = useState('');
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [activeMenuChatId, setActiveMenuChatId] = useState<string | null>(null);
  const [chatToDelete, setChatToDelete] = useState<any | null>(null);
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
          
          if (chatData.isGroup) {
            return {
              id: document.id,
              ...chatData,
              isGroup: true,
            };
          }

          const recipientId = chatData.participants?.find((id: string) => id !== currentUser.uid);
          let recipientData = { name: 'Community Member', photoURL: '', lastSeen: null };
          
          if (recipientId) {
            const userDoc = await getDoc(doc(db, 'users', recipientId));
            if (userDoc.exists()) {
              recipientData = userDoc.data() as any; 
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
            isGroup: false,
            recipient: { ...recipientData, isOnline, lastSeenText },
          };
        });

        const resolvedChats = await Promise.all(chatPromises);
        
        resolvedChats.sort((a: any, b: any) => {
          const timeA = a.updatedAt?.toMillis?.() || 0;
          const timeB = b.updatedAt?.toMillis?.() || 0;
          return timeB - timeA;
        });

        setChats(resolvedChats);
        setIsLoading(false);
      };

      fetchChatData();
    });

    return () => unsubscribe();
  }, [currentUser]);

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
        unreadCount: unreadMap
      });

      setGroupTitle('');
      setIsGroupModalOpen(false);
      router.push(`/messages/room?id=${chatRef.id}`);
    } catch (error) {
      console.error("Error creating group chat:", error);
      alert("Failed to create group chat.");
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
      setChatToDelete(null);
      setActiveMenuChatId(null);
    } catch (error) {
      console.error("Error deleting conversation:", error);
      alert("Failed to delete conversation.");
    }
  };

  if (isLoading && !currentUser && !showGuestModal) {
    return (
      <main className="min-h-screen bg-white dark:bg-slate-950 flex flex-col justify-between font-sans">
        <Navbar />
        <div className="flex-1 flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white sm:bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 flex flex-col justify-between font-sans transition-colors duration-300">
      
      {showGuestModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-[380px] rounded-2xl shadow-xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 text-center">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                Sign in to send messages
              </h3>
              <p className="text-[14px] text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                You need an account to connect with hosts and other members. It's completely free.
              </p>
              <div className="flex flex-col gap-2">
                <button 
                  onClick={handleUpgradeAccount} 
                  className="w-full bg-emerald-600 text-white py-2.5 rounded-lg text-[14px] font-semibold hover:bg-emerald-500 transition-colors cursor-pointer"
                >
                  Sign up / Log in
                </button>
                <button 
                  onClick={() => router.push('/')} 
                  className="w-full py-2.5 text-[14px] font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 transition-colors cursor-pointer"
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

      <div>
        <Navbar />
        
        <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full sm:px-6 sm:py-8">
        
          <div className="px-5 py-4 sm:px-0 sm:py-0 shrink-0 border-b border-slate-100 dark:border-slate-800 sm:border-none flex items-center justify-between mb-4 sm:mb-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Messages</h1>
            <button 
              onClick={() => setIsGroupModalOpen(true)}
              className="text-[13px] font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-3 py-2 rounded-lg hover:bg-emerald-600 dark:hover:bg-emerald-500 dark:hover:text-white transition-colors cursor-pointer shadow-sm"
            >
              + New group
            </button>
          </div>
          
          <div className="flex-1 bg-white dark:bg-slate-900 sm:rounded-2xl sm:shadow-sm sm:border border-slate-200 dark:border-slate-800 overflow-hidden">
            {chats.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-10 py-20 text-center h-full">
                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full flex items-center justify-center mb-4">
                  <HiOutlineChatBubbleLeftRight className="text-3xl text-emerald-600 dark:text-emerald-500" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Messages Yet</h3>
                <p className="text-[14px] text-slate-500 dark:text-slate-400 max-w-sm mt-1 leading-relaxed">
                  When you contact event hosts, members, or create discussion groups, your active chats will appear here. Hard press any conversation to manage it.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {chats.map((chat) => {
                  const unreadCount = chat.unreadCount?.[currentUser?.uid || ''] || 0;
                  const lastMessageText = chat.lastMessage || 'Tap to view conversation...';
                  const isMe = chat.lastMessageSenderId === currentUser?.uid;
                  const isMenuShowing = activeMenuChatId === chat.id;

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
                      className={`relative flex items-center gap-4 p-4 sm:p-5 transition-colors cursor-pointer group select-none ${
                        isMenuShowing ? 'bg-slate-50 dark:bg-slate-800/50 z-50 shadow-sm' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="relative shrink-0">
                        {chat.isGroup ? (
                          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 font-bold text-base border border-slate-200 dark:border-slate-700">
                            GRP
                          </div>
                        ) : chat.recipient?.photoURL ? (
                          <img 
                            src={chat.recipient.photoURL} 
                            alt={chat.recipient.name} 
                            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                          />
                        ) : (
                          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-bold text-lg border border-emerald-200 dark:border-emerald-800">
                            {chat.recipient?.name?.charAt(0) || 'U'}
                          </div>
                        )}
                        
                        {!chat.isGroup && chat.recipient?.isOnline && (
                          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"></div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-1">
                          <h3 className={`text-[15px] sm:text-[16px] truncate transition-colors group-hover:text-emerald-600 dark:group-hover:text-emerald-400 ${unreadCount > 0 ? 'font-extrabold text-slate-900 dark:text-white' : 'font-bold text-slate-800 dark:text-slate-200'}`}>
                            {chat.isGroup ? chat.title : (chat.recipient?.name || 'Community Member')}
                          </h3>
                          <span className={`text-[11px] font-semibold ${unreadCount > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`}>
                            {chat.updatedAt ? new Date(chat.updatedAt.toDate()).toLocaleDateString() : 'New'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className={`text-[14px] truncate pr-4 ${unreadCount > 0 ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-500 dark:text-slate-400'}`}>
                            {chat.isGroup ? (
                              <span>{isMe ? <span className="text-slate-400 dark:text-slate-500 font-normal">You: </span> : ''}{lastMessageText}</span>
                            ) : chat.recipient?.isOnline ? (
                              <span className="text-emerald-600 dark:text-emerald-400 font-bold">Online</span>
                            ) : (
                              <span>{isMe ? <span className="text-slate-400 dark:text-slate-500 font-normal">You: </span> : ''}{lastMessageText}</span>
                            )}
                          </p>
                          
                          {unreadCount > 0 && (
                            <div className="flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-emerald-500 text-white text-[11px] font-bold rounded-full shrink-0">
                              {unreadCount > 99 ? '99+' : unreadCount}
                            </div>
                          )}
                        </div>
                      </div>

                      {isMenuShowing && (
                        <div className="absolute left-20 bottom-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-xl overflow-hidden flex items-center z-50 animate-in zoom-in-95 duration-100">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuChatId(null);
                              setChatToDelete(chat);
                            }}
                            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-rose-600 dark:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                          >
                            <HiOutlineTrash className="text-sm text-rose-500" /> Delete chat
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
      </div>

      {/* Premium Delete Modal */}
      {chatToDelete && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-[380px] rounded-2xl shadow-xl p-8 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Delete conversation</h3>
            <p className="text-[14px] text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
              Are you sure you want to permanently delete your conversation with {chatToDelete.isGroup ? chatToDelete.title : chatToDelete.recipient?.name || 'this member'}?
            </p>
            <div className="flex flex-col sm:flex-row-reverse gap-3">
              <button 
                onClick={confirmDeleteConversation} 
                className="w-full sm:w-auto px-6 py-2.5 bg-rose-600 text-white font-semibold rounded-lg hover:bg-rose-500 transition-colors text-[14px]"
              >
                Delete
              </button>
              <button 
                onClick={() => setChatToDelete(null)} 
                className="w-full sm:w-auto px-6 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-[14px]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Premium New Group Modal */}
      {isGroupModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-[380px] rounded-2xl shadow-xl p-8 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
              New Group
            </h3>
            <p className="text-[14px] text-slate-500 dark:text-slate-400 mb-6">
              Create a space for your community.
            </p>

            <form onSubmit={handleCreateGroupChat}>
              <input 
                type="text" 
                value={groupTitle} 
                onChange={(e) => setGroupTitle(e.target.value)} 
                required 
                placeholder="Group name" 
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-[14px] rounded-lg py-2.5 px-3 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all mb-8" 
              />
              <div className="flex flex-col sm:flex-row-reverse gap-3">
                <button 
                  type="submit" 
                  disabled={!groupTitle.trim() || isCreatingGroup} 
                  className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 text-white text-[14px] font-semibold rounded-lg hover:bg-emerald-500 transition-colors disabled:opacity-50"
                >
                  {isCreatingGroup ? 'Creating...' : 'Create'}
                </button>
                <button 
                  type="button" 
                  onClick={() => setIsGroupModalOpen(false)}
                  className="w-full sm:w-auto px-6 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[14px] font-semibold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="mt-12">
        <Footer />
      </div>
    </main>
  );
}