import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { HiOutlineInformationCircle, HiOutlineSparkles, HiOutlineUserGroup, HiOutlineGlobeAlt, HiOutlineHeart } from 'react-icons/hi2';
import Link from 'next/link';
export default function AboutPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      <div>
        <Navbar />

        <section className="bg-slate-900 text-white py-16 sm:py-24 px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.15),transparent_50%)]"></div>
          <div className="mx-auto max-w-4xl text-center space-y-4 relative z-10">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold tracking-widest text-emerald-400 uppercase
             bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-800">
              <HiOutlineInformationCircle className="text-sm"/> Our Story & Mission
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
              About SkillForge
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
              Bridging the gap between ambition and opportunity through grassroots technical education, professional training, and 
              community empowerment.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div className="space-y-6 text-center md:text-left">
              <div className="flex justify-center md:justify-start">
                <span className="text-xs font-bold tracking-wider uppercase bg-emerald-100 text-emerald-800 px-3 py-1 
                      rounded-full">
                  Who We Are
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Empowering Africa, One Skill at a Time
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                SkillForge is a grassroots pan-African initiative founded to eliminate the barriers of cost, location, and 
                access to quality technical training. We believe that everyone—regardless of background—deserves access to 
                world-class digital skills, technical trades, and emergency safety preparedness.
              </p>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                From coding bootcamps and solar PV installation workshops to modern agricultural techniques and community 
                safety programs, our hub-based model brings hands-on learning straight into local neighborhoods across 
                Nigeria, Ghana, Kenya, and beyond.
              </p>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
              <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4">
                Our Core Pillars
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl shrink-0 mt-1">
                    <HiOutlineSparkles className="text-lg" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">100% Free Access</h4>
                    <p className="text-xs text-slate-600 mt-0.5">Eliminating financial barriers so talent meets opportunity
                       without debt.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl shrink-0 mt-1">
                    <HiOutlineUserGroup className="text-lg" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">Grassroots Community Hubs</h4>
                    <p className="text-xs text-slate-600 mt-0.5">Physical training spaces established locally in towns 
                      like Lagos, Delta, and Agbor.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl shrink-0 mt-1">
                    <HiOutlineGlobeAlt className="text-lg" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">Practical Competency</h4>
                    <p className="text-xs text-slate-600 mt-0.5">Focusing on hands-on project building, tool handling, and 
                      real employment readiness.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-emerald-900 text-white py-16 px-6 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.3),transparent_70%)]"></div>
          <div className="mx-auto max-w-2xl space-y-4 relative z-10">
            <div className="inline-flex p-3 bg-emerald-950 text-emerald-400 rounded-full text-xl border border-emerald-800">
              <HiOutlineHeart/>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Want to Host or Sponsor a Training Hub?
            </h2>
            <p className="text-xs sm:text-sm text-slate-200 mb-6">
              Whether you are an experienced instructor, artisan, or own community space, you can partner with us to expand
               educational opportunities in your area.
            </p>
            
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                href="/host"
                className="w-full sm:w-auto inline-block rounded-full bg-white text-emerald-900 px-8 py-3 text-sm 
                font-bold hover:bg-emerald-50 transition-colors shadow-lg">
                Become a Host
              </Link>
              <Link 
                href="/skills"
                className="w-full sm:w-auto inline-block rounded-full bg-emerald-800 text-white border
                 border-emerald-700 px-8 py-3 text-sm font-bold hover:bg-emerald-700 transition-colors shadow-lg">
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
