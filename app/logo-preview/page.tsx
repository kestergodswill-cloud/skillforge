import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
  theme?: 'light' | 'dark' | 'auto';
}

function Logo({ size = 44, className = "", theme = "auto" }: LogoProps) {
  let textClass = 'text-slate-900 dark:text-white';
  let highlightClass = 'text-emerald-700 dark:text-emerald-400';
  let subClass = 'text-slate-500 dark:text-slate-400';

  if (theme === 'light') {
    textClass = 'text-slate-900';
    highlightClass = 'text-emerald-700';
    subClass = 'text-slate-500';
  } else if (theme === 'dark') {
    textClass = 'text-white';
    highlightClass = 'text-emerald-400';
    subClass = 'text-slate-400';
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        className="shrink-0 drop-shadow-sm select-none"
        aria-hidden="true"
      >
        <defs>
          <path
            id="textCircle"
            d="M 60, 60 m -46, 0 a 46,46 0 1,1 92,0 a 46,46 0 1,1 -92,0"
          />
        </defs>

        <circle cx="60" cy="60" r="58" fill="#047857" stroke="#065f46" strokeWidth="2"/>
        <circle cx="60" cy="60" r="48" fill="#064e3b" />

        <text fill="#a7f3d0" fontSize="9.2" fontWeight="800" letterSpacing="2.8">
          <textPath href="#textCircle" startOffset="50%" textAnchor="middle">
             SKILLFORGE • EMPOWER AFRICA •
          </textPath>
        </text>

        <circle cx="60" cy="60" r="32" fill="#047857" stroke="#34d399" strokeWidth="1.5" />

        <g transform="translate(42, 42) scale(1.5)" stroke="#ffffff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 18h16" />
          <path d="M6 18v-4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v4" />
          <path d="M12 2v4" stroke="#f59e0b" strokeWidth="2.5" />
          <path d="m9.5 4.5 5 5" stroke="#f59e0b" strokeWidth="2" />
          <path d="m14.5 4.5-5 5" stroke="#f59e0b" strokeWidth="2" />
        </g>
      </svg>

      <div className="flex flex-col leading-tight">
        <span className={`text-xl font-black tracking-tight ${textClass}`}>
          Skill<span className={highlightClass}>Forge</span>
        </span>
        <span className={`text-[10px] font-semibold tracking-wider uppercase ${subClass}`}>
          Community Hub
        </span>
      </div>
    </div>
  );
}

export default function LogoPreviewPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-white">
      <div className="scale-[3] p-10">
        <Logo theme="light" />
      </div>
    </div>
  );
}