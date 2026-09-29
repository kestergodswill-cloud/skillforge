'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { db, auth } from '@/lib/firebase';
import { collection, query, where, onSnapshot, doc, getDoc, addDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { HiOutlineChatBubbleLeftRight, HiOutlineXMark, HiOutlineTrash } from 'react-icons/hi2';

export default function MessagesInboxPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [chats, setChats] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [groupTitle, setGroupTitle] = useState('');
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [activeMenuChatId, setActiveMenuChatId] = useState<string | null>(null);
  const [chatToDelete, setChatToDelete] = useState<any | null>(null);
  const pressTimer = useRef<any>(null);
  const isLongPress = useRef(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push('/auth');
      } else if (user.isAnonymous) {
        alert("You need to create a free account to use this feature!");
        router.push('/auth?next=/messages');
      } else {
        setCurrentUser(user);
      }
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (!currentUser) return;

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

  if (isLoading) {
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
      
      {(activeMenuChatId || chatToDelete) && (
        <div 
          className="fixed inset-0 z-40 bg-slate-950/20 backdrop-blur-[1px]" 
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
              className="text-[13px] font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-3 py-2 rounded-xl hover:bg-emerald-600 dark:hover:bg-emerald-500 dark:hover:text-white transition-colors cursor-pointer shadow-sm"
            >
              + New group
            </button>
          </div>
          
          <div className="flex-1 bg-white dark:bg-slate-900 sm:rounded-3xl sm:shadow-sm sm:border border-slate-200 dark:border-slate-800 overflow-hidden">
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
                        isMenuShowing ? 'bg-slate-100 dark:bg-slate-800/80 z-50 shadow-md ring-1 ring-emerald-500/30' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
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
                        <div className="absolute left-20 bottom-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl overflow-hidden flex items-center z-50 animate-in zoom-in-95 duration-100">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuChatId(null);
                              setChatToDelete(chat);
                            }}
                            className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-rose-600 dark:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
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

      {chatToDelete && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden p-6 border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-150">
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base mb-1">Delete conversation?</h3>
            <p className="text-[14px] text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
              "{chatToDelete.isGroup ? chatToDelete.title : chatToDelete.recipient?.name || 'This chat'}" will be removed.
            </p>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setChatToDelete(null)} 
                className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold py-3 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer text-[14px]"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDeleteConversation} 
                className="flex-1 bg-rose-600 text-white font-bold py-3 rounded-xl hover:bg-rose-500 transition-colors cursor-pointer text-[14px] shadow-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {isGroupModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden p-6 border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-150">
            
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                New group chat
              </h3>
              <button onClick={() => setIsGroupModalOpen(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer p-1.5">
                <HiOutlineXMark className="text-lg" />
              </button>
            </div>

            <form onSubmit={handleCreateGroupChat} className="space-y-4">
              <div>
                <input 
                  type="text" 
                  value={groupTitle} 
                  onChange={(e) => setGroupTitle(e.target.value)} 
                  required 
                  placeholder="Group name..." 
                  className="w-full bg-slate-100 dark:bg-slate-800 border-none text-slate-900 dark:text-white text-[14px] rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-emerald-500 transition-all" 
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsGroupModalOpen(false)}
                  className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold py-3 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer text-[14px]"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={!groupTitle.trim() || isCreatingGroup} 
                  className="flex-1 bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-500 transition-colors disabled:opacity-50 cursor-pointer text-[14px] shadow-sm"
                >
                  {isCreatingGroup ? 'Creating...' : 'Create'}
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