'use client';

import { useState, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { HiOutlineMagnifyingGlass, HiOutlineMapPin, HiOutlineClock, HiOutlineCheckBadge, HiOutlineGlobeAlt, HiOutlineBookOpen } from 'react-icons/hi2';
import { MdOutlineVolunteerActivism } from 'react-icons/md';

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
      { name: "Greater Accra Region", cities: ["Accra", "Tema", "Madina", "Teshie", "Legon"] },
      { name: "Ashanti Region", cities: ["Kumasi", "Obuasi", "Ejisu", "Mampong"] },
      { name: "Central Region", cities: ["Cape Coast", "Kasoa", "Winneba"] }
    ]
  },
  {
    country: "Kenya",
    states: [
      { name: "Nairobi County", cities: ["Nairobi Central", "Westlands", "Embakasi", "Kasarani", "Lang'ata"] },
      { name: "Mombasa County", cities: ["Mombasa Island", "Nyali", "Likoni", "Changamwe"] },
      { name: "Kisumu County", cities: ["Kisumu City", "Ahero", "Maseno"] }
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
      { name: "Arusha Region", cities: ["Arusha City", "Karatu"] }
    ]
  }
];

const vocationalSkills = [
  {
    id: 1,
    title: "Modern Web Development & UI/UX",
    category: "Tech & Digital",
    country: "Nigeria",
    state: "Lagos State",
    city: "Ikeja",
    duration: "4 Weeks",
    level: "Beginner Friendly",
    description: "Master HTML, Tailwind CSS, and JavaScript fundamentals to build responsive websites and secure remote tech careers.",
    image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 2,
    title: "Data Analysis & Visualization",
    category: "Tech & Digital",
    country: "Kenya",
    state: "Nairobi County",
    city: "Westlands",
    duration: "5 Weeks",
    level: "Intermediate",
    description: "Learn Python, Excel, and PowerBI to clean, analyze, and present data for businesses and organizations.",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 3,
    title: "Cybersecurity Fundamentals",
    category: "Tech & Digital",
    country: "Rwanda",
    state: "Kigali City",
    city: "Gasabo",
    duration: "6 Weeks",
    level: "Intermediate",
    description: "Understand network security, ethical hacking basics, and threat mitigation to protect community and business digital assets.",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 4,
    title: "Youth Coding & Robotics Bootcamp",
    category: "Tech & Digital",
    country: "South Africa",
    state: "Western Cape",
    city: "Cape Town",
    duration: "4 Weeks (Weekends)",
    level: "Beginner (Ages 12-18)",
    description: "Engaging, hands-on introduction to coding logic, basic robotics, and game design to empower the next generation.",
    image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 5,
    title: "Advanced Tiling & Floor Finishing",
    category: "Technical Trades",
    country: "Nigeria",
    state: "Edo State",
    city: "Benin City",
    duration: "3 Weeks",
    level: "All Levels",
    description: "Master the art of ceramic, porcelain, and marble tile cutting, layout design, and professional grouting techniques.",
    image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 6,
    title: "Professional Painting & Decor",
    category: "Technical Trades",
    country: "Ghana",
    state: "Ashanti Region",
    city: "Kumasi",
    duration: "2 Weeks",
    level: "Beginner Friendly",
    description: "Learn interior/exterior painting techniques, surface preparation, color mixing, and wallpaper installation.",
    image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 7,
    title: "Solar Panel Installation & Maintenance",
    category: "Technical Trades",
    country: "Nigeria",
    state: "Delta State",
    city: "Asaba",
    duration: "3 Weeks",
    level: "Intermediate",
    description: "Hands-on training on photovoltaic system sizing, inverter setup, wiring safety, and green energy maintenance.",
    image: "https://images.unsplash.com/photo-1509391365330-2e84173177bb?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 8,
    title: "Advanced Tailoring & Fashion Design",
    category: "Vocational Craft",
    country: "Nigeria",
    state: "Delta State",
    city: "Agbor",
    duration: "6 Weeks",
    level: "All Levels",
    description: "Learn precision pattern drafting, garment construction, and industrial sewing techniques for commercial fashion production.",
    image: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 9,
    title: "Community Health & Hygiene Facilitation",
    category: "Public Health",
    country: "Uganda",
    state: "Central Region",
    city: "Kampala",
    duration: "2 Weeks",
    level: "Beginner Friendly",
    description: "Training in disease prevention, sanitation campaigns, basic first-aid, and promoting healthy living in grassroots communities.",
    image: "https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 10,
    title: "Fitness Instructor & Daily Workout Coach",
    category: "Wellness",
    country: "Tanzania",
    state: "Dar es Salaam",
    city: "Kinondoni",
    duration: "4 Weeks",
    level: "All Levels",
    description: "Learn how to lead community group exercises, structure daily workout routines, and promote physical fitness.",
    image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 11,
    title: "Professional Culinary Arts & Baking",
    category: "Vocational Craft",
    country: "Ghana",
    state: "Greater Accra Region",
    city: "Accra",
    duration: "4 Weeks",
    level: "Beginner Friendly",
    description: "Commercial pastry preparation, event catering standards, food safety hygiene, and small business setup.",
    image: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 12,
    title: "Smartphone & Laptop Hardware Repairs",
    category: "Technical Trades",
    country: "Kenya",
    state: "Nairobi County",
    city: "Westlands",
    duration: "5 Weeks",
    level: "Beginner Friendly",
    description: "Diagnosing hardware faults, soldering micro-components, screen replacements, and software flashing procedures.",
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 13,
    title: "Digital Marketing & Social Commerce",
    category: "Tech & Digital",
    country: "South Africa",
    state: "Gauteng",
    city: "Johannesburg",
    duration: "3 Weeks",
    level: "Beginner Friendly",
    description: "Empowering artisans and youth with social media advertising, content creation, copywriting, and online sales funnels.",
    image: "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 14,
    title: "Carpentry & Modern Woodworking",
    category: "Technical Trades",
    country: "Nigeria",
    state: "Oyo State",
    city: "Ibadan",
    duration: "6 Weeks",
    level: "Beginner Friendly",
    description: "Precision furniture making, wood jointing techniques, finishing standards, and safety operation of power woodworking tools.",
    image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 15,
    title: "Hair Styling, Braiding & Cosmetology",
    category: "Vocational Craft",
    country: "Rwanda",
    state: "Kigali City",
    city: "Gasabo",
    duration: "4 Weeks",
    level: "Beginner Friendly",
    description: "Advanced braiding styles, natural hair care treatment, bridal styling, and salon business management.",
    image: "https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 16,
    title: "Agricultural Tech & Irrigation Systems",
    category: "Technical Trades",
    country: "Kenya",
    state: "Mombasa County",
    city: "Nyali",
    duration: "4 Weeks",
    level: "Intermediate",
    description: "Modern drip irrigation setup, greenhouse management basics, and smart crop monitoring technologies.",
    image: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=600&q=80"
  }
];

