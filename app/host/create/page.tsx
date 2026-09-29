
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, addDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { 
  HiOutlinePhoto, 
  HiOutlineCheckBadge, 
  HiOutlineCheckCircle,
  HiOutlineArrowRight,
  HiOutlineArrowLeft
} from 'react-icons/hi2';
import { MdOutlineComputer, MdOutlineLocationOn } from 'react-icons/md';

export default function HostCreatePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    listingType: 'workshop',
    workshopMode: 'physical',
    title: '',
    difficulty: 'beginner',
    workoutFocus: '',
    equipmentNeeded: '',
    healthTopic: '',
    ageRequired: '',
    cleanupFocus: '',
    trashTarget: '',
    whoCanJoin: '',
    country: '',
    state: '',
    city: '',
    location: '',
    schedule: '',
    description: '',
    organizer: '',
    contactEmail: '',
    contactPhone: ''
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [selectedMedia, setSelectedMedia] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push('/auth?next=/host/create');
      } else {
        setUser(currentUser);
        setFormData(prev => ({
          ...prev,
          organizer: currentUser.displayName || '',
          contactEmail: currentUser.email || ''
        }));
        setIsChecking(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 50 * 1024 * 1024) {
        alert("File is too large. Please select an image or video under 50MB.");
        return;
      }
      setSelectedMedia(file);
      setUploadStatus('idle');
    }
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (step === 2) {
      if (!formData.title.trim()) newErrors.title = "This field can't be empty";
      
      if (formData.listingType === 'workshop' && !formData.whoCanJoin.trim()) newErrors.whoCanJoin = "This field can't be empty";
      if (formData.listingType === 'workout' && !formData.workoutFocus.trim()) newErrors.workoutFocus = "This field can't be empty";
      if (formData.listingType === 'workout' && !formData.equipmentNeeded.trim()) newErrors.equipmentNeeded = "This field can't be empty";
      if (formData.listingType === 'health' && !formData.healthTopic.trim()) newErrors.healthTopic = "This field can't be empty";
      if (formData.listingType === 'health' && !formData.ageRequired.trim()) newErrors.ageRequired = "This field can't be empty";
      if (formData.listingType === 'cleanup' && !formData.cleanupFocus.trim()) newErrors.cleanupFocus = "This field can't be empty";
      if (formData.listingType === 'cleanup' && !formData.trashTarget.trim()) newErrors.trashTarget = "This field can't be empty";

    } else if (step === 3) {
      if (formData.workshopMode === 'physical' || formData.listingType !== 'workshop') {
        if (!formData.country.trim()) newErrors.country = "This field can't be empty";
        if (!formData.state.trim()) newErrors.state = "This field can't be empty";
        if (!formData.city.trim()) newErrors.city = "This field can't be empty";
        if (!formData.location.trim()) newErrors.location = "This field can't be empty";
      }
      if (!formData.schedule.trim()) newErrors.schedule = "This field can't be empty";
    } else if (step === 4) {
      if (!formData.description.trim()) newErrors.description = "This field can't be empty";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setErrors({});
    setStep(prev => Math.max(1, prev - 1));
  };

  const handleSubmit = async () => {
    if (!user || isSubmitting) return;

    const newErrors: { [key: string]: string } = {};
    if (!formData.organizer.trim()) newErrors.organizer = "This field can't be empty";
    if (!formData.contactEmail.trim()) newErrors.contactEmail = "This field can't be empty";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      let dbType = formData.listingType;
      if (formData.listingType === 'workshop') dbType = 'skill';

      let mediaUrl = null;

      if (selectedMedia && (formData.listingType === 'workshop' || formData.listingType === 'cleanup')) {
        setUploadStatus('uploading');
        const cloudinaryCloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_PRESET;
        
        if (!cloudinaryCloudName || !uploadPreset) throw new Error("Cloudinary configuration missing.");

        const uploadData = new FormData();
        uploadData.append('file', selectedMedia);
        uploadData.append('upload_preset', uploadPreset);

        const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/auto/upload`, {
          method: 'POST',
          body: uploadData,
        });

        if (!uploadRes.ok) {
          setUploadStatus('error');
          throw new Error('Failed to upload media');
        }
        
        const cloudinaryData = await uploadRes.json();
        mediaUrl = cloudinaryData.secure_url; 
        setUploadStatus('success');
      }

      const newProgramData = {
        type: dbType,
        workshopMode: formData.listingType === 'workshop' ? formData.workshopMode : null,
        title: formData.title,
        difficulty: formData.listingType === 'workshop' ? formData.difficulty : null,
        audience: formData.listingType === 'workshop' ? formData.whoCanJoin : null,
        workoutFocus: formData.listingType === 'workout' ? formData.workoutFocus : null,
        equipmentNeeded: formData.listingType === 'workout' ? formData.equipmentNeeded : null,
        healthTopic: formData.listingType === 'health' ? formData.healthTopic : null,
        ageRequired: formData.listingType === 'health' ? formData.ageRequired : null,
        cleanupFocus: formData.listingType === 'cleanup' ? formData.cleanupFocus : null,
        trashTarget: formData.listingType === 'cleanup' ? formData.trashTarget : null,
        
        country: formData.workshopMode === 'digital' && formData.listingType === 'workshop' ? 'Online' : formData.country,
        state: formData.workshopMode === 'digital' && formData.listingType === 'workshop' ? 'Remote' : formData.state,
        city: formData.workshopMode === 'digital' && formData.listingType === 'workshop' ? 'Global / Virtual' : formData.city,
        location: formData.workshopMode === 'digital' && formData.listingType === 'workshop' ? 'Zoom / Online Stream' : formData.location,
        
        schedule: formData.schedule,
        description: formData.description,
        organizer: formData.organizer,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone,
        mediaUrl: mediaUrl,
        status: 'pending',
        
        hostId: user.uid,
        hostName: user.displayName || formData.organizer,
        hostEmail: user.email,
        hostPhoto: user.photoURL || '',
        createdAt: serverTimestamp() 
      };

      const programsRef = collection(db, 'programs');
      const docRef = await addDoc(programsRef, newProgramData);
      await updateDoc(docRef, { id: docRef.id });

      await addDoc(collection(db, 'notifications'), {
        userId: user.uid,
        type: 'event',
        title: 'Event Submitted for Review',
        message: `Your event "${formData.title}" has been received and is currently under review by our moderation team.`,
        isRead: false,
        createdAt: serverTimestamp(),
        link: '/dashboard'
      });

      setShowSuccessModal(true);
      
    } catch (error: any) {
      console.error("Error adding document: ", error);
      alert(`Failed to publish listing: ${error.message}`);
      setUploadStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isChecking || !user) {
    return (
      <main className="min-h-screen bg-white dark:bg-slate-950 flex flex-col justify-between transition-colors duration-300">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
        <Footer />
      </main>
    );
  }

  const inputBaseClasses = "w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 px-4 py-4 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all outline-none";
  const labelBaseClasses = "block text-[13px] font-bold text-slate-800 dark:text-slate-200 mb-2";

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 flex flex-col transition-colors duration-300 relative">
      <Navbar/>
      
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md p-6 sm:p-8 space-y-4 shadow-2xl text-center border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-500">
              <HiOutlineCheckCircle className="text-4xl" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">Event Hosted Successfully!</h3>
            <div className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
              <p>Your event has been submitted and is currently on <strong>pending</strong> status.</p>
              <p>To ensure community safety, our team manually reviews all listings. This process typically takes <strong>24 to 48 hours</strong>.</p>
              <p>You will receive an email and in-app notification once your event goes live or if we need more information.</p>
            </div>
            <div className="pt-4 flex flex-col gap-3">
              <Link href="/" className="w-full rounded-2xl bg-emerald-600 py-4 text-sm font-bold text-white hover:bg-emerald-500 transition-colors shadow-sm">
                Done
              </Link>
              <button onClick={() => { setShowSuccessModal(false); setStep(1); }} className="w-full rounded-2xl bg-slate-100 dark:bg-slate-800 py-4 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer">
                Host Another Event
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 w-full max-w-xl mx-auto pt-6 sm:pt-10 pb-20 px-4 sm:px-6 flex flex-col">
        
        <div className="mb-8">
          <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mb-2">Step {step} of 5</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
            {step === 1 && "What kind of event are you organizing?"}
            {step === 2 && "Let's get the details down"}
            {step === 3 && "Where and when is it happening?"}
            {step === 4 && "Add a description and media"}
            {step === 5 && "Organizer contact info"}
          </h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {step === 1 && "Select the best fit to customize your listing."}
            {step === 2 && "Provide a title and specific particulars."}
            {step === 3 && "Help your community find you easily."}
            {step === 4 && "Show people what to expect."}
            {step === 5 && "How should participants reach out?"}
          </p>
        </div>

        <div className="w-full">
          
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="space-y-3">
                {[
                  { id: 'workshop', label: 'Technical Workshop', desc: 'Teach a skill, craft, or tech class' },
                  { id: 'cleanup', label: 'Eco / Cleanup Drive', desc: 'Organize a community cleanup' },
                  { id: 'health', label: 'Health-Safety Class', desc: 'Host a first-aid or health seminar' },
                  { id: 'workout', label: 'Group Workout', desc: 'Lead a fitness or workout session' }
                ].map((item) => (
                  <label key={item.id} className="block cursor-pointer relative">
                    <input 
                      type="radio" 
                      name="listingType" 
                      value={item.id} 
                      checked={formData.listingType === item.id} 
                      onChange={handleChange} 
                      className="peer sr-only" 
                    />
                    <div className="p-4 rounded-2xl border-2 transition-all bg-white dark:bg-slate-900 peer-checked:bg-emerald-50/50 dark:peer-checked:bg-emerald-900/10 border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700 peer-checked:border-emerald-500 flex items-center justify-between">
                      <div>
                        <p className={`font-bold text-base transition-colors ${formData.listingType === item.id ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                          {item.label}
                        </p>
                        <p className="text-sm text-slate-500 mt-0.5">{item.desc}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${formData.listingType === item.id ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300 dark:border-slate-600'}`}>
                        {formData.listingType === item.id && <div className="w-2 h-2 bg-white rounded-full"></div>}
                      </div>
                    </div>
                  </label>
                ))}
              </div>

              {formData.listingType === 'workshop' && (
                <div className="pt-2 animate-in fade-in">
                  <label className={labelBaseClasses}>How are you hosting this?</label>
                  <div className="flex p-1 bg-slate-100 dark:bg-slate-800/50 rounded-2xl">
                    <label className="flex-1 cursor-pointer">
                      <input type="radio" name="workshopMode" value="physical" checked={formData.workshopMode === 'physical'} onChange={handleChange} className="peer sr-only" />
                      <div className="py-3 flex items-center justify-center gap-2 rounded-xl text-sm font-bold transition-all peer-checked:bg-white dark:peer-checked:bg-slate-700 peer-checked:text-slate-900 dark:peer-checked:text-white peer-checked:shadow-sm text-slate-500">
                        <MdOutlineLocationOn className="text-lg" /> Physical
                      </div>
                    </label>
                    <label className="flex-1 cursor-pointer">
                      <input type="radio" name="workshopMode" value="digital" checked={formData.workshopMode === 'digital'} onChange={handleChange} className="peer sr-only" />
                      <div className="py-3 flex items-center justify-center gap-2 rounded-xl text-sm font-bold transition-all peer-checked:bg-white dark:peer-checked:bg-slate-700 peer-checked:text-slate-900 dark:peer-checked:text-white peer-checked:shadow-sm text-slate-500">
                        <MdOutlineComputer className="text-lg" /> Digital
                      </div>
                    </label>
                  </div>
                </div>
              )}

              <div className="pt-6 flex justify-end border-t border-slate-100 dark:border-slate-800/60 mt-8">
                <button 
                  type="button" 
                  onClick={() => setStep(2)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-10 py-4 text-sm font-bold text-white hover:bg-emerald-500 transition-all cursor-pointer"
                >
                  Next Step <HiOutlineArrowRight />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div>
                <label className={labelBaseClasses}>Event Title</label>
                <input 
                  type="text" 
                  name="title" 
                  value={formData.title} 
                  onChange={handleChange} 
                  placeholder="e.g., Advanced Tailoring Bootcamp" 
                  className={inputBaseClasses}
                />
                {errors.title && <p className="text-xs text-rose-500 font-bold mt-2">{errors.title}</p>}
              </div>

              {formData.listingType === 'workshop' && (
                <>
                  <div>
                    <label className={labelBaseClasses}>Difficulty Level</label>
                    <select 
                      name="difficulty" 
                      value={formData.difficulty} 
                      onChange={handleChange} 
                      className={`${inputBaseClasses} cursor-pointer focus:ring-0 focus:border-slate-200 dark:focus:border-slate-800`}
                    >
                      <option value="beginner">Beginner Friendly</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                      <option value="all">All Levels Welcome</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelBaseClasses}>Who can join?</label>
                    <input type="text" name="whoCanJoin" value={formData.whoCanJoin} onChange={handleChange} placeholder="e.g., Open to everyone" className={inputBaseClasses} />
                    {errors.whoCanJoin && <p className="text-xs text-rose-500 font-bold mt-2">{errors.whoCanJoin}</p>}
                  </div>
                </>
              )}

              {formData.listingType === 'workout' && (
                <>
                  <div>
                    <label className={labelBaseClasses}>Workout Focus / Style</label>
                    <input type="text" name="workoutFocus" value={formData.workoutFocus} onChange={handleChange} placeholder="e.g., HIIT, Cardio, Strength" className={inputBaseClasses} />
                    {errors.workoutFocus && <p className="text-xs text-rose-500 font-bold mt-2">{errors.workoutFocus}</p>}
                  </div>
                  <div>
                    <label className={labelBaseClasses}>Equipment Needed</label>
                    <input type="text" name="equipmentNeeded" value={formData.equipmentNeeded} onChange={handleChange} placeholder="e.g., Mat, Water bottle, Dumbbells" className={inputBaseClasses} />
                    {errors.equipmentNeeded && <p className="text-xs text-rose-500 font-bold mt-2">{errors.equipmentNeeded}</p>}
                  </div>
                </>
              )}

              {formData.listingType === 'health' && (
                <>
                  <div>
                    <label className={labelBaseClasses}>Specific Health Teaching</label>
                    <input type="text" name="healthTopic" value={formData.healthTopic} onChange={handleChange} placeholder="e.g., CPR & First Aid Basics" className={inputBaseClasses} />
                    {errors.healthTopic && <p className="text-xs text-rose-500 font-bold mt-2">{errors.healthTopic}</p>}
                  </div>
                  <div>
                    <label className={labelBaseClasses}>Age Required</label>
                    <input type="text" name="ageRequired" value={formData.ageRequired} onChange={handleChange} placeholder="e.g., Adults 18+ or All Ages" className={inputBaseClasses} />
                    {errors.ageRequired && <p className="text-xs text-rose-500 font-bold mt-2">{errors.ageRequired}</p>}
                  </div>
                </>
              )}

              {formData.listingType === 'cleanup' && (
                <>
                  <div>
                    <label className={labelBaseClasses}>Cleanup Focus</label>
                    <input type="text" name="cleanupFocus" value={formData.cleanupFocus} onChange={handleChange} placeholder="e.g., Plastic Recovery" className={inputBaseClasses} />
                    {errors.cleanupFocus && <p className="text-xs text-rose-500 font-bold mt-2">{errors.cleanupFocus}</p>}
                  </div>
                  <div>
                    <label className={labelBaseClasses}>Target Area</label>
                    <input type="text" name="trashTarget" value={formData.trashTarget} onChange={handleChange} placeholder="e.g., Neighborhood Market" className={inputBaseClasses} />
                    {errors.trashTarget && <p className="text-xs text-rose-500 font-bold mt-2">{errors.trashTarget}</p>}
                  </div>
                </>
              )}

              <div className="pt-6 flex flex-col-reverse sm:flex-row items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800/60 mt-8">
                <button type="button" onClick={handlePrevStep} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 px-8 py-4 text-sm font-bold text-slate-700 dark:text-slate-300 transition-all cursor-pointer">
                  <HiOutlineArrowLeft /> Back
                </button>
                <button type="button" onClick={handleNextStep} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-10 py-4 text-sm font-bold text-white hover:bg-emerald-500 transition-all cursor-pointer">
                  Next Step <HiOutlineArrowRight />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {formData.listingType === 'workshop' && formData.workshopMode === 'digital' ? (
                <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-300">
                  <p className="font-bold mb-1 flex items-center gap-2"><MdOutlineComputer className="text-xl"/> Digital Workshop</p>
                  <p className="text-sm">Physical location is bypassed. Just provide your schedule and meeting time below.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row gap-6">
                    <div className="flex-1">
                      <label className={labelBaseClasses}>Country</label>
                      <input type="text" name="country" value={formData.country} onChange={handleChange} placeholder="e.g., Nigeria" className={inputBaseClasses} />
                      {errors.country && <p className="text-xs text-rose-500 font-bold mt-2">{errors.country}</p>}
                    </div>
                    <div className="flex-1">
                      <label className={labelBaseClasses}>State / Region</label>
                      <input type="text" name="state" value={formData.state} onChange={handleChange} placeholder="e.g., Delta" className={inputBaseClasses} />
                      {errors.state && <p className="text-xs text-rose-500 font-bold mt-2">{errors.state}</p>}
                    </div>
                  </div>
                  
                  <div>
                    <label className={labelBaseClasses}>City / Town</label>
                    <input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="e.g., Agbor" className={inputBaseClasses} />
                    {errors.city && <p className="text-xs text-rose-500 font-bold mt-2">{errors.city}</p>}
                  </div>
                  
                  <div>
                    <label className={labelBaseClasses}>Specific Address / Landmark</label>
                    <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="e.g., Central Community Field" className={inputBaseClasses} />
                    {errors.location && <p className="text-xs text-rose-500 font-bold mt-2">{errors.location}</p>}
                  </div>
                </div>
              )}

              <div className="pt-2">
                <label className={labelBaseClasses}>Schedule & Time</label>
                <input type="text" name="schedule" value={formData.schedule} onChange={handleChange} placeholder="e.g., Every Saturday • 6:30 AM" className={inputBaseClasses} />
                {errors.schedule && <p className="text-xs text-rose-500 font-bold mt-2">{errors.schedule}</p>}
              </div>

              <div className="pt-6 flex flex-col-reverse sm:flex-row items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800/60 mt-8">
                <button type="button" onClick={handlePrevStep} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 px-8 py-4 text-sm font-bold text-slate-700 dark:text-slate-300 transition-all cursor-pointer">
                  <HiOutlineArrowLeft /> Back
                </button>
                <button type="button" onClick={handleNextStep} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-10 py-4 text-sm font-bold text-white hover:bg-emerald-500 transition-all cursor-pointer">
                  Next Step <HiOutlineArrowRight />
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div>
                <label className={labelBaseClasses}>Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows={5} placeholder="Explain what participants will learn or do..." className={`${inputBaseClasses} resize-none`}></textarea>
                {errors.description && <p className="text-xs text-rose-500 font-bold mt-2">{errors.description}</p>}
              </div>

              {(formData.listingType === 'workshop' || formData.listingType === 'cleanup') && (
                <div>
                  <label className={labelBaseClasses}>Event Cover (Optional)</label>
                  <div className="mt-2 flex justify-center rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 px-6 py-12 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors relative cursor-pointer" onClick={() => !selectedMedia && document.getElementById('file-upload')?.click()}>
                    <div className="text-center">
                      {selectedMedia ? (
                        <div className="flex flex-col items-center gap-3">
                          <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedMedia.name}</p>
                          <button type="button" onClick={(e) => { e.stopPropagation(); setSelectedMedia(null); }} className="text-xs text-rose-500 font-bold bg-rose-50 dark:bg-rose-900/30 px-4 py-2 rounded-full cursor-pointer">Remove File</button>
                        </div>
                      ) : (
                        <>
                          <HiOutlinePhoto className="mx-auto h-12 w-12 text-slate-400 mb-3" />
                          <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">Click to upload image</p>
                          <p className="text-xs text-slate-500 mt-1.5">PNG, JPG up to 50MB</p>
                          <input id="file-upload" type="file" className="sr-only" accept="image/*,video/*" onChange={handleFileChange} />
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-6 flex flex-col-reverse sm:flex-row items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800/60 mt-8">
                <button type="button" onClick={handlePrevStep} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 px-8 py-4 text-sm font-bold text-slate-700 dark:text-slate-300 transition-all cursor-pointer">
                  <HiOutlineArrowLeft /> Back
                </button>
                <button type="button" onClick={handleNextStep} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-10 py-4 text-sm font-bold text-white hover:bg-emerald-500 transition-all cursor-pointer">
                  Next Step <HiOutlineArrowRight />
                </button>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="space-y-6">
                <div>
                  <label className={labelBaseClasses}>Host / Organization Name</label>
                  <input type="text" name="organizer" value={formData.organizer} onChange={handleChange} className={inputBaseClasses} />
                  {errors.organizer && <p className="text-xs text-rose-500 font-bold mt-2">{errors.organizer}</p>}
                </div>
                
                <div>
                  <label className={labelBaseClasses}>Contact Email</label>
                  <input type="email" name="contactEmail" value={formData.contactEmail} onChange={handleChange} className={inputBaseClasses} />
                  {errors.contactEmail && <p className="text-xs text-rose-500 font-bold mt-2">{errors.contactEmail}</p>}
                </div>

                <div>
                  <label className={labelBaseClasses}>Phone / WhatsApp (Optional)</label>
                  <input type="tel" name="contactPhone" value={formData.contactPhone} onChange={handleChange} placeholder="+234 800 000 0000" className={inputBaseClasses} />
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-start gap-4 mt-6">
                <HiOutlineCheckBadge className="text-emerald-600 dark:text-emerald-400 text-2xl shrink-0 mt-0.5" />
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
                  Once published, your event will be reviewed by our moderation team within 24-48 hours.
                </p>
              </div>

              <div className="pt-6 flex flex-col-reverse sm:flex-row items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800/60 mt-8">
                <button type="button" onClick={handlePrevStep} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 px-8 py-4 text-sm font-bold text-slate-700 dark:text-slate-300 transition-all cursor-pointer">
                  <HiOutlineArrowLeft/> Back
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-emerald-600 px-10 py-4 text-sm font-bold text-white hover:bg-emerald-500 transition-all shadow-md cursor-pointer disabled:opacity-50">
                  {isSubmitting ? 'Publishing...' : 'Publish Listing'}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      <Footer />
    </main>
  );
}
