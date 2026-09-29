
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User, sendEmailVerification } from 'firebase/auth';
import { doc, updateDoc, setDoc, getDoc } from 'firebase/firestore';
import { 
  HiOutlineEnvelope, 
  HiOutlineArrowPath, 
  HiOutlineIdentification, 
  HiOutlineClock,
  HiOutlineCamera,
  HiOutlineShieldCheck
} from 'react-icons/hi2';

export default function VerifyPage() {
  const [user, setUser] = useState<User | null>(null);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1); 
  
  const [isSending, setIsSending] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  
  const [isSubmittingId, setIsSubmittingId] = useState(false);
  const [idFile, setIdFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push('/auth?next=/verify');
        return;
      }
      
      setUser(currentUser);
      
      try {
        const userRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const userData = userSnap.data();
          if (userData.isVerified) {
            router.push('/host'); 
          } else if (userData.verificationStatus === 'pending') {
            setCurrentStep(3); 
          } else if (currentUser.emailVerified) {
            setCurrentStep(2); 
          }
        } else {
          await setDoc(userRef, { 
            email: currentUser.email,
            name: currentUser.displayName || '',
            photoURL: currentUser.photoURL || '',
            isVerified: false,
            createdAt: new Date()
          });
          
          if (currentUser.emailVerified) {
            setCurrentStep(2);
          }
        }
      } catch (error) {
        console.error("Status check failed:", error);
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleSendVerificationEmail = async () => {
    if (!user) return;
    setIsSending(true);
    try {
      await sendEmailVerification(user);
      setEmailSent(true);
      alert(`Verification email sent to ${user.email}.`);
    } catch (error: any) {
      if (error.code === 'auth/too-many-requests') {
        alert("We already sent an email recently. Check your inbox.");
      } else {
        alert("Failed to send email. Try again later.");
      }
    } finally {
      setIsSending(false);
    }
  };

  const handleCheckEmailStatus = async () => {
    if (!user) return;
    setIsChecking(true);
    try {
      await user.reload();
      if (auth.currentUser?.emailVerified) {
        setCurrentStep(2);
      } else {
        alert("Your email is not verified yet. Please click the link in your inbox.");
      }
    } catch (error) {
      console.error("Status check error:", error);
    } finally {
      setIsChecking(false);
    }
  };

  const handleIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) return alert("ID file is too large. Max 10MB.");
      setIdFile(file);
    }
  };

  const handleSelfieChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) return alert("Selfie file is too large. Max 10MB.");
      setSelfieFile(file);
    }
  };

  const uploadToCloudinary = async (file: File) => {
    const cloudinaryCloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_PRESET;

    if (!cloudinaryCloudName || !uploadPreset) throw new Error("Cloudinary config missing.");

    const uploadData = new FormData();
    uploadData.append('file', file);
    uploadData.append('upload_preset', uploadPreset);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/image/upload`, {
      method: 'POST',
      body: uploadData,
    });

    if (!res.ok) throw new Error('Upload failed');
    const data = await res.json();
    return data.secure_url;
  };

  const submitIdentityVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !idFile || !selfieFile || !phoneNumber) {
      alert("Please provide a phone number, upload your ID, and upload a selfie.");
      return;
    }

    setIsSubmittingId(true);
    try {
      const [idUrl, selfieUrl] = await Promise.all([
        uploadToCloudinary(idFile),
        uploadToCloudinary(selfieFile)
      ]);

      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        phoneNumber: phoneNumber,
        verificationIdUrl: idUrl,
        verificationSelfieUrl: selfieUrl,
        verificationStatus: 'pending',
        isVerified: false 
      });

      setCurrentStep(3);

    } catch (error) {
      console.error("Verification submission failed:", error);
      alert("Failed to submit verification. Please try again.");
    } finally {
      setIsSubmittingId(false);
    }
  };

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 flex flex-col font-sans transition-colors duration-300">
      <Navbar />
      
      <div className="flex-1 w-full flex flex-col items-center justify-center px-5 pt-[80px] pb-20">
        
        <div className="w-full max-w-md">
          
          <div className="flex items-center gap-2 mb-10">
            <div className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${currentStep >= 1 ? 'bg-emerald-500' : 'bg-slate-100 dark:bg-slate-800'}`}></div>
            <div className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${currentStep >= 2 ? 'bg-emerald-500' : 'bg-slate-100 dark:bg-slate-800'}`}></div>
            <div className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${currentStep === 3 ? 'bg-emerald-500' : 'bg-slate-100 dark:bg-slate-800'}`}></div>
          </div>

          {currentStep === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400">
                <HiOutlineEnvelope className="text-3xl" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">Verify your email</h1>
              <p className="text-[14px] sm:text-[15px] text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                To secure your account, please verify your email address. A secure link will be sent to <span className="font-semibold text-slate-900 dark:text-white">{user?.email}</span>.
              </p>
              
              <div className="space-y-3">
                <button 
                  onClick={handleSendVerificationEmail} 
                  disabled={isSending || emailSent} 
                  className="w-full rounded-xl bg-emerald-600 px-6 py-3 text-[14px] font-bold text-white hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {isSending ? 'Sending link...' : emailSent ? 'Link sent. Check inbox.' : 'Send verification link'}
                </button>
                
                <button 
                  onClick={handleCheckEmailStatus} 
                  disabled={isChecking} 
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-6 py-3 text-[14px] font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <HiOutlineArrowPath className={isChecking ? "animate-spin text-lg" : "text-lg"} />
                  {isChecking ? 'Checking status...' : "I've verified my email"}
                </button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                <HiOutlineShieldCheck className="text-3xl" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">Identity verification</h1>
              <p className="text-[14px] sm:text-[15px] text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                To maintain community trust and safety, all hosts must verify their identity. Your documents are securely encrypted.
              </p>

              <form onSubmit={submitIdentityVerification} className="space-y-5">
                
                <div className="space-y-1.5">
                  <label className="text-[13px] font-bold text-slate-900 dark:text-white pl-1">Phone Number</label>
                  <input 
                    type="tel" 
                    required 
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+234 800 000 0000" 
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 text-[14px] font-medium text-slate-900 dark:text-white outline-none focus:border-blue-500/50 transition-colors shadow-sm" 
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-bold text-slate-900 dark:text-white pl-1">Government ID</label>
                    <label className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors px-4 py-6 cursor-pointer group">
                      {idFile ? (
                        <div className="text-center">
                          <p className="text-[13px] font-bold text-blue-600 dark:text-blue-400 truncate max-w-[120px]">{idFile.name}</p>
                          <span className="text-[11px] text-slate-500 font-medium group-hover:text-rose-500 transition-colors">Change file</span>
                        </div>
                      ) : (
                        <div className="text-center">
                          <HiOutlineIdentification className="mx-auto h-6 w-6 text-slate-400 mb-2" />
                          <span className="text-[13px] font-bold text-slate-700 dark:text-slate-300">Upload ID</span>
                        </div>
                      )}
                      <input type="file" required accept="image/*" className="hidden" onChange={handleIdChange} />
                    </label>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[13px] font-bold text-slate-900 dark:text-white pl-1">Clear Selfie</label>
                    <label className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors px-4 py-6 cursor-pointer group">
                      {selfieFile ? (
                        <div className="text-center">
                          <p className="text-[13px] font-bold text-blue-600 dark:text-blue-400 truncate max-w-[120px]">{selfieFile.name}</p>
                          <span className="text-[11px] text-slate-500 font-medium group-hover:text-rose-500 transition-colors">Change file</span>
                        </div>
                      ) : (
                        <div className="text-center">
                          <HiOutlineCamera className="mx-auto h-6 w-6 text-slate-400 mb-2" />
                          <span className="text-[13px] font-bold text-slate-700 dark:text-slate-300">Take Selfie</span>
                        </div>
                      )}
                      <input type="file" required accept="image/*" capture="user" className="hidden" onChange={handleSelfieChange} />
                    </label>
                  </div>

                </div>

                <div className="pt-4">
                  <button 
                    type="submit" 
                    disabled={isSubmittingId} 
                    className="w-full rounded-xl bg-blue-600 px-6 py-3.5 text-[14px] font-bold text-white shadow-sm hover:bg-blue-700 transition-all disabled:opacity-50 cursor-pointer active:scale-95"
                  >
                    {isSubmittingId ? 'Uploading secure files...' : 'Submit for review'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {currentStep === 3 && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-500">
                <HiOutlineClock className="text-3xl" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">Under Review</h1>
              <p className="text-[14px] sm:text-[15px] text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                Your verification documents have been securely submitted to our moderation team. Reviews are typically completed within 24 to 48 hours.
              </p>
              <button 
                onClick={() => router.push('/')} 
                className="w-full rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3.5 text-[14px] font-bold shadow-sm hover:bg-slate-800 dark:hover:bg-slate-100 transition-all cursor-pointer active:scale-95"
              >
                Return to homepage
              </button>
            </div>
          )}

        </div>
      </div>
      <Footer />
    </main>
  );
}