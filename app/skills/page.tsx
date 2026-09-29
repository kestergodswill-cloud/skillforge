
'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import RegistrationModal from '@/components/RegistrationModal';
import { auth, db } from '@/lib/firebase';
import { collection, getDocs, query, where, addDoc, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { HiOutlineMagnifyingGlass, HiOutlineMapPin, HiOutlineHeart, HiHeart, HiChevronDown } from 'react-icons/hi2';

const africanLocations = [
  {
    country: "Nigeria",
    states: [
      { name: "Lagos State", cities: ["Ikeja", "Yaba", "Lekki", "Surulere", "Ikorodu", "Victoria Island"] },
      { name: "Delta State", cities: ["Agbor", "Asaba", "Warri", "Sapele", "Ughelli"] },
      { name: "Rivers State", cities: ["Port Harcourt", "Obio-Akpor", "Bonny", "Eleme"] },
      { name: "FCT Abuja", cities: ["Garki", "Wuse", "Maitama", "Gwarinpa", "Kubwa"] },
      { name: "Oyo State", cities: ["Ibadan", "Ogbomoso", "Oyo", "Iseyin"] },
      { name: "Edo State", cities: ["Benin City", "Auchi", "Uromi", "Ekpoma"] },
      { name: "Kano State", cities: ["Kano City", "Wudil", "Gaya"] }
    ]
  },
  {
    country: "Ghana",
    states: [
      { name: "Greater Accra", cities: ["Accra", "Tema", "Madina", "Teshie", "Legon"] },
      { name: "Ashanti", cities: ["Kumasi", "Obuasi", "Ejisu", "Mampong"] },
      { name: "Central", cities: ["Cape Coast", "Kasoa", "Winneba"] }
    ]
  },
  {
    country: "Kenya",
    states: [
      { name: "Nairobi", cities: ["Nairobi Central", "Westlands", "Embakasi", "Kasarani", "Lang'ata"] },
      { name: "Mombasa", cities: ["Mombasa Island", "Nyali", "Likoni", "Changamwe"] },
      { name: "Kisumu", cities: ["Kisumu City", "Ahero", "Maseno"] }
    ]
  },
  {
    country: "South Africa",
    states: [
      { name: "Gauteng", cities: ["Johannesburg", "Pretoria", "Sandton", "Soweto", "Centurion"] },
      { name: "Western Cape", cities: ["Cape Town", "Stellenbosch", "Bellville", "Khayelitsha"] },
      { name: "KwaZulu-Natal", cities: ["Durban", "Pietermaritzburg", "Richards Bay"] }
    ]
  },
  {
    country: "Egypt",
    states: [
      { name: "Cairo", cities: ["Cairo", "New Cairo", "Maadi", "Nasr City"] },
      { name: "Alexandria", cities: ["Alexandria City", "Borg El Arab"] },
      { name: "Giza", cities: ["Giza City", "6th of October", "Sheikh Zayed"] }
    ]
  },
  {
    country: "Morocco",
    states: [
      { name: "Casablanca-Settat", cities: ["Casablanca", "Mohammedia", "El Jadida"] },
      { name: "Rabat", cities: ["Rabat", "Salé", "Kénitra"] },
      { name: "Marrakech", cities: ["Marrakech", "Essaouira"] }
    ]
  },
  {
    country: "Senegal",
    states: [
      { name: "Dakar Region", cities: ["Dakar", "Pikine", "Rufisque", "Guédiawaye"] },
      { name: "Thiès Region", cities: ["Thiès", "Mbour", "Touba"] }
    ]
  },
  {
    country: "Ivory Coast",
    states: [
      { name: "Abidjan", cities: ["Cocody", "Yopougon", "Abobo", "Marcory", "Plateau"] },
      { name: "Yamoussoukro", cities: ["Yamoussoukro City"] },
      { name: "Bouaké", cities: ["Bouaké City"] }
    ]
  },
  {
    country: "Cameroon",
    states: [
      { name: "Littoral", cities: ["Douala", "Edéa", "Nkongsamba"] },
      { name: "Centre", cities: ["Yaoundé", "Mbalmayo"] },
      { name: "Southwest", cities: ["Buea", "Limbe", "Tiko"] }
    ]
  },
  {
    country: "Rwanda",
    states: [
      { name: "Kigali City", cities: ["Gasabo", "Kicukiro", "Nyarugenge"] },
      { name: "Eastern Province", cities: ["Rwamagana", "Nyagatare", "Bugesera"] }
    ]
  },
  {
    country: "Uganda",
    states: [
      { name: "Central Region", cities: ["Kampala", "Entebbe", "Mukono"] },
      { name: "Eastern Region", cities: ["Jinja", "Mbale", "Tororo"] }
    ]
  },
  {
    country: "Tanzania",
    states: [
      { name: "Dar es Salaam", cities: ["Kinondoni", "Ilala", "Temeke"] },
      { name: "Arusha", cities: ["Arusha City", "Karatu"] },
      { name: "Zanzibar", cities: ["Zanzibar City", "Stone Town"] }
    ]
  },
  {
    country: "Zambia",
    states: [
      { name: "Lusaka Province", cities: ["Lusaka", "Chongwe"] },
      { name: "Copperbelt", cities: ["Ndola", "Kitwe", "Chingola"] },
      { name: "Southern Province", cities: ["Livingstone", "Choma"] }
    ]
  },
  {
    country: "Zimbabwe",
    states: [
      { name: "Harare Province", cities: ["Harare", "Chitungwiza"] },
      { name: "Bulawayo Province", cities: ["Bulawayo"] }
    ]
  },
  {
    country: "Ethiopia",
    states: [
      { name: "Addis Ababa", cities: ["Addis Ababa", "Bole", "Kirkos"] },
      { name: "Oromia", cities: ["Adama", "Jimma"] },
      { name: "Amhara", cities: ["Bahir Dar", "Gondar"] }
    ]
  }
];

const filterCategories = ['All', 'Tech & Digital', 'Vocational Craft', 'Technical Trades', 'Public Health', 'Wellness', 'Arts & Culture'];

export default function SkillsPage() {
  const router = useRouter();
  
  const [user, setUser] = useState<User | null>(null);
  const [appliedPrograms, setAppliedPrograms] = useState<string[]>([]);
  const [savedPrograms, setSavedPrograms] = useState<string[]>([]);
  
  const [liveSkills, setLiveSkills] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedCountry, setSelectedCountry] = useState('All');
  const [selectedState, setSelectedState] = useState('All');
  const [citySearch, setCitySearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const regsRef = collection(db, 'registrations');
          const qRegs = query(regsRef, where("userId", "==", currentUser.uid));
          const regsSnap = await getDocs(qRegs);
          setAppliedPrograms(regsSnap.docs.map(d => d.data().programId));
        } catch (error) {
          console.error("Failed to fetch user registrations:", error);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const programsRef = collection(db, 'programs');
        const snapshot = await getDocs(programsRef);
        
        const data = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter((doc: any) => doc.status === 'approved' || doc.status === 'live');
        
        setLiveSkills(data);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrograms();
  }, []);

  const availableStates = useMemo(() => {
    if (selectedCountry === 'All') return [];
    return africanLocations.find(c => c.country === selectedCountry)?.states || [];
  }, [selectedCountry]);

  const filteredSkills = useMemo(() => {
    return liveSkills.filter(skill => {
      const matchCountry = selectedCountry === 'All' || skill.country === selectedCountry;
      const matchState = selectedState === 'All' || skill.state === selectedState;
      const matchCity = !citySearch || (skill.city?.toLowerCase().includes(citySearch.toLowerCase()));
      const matchCategory = selectedCategory === 'All' || skill.category === selectedCategory;
      const matchSearch = !searchQuery || 
        skill.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        skill.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchCountry && matchState && matchCity && matchCategory && matchSearch;
    });
  }, [liveSkills, selectedCountry, selectedState, citySearch, selectedCategory, searchQuery]);

  const toggleSave = (e: React.MouseEvent, skillId: string) => {
    e.stopPropagation();
    e.preventDefault();
    setSavedPrograms(prev => 
      prev.includes(skillId) ? prev.filter(id => id !== skillId) : [...prev, skillId]
    );
  };

  const handleReserveClick = (skill: any, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (!user) {
      router.push('/auth?next=/skills');
      return;
    }
    setSelectedSkill(skill);
    setIsSuccess(false);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (details: { fullName: string; phone: string; note: string }) => {
    if (!user || !selectedSkill) return;
    
    setIsProcessing(true);
    try {
      await addDoc(collection(db, 'registrations'), {
        programId: selectedSkill.id,
        userId: user.uid,
        fullName: details.fullName,
        phone: details.phone,
        note: details.note,
        email: user.email,
        status: 'pending',
        appliedAt: serverTimestamp()
      });
      
      setAppliedPrograms(prev => [...prev, selectedSkill.id]);
      setIsSuccess(true);
    } catch (error) {
      console.error(error);
      alert('Failed to submit application. Please check your connection and try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const renderSkeletons = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 gap-y-10 mt-2">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="flex flex-col gap-2 animate-pulse">
          <div className="aspect-[4/3] w-full rounded-xl bg-slate-200 dark:bg-slate-800"></div>
          <div className="flex justify-between items-start mt-1">
            <div className="h-4 w-1/3 bg-slate-200 dark:bg-slate-800 rounded"></div>
            <div className="h-4 w-1/4 bg-slate-200 dark:bg-slate-800 rounded"></div>
          </div>
          <div className="h-3 w-3/4 bg-slate-200 dark:bg-slate-800 rounded mt-1"></div>
          <div className="h-3 w-1/2 bg-slate-200 dark:bg-slate-800 rounded"></div>
          <div className="h-10 w-full bg-slate-200 dark:bg-slate-800 rounded-lg mt-2"></div>
        </div>
      ))}
    </div>
  );

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 font-sans transition-colors 
          duration-300 flex flex-col">
      <Navbar />

      <RegistrationModal
         isOpen={isModalOpen}
         onClose={() => setIsModalOpen(false)}
         onSubmitDetails={handleFormSubmit}
         title="Training Track Slot"
         itemTitle={selectedSkill?.title || ''}
         isProcessing={isProcessing}
         isSuccess={isSuccess}
      />

      <div className="flex-1 w-full max-w-[1400px] mx-auto px-5 pt-4 sm:pt-6 pb-24">
        
        <div className="mb-6 mt-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
            Learn a practical skill.
          </h1>
          <p className="text-[15px] sm:text-base text-slate-600 dark:text-slate-400 mt-1.5">
            Join 100% free workshops hosted by local professionals.
          </p>
        </div>

        <div className="flex flex-col gap-4 mb-8">
          
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative flex items-center border-b border-slate-300 dark:border-slate-700 pb-2">
              <HiOutlineMagnifyingGlass className="text-slate-400 text-xl shrink-0" />
              <input
                type="text"
                placeholder="Search skills or titles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent pl-3 pr-4 py-1 text-[15px] font-medium text-slate-900 dark:text-white outline-none
               placeholder:text-slate-400"
              />
            </div>

            <div className="flex flex-wrap sm:flex-nowrap gap-4 lg:w-auto">
              <div className="relative flex-1 sm:w-36 flex items-center border-b border-slate-300 dark:border-slate-700 pb-2">
                <select
                  value={selectedCountry}
                  onChange={(e) => { setSelectedCountry(e.target.value); setSelectedState('All'); }}
                  className="w-full bg-transparent pr-6 py-1 text-[14px] font-semibold text-slate-900 dark:text-white outline-none 
                  appearance-none cursor-pointer truncate"
                >
                  <option value="All">Country</option>
                  {africanLocations.map(loc => <option key={loc.country} value={loc.country}>{loc.country}</option>)}
                </select>
                <HiChevronDown className="absolute right-0 text-slate-400 pointer-events-none" />
              </div>

              <div className="relative flex-1 sm:w-36 flex items-center border-b border-slate-300 dark:border-slate-700 pb-2">
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  disabled={selectedCountry === 'All'}
                  className="w-full bg-transparent pr-6 py-1 text-[14px] font-semibold text-slate-900 dark:text-white outline-none 
                  appearance-none disabled:opacity-50 cursor-pointer truncate"
                >
                  <option value="All">State/Region</option>
                  {availableStates.map(st => <option key={st.name} value={st.name}>{st.name}</option>)}
                </select>
                <HiChevronDown className="absolute right-0 text-slate-400 pointer-events-none" />
              </div>

              <div className="relative w-full sm:w-40 flex items-center border-b border-slate-300 dark:border-slate-700 pb-2">
                <HiOutlineMapPin className="text-slate-400 text-lg shrink-0" />
                <input
                  type="text"
                  placeholder="City"
                  value={citySearch}
                  onChange={(e) => setCitySearch(e.target.value)}
                  className="w-full bg-transparent pl-2 pr-4 py-1 text-[14px] font-semibold text-slate-900 dark:text-white 
                  outline-none placeholder:text-slate-400"
                />
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2.5 overflow-x-auto pb-2 no-scrollbar">
            {filterCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full px-4 py-1.5 text-[13px] font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                    : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}>
                {cat}
              </button>
            ))}
          </div>
        </div>
        
        {isLoading ? (
          renderSkeletons()
        ) : filteredSkills.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
            {filteredSkills.map((skill) => {
              const hasApplied = appliedPrograms.includes(skill.id);
              const isHost = user?.uid === skill.hostId;
              const isSaved = savedPrograms.includes(skill.id);
              
              return (
                <div key={skill.id} className="group flex flex-col">
                  
                  <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 mb-3">
                    <img 
                      src={skill.mediaUrl || skill.image || "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80"} 
                      alt={skill.title} 
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    
                    <button
                      onClick={(e) => toggleSave(e, skill.id)}
                      className="absolute top-3 right-3 p-1 hover:scale-110 active:scale-95 transition-transform z-20 cursor-pointer"
                      aria-label={isSaved ? "Remove from saved" : "Save event"}
                    >
                      {isSaved ? (
                        <HiHeart className="text-3xl text-rose-500 drop-shadow-md" />
                      ) : (
                        <HiOutlineHeart className="text-3xl text-white drop-shadow-md stroke-2" />
                      )}
                    </button>

                    <div className="absolute top-4 left-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-2 py-1 rounded 
                         text-[10px] font-extrabold text-slate-900 dark:text-white shadow-sm uppercase tracking-wider z-10">
                      {skill.category || 'Workshop'}
                    </div>
                  </div>
                  
                  <div className="flex flex-col flex-1 px-0.5">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="text-[15px] font-bold text-slate-900 dark:text-white leading-tight truncate">
                        {skill.city || 'TBA'}, {skill.country || 'TBA'}
                      </h3>
                      <span className="text-[14px] font-semibold text-slate-900 dark:text-white shrink-0">
                        {hasApplied ? <span className="text-emerald-600">Reserved</span> : isHost ? 'Yours' : 'Free'}
                      </span>
                    </div>

                    <p className="text-[14px] text-slate-500 dark:text-slate-400 mt-1 truncate">{skill.title}</p>
                    <p className="text-[14px] text-slate-500 dark:text-slate-400 truncate">{skill.schedule || 'Flexible dates'}</p>
                    
                    <div className="mt-1">
                      <Link 
                        href={`/host/${skill.hostId}`} 
                        className="text-[13px] font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900
                        dark:hover:text-white transition-colors cursor-pointer"
                      >
                        Hosted by <span className="font-semibold">{skill.organizer || 'Community Member'}</span>
                      </Link>
                    </div>
                    
                    <div className="mt-4">
                      <button
                        type="button"
                        onClick={(e) => handleReserveClick(skill, e)}
                        disabled={hasApplied || isHost}
                        className={`w-full rounded-lg py-2.5 text-[14px] font-bold transition-all cursor-pointer ${
                          hasApplied 
                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed'
                            : isHost
                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed'
                            : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 active:scale-95'
                        }`}
                      >
                        {hasApplied ? 'Request Sent' : isHost ? 'Your Event' : 'Reserve Slot'}
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-24 max-w-md mx-auto">
            <HiOutlineMagnifyingGlass className="mx-auto text-4xl text-slate-300 dark:text-slate-700 mb-3" />
            <p className="text-[16px] text-slate-900 dark:text-white font-bold mb-1">No workshops found</p>
            <p className="text-[14px] text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
              We couldn't find any workshops matching your search.
            </p>
            <button 
              onClick={() => { setSelectedCountry('All'); setSelectedState('All'); setCitySearch(''); setSearchQuery(''); setSelectedCategory('All'); }}
              className="rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 text-[13px] font-bold
              hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors shadow-sm cursor-pointer"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}