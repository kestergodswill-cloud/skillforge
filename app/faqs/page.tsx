

'use client';

import { useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { HiOutlineChevronDown, HiOutlineMagnifyingGlass } from 'react-icons/hi2';

const faqs = [
  {
    question: "Are the workshops and training sessions completely free?",
    answer: "Yes, 100% free. We believe vital vocational skills and emergency safety knowledge should be universally accessible to everyone in our communities without financial barriers."
  },
  {
    question: "Do you offer certificates after completing a course?",
    answer: "Yes! Every participant who successfully finishes our hands-on training tracks or safety programs receives an official SkillForge community completion certificate."
  },
  {
    question: "Where can I work or use the SkillForge certificate?",
    answer: "Our certificates help validate your practical competency for local artisanal jobs, small business setups, technical workshops, community safety initiatives, and freelance opportunities across Nigeria and beyond."
  },
  {
    question: "Do I need to bring my own equipment or tools?",
    answer: "No. All necessary tools, digital hardware, safety gear, and training materials are fully provided at our community hubs during every session."
  },
  {
    question: "Who is eligible to attend these community training programs?",
    answer: "Our workshops are open to everyone—youth, local artisans, small business owners, students, and community members looking to gain practical skills or health education."
  },
  {
    question: "How can I volunteer to host a workshop or safety drive?",
    answer: "You can click the '+ Host / Publish' button on our navigation bar to submit your training topic, craft expertise, or health drive proposal for review by our hub coordinators."
  },
  {
    question: "Where are the physical training hubs currently located?",
    answer: "We operate active community centers across Lagos, Delta State, and Agbor, with ongoing plans to expand into more neighborhoods."
  },
  {
    question: "How do I sign up for an upcoming clean-up or group workout?",
    answer: "You can find scheduled neighborhood events under our 'Health & Safety' section on the homepage and reserve your spot directly with a single click."
  },
  {
    question: "Are prior qualifications or degrees required to join technical classes?",
    answer: "Not at all! Our classes are built from the ground up to be beginner-friendly, focusing heavily on practical, hands-on learning rather than academic prerequisites."
  }
];

export default function FAQsPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      <div>
        <Navbar/>

        <section className="mx-auto max-w-4xl px-6 py-16 sm:py-24">
          <div className="text-center space-y-4 mb-12">
            <span className="text-xs font-bold tracking-widest text-emerald-600 uppercase bg-emerald-50 px-3 py-1 
            rounded-full border border-emerald-200">
              Help Center
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900">
              Frequently Asked Questions
            </h1>
            <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
              Got questions about our free workshops, safety training, or hosting? Find quick answers here.
            </p>

            <div className="relative max-w-md mx-auto mt-4">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400 text-lg">
                <HiOutlineMagnifyingGlass />
              </span>
              <input
                type="text"
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-slate-200 bg-white py-3 pl-11 pr-4 text-xs font-medium
                 text-slate-800 shadow-sm outline-none transition-all focus:border-emerald-500 focus:ring-2
                  focus:ring-emerald-500/20"
              />
            </div>

          </div>

          <div className="space-y-4">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq, index) => (
                <div 
                  key={index} 
                  className="border border-slate-200 rounded-2xl bg-white shadow-sm overflow-hidden transition-all">
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="flex w-full items-center justify-between px-6 py-5 text-left focus:outline-none">
                    <span className="font-semibold text-slate-800 text-sm sm:text-base">{faq.question}</span>
                    <HiOutlineChevronDown 
                      className={`text-xl text-emerald-600 transition-transform duration-300 shrink-0 ${openFaq === index ? 'rotate-180' : ''}`} />
                  </button>
                  {openFaq === index && (
                    <div className="px-6 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-center text-sm text-slate-500 py-12">No matching questions found.</p>
            )}
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}