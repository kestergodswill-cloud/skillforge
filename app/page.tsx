

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      <section className="relative flex min-h-[calc(100vh-5rem)] items-center justify-center overflow-hidden bg-slate-950 px-6 py-16 text-center text-white">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/image/hero-bg.jpeg')" }}
        />

        <div className="absolute inset-0 bg-slate-950 opacity-80" />

        <div className="relative z-10 mx-auto max-w-4xl space-y-6">
          <div className="mx-auto inline-block max-w-[92%] rounded-2xl border border-emerald-400/30 bg-emerald-500/15 
            px-4 py-2 text-center backdrop-blur-md sm:max-w-none sm:rounded-full">
            <span className="text-[11px] font-bold uppercase leading-snug tracking-wider text-emerald-300 sm:text-xs">
              <span className="mr-2 -mt-0.5 inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-400 align-middle" />
              Skills That Build Communities, Knowledge That Saves Lives
            </span>
          </div>

          <h1 className="text-4xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-6xl lg:text-7xl">
            Practical Skills for Work.{' '}
            <span className="text-emerald-400">
              Vital Knowledge for Life.
            </span>
          </h1>

          <p className="mx-auto max-w-2xl text-base font-normal leading-relaxed text-slate-200 sm:text-lg lg:text-xl">
            Zero-cost community training: learn hands-on crafts, digital skills, CPR emergencies, oral & body hygiene, and
             neighborhood cleanups.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <a
              href="/skills"
              className="rounded-full bg-emerald-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg transition-all
               hover:bg-emerald-500 hover:shadow-emerald-600/30 active:scale-95 sm:text-base">
              Explore Free Workshops
            </a>
            <a
              href="/cleanups-workouts"
              className="flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-7 py-3.5 text-sm 
              font-medium text-white backdrop-blur-md transition-all hover:bg-white/20 active:scale-95 sm:text-base">
              <span>🌱</span>
              <span>Find Local Cleanups & Group workouts</span>
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}