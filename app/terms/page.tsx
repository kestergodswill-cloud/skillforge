
'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 flex flex-col justify-between font-sans transition-colors duration-300">
      <div>
        <Navbar />
        
        <section className="max-w-[800px] mx-auto px-5 pt-[88px] sm:pt-[104px] pb-24">
          
          <div className="mb-10 sm:mb-12 border-b border-slate-100 dark:border-slate-800 pb-8">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-3">
              Terms of Service
            </h1>
            <p className="text-[14px] sm:text-[15px] text-slate-500 dark:text-slate-400 font-medium">
              Last updated: September 28, 2026
            </p>
          </div>

          <div className="space-y-10">
            
            <div className="space-y-3">
              <h2 className="text-[18px] sm:text-[20px] font-bold text-slate-900 dark:text-white tracking-tight">1. Acceptance of Terms</h2>
              <p className="text-[14px] sm:text-[15px] text-slate-600 dark:text-slate-400 leading-relaxed">
                By accessing, browsing, or utilizing the SkillForge platform, you agree to comply with and be bound by these Terms of Service. SkillForge is a grassroots pan-African initiative designed to connect community members with free technical training, health safety classes, and local environmental activities. If you do not agree to these terms, please refrain from using the platform.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-[18px] sm:text-[20px] font-bold text-slate-900 dark:text-white tracking-tight">2. User Accounts & Eligibility</h2>
              <p className="text-[14px] sm:text-[15px] text-slate-600 dark:text-slate-400 leading-relaxed">
                You agree to provide accurate, current, and complete information during registration and identity verification. You are solely responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. Harassment, spam, fraudulent event listings, or submitting falsified credentials will result in immediate account suspension and permanent termination.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-[18px] sm:text-[20px] font-bold text-slate-900 dark:text-white tracking-tight">3. Event Hosting & Community Guidelines</h2>
              <p className="text-[14px] sm:text-[15px] text-slate-600 dark:text-slate-400 leading-relaxed">
                Event hosts must ensure all published workshops, cleanups, or fitness drives are safe, legal, and accurately described. All submissions undergo manual moderation within 24 to 48 hours. SkillForge acts strictly as a discovery and networking platform and is not directly liable for physical incidents, damages, or disputes occurring at community-hosted events.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-[18px] sm:text-[20px] font-bold text-slate-900 dark:text-white tracking-tight">4. Intellectual Property Rights</h2>
              <p className="text-[14px] sm:text-[15px] text-slate-600 dark:text-slate-400 leading-relaxed">
                All original platform design, user interface layouts, graphics, source code, and branding assets remain the exclusive intellectual property of SkillForge. User-uploaded media (such as event photos and workshop banners) remain the property of their respective creators while granting SkillForge a license to display them across the platform.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-[18px] sm:text-[20px] font-bold text-slate-900 dark:text-white tracking-tight">5. Limitation of Liability</h2>
              <p className="text-[14px] sm:text-[15px] text-slate-600 dark:text-slate-400 leading-relaxed">
                SkillForge and its coordinators shall not be held liable for any indirect, incidental, special, or consequential damages resulting from the use or inability to use our platform, or from participation in any community-led workshop, cleanup, or health program.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-[18px] sm:text-[20px] font-bold text-slate-900 dark:text-white tracking-tight">6. Modifications to Terms</h2>
              <p className="text-[14px] sm:text-[15px] text-slate-600 dark:text-slate-400 leading-relaxed">
                SkillForge reserves the right to modify these terms at any time to reflect platform upgrades or regulatory requirements. Continued use of the platform after updates indicates your acceptance of the revised terms.
              </p>
            </div>

          </div>
        </section>
      </div>
      <Footer />
    </main>
  );
}