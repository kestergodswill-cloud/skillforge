
'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  HiOutlineSparkles, 
  HiOutlineUserGroup, 
  HiOutlineGlobeAlt, 
  HiOutlineShieldCheck, 
  HiOutlineChatBubbleLeftRight, 
  HiOutlineTrophy,
  HiOutlineBriefcase,
  HiOutlineMapPin
} from 'react-icons/hi2';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 flex flex-col justify-between font-sans transition-colors duration-300">
      <div>
        <Navbar />

        <section className="bg-white dark:bg-slate-950 pt-12 sm:pt-16 lg:pt-20 pb-16 sm:pb-20 px-5 border-b border-slate-100 dark:border-slate-800 transition-colors duration-300">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-emerald-600 dark:text-emerald-500 font-bold tracking-widest uppercase text-[13px] mb-6">
              Our Story & Mission
            </h2>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.1] mb-6">
              Built for the Future of Africa.
            </h1>
            
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 font-medium leading-relaxed max-w-2xl mx-auto">
              SkillForge is a pan-African community hub bridging the gap between ambition and opportunity. We empower youths through
               grassroots technical education, professional training, and local environmental action.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-[1200px] px-5 py-20 sm:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            
            <div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight mb-6">
                Empowering communities, bypassing traditional barriers.
              </h2>
              <div className="space-y-5 text-[16px] text-slate-600 dark:text-slate-400 leading-relaxed">
                <p>
                  Across Africa, millions of young people possess incredible drive and talent, yet face massive barriers to entry. 
                  Costly bootcamps, distant training centers, and a lack of local mentorship prevent ambition from turning into tangible skills.
                </p>
                <p>
                  We built SkillForge to change that. We are a grassroots platform designed to eliminate the barriers of cost and location.
                   Whether you want to learn modern web development, master a vocational trade, or organize a neighborhood cleanup,
                    SkillForge connects you with local professionals and peers ready to help you grow.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900 p-8 sm:p-10 rounded-2xl transition-colors duration-300">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-5 mb-6">
                Our Core Pillars
              </h3>
              
              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <HiOutlineSparkles className="text-2xl text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">100% Free Access</h4>
                    <p className="text-[15px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">We eliminate financial barriers 
                          so talent meets opportunity without the burden of debt.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <HiOutlineMapPin className="text-2xl text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">Local Community Hubs</h4>
                    <p className="text-[15px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">Training spaces and events 
                          established directly in your town, bringing opportunities to your doorstep.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <HiOutlineBriefcase className="text-2xl text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">Practical Competency</h4>
                    <p className="text-[15px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">We prioritize hands-on project
                           building, actual tool handling, and genuine employment readiness.</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        <section className="bg-slate-50 dark:bg-slate-900/50 py-20 sm:py-28 border-y border-slate-200 dark:border-slate-800 
                 transition-colors duration-300">
          <div className="mx-auto max-w-[1200px] px-5">
            <div className="max-w-2xl mb-12">
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-4">
                What can you do on SkillForge?
              </h2>
              <p className="text-[16px] text-slate-600 dark:text-slate-400 leading-relaxed">
                SkillForge isn't just a directory—it's an interactive ecosystem. Here is how you can use the platform to upskill and impact
                your neighborhood.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
              
              <div>
                <HiOutlineGlobeAlt className="text-3xl text-blue-600 dark:text-blue-500 mb-4" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Learn Tech & Trades</h3>
                <p className="text-[15px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  Browse and reserve slots for free, locally-hosted workshops. From web development to solar installation, learn skills that pay.
                </p>
              </div>

              <div>
                <HiOutlineUserGroup className="text-3xl text-emerald-600 dark:text-emerald-500 mb-4" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Join Local Activities</h3>
                <p className="text-[15px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  Discover community-driven events. Register for neighborhood cleanups, group workouts, and eco-drives happening near you.
                </p>
              </div>

              <div>
                <HiOutlineShieldCheck className="text-3xl text-rose-600 dark:text-rose-500 mb-4" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Health & Safety</h3>
                <p className="text-[15px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  Access crucial first-aid training, emergency preparedness seminars, and public health awareness drives in your city.
                </p>
              </div>

              <div>
                <HiOutlineChatBubbleLeftRight className="text-3xl text-amber-600 dark:text-amber-500 mb-4" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Network & Message</h3>
                <p className="text-[15px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  Connect with hosts directly. Build your profile, follow industry mentors, and use our built-in messenger to coordinate meetups.
                </p>
              </div>

            </div>
          </div>
        </section>

        <section className="py-20 sm:py-28 px-5 bg-white dark:bg-slate-950 transition-colors duration-300">
          <div className="mx-auto max-w-[1200px]">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
                Built for Safety and Growth
              </h2>
              <p className="text-[16px] text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
                We prioritize community trust and verifiable impact above all else.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
              
              <div className="flex gap-5">
                <HiOutlineShieldCheck className="text-3xl text-slate-900 dark:text-white shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Verified Safety & Reviews</h3>
                  <p className="text-[15px] text-slate-600 dark:text-slate-400 leading-relaxed">
                    Every host goes through a verification process. Read genuine community ratings and reviews before attending any physical workshop or cleanup.
                  </p>
                </div>
              </div>

              <div className="flex gap-5">
                <HiOutlineTrophy className="text-3xl text-slate-900 dark:text-white shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Impact Scores & Badges</h3>
                  <p className="text-[15px] text-slate-600 dark:text-slate-400 leading-relaxed">
                    Earn impact points and profile badges every time you host an event or attend a community drive, publicly tracking your neighborhood contributions.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>

        <section className="bg-emerald-900 dark:bg-emerald-950 text-white py-24 px-5 text-center transition-colors duration-300">
          <div className="mx-auto max-w-2xl space-y-6">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Host or Sponsor a Training Hub
            </h2>
            <p className="text-lg text-emerald-100/80 font-medium leading-relaxed max-w-lg mx-auto">
              Whether you are an experienced instructor, a skilled artisan, or someone who owns community space, you can partner with us 
              to expand educational opportunities in your area.
            </p>
            
            <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                href="/host"
                className="w-full sm:w-auto rounded-xl bg-white text-emerald-900 px-8 py-4 text-[15px] font-bold hover:bg-emerald-50
                 transition-colors active:scale-95"
              >
                Become a Host
              </Link>
              <Link 
                href="/skills"
                className="w-full sm:w-auto rounded-xl bg-emerald-800 text-white border border-emerald-700 px-8 py-4 text-[15px] 
                font-bold hover:bg-emerald-700 transition-colors active:scale-95"
              >
                Explore Workshops
              </Link>
            </div>
          </div>
        </section>
      </div>

      <Footer/>
    </main>
  );
}