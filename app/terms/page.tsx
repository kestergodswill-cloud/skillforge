import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      <Navbar />
      <section className="flex-1 mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-extrabold mb-8">Terms of Service</h1>
        <div className="space-y-6 text-sm text-slate-600 leading-relaxed">
          <p><strong>1. Welcome to SkillForge:</strong> By accessing our platform, you agree to abide by these terms. We are 
                     a community-driven initiative focused on empowerment and skill-sharing.</p>
          <p><strong>2. User Responsibilities:</strong> You agree to provide accurate information when registering for an 
                     account or hosting an event. Harassment, spam, or submitting false workshop details will result in 
                     immediate account termination.</p>
          <p><strong>3. Event Hosting:</strong> Hosts must ensure their events (cleanups, workshops, fitness drives) are 
                     safe and accurately described. SkillForge acts as a discovery hub and is not legally liable for 
                     incidents occurring at community events.</p>
          <p><strong>4. Intellectual Property:</strong> All site design, text, and graphics remain the property of SkillForge.</p>
        </div>
      </section>
      <Footer />
    </main>
  );
}
