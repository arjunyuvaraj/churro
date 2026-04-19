import { Link } from 'react-router-dom';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] text-text-primary">
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#FAFAF8] border-b border-stone-200">
        <div className="mx-auto flex h-20 max-w-4xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2">
            <img src="/churro-logo.png" alt="Churro" className="h-12 w-auto" />
            <span className="font-heading text-xl font-bold text-primary">Churro</span>
          </Link>
          <Link to="/" className="text-sm font-medium text-stone-600 hover:text-stone-900">Back to Home</Link>
        </div>
      </header>

      <main className="pt-20 max-w-4xl mx-auto px-6 py-12">
        <h1 className="font-heading text-4xl font-bold mb-8">Privacy Policy</h1>
        <p className="text-sm text-stone-500 mb-8">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

        <div className="prose prose-stone max-w-none space-y-6">
          <section>
            <h2 className="font-heading text-xl font-bold mt-8 mb-4">1. Introduction</h2>
            <p>Churro ("we," "our," or "us") respects your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.</p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-bold mt-8 mb-4">2. Information We Collect</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Account Information:</strong> Name, email, date of birth, and role (teen, parent, or neighbor) when you create an account.</li>
              <li><strong>Profile Information:</strong> Skills, interests, and preferences you provide.</li>
              <li><strong>Task Information:</strong> Task postings, applications, and completion history.</li>
              <li><strong>Payment Information:</strong> For MVP, we only store mock payment data. In production, payment info is handled by Stripe.</li>
              <li><strong>Usage Data:</strong> How you interact with the platform.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-xl font-bold mt-8 mb-4">3. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>To provide and maintain the Churro platform</li>
              <li>To match teens with appropriate tasks based on age and skills</li>
              <li>To notify parents of task status and applications</li>
              <li>To improve our services and user experience</li>
              <li>To comply with legal obligations (including child labor law compliance)</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-xl font-bold mt-8 mb-4">4. Information Sharing</h2>
            <p>We do <strong>not</strong> sell your personal information. We may share information with:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Firebase (Google):</strong> For authentication and data storage</li>
              <li><strong>Parents/Guardians:</strong> For teen accounts, to enable oversight</li>
              <li><strong>Legal authorities:</strong> When required by law</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-xl font-bold mt-8 mb-4">5. Data Security</h2>
            <p>We use industry-standard security measures to protect your data. However, no method of transmission over the Internet is 100% secure. We cannot guarantee absolute security.</p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-bold mt-8 mb-4">6. Children's Privacy</h2>
            <p>Churro is designed for teens aged 13-17. We comply with the Children's Online Privacy Protection Act (COPPA). We:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Do not knowingly collect personal information from children under 13 without parental consent</li>
              <li>Require parental email for teen accounts</li>
              <li>Filter tasks by age to comply with FLSA</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-xl font-bold mt-8 mb-4">7. Your Rights</h2>
            <p>Depending on your location, you may have rights to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Object to processing</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-xl font-bold mt-8 mb-4">8. Changes to This Policy</h2>
            <p>We may update this policy from time to time. We will notify you of any material changes by posting the new policy on this page.</p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-bold mt-8 mb-4">9. Contact Us</h2>
            <p>If you have questions about this Privacy Policy, please contact us at:</p>
            <p className="mt-2">hello@churro.app</p>
          </section>
        </div>
      </main>
    </div>
  );
}