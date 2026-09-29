'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { db, auth } from '@/lib/firebase';
import { doc, getDoc, collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, updateDoc, setDoc, arrayUnion, arrayRemove, increment, deleteDoc, getDocs } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { 
  HiOutlineArrowLeft, 
  HiEllipsisVertical,
  HiOutlineFlag,
  HiOutlineNoSymbol,
  HiOutlineUserMinus,
  HiOutlineUserPlus,
  HiOutlineUser,
  HiOutlineXMark,
  HiOutlinePaperClip,
  HiOutlineMicrophone,
  HiStop,
  HiOutlineTrash,
  HiOutlineMapPin,
  HiOutlineArrowUturnLeft,
  HiOutlineUserGroup,
  HiOutlinePlus,
  HiPaperAirplane
} from 'react-icons/hi2';

function ChatRoomContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const chatId = searchParams.get('id');

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  const [isGroup, setIsGroup] = useState(false);
  const [groupData, setGroupData] = useState<any>(null);
  const [groupMembers, setGroupMembers] = useState<any[]>([]);
  const [groupInfoOpen, setGroupInfoOpen] = useState(false);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [allPlatformUsers, setAllPlatformUsers] = useState<any[]>([]);

  const [recipient, setRecipient] = useState<any>(null);
  const [isRecipientOnline, setIsRecipientOnline] = useState(false);
  const [recipientLastSeenText, setRecipientLastSeenText] = useState('Offline');

  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const [menuOpen, setMenuOpen] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isUploading, setIsUploading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioPreviewBlob, setAudioPreviewBlob] = useState<Blob | null>(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null);
  
  const [deleteTarget, setDeleteTarget] = useState<{id: string, isMine: boolean, text: string} | null>(null);
  const [replyingTo, setReplyingTo] = useState<{id: string, text: string, sender: string} | null>(null);

  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [locationQuery, setLocationQuery] = useState('');
  const [locationResults, setLocationResults] = useState<any[]>([]);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<any>(null);
  const mediaRecorderRef = useRef<any>(null);
  const audioChunksRef = useRef<any[]>([]);
  const pressTimer = useRef<any>(null);
  const touchStartX = useRef<number | null>(null);

  const uploadMediaToCloudinary = async (fileOrBlob: File | Blob, resourceType: "image" | "video" | "raw" = "image") => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const preset = process.env.NEXT_PUBLIC_CLOUDINARY_PRESET;
    const formData = new FormData();
    formData.append("file", fileOrBlob);
    formData.append("upload_preset", preset!);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
      { method: "POST", body: formData }
    );

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Upload failed: ${err}`);
    }

    const data = await response.json();
    return data.secure_url as string;
  };

  useEffect(() => {
    if (!currentUser) return;
    const updatePresence = async () => {
      try {
        await setDoc(doc(db, 'users', currentUser.uid), {
          lastSeen: serverTimestamp()
        }, { merge: true });
      } catch (e) {
        console.error("Presence error:", e);
      }
    };

    updatePresence();
    const interval = setInterval(updatePresence, 25000);
    return () => clearInterval(interval);
  }, [currentUser]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (!user) router.push('/auth');
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (!chatId || !currentUser) return;

    const chatDocRef = doc(db, 'chats', chatId);
    const unsubscribeChat = onSnapshot(chatDocRef, async (chatDoc) => {
      if (chatDoc.exists()) {
        const chatData = chatDoc.data();
        
        if (chatData.isGroup) {
          setIsGroup(true);
          setGroupData({ id: chatDoc.id, ...chatData });

          if (chatData.participants && chatData.participants.length > 0) {
            const memberPromises = chatData.participants.map(async (uid: string) => {
              const uDoc = await getDoc(doc(db, 'users', uid));
              return uDoc.exists() ? { id: uDoc.id, ...uDoc.data() } : { id: uid, name: 'User' };
            });
            const resolvedMembers = await Promise.all(memberPromises);
            setGroupMembers(resolvedMembers);
          }
        } else {
          setIsGroup(false);
          const recipientId = chatData.participants?.find((id: string) => id !== currentUser.uid);
          
          if (recipientId) {
            const recipientDoc = await getDoc(doc(db, 'users', recipientId));
            if (recipientDoc.exists()) {
              const recData = recipientDoc.data();
              setRecipient({ id: recipientDoc.id, ...recData });

              const now = Date.now();
              const lastSeenVal: any = recData.lastSeen;
              const lastSeenTime = lastSeenVal?.toMillis ? lastSeenVal.toMillis() : (lastSeenVal?.seconds ? lastSeenVal.seconds * 1000 : 0);
              const online = now - lastSeenTime < 45000;
              setIsRecipientOnline(online);

              if (lastSeenTime > 0) {
                const lastSeenDate = new Date(lastSeenTime);
                const isToday = new Date().toDateString() === lastSeenDate.toDateString();
                const timeString = lastSeenDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                setRecipientLastSeenText(isToday ? `Last seen at ${timeString}` : `Last seen ${lastSeenDate.toLocaleDateString()}`);
              }
            } else {
              setRecipient({ id: recipientId, name: 'Community Member' });
            }

            const currentUserDoc = await getDoc(doc(db, 'users', currentUser.uid));
            if (currentUserDoc.exists()) {
              const myData = currentUserDoc.data();
              setIsFollowing(myData.followingIds?.includes(recipientId) || false);
              setIsBlocked(myData.blockedUsers?.includes(recipientId) || false);
            }
          }
        }
      }
    });

    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'));
    
    const unsubscribeMsg = onSnapshot(q, (snapshot) => {
      const fetchedMessages = snapshot.docs.map(document => ({
        id: document.id,
        ...document.data()
      }));
      setMessages(fetchedMessages);
      setIsLoading(false);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    });

    return () => {
      unsubscribeChat();
      unsubscribeMsg();
    };
  }, [chatId, currentUser]);

  useEffect(() => {
    if (!chatId || !currentUser) return;
    const clearUnreadCount = async () => {
      try {
        await updateDoc(doc(db, 'chats', chatId), {
          [`unreadCount.${currentUser.uid}`]: 0
        });
      } catch (error) {
        console.error(error);
      }
    };
    clearUnreadCount();
  }, [chatId, currentUser, messages.length]); 

  const fetchPlatformUsers = async () => {
    try {
      const usersSnap = await getDocs(collection(db, 'users'));
      const users = usersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      setAllPlatformUsers(users);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddMember = async (userId: string) => {
    if (!chatId) return;
    try {
      await updateDoc(doc(db, 'chats', chatId), {
        participants: arrayUnion(userId),
        [`unreadCount.${userId}`]: 0
      });
    } catch (e) {
      console.error(e);
      alert("Failed to add member.");
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!chatId) return;
    if (!window.confirm("Remove this member from the group?")) return;
    try {
      await updateDoc(doc(db, 'chats', chatId), {
        participants: arrayRemove(userId)
      });
    } catch (e) {
      console.error(e);
      alert("Failed to remove member.");
    }
  };

  const updateParentChat = async (textSnippet: string) => {
    if (!chatId || !currentUser) return;
    
    try {
      const chatRef = doc(db, 'chats', chatId);
      const chatSnap = await getDoc(chatRef);
      if (!chatSnap.exists()) return;
      const chatData = chatSnap.data();

      const updateData: any = {
        updatedAt: serverTimestamp(),
        lastMessage: textSnippet,
        lastMessageSenderId: currentUser.uid,
      };

      if (chatData.isGroup && chatData.participants) {
        chatData.participants.forEach((pId: string) => {
          if (pId !== currentUser.uid) {
            updateData[`unreadCount.${pId}`] = increment(1);
          }
        });
      } else {
        const recipientId = chatData.participants?.find((id: string) => id !== currentUser.uid);
        if (recipientId) {
          updateData[`unreadCount.${recipientId}`] = increment(1);
        }
      }

      await updateDoc(chatRef, updateData);
    } catch (e) {
      console.error("Failed to update parent chat stats:", e);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser || !chatId || isBlocked) return;

    const messageText = newMessage.trim();
    const replyData = replyingTo ? { replyToId: replyingTo.id, replyToText: replyingTo.text, replyToSender: replyingTo.sender } : null;
    
    setNewMessage('');
    setReplyingTo(null);

    try {
      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        text: messageText,
        type: 'text',
        senderId: currentUser.uid,
        createdAt: serverTimestamp(),
        ...replyData
      });
      await updateParentChat(messageText);

      if (!isGroup && recipient?.id) {
        fetch('/api/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipientId: recipient.id,
            title: currentUser.displayName || 'New Message',
            body: messageText,
            link: `/messages/room?id=${chatId}`
          })
        }).catch(err => console.error("Notification dispatch failed:", err));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleFileUpload = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser || !chatId) return;

    setIsUploading(true);
    const replyData = replyingTo ? { replyToId: replyingTo.id, replyToText: replyingTo.text, replyToSender: replyingTo.sender } : null;
    setReplyingTo(null);

    try {
      const isVideo = file.type.startsWith('video/');
      const isImage = file.type.startsWith('image/');
      
      let msgType = 'file';
      let resourceType: "image" | "video" | "raw" = 'raw';

      if (isVideo) { msgType = 'video'; resourceType = 'video'; } 
      else if (isImage) { msgType = 'image'; resourceType = 'image'; }

      const downloadUrl = await uploadMediaToCloudinary(file, resourceType);

      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        text: msgType === 'file' ? file.name : '',
        mediaUrl: downloadUrl,
        type: msgType,
        senderId: currentUser.uid,
        createdAt: serverTimestamp(),
        ...replyData
      });
      
      const snippet = msgType === 'image' ? '📸 Sent an image' : msgType === 'video' ? '🎥 Sent a video' : '📎 Sent a file';
      await updateParentChat(snippet);
    } catch (error) {
      console.error(error);
      alert("Failed to upload file.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSendLocation = async () => {
    if (!currentUser || !chatId) return;

    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setIsUploading(true);
    const replyData = replyingTo ? { replyToId: replyingTo.id, replyToText: replyingTo.text, replyToSender: replyingTo.sender } : null;
    setReplyingTo(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const locationUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;

        try {
          await addDoc(collection(db, 'chats', chatId, 'messages'), {
            text: locationUrl,
            mediaUrl: '',
            type: 'location',
            senderId: currentUser?.uid,
            createdAt: serverTimestamp(),
            ...replyData
          });
          await updateParentChat('📍 Shared a location');
          setLocationModalOpen(false);
        } catch (error) {
          console.error(error);
          alert("Failed to send location.");
        } finally {
          setIsUploading(false);
        }
      },
      (error) => {
        console.error(error);
        alert("Could not retrieve location.");
        setIsUploading(false);
      }
    );
  };

  const searchLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!locationQuery.trim()) return;
    setIsSearchingLocation(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationQuery)}&limit=5`);
      const data = await res.json();
      setLocationResults(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSearchingLocation(false);
    }
  };

  const handleSendSpecificLocation = async (lat: string, lon: string, displayName: string) => {
    if (!currentUser || !chatId) return;

    const locationUrl = `https://www.google.com/maps?q=${lat},${lon}`;
    setIsUploading(true);
    const replyData = replyingTo ? { replyToId: replyingTo.id, replyToText: replyingTo.text, replyToSender: replyingTo.sender } : null;
    setReplyingTo(null);

    try {
      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        text: locationUrl,
        mediaUrl: displayName, 
        type: 'location',
        senderId: currentUser?.uid,
        createdAt: serverTimestamp(),
        ...replyData
      });
      await updateParentChat('📍 Shared a location');
      
      setLocationModalOpen(false);
      setLocationResults([]);
      setLocationQuery('');
    } catch (error) {
      console.error(error);
      alert("Failed to send location.");
    } finally {
      setIsUploading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioPreviewBlob(audioBlob);
        setAudioPreviewUrl(audioUrl);
        setIsRecording(false);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error(error);
      alert("Microphone access denied.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) mediaRecorderRef.current.stop();
  };

  const handleSendAudioPreview = async () => {
    if (!audioPreviewBlob || !currentUser || !chatId) return;
    
    setIsUploading(true);
    const replyData = replyingTo ? { replyToId: replyingTo.id, replyToText: replyingTo.text, replyToSender: replyingTo.sender } : null;
    setReplyingTo(null);

    try {
      const downloadUrl = await uploadMediaToCloudinary(audioPreviewBlob, "video");
      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        text: '',
        mediaUrl: downloadUrl,
        type: 'audio',
        senderId: currentUser.uid,
        createdAt: serverTimestamp(),
        ...replyData
      });
      await updateParentChat('🎤 Sent a voice note');
      
      setAudioPreviewBlob(null);
      setAudioPreviewUrl(null);
    } catch (error) {
      console.error(error);
      alert("Failed to upload voice note.");
    } finally {
      setIsUploading(false);
    }
  };

  const discardAudioPreview = () => {
    setAudioPreviewBlob(null);
    setAudioPreviewUrl(null);
  };

  const handlePressStart = (msgId: string, isMine: boolean, text: string) => {
    pressTimer.current = setTimeout(() => {
      setDeleteTarget(prev => prev?.id === msgId ? null : { id: msgId, isMine, text });
    }, 500);
  };

  const handlePressEnd = () => {
    if (pressTimer.current) clearTimeout(pressTimer.current);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent, msg: any) => {
    if (!touchStartX.current) return;
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    if (diff > 50) {
      const senderName = msg.senderId === currentUser?.uid ? 'You' : (isGroup ? 'Member' : (recipient?.name || 'Member'));
      setReplyingTo({ id: msg.id, text: msg.type === 'text' ? msg.text : msg.type, sender: senderName });
    }
    touchStartX.current = null;
  };

  const confirmDeleteMessage = async (type: 'me' | 'everyone') => {
    if (!deleteTarget || !chatId || !currentUser) return;
    try {
      const msgRef = doc(db, 'chats', chatId, 'messages', deleteTarget.id);
      
      if (type === 'everyone' && deleteTarget.isMine) {
        await deleteDoc(msgRef);

        const chatDocRef = doc(db, 'chats', chatId);
        const chatSnap = await getDoc(chatDocRef);
        if (chatSnap.exists()) {
          const chatData = chatSnap.data();
          if (chatData.lastMessage === deleteTarget.text) {
            await updateDoc(chatDocRef, { lastMessage: 'Message deleted' });
          }
        }
      } else {
        await updateDoc(msgRef, { deletedBy: arrayUnion(currentUser.uid) });
      }
    } catch (error) {
      console.error(error);
      alert("Failed to delete message.");
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleFollowToggle = async () => {
    if (!currentUser || !recipient?.id) return;
    setMenuOpen(false);
    const prevFollowing = isFollowing;
    setIsFollowing(!prevFollowing);

    try {
      const targetUserRef = doc(db, 'users', recipient.id);
      const currentUserRef = doc(db, 'users', currentUser.uid);

      if (prevFollowing) {
        await setDoc(targetUserRef, { followers: increment(-1), followerIds: arrayRemove(currentUser.uid) }, { merge: true });
        await setDoc(currentUserRef, { following: increment(-1), followingIds: arrayRemove(recipient.id) }, { merge: true });
      } else {
        await setDoc(targetUserRef, { followers: increment(1), followerIds: arrayUnion(currentUser.uid) }, { merge: true });
        await setDoc(currentUserRef, { following: increment(1), followingIds: arrayUnion(recipient.id) }, { merge: true });
      }
    } catch (error: any) {
      console.error(error);
      setIsFollowing(prevFollowing);
    }
  };

  const handleBlockUser = async () => {
    if (!currentUser || !recipient?.id) return;
    setIsSubmitting(true);
    try {
      await setDoc(doc(db, 'users', currentUser.uid), { blockedUsers: arrayUnion(recipient.id) }, { merge: true });
      if (isFollowing) await handleFollowToggle(); 
      setIsBlocked(true);
      setBlockModalOpen(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReportUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !recipient?.id || !reportReason) return;
    setIsSubmitting(true);
    
    try {
      await addDoc(collection(db, 'reports'), {
        reporterId: currentUser.uid, reportedId: recipient.id, reason: reportReason, status: 'pending', createdAt: serverTimestamp()
      });
      setReportModalOpen(false);
      setReportReason('');
      alert("Report submitted successfully.");
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  const visibleMessages = messages.filter((m) => !m.deletedBy?.includes(currentUser?.uid));

  return (
    <div className="flex-1 flex flex-col min-h-0 w-full bg-white dark:bg-slate-950 shadow-sm relative transition-colors duration-300">
      
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 z-10 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300 cursor-pointer">
            <HiOutlineArrowLeft className="text-xl" />
          </button>
          
          {isGroup ? (
            <div onClick={() => setGroupInfoOpen(true)} className="flex items-center gap-3 cursor-pointer group">
              <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold shrink-0">
                <HiOutlineUserGroup className="text-xl" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                  {groupData?.title || 'Group Chat'}
                </h2>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                  {groupData?.participants?.length || 0} members • Tap for info
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href={`/host/${recipient?.id}`} className="w-10 h-10 rounded-full bg-emerald-100 overflow-hidden shrink-0 cursor-pointer hover:ring-2 hover:ring-emerald-500 transition-all flex items-center justify-center relative">
                {recipient?.photoURL ? (
                  <img src={recipient.photoURL} alt={recipient?.name || 'User'} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl font-bold text-emerald-700">{recipient?.name ? recipient.name.charAt(0) : 'U'}</span>
                )}
                {isRecipientOnline && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"></div>
                )}
              </Link>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  {recipient ? (recipient.name || 'Community Member') : 'Loading...'}
                </h2>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${isRecipientOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300 dark:bg-slate-600'}`}></span>
                  {isRecipientOnline ? <span className="text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">Online</span> : recipientLastSeenText}
                </p>
              </div>
            </div>
          )}
        </div>

        {!isGroup && (
          <div className="relative" ref={menuRef}>
            <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer">
              <HiEllipsisVertical className="text-xl" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden z-50">
                <Link href={`/host/${recipient?.id}`} className="flex items-center gap-3 w-full px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <HiOutlineUser className="text-lg text-slate-400 dark:text-slate-500" /> View Profile
                </Link>
                <button onClick={handleFollowToggle} className="flex items-center gap-3 w-full px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left cursor-pointer">
                  {isFollowing ? <><HiOutlineUserMinus className="text-lg text-slate-400 dark:text-slate-500" /> Unfollow User</> : <><HiOutlineUserPlus className="text-lg text-emerald-500" /> Follow User</>}
                </button>
                <div className="border-t border-slate-100 dark:border-slate-700 my-1"></div>
                <button onClick={() => { setReportModalOpen(true); setMenuOpen(false); }} className="flex items-center gap-3 w-full px-4 py-3 text-sm text-amber-600 dark:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors text-left cursor-pointer">
                  <HiOutlineFlag className="text-lg" /> Report User
                </button>
                <button onClick={() => { setBlockModalOpen(true); setMenuOpen(false); }} className="flex items-center gap-3 w-full px-4 py-3 text-sm text-rose-600 dark:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors text-left font-semibold cursor-pointer">
                  <HiOutlineNoSymbol className="text-lg" /> Block User
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {deleteTarget && (
        <div className="fixed inset-0 z-40" onClick={() => setDeleteTarget(null)} onTouchStart={() => setDeleteTarget(null)} />
      )}

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50 dark:bg-slate-950 relative" style={{ backgroundImage: 'radial-gradient(currentColor 1px, transparent 0)', backgroundSize: '20px 20px', color: 'rgba(148, 163, 184, 0.08)' }}>
        {visibleMessages.length === 0 ? (
          <div className="text-center py-10 text-slate-400 dark:text-slate-500 text-sm font-medium">
            Start the conversation. <br/><span className="text-xs text-slate-300 dark:text-slate-600">Swipe right to reply.</span>
          </div>
        ) : (
          visibleMessages.map((msg) => {
            const isMine = msg.senderId === currentUser?.uid;
            const isMenuOpen = deleteTarget?.id === msg.id;
            const messageDisplayText = msg.type === 'text' ? msg.text : msg.type;
            const isMedia = msg.type === 'image' || msg.type === 'video' || msg.type === 'location' || msg.type === 'audio' || msg.type === 'file';

            return (
              <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-2 relative ${isMenuOpen ? 'z-50' : 'z-0'}`}>
                <div 
                  className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} max-w-xs sm:max-w-md`}
                  onMouseLeave={() => { if (isMenuOpen) setDeleteTarget(null); }}
                >
                  <div 
                    className={`cursor-pointer select-none transition-transform duration-200 ${
                      isMedia
                        ? 'rounded-2xl overflow-hidden' 
                        : isMine 
                          ? 'px-4 py-2.5 bg-emerald-600 text-white rounded-2xl rounded-tr-sm shadow-sm' 
                          : 'px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-2xl rounded-tl-sm shadow-sm'
                    } ${isMenuOpen ? 'ring-2 ring-emerald-400 scale-[0.98]' : ''}`}
                    onTouchStart={(e) => { handlePressStart(msg.id, isMine, messageDisplayText); handleTouchStart(e); }}
                    onTouchEnd={(e) => { handlePressEnd(); handleTouchEnd(e, msg); }}
                    onTouchMove={handlePressEnd}
                    onMouseDown={() => handlePressStart(msg.id, isMine, messageDisplayText)}
                    onMouseUp={handlePressEnd}
                    onMouseLeave={handlePressEnd}
                    onContextMenu={(e) => e.preventDefault()}
                    onDoubleClick={() => {
                      const senderName = isMine ? 'You' : (isGroup ? 'Member' : (recipient?.name || 'Member'));
                      setReplyingTo({ id: msg.id, text: messageDisplayText, sender: senderName });
                    }}
                  >
                    {msg.replyToText && (
                      <div className={`mb-2 p-2 rounded-xl text-xs border-l-4 ${isMine && !isMedia ? 'bg-emerald-700/50 border-emerald-300 text-emerald-50' : 'bg-slate-100 dark:bg-slate-800 border-emerald-500 text-slate-600 dark:text-slate-300'} line-clamp-2`}>
                        <span className="font-bold block text-[10px] mb-0.5">{msg.replyToSender}</span>
                        {msg.replyToText}
                      </div>
                    )}

                    {msg.type === 'image' && (
                      <a href={msg.mediaUrl} target="_blank" rel="noopener noreferrer" className="block cursor-pointer" onClick={(e) => e.stopPropagation()}>
                        <img src={msg.mediaUrl} alt="Sent media" className="rounded-2xl max-w-full h-auto max-h-72 object-cover hover:opacity-95 transition-opacity shadow-sm" />
                      </a>
                    )}
                    {msg.type === 'video' && (
                      <video controls src={msg.mediaUrl} className="max-w-full rounded-2xl h-auto max-h-72 outline-none pointer-events-auto shadow-sm" onClick={(e) => e.stopPropagation()} />
                    )}
                    {msg.type === 'file' && (
                      <a href={msg.mediaUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:opacity-90 transition-opacity pointer-events-auto" onClick={(e) => e.stopPropagation()}>
                        <HiOutlinePaperClip className="text-xl shrink-0 text-slate-500" />
                        <span className="text-sm font-medium truncate max-w-xs underline text-slate-900 dark:text-white">{msg.text || 'Download File'}</span>
                      </a>
                    )}
                    {msg.type === 'location' && (
                      <a href={msg.text} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:opacity-90 transition-opacity pointer-events-auto" onClick={(e) => e.stopPropagation()}>
                        <HiOutlineMapPin className="text-2xl shrink-0 text-emerald-500 bg-emerald-50 dark:bg-emerald-900/40 p-2 rounded-xl" />
                        <div className="flex flex-col pr-2">
                          <span className="text-sm font-bold underline text-slate-900 dark:text-white">View on Google Maps</span>
                          {msg.mediaUrl && <span className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 max-w-xs mt-0.5">{msg.mediaUrl}</span>}
                        </div>
                      </a>
                    )}
                    {msg.type === 'audio' && (
                      <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
                        <audio controls src={msg.mediaUrl} className="max-w-full sm:w-64 h-10 outline-none pointer-events-auto" onClick={(e) => e.stopPropagation()} />
                      </div>
                    )}
                    {(!msg.type || msg.type === 'text') && (
                      <span className="whitespace-pre-wrap block leading-relaxed text-[14px] sm:text-[15px]">{msg.text}</span>
                    )}
                  </div>

                  {isMenuOpen && (
                    <div className="mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-2xl overflow-hidden flex flex-col w-44 z-10 transition-all animate-in fade-in zoom-in-95 duration-100 relative">
                      <button 
                        onClick={() => {
                          const senderName = isMine ? 'You' : (isGroup ? 'Member' : (recipient?.name || 'Member'));
                          setReplyingTo({ id: msg.id, text: messageDisplayText, sender: senderName });
                          setDeleteTarget(null);
                        }}
                        className="flex items-center gap-2.5 px-4 py-3 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors cursor-pointer border-b border-slate-100 dark:border-slate-800 relative z-20"
                      >
                        <HiOutlineArrowUturnLeft className="text-sm text-slate-400 dark:text-slate-500 shrink-0" /> Reply
                      </button>
                      {isMine && (
                        <button 
                          onClick={() => confirmDeleteMessage('everyone')} 
                          className="flex items-center gap-2.5 px-4 py-3 text-xs font-bold text-rose-600 dark:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-left transition-colors cursor-pointer relative z-20 whitespace-nowrap"
                        >
                          <HiOutlineTrash className="text-sm text-rose-500 shrink-0" /> Delete for everyone
                        </button>
                      )}
                      <button 
                        onClick={() => confirmDeleteMessage('me')} 
                        className="flex items-center gap-2.5 px-4 py-3 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors border-t border-slate-100 dark:border-slate-800 cursor-pointer relative z-20 whitespace-nowrap"
                      >
                        <HiOutlineTrash className="text-sm text-slate-400 dark:text-slate-500 shrink-0" /> Delete for me
                      </button>
                    </div>
                  )}

                </div>
              </div>
            );
          })
        )}
        {isUploading && (
          <div className="flex justify-end">
            <div className="max-w-xs px-4 py-2.5 rounded-2xl text-sm bg-emerald-600/50 text-white rounded-tr-sm animate-pulse">
              Sending media...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} className="h-4" />
      </div>

      <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 relative z-10 shrink-0 shadow-sm">
        {replyingTo && (
          <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3 overflow-hidden border-l-4 border-emerald-500 pl-3">
              <HiOutlineArrowUturnLeft className="text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div className="flex flex-col overflow-hidden">
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Replying to {replyingTo.sender}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 truncate">{replyingTo.text}</span>
              </div>
            </div>
            <button onClick={() => setReplyingTo(null)} className="p-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 rounded-full transition-colors shrink-0 cursor-pointer">
              <HiOutlineXMark className="text-sm" />
            </button>
          </div>
        )}

        <div className="p-3 sm:p-4">
          {isBlocked ? (
            <div className="flex items-center justify-center gap-2 py-3 px-4 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-500 dark:text-slate-400 text-sm font-medium border border-slate-200 dark:border-slate-700">
              <HiOutlineNoSymbol className="text-lg" />
              You blocked this user. Unblock them to send messages.
            </div>
          ) : audioPreviewUrl ? (
            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full py-2 px-4 w-full">
              <button onClick={discardAudioPreview} disabled={isUploading} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-full transition-colors cursor-pointer disabled:opacity-50">
                <HiOutlineTrash className="text-lg" />
              </button>
              <audio src={audioPreviewUrl} controls className="h-9 flex-1" />
              <button onClick={handleSendAudioPreview} disabled={isUploading} className="flex h-9 w-9 shrink-0 items-center justify-center bg-emerald-600 text-white rounded-full hover:bg-emerald-500 transition-colors disabled:opacity-50 cursor-pointer shadow-sm">
                <HiPaperAirplane className="text-[15px] translate-x-[1.5px] -translate-y-[1px]" />
              </button>
            </div>
          ) : (
            <form onSubmit={handleSendMessage} className="flex items-center gap-2 relative">
              <input type="file" accept="image/png, image/jpeg, image/jpg, image/webp, video/mp4, video/quicktime, application/pdf, .doc, .docx" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
              
              <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2.5 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors shrink-0 cursor-pointer">
                <HiOutlinePaperClip className="text-xl" />
              </button>

              <button type="button" onClick={() => setLocationModalOpen(true)} className="p-2.5 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors shrink-0 cursor-pointer" title="Share Location">
                <HiOutlineMapPin className="text-xl" />
              </button>

              <input 
                type="text" 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder-slate-400 border border-slate-200 dark:border-slate-700 rounded-full py-3 px-4 sm:px-5 text-sm sm:text-base outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all pr-12"
              />
              
              <div className="absolute right-2 flex items-center gap-1">
                {!newMessage.trim() ? (
                  isRecording ? (
                    <button type="button" onClick={stopRecording} className="p-2 rounded-full bg-rose-500 text-white hover:bg-rose-600 transition-colors animate-pulse cursor-pointer">
                      <HiStop className="text-sm" />
                    </button>
                  ) : (
                    <button type="button" onClick={startRecording} className="p-2 rounded-full text-slate-400 dark:text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                      <HiOutlineMicrophone className="text-lg" />
                    </button>
                  )
                ) : (
                  <button type="submit" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white hover:bg-emerald-500 transition-colors cursor-pointer shadow-sm">
                    <HiPaperAirplane className="text-base translate-x-[1.5px] -translate-y-[1px]" />
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>

      {groupInfoOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col max-h-[80vh] border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-150">
            
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                Members ({groupMembers.length})
              </h3>
              <button onClick={() => setGroupInfoOpen(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer p-1.5">
                <HiOutlineXMark className="text-lg" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 flex-1 divide-y divide-slate-100 dark:divide-slate-800/60">
              <div className="pb-2 flex justify-between items-center">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Participants</span>
                <button 
                  onClick={() => { fetchPlatformUsers(); setAddMemberOpen(true); }}
                  className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer flex items-center gap-1"
                >
                  <HiOutlinePlus className="text-xs" /> Add member
                </button>
              </div>

              <div className="pt-3 space-y-3">
                {groupMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {member.photoURL ? (
                        <img src={member.photoURL} alt={member.name} className="w-9 h-9 rounded-full object-cover" />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                          {member.name?.charAt(0) || 'U'}
                        </div>
                      )}
                      <div>
                        <p className="text-[14px] font-bold text-slate-900 dark:text-white">
                          {member.name || 'Member'} {member.id === currentUser?.uid ? <span className="text-emerald-600 font-normal">(You)</span> : ''}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate max-w-[150px]">{member.email}</p>
                      </div>
                    </div>

                    {groupData?.admins?.includes(currentUser?.uid) && member.id !== currentUser?.uid && (
                      <button 
                        onClick={() => handleRemoveMember(member.id)}
                        className="text-xs text-rose-500 font-bold hover:underline cursor-pointer"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 shrink-0 flex justify-end">
              <button 
                onClick={() => setGroupInfoOpen(false)}
                className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl transition-colors cursor-pointer text-sm shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {addMemberOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col max-h-[70vh] border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-150">
            
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Add member</h3>
              <button onClick={() => setAddMemberOpen(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer p-1.5">
                <HiOutlineXMark className="text-lg" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-2 flex-1">
              {allPlatformUsers
                .filter(u => !groupData?.participants?.includes(u.id))
                .map((user) => (
                  <div key={user.id} className="p-2.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-center justify-between transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      {user.photoURL ? (
                        <img src={user.photoURL} alt={user.name} className="w-9 h-9 rounded-full object-cover shrink-0" />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xs shrink-0">
                          {user.name?.charAt(0) || 'U'}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-[14px] font-bold text-slate-900 dark:text-white truncate">{user.name || 'User'}</p>
                        <p className="text-[11px] text-slate-400 truncate max-w-[140px]">{user.email}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleAddMember(user.id)}
                      className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-500 transition-colors cursor-pointer shrink-0 shadow-sm"
                    >
                      Add
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {reportModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden p-6 border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2"><HiOutlineFlag className="text-amber-500 text-lg" /> Report User</h3>
              <button onClick={() => setReportModalOpen(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1"><HiOutlineXMark className="text-lg" /></button>
            </div>
            <form onSubmit={handleReportUser}>
              <p className="text-[14px] text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">Why are you reporting {recipient?.name}?</p>
              <select value={reportReason} onChange={(e) => setReportReason(e.target.value)} required className="w-full bg-slate-100 dark:bg-slate-800 border-none text-slate-900 dark:text-white text-[14px] rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-emerald-500 mb-6">
                <option value="" disabled>Select a reason...</option>
                <option value="spam">Spam or Scams</option>
                <option value="harassment">Harassment or Bullying</option>
                <option value="inappropriate">Inappropriate Content</option>
              </select>
              <button type="submit" disabled={!reportReason || isSubmitting} className="w-full bg-amber-500 text-white font-bold py-3 rounded-xl hover:bg-amber-600 transition-colors disabled:opacity-50 cursor-pointer shadow-sm text-[14px]">
                {isSubmitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </form>
          </div>
        </div>
      )}

      {blockModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden p-6 text-center border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-150">
            <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4"><HiOutlineNoSymbol className="text-3xl" /></div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base mb-2">Block {recipient?.name}?</h3>
            <p className="text-[14px] text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">They won't be able to send you messages or find your profile.</p>
            <div className="flex gap-3">
              <button onClick={() => setBlockModalOpen(false)} className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold py-3 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer text-[14px]">Cancel</button>
              <button onClick={handleBlockUser} disabled={isSubmitting} className="flex-1 bg-rose-600 text-white font-bold py-3 rounded-xl hover:bg-rose-700 transition-colors disabled:opacity-50 cursor-pointer shadow-sm text-[14px]">{isSubmitting ? 'Blocking...' : 'Block User'}</button>
            </div>
          </div>
        </div>
      )}

      {locationModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden p-6 flex flex-col max-h-[80vh] border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center mb-4 shrink-0">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2"><HiOutlineMapPin className="text-emerald-500 text-lg" /> Share Location</h3>
              <button onClick={() => setLocationModalOpen(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1"><HiOutlineXMark className="text-lg" /></button>
            </div>
            <button onClick={handleSendLocation} className="w-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-bold py-3 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors mb-4 shrink-0 cursor-pointer text-[14px]">Send My Current Location</button>
            <div className="relative flex items-center mb-4 shrink-0"><div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div><span className="mx-4 text-slate-400 text-xs font-semibold">or search</span><div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div></div>
            <form onSubmit={searchLocation} className="flex gap-2 mb-4 shrink-0">
              <input type="text" value={locationQuery} onChange={(e) => setLocationQuery(e.target.value)} placeholder="Search for a place..." className="flex-1 bg-slate-100 dark:bg-slate-800 border-none text-[14px] text-slate-900 dark:text-white rounded-xl py-2.5 px-4 outline-none focus:ring-2 focus:ring-emerald-500" />
              <button type="submit" disabled={isSearchingLocation || !locationQuery.trim()} className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 rounded-xl text-xs font-bold disabled:opacity-50 cursor-pointer shadow-sm">{isSearchingLocation ? '...' : 'Search'}</button>
            </form>
            <div className="overflow-y-auto flex-1 space-y-2">
              {locationResults.map((place, idx) => (
                <button key={idx} onClick={() => handleSendSpecificLocation(place.lat, place.lon, place.display_name)} className="w-full text-left p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-transparent transition-colors cursor-pointer">
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{place.name || place.display_name.split(',')[0]}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{place.display_name}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ChatRoomPage() {
  return (
    <main className="bg-white dark:bg-slate-950 flex flex-col h-[100dvh] overflow-hidden transition-colors duration-300">
      <Suspense fallback={<div className="flex-1 flex items-center justify-center dark:text-white text-sm font-medium">Loading chat...</div>}>
        <ChatRoomContent />
      </Suspense>
    </main>
  );
}