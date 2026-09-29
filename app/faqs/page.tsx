
'use client';

import { useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { 
  HiOutlineChevronDown, 
  HiOutlineMagnifyingGlass,
  HiOutlineEnvelope,
  HiOutlinePhone
} from 'react-icons/hi2';

const faqs = [
  {
    category: "General",
    question: "Are the workshops and training sessions completely free?",
    answer: "Yes, 100% free. We believe vital vocational skills and emergency safety knowledge should be universally accessible to everyone in our communities without financial barriers."
  },
  {
    category: "Certification",
    question: "Do you offer certificates after completing a course?",
    answer: "Yes. Every participant who successfully finishes our hands-on training tracks or safety programs receives an official SkillForge community completion certificate."
  },
  {
    category: "Certification",
    question: "Where can I use the SkillForge certificate?",
    answer: "Our certificates validate practical competency for local artisanal jobs, small business setups, technical workshops, community safety initiatives, and freelance opportunities across Nigeria and beyond."
  },
  {
    category: "Workshops",
    question: "Do I need to bring my own equipment or tools?",
    answer: "No. All necessary tools, digital hardware, safety gear, and training materials are provided on-site at the community hubs during every session."
  },
  {
    category: "General",
    question: "Who is eligible to attend these community programs?",
    answer: "Our workshops are open to everyone—youth, local artisans, small business owners, students, and community members looking to gain practical skills or health education."
  },
  {
    category: "Hosting",
    question: "How long does it take for a hosted event to go live?",
    answer: "When you publish an event, it enters a brief review queue. To ensure community safety and quality, our moderation team reviews all submissions within 24 to 48 hours."
  },
  {
    category: "Community",
    question: "Can I message event hosts or other members directly?",
    answer: "Yes. SkillForge includes direct messaging. Visit any member's public profile, tap 'Message', and coordinate details, ask questions, or share meeting locations in real time."
  },
  {
    category: "Community",
    question: "What are Impact Scores and how do I earn them?",
    answer: "Your Impact Score tracks your active contribution to the community. You earn points automatically for publishing approved workshops, attending local cleanups, and participating in community health drives."
  },
  {
    category: "Hosting",
    question: "How can I volunteer to host a workshop or safety drive?",
    answer: "Tap 'Host / Publish' in the navigation bar to submit your training topic, craft expertise, or health drive proposal for review by our hub coordinators."
  },
  {
    category: "General",
    question: "Where are the physical training hubs currently located?",
    answer: "We operate active community hubs across Lagos, Delta State, and Agbor, with ongoing plans to expand into more neighborhoods across Africa."
  },
  {
    category: "Workshops",
    question: "How do I sign up for an upcoming clean-up or workout?",
    answer: "Find any scheduled event under 'Health & Safety' or 'Local Activities' and reserve your spot directly with a single tap."
  },
  {
    category: "Workshops",
    question: "Are prior qualifications or degrees required?",
    answer: "None at all. Every class is designed from the ground up to be beginner-friendly, focusing entirely on practical, hands-on learning rather than academic theory."
  },
  {
    category: "General",
    question: "Is SkillForge accessible on mobile browsers?",
    answer: "Yes, the platform is responsive and works across all modern mobile browsers on both iOS and Android."
  },
  {
    category: "Hosting",
    question: "What happens if an event host cancels or doesn't show up?",
    answer: "All registered attendees are notified immediately if an event is cancelled. Hosts with unexcused no-shows lose their verified host privileges."
  },
  {
    category: "Account",
    question: "How do I reset my password if I get locked out?",
    answer: "On the login screen, select 'Forgot Password' and enter your email address to receive a secure password reset link."
  },
  {
    category: "Partnerships",
    question: "Can an organization or business sponsor a local hub?",
    answer: "Yes. We partner with local businesses, cooperatives, and NGOs. Use the contact details below to get in touch with our team."
  }
];

export default function FAQsPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 flex flex-col justify-between font-sans transition-colors duration-200">
      <div>
        <Navbar />

        <div className="max-w-3xl mx-auto px-5 pt-6 sm:pt-8 pb-20">
          
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Frequently asked questions
            </h1>
            <p className="text-[14px] sm:text-[15px] text-slate-500 dark:text-slate-400 mt-1.5">
              Everything you need to know about workshops, certifications, hosting, and community drives.
            </p>

            <div className="relative mt-5">
              <HiOutlineMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg pointer-events-none" />
              <input
                type="text"
                placeholder="Search questions or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-[14px] text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-slate-400 dark:focus:border-slate-600 transition-colors"
              />
            </div>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/80 border-t border-slate-100 dark:border-slate-800/80">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq, index) => {
                const isOpen = openFaq === index;
                return (
                  <div key={index} className="py-1">
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                      className="w-full flex items-center justify-between py-3.5 text-left cursor-pointer group"
                    >
                      <span className="text-[14px] sm:text-[15px] font-semibold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors pr-4">
                        {faq.question}
                      </span>
                      <HiOutlineChevronDown 
                        className={`text-slate-400 shrink-0 text-base transition-transform duration-200 ${isOpen ? 'rotate-180 text-emerald-600 dark:text-emerald-400' : ''}`}
                      />
                    </button>
                    {isOpen && (
                      <div className="pb-4 pr-6">
                        <p className="text-[13px] sm:text-[14px] text-slate-600 dark:text-slate-400 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="py-12 text-center">
                <p className="text-[14px] font-medium text-slate-500 dark:text-slate-400">
                  No matching questions found for "{searchQuery}".
                </p>
              </div>
            )}
          </div>

          <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-[14px] font-bold text-slate-900 dark:text-white">
                Can't find what you're looking for?
              </h2>
              <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
                Reach out to our community support desk directly.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <a
                href="mailto:support@skillforge.africa"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[12px] font-bold hover:opacity-90 transition-opacity"
              >
                <HiOutlineEnvelope className="text-sm" />
                Email support
              </a>
              <a
                href="tel:+2348000000000"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-[12px] font-bold hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
              >
                <HiOutlinePhone className="text-sm" />
                Call desk
              </a>
            </div>
          </div>

        </div>
      </div>

      <Footer />
    </main>
  );
}