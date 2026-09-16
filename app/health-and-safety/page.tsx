'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { HiOutlineShieldCheck, HiOutlineCheckBadge, HiOutlinePhone, HiOutlineCalendar, HiOutlineMagnifyingGlass } from 'react-icons/hi2';

const safetyPrograms = [
  {
    title: "Community First-Aid & CPR Certification",
    category: "Emergency Preparedness",
    schedule: "Every Saturday • 10:00 AM",
    location: "Lagos & Delta Regional Hubs",
    city: "Lagos / Delta / Agbor",
    description: "Learn vital emergency response skills, CPR techniques, wound management, and basic trauma stabilization to save lives in community accidents.",
    highlights: ["Hands-on manikin practice", "Certified emergency responders", "Free first-aid starter kit"]
  },
  {
    title: "Neighborhood Clean-Up & Sanitation Drive",
    category: "Environmental Health",
    schedule: "Monthly (First Saturday)",
    location: "Agbor & Surrounding Communities",
    city: "Agbor",
    description: "Join local volunteers to clear drainage channels, promote proper waste disposal, and prevent malaria and waterborne diseases in our neighborhoods.",
    highlights: ["Community sanitation supplies", "Environmental health seminar", "Volunteer recognition badge"]
  },
  {
    title: "Maternal & Child Health Awareness",
    category: "Public Health Education",
    schedule: "Bi-Weekly Wednesdays",
    location: "Community Health Centers",
    city: "Abuja / Lagos",
    description: "Free nutritional workshops, prenatal care education, and hygiene counseling for nursing mothers and young families to ensure community-wide wellbeing.",
    highlights: ["Expert pediatric guidance", "Nutritional supplement distributions", "Open Q&A sessions"]
  },
  {
    title: "Clean Water & Hygiene Safety Seminar",
    category: "Disease Prevention",
    schedule: "Every Thursday • 2:00 PM",
    location: "Online / Virtual Hub",
    city: "Pan-African / Nationwide",
    description: "Practical methods for water purification, domestic sanitation safety, and preventing common waterborne illnesses using accessible local resources.",
    highlights: ["Water testing demonstrations", "Purification filter guides", "Digital resource booklet"]
  }
];

export default function HealthAndSafetyPage() {
  const [searchLocation, setSearchLocation] = useState('');

  const filteredPrograms = safetyPrograms.filter(program => 
    program.city.toLowerCase().includes(searchLocation.toLowerCase()) ||
    program.location.toLowerCase().includes(searchLocation.toLowerCase()) ||
    program.title.toLowerCase().includes(searchLocation.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      <div>
        <Navbar />

        {/* Hero Section */}
        <section className="bg-slate-900 text-white py-16 sm:py-24 px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.15),transparent_50%)]"></div>
          <div className="mx-auto max-w-4xl text-center space-y-6 relative z-10">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold tracking-widest text-emerald-400 uppercase bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-800">
              <HiOutlineShieldCheck className="text-sm" /> Safety & Welfare Initiative
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
              Health & Life-Saving Programs
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
              Empowering grassroots communities with emergency preparedness, first-aid training, and public sanitation drives tailored to your location.
            </p>

            {/* Location Search Bar */}
            <div className="relative max-w-md mx-auto pt-2">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400 text-lg mt-2">
                <HiOutlineMagnifyingGlass />
              </span>
              <input
                type="text"
                placeholder="Search by your town, city, or area (e.g., Agbor, Lagos)..."
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                className="w-full rounded-full border border-slate-700 bg-slate-800/90 py-3.5 pl-11 pr-4 text-xs font-medium
                 text-white shadow-lg outline-none transition-all focus:border-emerald-500 focus:ring-2
                  focus:ring-emerald-500/30 placeholder:text-slate-400"
              />
            </div>
          </div>
        </section>

        {/* Programs Grid */}
        <section className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {filteredPrograms.length > 0 ? (
              filteredPrograms.map((program, idx) => (
                <div key={idx} className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm flex flex-col justify-between hover:border-emerald-500/50 transition-all">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold tracking-wider uppercase bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-200">
                        {program.category}
                      </span>
                      <span className="flex items-center gap-1 text-xs font-semibold text-slate-500">
                        <HiOutlineCalendar className="text-emerald-600" /> {program.schedule}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                      {program.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {program.description}
                    </p>

                    <div className="pt-2 space-y-2 border-t border-slate-100">
                      <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Key Highlights:</p>
                      <ul className="space-y-1.5">
                        {program.highlights.map((item, i) => (
                          <li key={i} className="flex items-center gap-2 text-xs text-slate-600">
                            <HiOutlineCheckBadge className="text-emerald-600 text-sm shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500">
                      📍 {program.location}
                    </span>
                    <a
                      href="/auth"
                      className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-600 transition-colors shadow-sm"
                    >
                      Register
                    </a>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-4">
                <p className="text-sm font-semibold text-slate-700">No specific safety drives found for "{searchLocation}".</p>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Don't worry! You can request a new community safety program or hub in your area by contacting our regional support team.
                </p>
                <a
                  href="/auth"
                  className="inline-block rounded-full bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 transition-colors"
                >
                  Request Hub in Your Area
                </a>
              </div>
            )}
          </div>
        </section>

        {/* Emergency Help Banner */}
        <section className="bg-emerald-900 text-white py-16 px-6 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.3),transparent_70%)]"></div>
          <div className="mx-auto max-w-2xl space-y-4 relative z-10">
            <div className="inline-flex p-3 bg-emerald-950 text-emerald-400 rounded-full text-xl border border-emerald-800">
              <HiOutlinePhone />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Want to Launch a Program in Your Street?
            </h2>
            <p className="text-xs sm:text-sm text-slate-200">
              If your neighborhood needs an emergency first-aid workshop or a sanitation drive, let our coordinators know and we will bring the resources to you.
            </p>
            <div className="pt-2">
              <a 
                href="mailto:safety@skillforge.africa"
                className="inline-block rounded-full bg-white text-slate-900 px-8 py-3 text-xs font-bold hover:bg-emerald-50 transition-colors shadow-lg"
              >
                Contact Safety Desk
              </a>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
