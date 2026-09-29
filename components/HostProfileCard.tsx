'use client';

import { 
  HiCheckBadge, 
  HiStar, 
  HiUsers, 
  HiBolt, 
  HiOutlineEnvelope, 
  HiOutlinePhone 
} from 'react-icons/hi2';

interface HostProfileProps {
  name?: string;
  photoURL?: string;
  isVerified?: boolean;
  followers?: number;
  impact?: string;
  rating?: number;
  email?: string;
  phone?: string;
}

export default function HostProfileCard({
  name = "Kester Godswill",
  photoURL = "https://ui-avatars.com/api/?name=Kester+Godswill&background=047857&color=fff&size=150",
  isVerified = true,
  followers = 1250,
  impact = "42 Workshops",
  rating = 4.9,
  email = "host@skillforge.africa",
  phone = "+2348000000000"
}: HostProfileProps) {
  return (
    <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="relative h-16 w-16 shrink-0">
            <img 
              src={photoURL} 
              alt={name} 
              className="h-full w-full rounded-full object-cover shadow-sm ring-2 ring-white dark:ring-slate-900"
              referrerPolicy="no-referrer"
            />
            {isVerified && (
              <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-white dark:bg-slate-900">
                <HiCheckBadge className="text-xl text-emerald-500" />
              </div>
            )}
          </div>
          
          <div className="flex flex-col">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              {name}
            </h3>
            <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
              Verified Organizer
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4 border-y border-slate-100 py-4 dark:border-slate-800/60">
        <div className="flex flex-col items-center justify-center text-center gap-1">
          <HiUsers className="text-xl text-slate-400 dark:text-slate-500" />
          <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
            {followers >= 1000 ? `${(followers / 1000).toFixed(1)}k` : followers}
          </span>
          <span className="text-[10px] uppercase tracking-wider text-slate-400">Followers</span>
        </div>
        
        <div className="flex flex-col items-center justify-center text-center gap-1 border-x border-slate-100 dark:border-slate-800/60">
          <HiBolt className="text-xl text-amber-500" />
          <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{impact}</span>
          <span className="text-[10px] uppercase tracking-wider text-slate-400">Impact</span>
        </div>

        <div className="flex flex-col items-center justify-center text-center gap-1">
          <HiStar className="text-xl text-rose-400" />
          <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{rating}</span>
          <span className="text-[10px] uppercase tracking-wider text-slate-400">Rating</span>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        {email && (
          <a 
            href={`mailto:${email}`}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-50 px-4 py-3 text-xs font-bold text-slate-700 
            transition-all hover:bg-emerald-50 hover:text-emerald-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-400"
          >
            <HiOutlineEnvelope className="text-base" />
            Message
          </a>
        )}
        {phone && (
          <a 
            href={`tel:${phone}`}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-50 px-4 py-3 text-xs font-bold text-slate-700 
            transition-all hover:bg-emerald-50 hover:text-emerald-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-400"
          >
            <HiOutlinePhone className="text-base" />
            Contact
          </a>
        )}
      </div>
    </div>
  );
}
