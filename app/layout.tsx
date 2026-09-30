import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import MaintenanceGuard from "@/components/MaintenanceGuard";
import { Analytics } from "@vercel/analytics/react"; 

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SkillForge - Community Hub",
  description: "Connect, learn, and host community events.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 transition-colors duration-300">
        <MaintenanceGuard>
          {children}
        </MaintenanceGuard>
        <Analytics />
      </body>
    </html>
  );
}