export default function SkillsPage() {
  const [selectedCountry, setSelectedCountry] = useState('All');
  const [selectedState, setSelectedState] = useState('All');
  const [citySearch, setCitySearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Available states based on selected country
  const availableStates = useMemo(() => {
    if (selectedCountry === 'All') return [];
    return africanLocations.find(c => c.country === selectedCountry)?.states || [];
  }, [selectedCountry]);

  const filteredSkills = useMemo(() => {
    return vocationalSkills.filter(skill => {
      const matchesCountry = selectedCountry === 'All' || skill.country === selectedCountry;
      const matchesState = selectedState === 'All' || skill.state === selectedState;
      const matchesCity = citySearch === '' || skill.city.toLowerCase().includes(citySearch.toLowerCase()) || skill.title.toLowerCase().includes(citySearch.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || skill.category === selectedCategory;
      const matchesSearch = searchQuery === '' || skill.title.toLowerCase().includes(searchQuery.toLowerCase()) || skill.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesCountry && matchesState && matchesCity && matchesCategory && matchesSearch;
    });
  }, [selectedCountry, selectedState, citySearch, selectedCategory, searchQuery]);

  const filterCategories = ['All', 'Tech & Digital', 'Vocational Craft', 'Technical Trades', 'Public Health', 'Wellness'];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      <div>
        <Navbar />

        <section className="bg-slate-900 text-white py-16 sm:py-24 px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.15),transparent_50%)]"></div>
          <div className="mx-auto max-w-4xl text-center space-y-6 relative z-10">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold tracking-widest text-emerald-400 uppercase
             bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-800">
              <MdOutlineVolunteerActivism className="text-sm" /> Pan-African Empowerment Initiative
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
              Transform Your Future With Free Practical Skills
            </h1>
            
            <div className="bg-slate-800/90 p-6 sm:p-8 rounded-2xl border border-slate-700 text-left text-slate-300 
                 text-xs sm:text-sm leading-relaxed space-y-4 shadow-xl backdrop-blur-md">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                <HiOutlineBookOpen className="text-base" /> Welcome to SkillForge Training Hubs
              </div>
              <p>
                SkillForge is dedicated to grassroots economic empowerment across communities in Nigeria, Ghana, Kenya, 
                South Africa, Rwanda, Uganda, Tanzania, and beyond. We believe that lack of financial resources should never 
                be a barrier to acquiring professional competency.
              </p>
              <p>
                Every workshop listed below is <strong className="text-white">100% free of charge</strong>, equipped with 
                professional instructors, physical tools, and materials. Upon successful completion, participants receive an 
                official certification accredited to validate their skills for local jobs, entrepreneurship, and freelance 
                opportunities. Use the filters below to find an active hub near your city or town.
              </p>
            </div>

            <div className="pt-4 space-y-4 bg-slate-800/80 p-6 rounded-2xl border border-slate-700 shadow-xl 
                 backdrop-blur-md text-left">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Country</label>
                  <select
                    value={selectedCountry}
                    onChange={(e) => {
                      setSelectedCountry(e.target.value);
                      setSelectedState('All');
                    }}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-xs font-medium
                     text-white outline-none focus:border-emerald-500">
                    <option value="All">All Countries</option>
                    {africanLocations.map(loc => (
                      <option key={loc.country} value={loc.country}>{loc.country}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">State / Province</label>
                  <select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    disabled={selectedCountry === 'All'}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-xs font-medium
                    text-white outline-none focus:border-emerald-500 disabled:opacity-50">
                    <option value="All">All States / Regions</option>
                    {availableStates.map(st => (
                      <option key={st.name} value={st.name}>{st.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">City / Town</label>
                  <input
                    type="text"
                    placeholder="e.g. Ikeja, Agbor, Accra..."
                    value={citySearch}
                    onChange={(e) => setCitySearch(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-xs font-medium
                     text-white outline-none placeholder:text-slate-500 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="relative pt-2">
                <HiOutlineMagnifyingGlass className="absolute left-4 top-1/2 translate-y-1 text-slate-400 text-lg" />
                <input
                  type="text"
                  placeholder="Search specific workshop titles or skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 py-3 pl-11 pr-4 text-xs font-medium
                   text-white outline-none placeholder:text-slate-400 focus:border-emerald-500"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-16">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
            <h2 className="text-xl font-bold tracking-tight text-slate-800">
              Available Training Tracks ({filteredSkills.length})
            </h2>
            
            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
              {filterCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-slate-900 text-white'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {filteredSkills.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredSkills.map((skill) => (
                <div 
                  key={skill.id}
                  className="group rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md 
                  transition-all overflow-hidden flex flex-col justify-between">
                  <div>
                    <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                      <img 
                        src={skill.image} 
                        alt={skill.title} 
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-sm text-white text-[10px] 
                            font-bold tracking-wider uppercase px-2.5 py-1 rounded-full border border-slate-700">
                        {skill.category}
                      </div>
                    </div>

                    <div className="p-6 space-y-4">
                      <div className="space-y-1.5">
                        <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                          {skill.title}
                        </h3>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {skill.description}
                        </p>
                      </div>

                      <div className="space-y-2 pt-3 border-t border-slate-100 text-xs text-slate-500">
                        <div className="flex items-center gap-2">
                          <HiOutlineGlobeAlt className="text-emerald-600 text-sm shrink-0" />
                          <span className="font-semibold text-slate-700">{skill.country} • {skill.state}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <HiOutlineMapPin className="text-emerald-600 text-sm shrink-0" />
                          <span className="font-medium text-slate-700">Hub City: {skill.city}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <HiOutlineClock className="text-emerald-600 text-sm shrink-0" />
                          <span>{skill.duration} • {skill.level}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 pt-0 mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600">
                      <HiOutlineCheckBadge className="text-sm" /> 100% Free Certificate
                    </div>
                    <button
                      type="button"
                      className="rounded-full bg-slate-900 px-4 py-2 text-xs font-bold text-white transition-all
                       hover:bg-emerald-600 active:scale-95"
                    >
                      Reserve Slot
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-sm text-slate-500 font-medium">No training tracks found matching your selected country, state, or area.</p>
              <button 
                onClick={() => { setSelectedCountry('All'); setSelectedState('All'); setCitySearch(''); setSearchQuery(''); }}
                className="mt-4 rounded-full bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500 transition-colors"
              >
                Reset Location Filters
              </button>
            </div>
          )}
        </section>
      </div>

      <Footer />
    </main>
  );
}
