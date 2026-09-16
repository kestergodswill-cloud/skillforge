'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { HiOutlineHeart, HiOutlineUserGroup, HiOutlineMapPin, HiOutlineCalendar, 
        HiOutlineMagnifyingGlass, HiOutlineCheckBadge } from 'react-icons/hi2';

const eventsList = [
  {
    title: "Saturday Morning Community Fitness Bootcamp",
    category: "Group Workout",
    schedule: "Every Saturday • 6:30 AM",
    location: "Central Community Field, Agbor",
    city: "Agbor",
    description: "Start your weekend right with an energizing group cardio and bodyweight fitness session open to all ages and fitness levels.",
    organizer: "SkillForge Wellness Club",
    highlights: ["Certified fitness instructor", "Hydration station provided", "All fitness levels welcome"]
  },
  {
    title: "Neighborhood Eco-Sanitation & Tree Planting Drive",
    category: "Cleanup & Green Initiative",
    schedule: "First Saturday of the Month • 7:00 AM",
    location: "Main Market Road, Ikeja, Lagos",
    city: "Lagos",
    description: "Join local community members to clean up drainage pathways, properly dispose of recyclable waste, and plant shade trees along major streets.",
    organizer: "Green Lagos Initiative",
    highlights: ["Gloves & sanitation tools provided", "Community service certificate", "Refreshments after cleanup"]
  },
  {
    title: "Sunrise Jogging & Aerobics Club",
    category: "Group Workout",
    schedule: "Tuesdays & Thursdays • 5:45 AM",
    location: "Delta State University Sub-Urban Area, Delta",
    city: "Delta",
    description: "A refreshing morning jog and stretching session designed to build cardiovascular endurance and foster strong community ties.",
    organizer: "Delta Active Youth",
    highlights: ["Safe group pacing", "Stretching & mobility routine", "Encouraging community"]
  },
  {
    title: "Community Creek & Street Waste Clearance",
    category: "Cleanup & Green Initiative",
    schedule: "Bi-Weekly Saturday • 8:00 AM",
    location: "Abuja Municipal Community Zone",
    city: "Abuja",
    description: "Collaborative neighborhood cleanup to clear blocked waterways, prevent flooding during rainy seasons, and promote proper hygiene habits.",
    organizer: "Abuja Clean Streets Taskforce",
    highlights: ["Safety briefing & gear included", "Waste segregation training", "Impact award recognition"]
  }
];

export default function CleanupsWorkoutsPage() {
  const [searchLocation, setSearchLocation] = useState('');

  const filteredEvents = eventsList.filter(event => 
    event.city.toLowerCase().includes(searchLocation.toLowerCase()) ||
    event.location.toLowerCase().includes(searchLocation.toLowerCase()) ||
    event.title.toLowerCase().includes(searchLocation.toLowerCase()) ||
    event.category.toLowerCase().includes(searchLocation.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      <div>
        <Navbar />

        {/* Hero Section */}
        <section className="bg-slate-900 text-white py-16 sm:py-24 px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.15),transparent_50%)]"></div>
          <div className="mx-auto max-w-4xl text-center space-y-6 relative z-10">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold tracking-widest text-emerald-400 uppercase
                 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-800">
              <HiOutlineHeart className="text-sm" /> Community Fitness & Cleanups
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
              Local Cleanups & Group Workouts
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
              Find scheduled neighborhood cleanups, group workouts, and fitness meetups happening right in your local area. Stay active and keep your environment clean together.
            </p>

            {/* Location / Keyword Search */}
            <div className="relative max-w-md mx-auto pt-2">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400 text-lg mt-2">
                <HiOutlineMagnifyingGlass />
              </span>
              <input
                type="text"
                placeholder="Search by city or activity (e.g., Agbor, Lagos, Workout)..."
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                className="w-full rounded-full border border-slate-700 bg-slate-800/90 py-3.5 pl-11 pr-4 text-xs font-medium
                 text-white shadow-lg outline-none transition-all focus:border-emerald-500 focus:ring-2
                  focus:ring-emerald-500/30 placeholder:text-slate-400"
              />
            </div>
          </div>
        </section>

        {/* Events Grid */}
        <section className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredEvents.length > 0 ? (
              filteredEvents.map((event, idx) => (
                <div key={idx} className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm flex flex-col 
                              justify-between hover:border-emerald-500/50 transition-all">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold tracking-wider uppercase bg-emerald-50 text-emerald-700 px-3 
                            py-1 rounded-full border border-emerald-200">
                        {event.category}
                      </span>
                      <span className="flex items-center gap-1 text-xs font-semibold text-slate-500">
                        <HiOutlineCalendar className="text-emerald-600" /> {event.schedule}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                      {event.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {event.description}
                    </p>

                    <div className="pt-2 space-y-2 border-t border-slate-100">
                      <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Highlights:</p>
                      <ul className="space-y-1.5">
                        {event.highlights.map((item, i) => (
                          <li key={i} className="flex items-center gap-2 text-xs text-slate-600">
                            <HiOutlineCheckBadge className="text-emerald-600 text-sm shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                 <div className="pt-6 mt-6 border-t border-slate-100 flex flex-row items-center justify-between gap-2">
                    <span className="text-xs font-medium text-slate-500 flex items-center gap-1 truncate">
                      <HiOutlineMapPin className="text-emerald-600 shrink-0" /> <span className="truncate">{event.location}</span>
                    </span>
                    <a
                      href="/auth"
                      className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-5 py-2 text-xs font-bold
                       text-white hover:bg-emerald-600 transition-colors shadow-sm shrink-0 whitespace-nowrap">
                      Join Event
                    </a>
                  </div>

                </div>
              ))
            ) : (
              <div className="col-span-2 text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-4">
                <p className="text-sm font-semibold text-slate-700">No events found matching "{searchLocation}".</p>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Want to organize a group workout or neighborhood cleanup in your area? Connect with our coordinators to
                   get started.
                </p>
                <a
                  href="/auth"
                  className="inline-block rounded-full bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white
                   hover:bg-emerald-500 transition-colors">
                  Propose New Event
                </a>
              </div>
            )}
          </div>
        </section>

        <section className="bg-emerald-900 text-white py-16 px-6 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.3),transparent_70%)]"></div>
          <div className="mx-auto max-w-2xl space-y-4 relative z-10">
            <div className="inline-flex p-3 bg-emerald-950 text-emerald-400 rounded-full text-xl border border-emerald-800">
              <HiOutlineUserGroup />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Host a Workout or Cleanup in Your Community
            </h2>
            <p className="text-xs sm:text-sm text-slate-200">
              Passionate about fitness or environmental cleanliness? Partner with SkillForge to list your local group 
              exercise or street sanitation drive for free.
            </p>
            <div className="pt-2">
              <a 
                href="/auth"
                className="inline-block rounded-full bg-white text-slate-900 px-8 py-3 text-xs font-bold
                 hover:bg-emerald-50 transition-colors shadow-lg">
                Register as Event Host
              </a>
            </div>
          </div>
        </section>
      </div>

      <Footer/>
    </main>
  );
}
