import { Link } from 'react-router-dom';

export default function Terms() {
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
        <h1 className="font-heading text-4xl font-bold mb-8">Terms of Service</h1>
        <p className="text-sm text-stone-500 mb-8">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

        <div className="prose prose-stone max-w-none space-y-6">
          <section>
            <h2 className="font-heading text-xl font-bold mt-8 mb-4">1. Acceptance of Terms</h2>
            <p>By accessing or using Churro ("the Platform"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, do not use the Platform.</p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-bold mt-8 mb-4">2. What Is Churro?</h2>
            <p>Churro is a task marketplace that connects local teens (ages 13-17) with neighbors for age-appropriate tasks. Churro is <strong>not an employer</strong>. All tasks are independent service arrangements between neighbors and teens.</p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-bold mt-8 mb-4">3. Eligibility</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Teens:</strong> Must be 13-17 years old and have parent/guardian consent.</li>
              <li><strong>Parents:</strong> Must be 18+ and provide consent for teen accounts.</li>
              <li><strong>Neighbors:</strong> Must have a valid address for task posting.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-xl font-bold mt-8 mb-4">4. User Roles & Responsibilities</h2>
            
            <h3 className="font-bold mt-4 mb-2">4.1 Teens</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Only accept tasks appropriate for your age</li>
              <li>Get parent approval before accepting tasks</li>
              <li>Complete tasks as agreed</li>
              <li>Maintain a respectful and professional attitude</li>
            </ul>

            <h3 className="font-bold mt-4 mb-2">4.2 Parents/Guardians</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Approve or decline task applications</li>
              <li>Set radius limits and category restrictions</li>
              <li>Monitor task progress</li>
              <li>Ensure teen safety</li>
            </ul>

            <h3 className="font-bold mt-4 mb-2">4.3 Neighbors</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide accurate task descriptions</li>
              <li>Pay agreed-upon rates</li>
              <li>Be respectful and fair</li>
              <li>Do not request hazardous or inappropriate tasks</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-xl font-bold mt-8 mb-4">5. Prohibited Activities</h2>
            <p>You may NOT use Churro to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Post tasks involving driving or transportation</li>
              <li>Request hazardous work (chemicals, heavy machinery, heights)</li>
              <li>Schedule tasks after 9pm</li>
              <li>Request tasks that violate child labor laws</li>
              <li>Harass, discriminate, or behave inappropriately</li>
              <li>Share false or misleading information</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-xl font-bold mt-8 mb-4">6. Task Categories & Age Restrictions</h2>
            <p>Tasks are filtered by age to comply with FLSA (Fair Labor Standards Act):</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Ages 13-15:</strong> Grocery runs, tech help, pet sitting, light housework, tutoring</li>
              <li><strong>Ages 16-17:</strong> Above plus yard work with non-power tools (some power tools with supervision)</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-xl font-bold mt-8 mb-4">7. Payment</h2>
            <p>For MVP, Churro uses a mock payment system. In production:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Neighbors agree to pay the teen before the task begins</li>
              <li>Payment is processed through Stripe Connect</li>
              <li>Churro may charge a platform fee (disclosed in production)</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-xl font-bold mt-8 mb-4">8. Ratings & Disputes</h2>
            <p>After each task, both parties can rate each other. Ratings build trust in the community. For disputes:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Contact hello@churro.app for support</li>
              <li>Provide details about the issue</li>
              <li>We will work to resolve any conflicts fairly</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-xl font-bold mt-8 mb-4">9. Limitation of Liability</h2>
            <p>Churro is a platform, not a party to any task. We:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Do not guarantee task completion</li>
              <li>Do not employ teens or control their work</li>
              <li>Are not liable for damages arising from tasks</li>
              <li>Provide the platform "as is"</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-xl font-bold mt-8 mb-4">10. Termination</h2>
            <p>We may suspend or terminate your account for:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Violating these Terms</li>
              <li>Posting prohibited tasks</li>
              <li>Harassment or inappropriate behavior</li>
              <li>Safety concerns</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-xl font-bold mt-8 mb-4">11. Changes to Terms</h2>
            <p>We may update these Terms from time to time. Continued use of Churro means you accept the updated Terms.</p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-bold mt-8 mb-4">12. Contact</h2>
            <p>Questions? Contact us at:</p>
            <p className="mt-2">hello@churro.app</p>
          </section>
        </div>
      </main>
    </div>
  );
}