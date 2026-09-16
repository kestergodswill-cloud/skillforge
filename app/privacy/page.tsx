import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      <Navbar />
      <section className="flex-1 mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-extrabold mb-8">Privacy Policy</h1>
        <div className="space-y-6 text-sm text-slate-600 leading-relaxed">
          <p><strong>1. Information We Collect:</strong> When you sign up, we securely collect your name, email address, and
             profile picture via your chosen authentication provider (like Google). If you host an event, we collect the 
             contact details you voluntarily provide.</p>

          <p><strong>2. How We Use Your Data:</strong> Your data is used strictly to manage your account, track your impact 
            score, and display your contact information publicly *only* if you choose to host a community event.</p>

          <p><strong>3. Data Protection:</strong> We adhere to standard data protection regulations to ensure your data is
            stored securely and never sold to third parties.</p>

          <p><strong>4. Your Rights:</strong> You have the right to request deletion of your account and all associated data 
            at any time by contacting our support team.</p>
        </div>
      </section>
      <Footer />
    </main>
  );
}
