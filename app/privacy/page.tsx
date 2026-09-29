
'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 flex flex-col justify-between font-sans transition-colors duration-300">
      <div>
        <Navbar />
        
        <section className="max-w-[800px] mx-auto px-5 pt-[88px] sm:pt-[104px] pb-24">
          
          <div className="mb-10 sm:mb-12 border-b border-slate-100 dark:border-slate-800 pb-8">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-3">
              Privacy Policy
            </h1>
            <p className="text-[14px] sm:text-[15px] text-slate-500 dark:text-slate-400 font-medium">
              Last updated: September 28, 2026
            </p>
          </div>

          <div className="space-y-10">
            
            <div className="space-y-3">
              <h2 className="text-[18px] sm:text-[20px] font-bold text-slate-900 dark:text-white tracking-tight">1. Information We Collect</h2>
              <p className="text-[14px] sm:text-[15px] text-slate-600 dark:text-slate-400 leading-relaxed">
                When you sign up or interact with SkillForge, we securely collect core details including your name, email address, and profile picture provided via your chosen authentication provider (such as Google). If you register for workshops or host community events, we collect the contact details, phone numbers, and location details you voluntarily supply. For host verification purposes, we also handle government identification documents and verification selfies securely.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-[18px] sm:text-[20px] font-bold text-slate-900 dark:text-white tracking-tight">2. How We Use Your Data</h2>
              <p className="text-[14px] sm:text-[15px] text-slate-600 dark:text-slate-400 leading-relaxed">
                Your personal information is used strictly to manage your account, facilitate direct messaging between community members, track your impact score, and display necessary contact information publicly only if you choose to publish a community event. We also use your data to send essential updates regarding event approvals, rejections, and moderation statuses.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-[18px] sm:text-[20px] font-bold text-slate-900 dark:text-white tracking-tight">3. Data Protection & Security</h2>
              <p className="text-[14px] sm:text-[15px] text-slate-600 dark:text-slate-400 leading-relaxed">
                We adhere to robust data protection regulations and industry-standard security measures (including Firestore security rules and encrypted cloud storage via Cloudinary and Firebase) to ensure your data is stored securely. We strictly prohibit the selling, trading, or renting of your personal information to third-party advertisers or data brokers.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-[18px] sm:text-[20px] font-bold text-slate-900 dark:text-white tracking-tight">4. Cookies & Tracking Technologies</h2>
              <p className="text-[14px] sm:text-[15px] text-slate-600 dark:text-slate-400 leading-relaxed">
                SkillForge uses basic session cookies and local storage parameters (such as theme preferences and authentication tokens) to keep you logged in and ensure a smooth, personalized user experience across your browsing sessions.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-[18px] sm:text-[20px] font-bold text-slate-900 dark:text-white tracking-tight">5. Your Data Rights</h2>
              <p className="text-[14px] sm:text-[15px] text-slate-600 dark:text-slate-400 leading-relaxed">
                You maintain full control over your personal data. You have the right to access, update, or request complete deletion of your account and all associated database records at any time by contacting our support team or navigating through your account management settings.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-[18px] sm:text-[20px] font-bold text-slate-900 dark:text-white tracking-tight">6. Policy Updates</h2>
              <p className="text-[14px] sm:text-[15px] text-slate-600 dark:text-slate-400 leading-relaxed">
                We may periodically update this Privacy Policy to reflect platform enhancements or new regulatory requirements. We encourage you to review this page from time to time to stay informed about how we protect your information.
              </p>
            </div>

          </div>
        </section>
      </div>
      <Footer />
    </main>
  );
}