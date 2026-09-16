'use client';

import { useEffect, useState, useRef } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Logo from '@/components/Logo';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { 
  HiOutlineArrowRightOnRectangle, 
  HiOutlineCalendar, 
  HiOutlineStar, 
  HiOutlineTrophy, 
  HiOutlineUserCircle,
  HiOutlineCog6Tooth,
  HiOutlineCamera,
  HiOutlineLockClosed,
  HiOutlinePhone,
  HiOutlineTrash,
  HiOutlinePencil,
  HiOutlineArrowLeft,
  HiOutlineUser
} from 'react-icons/hi2';

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'settings'>('dashboard');
  const router = useRouter();

  // Accordion / Toggle States
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);

  // Settings Input States
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Processing State & Dynamic Loading Message
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('AUTHENTICATING...');
  const [showDeleteWarning, setShowDeleteWarning] = useState(false);

  // Guard to prevent auth listener race conditions during manual sign out
  const isSigningOutRef = useRef(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (isSigningOutRef.current) return; // Ignore if we are actively signing out

      if (currentUser) {
        setUser(currentUser);
        setIsLoading(false);
      } else {
        router.push('/auth?next=/account');
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleSignOut = async () => {
    isSigningOutRef.current = true;
    setLoadingMessage('SIGNING OUT...');
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

  const handleImageUpload = () => {
    alert("Firebase Storage integration coming next!");
  };

  const handleUpdateName = () => {
    setLoadingMessage('UPDATING NAME...');
    setIsProcessing(true);
    setTimeout(() => {
      alert("Display Name update connected to Firebase soon!");
      setIsEditingName(false);
      setNewName('');
      setIsProcessing(false);
    }, 1500);
  };

  const handleUpdatePhone = () => {
    setLoadingMessage('UPDATING PHONE...');
    setIsProcessing(true);
    setTimeout(() => {
      alert("Phone number update connected to Firebase soon!");
      setIsEditingPhone(false);
      setNewPhone('');
      setIsProcessing(false);
    }, 1500);
  };

  const handleUpdatePassword = () => {
    if (newPassword && newPassword !== confirmPassword) {
      return alert("Your new passwords do not match. Please try again.");
    }
    setLoadingMessage('SECURING ACCOUNT...');
    setIsProcessing(true);
    setTimeout(() => {
      alert("Password update connected to Firebase soon!");
      setIsEditingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsProcessing(false);
    }, 1500);
  };

  const handleDeleteAccount = () => {
    setLoadingMessage('DELETING ACCOUNT...');
    setIsProcessing(true);
    setTimeout(() => {
      alert("Account deletion logic connecting to Firebase soon!");
      setShowDeleteWarning(false);
      setIsProcessing(false);
    }, 1500);
  };

  const renderSplashScreen = (message: string) => (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-sm 
         transition-opacity duration-500">
      <div className="flex flex-col items-center gap-6">
        
        <div className="relative flex items-center justify-center animate-pulse">
          <div className="absolute inset-0 bg-emerald-500/25 blur-2xl rounded-full scale-[2.0]"></div>
          <Logo size={85} theme="dark" className="relative z-10" />
        </div>
        
        <div className="flex items-center gap-3">
          <svg className="animate-spin h-4 w-4 text-emerald-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 
                7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-emerald-400 font-bold tracking-[0.15em] uppercase text-xs drop-shadow-md">
            {message}
          </p>
        </div>

      </div>
    </div>
  );

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-50 flex flex-col justify-between">
        <Navbar />
        {renderSplashScreen('LOADING PROFILE...')}
        <Footer />
      </main>
    );
  }

  if (!user) return null; 

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      
      {isProcessing && renderSplashScreen(loadingMessage)}
      
      <div>
        <Navbar />
        {activeTab === 'dashboard' && (
          <>
            <section className="bg-slate-900 text-white py-12 px-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.15),transparent_50%)]"></div>
              
              <div className="absolute top-6 right-6 z-20">
                <button
                  onClick={() => setActiveTab('settings')}
                  title="Settings"
                  className="p-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded-full 
                  transition-all border border-slate-700 shadow-sm">
                  <HiOutlineCog6Tooth className="text-xl" />
                </button>
              </div>

              <div className="mx-auto max-w-4xl relative z-10 flex flex-col sm:flex-row items-center sm:items-start 
                   justify-between gap-6 text-center sm:text-left mt-4 sm:mt-0">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="relative group cursor-pointer" onClick={() => setActiveTab('settings')}>
                    {user.photoURL ? (
                      <img 
                        src={user.photoURL} 
                        alt="Profile" 
                        className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-slate-800 shadow-xl object-cover 
                        group-hover:opacity-75 transition-opacity"
                        referrerPolicy="no-referrer"
                        />
                    ) : (
                      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-slate-800 border-4 border-slate-700 flex 
                           items-center justify-center shrink-0 group-hover:opacity-75 transition-opacity">
                        <HiOutlineUserCircle className="text-4xl text-slate-400" />
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 
                         transition-opacity">
                      <div className="bg-slate-900/80 p-2 rounded-full">
                        <HiOutlinePencil className="text-white text-lg" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h1 className="text-3xl font-extrabold tracking-tight">
                      {user.displayName || 'SkillForge Member'}
                    </h1>
                    <p className="text-sm text-emerald-400 font-medium tracking-wide">
                      {user.email || user.phoneNumber || 'No contact info provided'}
                    </p>
                    <div className="pt-2">
                      <span className="inline-block text-[10px] uppercase tracking-wider font-bold bg-emerald-950
                           text-emerald-400 px-3 py-1 rounded-full border border-emerald-800">
                        Community Member
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Stats Area */}
            <section className="mx-auto max-w-4xl px-4 sm:px-6 py-12">
              <div className="space-y-12">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4
                      hover:border-emerald-200 transition-colors">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl shrink-0">
                      <HiOutlineCalendar className="text-2xl" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Events Joined</p>
                      <p className="text-2xl font-black text-slate-900">0</p>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4
                      hover:border-blue-200 transition-colors">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl shrink-0">
                      <HiOutlineStar className="text-2xl" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Workshops Hosted</p>
                      <p className="text-2xl font-black text-slate-900">0</p>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4
                       hover:border-amber-200 transition-colors">
                    <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl shrink-0">
                      <HiOutlineTrophy className="text-2xl" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Impact Score</p>
                      <p className="text-2xl font-black text-slate-900">10</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

           {/* SETTINGS */}
        {activeTab === 'settings' && (
          <section className="mx-auto max-w-2xl px-4 sm:px-6 py-8 sm:py-12">
            
            <button 
              onClick={() => {
                setActiveTab('dashboard');
                setShowDeleteWarning(false);
                setIsEditingName(false);
                setIsEditingPhone(false);
                setIsEditingPassword(false);
              }}
              className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold text-sm mb-6 
              transition-colors w-fit">
              <HiOutlineArrowLeft className="text-lg" />
              Back to Dashboard
            </button>

            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
              <h2 className="text-xl font-extrabold text-slate-900 border-b border-slate-100 pb-4 mb-6">Account Settings</h2>
              
              <div className="space-y-5">
                
                {/* Profile Picture Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border
                    border-slate-100 bg-slate-50/50 gap-4">
                  <div className="flex items-center gap-4">
                    {user.photoURL ? (
                      <img 
                        src={user.photoURL} 
                        alt="Profile" 
                        className="w-14 h-14 rounded-full object-cover border border-slate-200 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-slate-200 border border-slate-300 flex items-center 
                           justify-center shrink-0">
                        <HiOutlineUserCircle className="text-3xl text-slate-500" />
                      </div>
                    )}
                    <div>
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Profile Picture</p>
                      <p className="text-xs text-slate-600 mt-0.5">JPEG or PNG, max 2MB</p>
                    </div>
                  </div>
                  <button
                    onClick={handleImageUpload}
                    className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-white border border-slate-200
                    hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-full transition-colors shadow-sm w-full sm:w-auto">
                    <HiOutlineCamera className="text-sm shrink-0" />
                    Change Image
                  </button>
                </div>

                {/* Display Name Section */}
                <div className="border border-slate-100 rounded-2xl overflow-hidden">
                  <div className="flex items-center justify-between p-4 bg-slate-50/50">
                    <div className="pr-4 overflow-hidden">
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Display Name</p>
                      <p className="text-sm font-medium text-slate-900 mt-1 truncate">{user.displayName || 'Not provided'}</p>
                    </div>
                    {!isEditingName && (
                      <button
                        onClick={() => setIsEditingName(true)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50
                         text-slate-700 text-xs font-bold rounded-full transition-colors shadow-sm shrink-0">
                        <HiOutlinePencil className="text-sm" />
                        {user.displayName ? 'Edit' : 'Add'}
                      </button>
                    )}
                  </div>
                  
                  {isEditingName && (
                    <div className="p-4 bg-white border-t border-slate-100 space-y-4">
                      <div className="relative">
                        <HiOutlineUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                        <input 
                          type="text" 
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          placeholder="Enter your name" 
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm 
                          font-medium outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                        />
                      </div>
                      <div className="flex justify-end gap-3">
                        <button 
                          onClick={() => setIsEditingName(false)}
                          className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors">
                          Cancel
                        </button>
                        <button 
                          onClick={handleUpdateName}
                          className="rounded-full bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white
                           hover:bg-emerald-500 transition-colors shadow-sm"
                        >
                          Save Name
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="border border-slate-100 rounded-2xl overflow-hidden">
                  <div className="flex items-center justify-between p-4 bg-slate-50/50">
                    <div className="pr-4 overflow-hidden">
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Phone Number</p>
                      <p className="text-sm font-medium text-slate-900 mt-1 truncate">{user.phoneNumber || 'Not provided'}</p>
                    </div>
                    {!isEditingPhone && (
                      <button
                        onClick={() => setIsEditingPhone(true)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50
                         text-slate-700 text-xs font-bold rounded-full transition-colors shadow-sm shrink-0">
                        <HiOutlinePencil className="text-sm" />
                        {user.phoneNumber ? 'Edit' : 'Add'}
                      </button>
                    )}
                  </div>
                  
                  {isEditingPhone && (
                    <div className="p-4 bg-white border-t border-slate-100 space-y-4">
                      <div className="relative">
                        <HiOutlinePhone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                        <input 
                          type="tel" 
                          value={newPhone}
                          onChange={(e) => setNewPhone(e.target.value)}
                          placeholder="Enter new phone number" 
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm font-medium 
                          outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                        />
                      </div>
                      <div className="flex justify-end gap-3">
                        <button 
                          onClick={() => setIsEditingPhone(false)}
                          className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors"
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={handleUpdatePhone}
                          className="rounded-full bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 
                          transition-colors shadow-sm">
                          Save Phone
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Password Section */}
                <div className="border border-slate-100 rounded-2xl overflow-hidden">
                  <div className="flex items-center justify-between p-4 bg-slate-50/50">
                    <div className="pr-4 overflow-hidden">
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Password</p>
                      <p className="text-sm font-medium text-slate-900 mt-1 tracking-widest truncate">••••••••</p>
                    </div>
                    {!isEditingPassword && (
                      <button
                        onClick={() => setIsEditingPassword(true)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200
                       hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-full transition-colors shadow-sm shrink-0">
                        <HiOutlinePencil className="text-sm" />
                        Edit
                      </button>
                    )}
                  </div>

                  {isEditingPassword && (
                    <div className="p-4 bg-white border-t border-slate-100 space-y-4">
                      <div className="space-y-3">
                        <div className="relative">
                          <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg"/>
                          <input 
                            type="password" 
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="Current Password" 
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm 
                            font-medium outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                          />
                        </div>
                        <div className="relative">
                          <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg"/>
                          <input 
                            type="password" 
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="New Password" 
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm 
                            font-medium outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                          />
                        </div>
                        <div className="relative">
                          <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg"/>
                          <input 
                            type="password" 
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm New Password" 
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm 
                            font-medium outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                          />
                        </div>
                      </div>
                      
                      <div className="flex justify-end gap-3 pt-2">
                        <button 
                          onClick={() => setIsEditingPassword(false)}
                          className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors">
                          Cancel
                        </button>
                        <button 
                          onClick={handleUpdatePassword}
                          className="rounded-full bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white
                           hover:bg-emerald-500 transition-colors shadow-sm">
                          Update Password
                        </button>
                      </div>
                    </div>
                  )}
                </div>

              </div>

              {/* Danger Zone */}
              <div className="mt-10 space-y-4">
                <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 
                    pb-2">Account Actions</h3>
                
                <div className="flex flex-col sm:flex-row flex-wrap gap-3 pt-2">
                  <button 
                    onClick={handleSignOut}
                    type="button"
                    className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-2.5 bg-slate-100 border
                    border-slate-200 text-slate-700 text-sm font-bold rounded-full hover:bg-slate-200 transition-colors shadow-sm">
                    <HiOutlineArrowRightOnRectangle className="text-lg shrink-0" />
                    Sign Out
                  </button>

                  {!showDeleteWarning ? (
                    <button 
                      onClick={() => setShowDeleteWarning(true)}
                      type="button"
                      className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-2.5 bg-white border
                      border-red-200 text-red-600 text-sm font-bold rounded-full hover:bg-red-50 hover:border-red-300 
                      transition-colors shadow-sm">
                      <HiOutlineTrash className="text-lg shrink-0" />
                      Delete Account
                    </button>
                  ) : null}
                </div>

                {/* Inline Delete Confirmation */}
                {showDeleteWarning && (
                  <div className="mt-4 p-4 sm:p-5 bg-red-50 border border-red-200 rounded-2xl space-y-3">
                    <h4 className="text-sm font-bold text-red-800">Are you absolutely sure?</h4>
                    <p className="text-xs text-red-600 leading-relaxed">
                      This action cannot be undone. All your data, impact score, and event history will be permanently 
                      deleted from SkillForge.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                      <button 
                        onClick={handleDeleteAccount}
                        className="w-full sm:w-auto px-5 py-2.5 bg-red-600 text-white text-xs font-bold rounded-full
                         hover:bg-red-700 transition-colors shadow-sm">
                        Yes, Delete My Account
                      </button>
                      <button 
                        onClick={() => setShowDeleteWarning(false)}
                        className="w-full sm:w-auto px-5 py-2.5 bg-white text-slate-700 border border-slate-300 
                        text-xs font-bold rounded-full hover:bg-slate-50 transition-colors shadow-sm">
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </section>
        )}

      </div>
      <Footer/>
    </main>
  );
}
