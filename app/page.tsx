
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { 
  HiOutlineWrenchScrewdriver, 
  HiOutlineHeart, 
  HiOutlineSparkles, 
  HiOutlineUserGroup,
  HiChevronLeft,
  HiChevronRight
} from 'react-icons/hi2';

export default function Home() {
  const carouselImages = [
    '/image/hero-2.jpg', 
    '/image/hero-3.jpg',
    '/image/hero-4.jpg',
    '/image/hero-5.jpg',
    '/image/hero-6.jpg',
    '/image/hero-7.jpg',
    '/image/hero-8.jpg',
    '/image/hero-1.jpg'
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev === carouselImages.length - 1 ? 0 : prev + 1));
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev === 0 ? carouselImages.length - 1 : prev - 1));
  };

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 flex flex-col font-sans overflow-x-hidden transition-colors duration-300">
      <Navbar />

      <section 
        className="relative flex flex-col items-center justify-center pt-32 pb-28 sm:pt-40 sm:pb-36 lg:pt-48 lg:pb-40 w-full bg-slate-950 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/image/hero-bg.jpeg')" }}
      >
        <div className="absolute inset-0 bg-slate-950/75 z-0" />

        <div className="relative z-10 mx-auto max-w-4xl px-5 sm:px-6 text-center space-y-6 sm:space-y-8">

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] tracking-tight">
            Practical skills for work. <br />
            <span className="text-emerald-400">Vital knowledge for life.</span>
          </h1>

          <p className="mx-auto max-w-2xl text-[15px] sm:text-lg lg:text-xl text-slate-200 leading-relaxed font-medium">
            Join our zero-cost platform built to uplift our neighborhoods. Learn hands-on trades, master digital skills, train in emergency CPR, and team up for local eco-cleanups.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link 
              href="/skills"
              className="w-full sm:w-auto rounded-full bg-emerald-600 px-7 py-3.5 text-sm sm:text-base font-bold text-white shadow-lg transition-all hover:bg-emerald-500 active:scale-95 cursor-pointer"
            >
              Explore Free Workshops
            </Link>
            <Link 
              href="/cleanups-workouts"
              className="w-full sm:w-auto rounded-full border border-white/30 bg-white/10 backdrop-blur-md px-7 py-3.5 text-sm sm:text-base font-bold text-white transition-all hover:bg-white/20 active:scale-95 cursor-pointer"
            >
              Find Local Cleanups
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-white dark:bg-slate-950 py-16 sm:py-24 px-6 sm:px-12 border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
          
          <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left space-y-4 sm:space-y-6">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              Empowering African communities.
            </h2>
            <div className="space-y-4 text-slate-600 dark:text-slate-400 text-[15px] sm:text-lg leading-relaxed">
              <p>
                Across the continent, practical knowledge and collective action change lives. We built this platform to bridge the gap between willing mentors and eager learners—at absolutely no cost.
              </p>
              <p>
                Whether it is teaching digital skills in local hubs, leading neighborhood market cleanups, or offering free CPR and hygiene classes, we believe in building a culture of shared growth right here at home.
              </p>
            </div>
            <Link 
              href="/about"
              className="text-[14px] sm:text-base text-emerald-600 dark:text-emerald-400 font-bold hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors inline-flex items-center gap-1 mt-2"
            >
              Read our story <HiChevronRight className="mt-0.5" />
            </Link>
          </div>

          <div className="w-full lg:w-1/2 relative group">
            <div className="relative w-full aspect-[16/9] sm:aspect-[4/3] rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden bg-slate-100 dark:bg-slate-900 shadow-lg border border-slate-200/50 dark:border-slate-800">
              
              <img 
                src={carouselImages[currentIndex]}
                alt={`Community Slider ${currentIndex + 1}`}
                className="w-full h-full object-cover transition-opacity duration-300"
              />

              <button 
                onClick={prevImage}
                className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-slate-900 dark:text-white flex items-center justify-center shadow-lg opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all hover:bg-white dark:hover:bg-slate-900 hover:scale-105 cursor-pointer"
                aria-label="Previous image"
              >
                <HiChevronLeft className="text-xl sm:text-2xl pr-[1px] sm:pr-0.5" />
              </button>

              <button 
                onClick={nextImage}
                className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-slate-900 dark:text-white flex items-center justify-center shadow-lg opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all hover:bg-white dark:hover:bg-slate-900 hover:scale-105 cursor-pointer"
                aria-label="Next image"
              >
                <HiChevronRight className="text-xl sm:text-2xl pl-[1px] sm:pl-0.5" />
              </button>

              <div className="absolute bottom-4 sm:bottom-6 w-full flex justify-center flex-wrap gap-2 px-4">
                {carouselImages.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      idx === currentIndex 
                        ? 'w-8 bg-white shadow-md' 
                        : 'w-2 bg-white/60 hover:bg-white'
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>

            </div>
          </div>

        </div>
      </section>

      <section className="bg-slate-50 dark:bg-slate-900/40 py-16 sm:py-28 px-6 lg:px-12 border-t border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-[1400px] mx-auto">
          
          <div className="max-w-2xl mb-12 sm:mb-16">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">
              How you can get involved
            </h2>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
              Whether you are looking to acquire a new trade to boost your career or give back to your neighborhood, here is where you start.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10 lg:gap-y-12">
            
            <Link href="/skills" className="flex flex-col group cursor-pointer transition-transform hover:-translate-y-1">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-5 transition-transform group-hover:scale-105 border border-emerald-200 dark:border-emerald-800/50">
                <HiOutlineWrenchScrewdriver className="text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Technical Skills</h3>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                Join workshops to learn practical trades, digital skills, and crafts from experienced local professionals.
              </p>
            </Link>

            <Link href="/health-and-safety" className="flex flex-col group cursor-pointer transition-transform hover:-translate-y-1">
              <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-5 transition-transform group-hover:scale-105 border border-rose-200 dark:border-rose-800/50">
                <HiOutlineHeart className="text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">Health & Safety</h3>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                Learn vital life-saving knowledge including CPR, first aid response, and general health hygiene.
              </p>
            </Link>

            <Link href="/cleanups-workouts" className="flex flex-col group cursor-pointer transition-transform hover:-translate-y-1">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-5 transition-transform group-hover:scale-105 border border-blue-200 dark:border-blue-800/50">
                <HiOutlineSparkles className="text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Eco Cleanups</h3>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                Team up with neighbors to clear drainage systems, recover plastics, and keep the community clean.
              </p>
            </Link>

            <Link href="/cleanups-workouts" className="flex flex-col group cursor-pointer transition-transform hover:-translate-y-1">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-5 transition-transform group-hover:scale-105 border border-amber-200 dark:border-amber-800/50">
                <HiOutlineUserGroup className="text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">Group Workouts</h3>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                Stay fit and connect with others through free, host-led community fitness and wellness sessions.
              </p>
            </Link>

          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}