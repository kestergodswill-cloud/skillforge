'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Logo from './Logo';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { 
  HiOutlineUser, 
  HiOutlineHome,
  HiOutlineBars3, 
  HiOutlineXMark, 
  HiOutlineMagnifyingGlass,
  HiOutlineSparkles,
  HiOutlineQuestionMarkCircle
} from 'react-icons/hi2';
import { MdOutlineHealthAndSafety, MdOutlineVolunteerActivism } from 'react-icons/md';
import { LuBookOpen } from 'react-icons/lu';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <Logo size={44} />
        </Link>
        
        <div className="hidden 2xl:flex items-center flex-1 max-w-xs mx-6">
          <div className="relative w-full">
            <HiOutlineMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm"/>
            <input
              type="text"
              placeholder="Search skills, CPR, cleanups..."
              className="w-full rounded-full border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-xs font-medium
              text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-emerald-500
              focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        </div>

        <nav className="hidden lg:flex items-center gap-5 text-sm font-semibold text-slate-600">
          <Link 
            href="/skills" 
            className="flex items-center gap-1.5 transition-colors hover:text-emerald-600 whitespace-nowrap">
            <MdOutlineVolunteerActivism className="text-lg text-emerald-600 shrink-0" />
            <span>Explore Skills</span>
          </Link>

          <Link 
            href="/health-and-safety" 
            className="flex items-center gap-1.5 transition-colors hover:text-emerald-600 whitespace-nowrap">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500"></span>
            </span>
            <MdOutlineHealthAndSafety className="text-lg text-rose-500 shrink-0" />
            <span>Health & Life-Saving</span>
          </Link>

          <Link 
            href="/about" 
            className="flex items-center gap-1.5 transition-colors hover:text-emerald-600 whitespace-nowrap">
            <LuBookOpen className="text-base text-slate-500 shrink-0"/>
            <span>About</span>
          </Link>

          <Link 
            href="/faqs" 
            className="flex items-center gap-1.5 transition-colors hover:text-emerald-600 whitespace-nowrap">
            <HiOutlineQuestionMarkCircle className="text-base text-slate-500 shrink-0"/>
            <span>FAQs</span>
          </Link>
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          
          <div className="hidden lg:flex 2xl:hidden items-center">
            {searchOpen ? (
              <div className="flex items-center gap-2">
                <input
                  type="text" 
                  autoFocus
                  placeholder="Search workshops..."
                  className="w-48 rounded-full border border-slate-200 bg-slate-50 py-1.5 pl-3.5 pr-3 text-xs font-medium
                  text-slate-800 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-2
                  focus:ring-emerald-500/20"
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-full">
                  <HiOutlineXMark className="text-base" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="flex items-center justify-center h-9 w-9 rounded-full text-slate-600 hover:text-emerald-600
                hover:bg-slate-100 transition-colors"
                aria-label="Search">
                <HiOutlineMagnifyingGlass className="text-lg" />
              </button>
            )}
          </div>

          <Link
            href="/host"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-4 py-2 text-xs 
            font-bold text-white shadow-sm transition-all hover:bg-emerald-500 active:scale-95 whitespace-nowrap">
            <HiOutlineSparkles className="text-sm" />
            <span>Host / Publish</span>
          </Link>

          {user ? (
            <Link 
              href="/account"
              className="hidden lg:inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 
              px-3 py-1.5 text-xs font-bold text-slate-700 transition-all hover:bg-slate-100 whitespace-nowrap">
              {user.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="h-6 w-6 rounded-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <HiOutlineUser className="text-sm text-slate-500" />
              )}
              <span className="truncate max-w-24">
                {user.displayName?.split(' ')[0] || 'Account'}
              </span>
            </Link>
          ) : (
            <Link 
              href="/auth"
              className="hidden lg:inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 
              px-4 py-2.5 text-xs font-bold text-slate-700 transition-all hover:bg-slate-100 whitespace-nowrap">
              <HiOutlineUser className="text-sm text-slate-500" />
              <span>Sign In</span>
            </Link>
          )}

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-none"
            aria-label="Toggle Navigation Menu">
            {mobileMenuOpen ? (
              <HiOutlineXMark className="text-2xl"/>
            ) : (
              <HiOutlineBars3 className="text-2xl"/>
            )}
          </button>
        </div>

      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-5 py-6 space-y-4 shadow-xl">
          <div className="relative w-full">
            <HiOutlineMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base"/>
            <input
              type="text"
              placeholder="Search skills, CPR, cleanups..."
              className="w-full rounded-full border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-xs font-medium
              text-slate-900 outline-none"
            />
          </div>

           <div className="flex flex-col space-y-2 pt-2">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700
              hover:bg-emerald-50 hover:text-emerald-700">
              <HiOutlineHome className="text-xl text-slate-600" />
              <span>Home</span>
            </Link>

            <Link
              href="/skills"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700
              hover:bg-emerald-50 hover:text-emerald-700">
              <MdOutlineVolunteerActivism className="text-xl text-emerald-600" />
              <span>Explore Skills</span>
            </Link>

            <Link
              href="/health-and-safety"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700
              hover:bg-emerald-50 hover:text-emerald-700">
              <MdOutlineHealthAndSafety className="text-xl text-rose-500" />
              <span>Health & Life-Saving</span>
            </Link>

            <Link
              href="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700
              hover:bg-emerald-50 hover:text-emerald-700">
              <LuBookOpen className="text-lg text-slate-500" />
              <span>About</span>
            </Link>

            <Link
              href="/faqs"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700
              hover:bg-emerald-50 hover:text-emerald-700">
              <HiOutlineQuestionMarkCircle className="text-xl text-slate-500" />
              <span>FAQs</span>
            </Link>

            {user ? (
              <Link
                href="/account"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700
                hover:bg-emerald-50 hover:text-emerald-700">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Profile" className="h-6 w-6 rounded-full object-cover shrink-0" referrerPolicy="no-referrer" />
                ) : (
                  <HiOutlineUser className="text-xl text-slate-500 shrink-0"/>
                )}
                <span>My Account</span>
              </Link>
            ) : (
              <Link
                href="/auth"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700
                hover:bg-emerald-50 hover:text-emerald-700">
                <HiOutlineUser className="text-xl text-slate-500 shrink-0"/>
                <span>Sign In</span>
              </Link>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100">
            <Link
              href="/host"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full rounded-full bg-emerald-600 py-3 text-xs 
              font-bold text-white shadow-sm hover:bg-emerald-500">
              <HiOutlineSparkles className="text-base" />
              <span>Host / Publish</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
