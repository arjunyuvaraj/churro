import { ArrowRight, BadgeCheck, BellRing, CheckCircle2, Clock, HandHeart, MapPinned, ShieldCheck, Sparkles, Star, Users, WalletCards } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '../../lib/useAuth';

const features = [
  {
    title: 'Safety First',
    description: 'Every task is parent-approved. Teens can only accept jobs that match their age and skill level.',
    icon: ShieldCheck
  },
  {
    title: 'Verified Neighbors',
    description: 'All neighbors are verified with address validation and rating systems.',
    icon: BadgeCheck
  },
  {
    title: 'Real-time Updates',
    description: 'Track task progress from start to finish with live notifications.',
    icon: BellRing
  },
  {
    title: 'Local Discovery',
    description: 'Find tasks right in your neighborhood with interactive maps.',
    icon: MapPinned
  },
  {
    title: 'Earn & Save',
    description: 'Teens build earnings history and request payouts through the app.',
    icon: WalletCards
  },
  {
    title: 'Trusted Reviews',
    description: 'Both sides rate each other after every task for accountability.',
    icon: Star
  }
];

const steps = [
  {
    number: '01',
    title: 'Create Your Profile',
    description: 'Choose your role - teen, parent, or neighbor - and set up your dashboard.'
  },
  {
    number: '02',
    title: 'Find or Post Tasks',
    description: 'Teens browse nearby tasks; neighbors post jobs they need help with.'
  },
  {
    number: '03',
    title: 'Get Connected',
    description: 'Parents approve teen applications. Tasks are matched and assigned.'
  },
  {
    number: '04',
    title: 'Complete & Rate',
    description: 'Finish the task, confirm completion, and leave reviews.'
  }
];

const stats = [
  { value: '13-17', label: 'Age Range' },
  { value: '500+', label: 'Tasks Completed' },
  { value: '4.9/5', label: 'Average Rating' },
  { value: '100%', label: 'Parent Approved' }
];

const testimonials = [
  {
    quote: "My teen learned responsibility while earning money for college. The parental oversight gives me peace of mind.",
    author: "Sarah M.",
    role: "Parent"
  },
  {
    quote: "Found reliable help around the yard within hours. Much easier than posting on generic marketplaces.",
    author: "Robert T.",
    role: "Neighbor"
  },
  {
    quote: "I earned $200 this summer doing lawn care and dog walking. Pretty awesome for a high schooler.",
    author: "Jake R.",
    role: "Teen"
  }
];

export default function Landing() {
  const auth = useAuth();

  useEffect(() => {
    document.title = 'Churro | Safe Local Tasks for Teens';
  }, []);

  if (auth?.isAuthenticated && auth?.role) {
    return <Navigate to={`/${auth.role}`} replace />;
  }

  return (
    <div className="min-h-screen bg-white text-text-primary">
      <header className="sticky top-0 z-50 border-b border-stone-100 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2">
            <img
              src="/churro-logo.png"
              alt="Churro"
              className="h-16 w-auto"
              onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }}
            />
            <div className="hidden items-center gap-2">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white font-heading font-bold text-xl">C</div>
              <span className="font-heading text-xl font-extrabold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">Churro</span>
            </div>
          </Link>
          <nav className="flex items-center gap-3">
            <Link to="/login" className="hidden sm:flex h-10 items-center px-4 py-2 text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors">
              Log in
            </Link>
            <Link to="/signup/role" className="flex h-10 items-center rounded-full bg-stone-900 px-5 py-2 text-sm font-semibold text-white hover:bg-stone-800 transition-colors">
              Get started
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden bg-gradient-to-b from-orange-50/80 via-white to-white">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-orange-200/30 blur-3xl" />
            <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-orange-300/20 blur-3xl" />
          </div>
          
          <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-28">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-8">
              <div className="text-center lg:text-left">
                <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-medium text-orange-700">
                  <Sparkles size={14} className="text-orange-500" />
                  Safe teen earning marketplace
                </div>
                <h1 className="mt-6 font-heading text-4xl font-extrabold tracking-tight text-stone-900 sm:text-5xl lg:text-6xl">
                  Teens earn safely. <br/>
                  <span className="bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent">Neighbors help.</span>
                </h1>
                <p className="mt-6 text-lg text-stone-600 sm:text-xl max-w-xl mx-auto lg:mx-0">
                  Connect teens with age-appropriate local tasks. From lawn care to dog walking, Churro makes it safe, simple, and trustworthy for everyone in the neighborhood.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
                  <Link to="/signup/role" className="inline-flex h-12 items-center gap-2 rounded-full bg-stone-900 px-6 py-3 text-sm font-semibold text-white hover:bg-stone-800 transition-all hover:shadow-lg hover:shadow-stone-900/20">
                    Get started <ArrowRight size={18} />
                  </Link>
                  <Link to="/login" className="inline-flex h-12 items-center gap-2 rounded-full border border-stone-200 bg-white px-6 py-3 text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors">
                    I already have an account
                  </Link>
                </div>
                <div className="mt-8 flex items-center justify-center lg:justify-start gap-6 text-sm text-stone-500">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-green-500" />
                    Parent-approved
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-green-500" />
                    Age-filtered
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-green-500" />
                    Verified neighbors
                  </div>
                </div>
              </div>
              
              <div className="relative mx-auto w-full max-w-md lg:max-w-full">
                <div className="aspect-square rounded-3xl bg-gradient-to-br from-orange-100 to-amber-100 p-2">
                  <div className="flex h-full flex-col rounded-2xl bg-white shadow-2xl overflow-hidden">
                    <div className="flex items-center justify-between border-b border-stone-100 p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
                          <HandHeart size={20} className="text-orange-600" />
                        </div>
                        <div>
                          <p className="font-medium text-stone-900">Yard Cleanup</p>
                          <p className="text-xs text-stone-500">Oak Street • 0.3 mi away</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-stone-900">$35</p>
                        <p className="text-xs text-stone-500">this week</p>
                      </div>
                    </div>
                    <div className="flex-1 bg-stone-50 flex items-center justify-center p-6">
                      <div className="grid grid-cols-3 gap-4 w-full">
                        <div className="rounded-xl bg-white p-3 text-center shadow-sm">
                          <Clock size={20} className="mx-auto mb-1 text-orange-500" />
                          <p className="text-xs text-stone-500">Due</p>
                          <p className="font-semibold text-stone-900">Sat</p>
                        </div>
                        <div className="rounded-xl bg-white p-3 text-center shadow-sm">
                          <Users size={20} className="mx-auto mb-1 text-orange-500" />
                          <p className="text-xs text-stone-500">Applied</p>
                          <p className="font-semibold text-stone-900">3</p>
                        </div>
                        <div className="rounded-xl bg-white p-3 text-center shadow-sm">
                          <Star size={20} className="mx-auto mb-1 text-orange-500" />
                          <p className="text-xs text-stone-500">Rating</p>
                          <p className="font-semibold text-stone-900">4.9</p>
                        </div>
                      </div>
                    </div>
                    <div className="border-t border-stone-100 p-4">
                      <button className="w-full rounded-xl bg-stone-900 py-3 text-sm font-semibold text-white hover:bg-stone-800 transition-colors">
                        Apply Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-stone-900 py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
              {stats.map((stat, idx) => (
                <div key={idx} className="text-center">
                  <p className="font-heading text-3xl font-bold text-white sm:text-4xl">{stat.value}</p>
                  <p className="mt-1 text-sm text-stone-400">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="font-heading text-3xl font-bold text-stone-900 sm:text-4xl">How it works</h2>
              <p className="mt-4 text-lg text-stone-600 max-w-2xl mx-auto">Four simple steps to start earning or getting help around the neighborhood.</p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((step, idx) => (
                <div key={idx} className="relative rounded-2xl border border-stone-100 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                  <p className="font-heading text-5xl font-bold text-orange-100">{step.number}</p>
                  <h3 className="mt-4 font-heading text-lg font-bold text-stone-900">{step.title}</h3>
                  <p className="mt-2 text-sm text-stone-600">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-orange-50 py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="font-heading text-3xl font-bold text-stone-900 sm:text-4xl">Why families trust Churro</h2>
              <p className="mt-4 text-lg text-stone-600 max-w-2xl mx-auto">Built with safety, transparency, and trust at every level.</p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, idx) => {
                const Icon = feature.icon;
                return (
                  <div key={idx} className="rounded-2xl bg-white p-6 shadow-sm">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100">
                      <Icon size={24} className="text-orange-600" />
                    </div>
                    <h3 className="mt-4 font-heading text-lg font-bold text-stone-900">{feature.title}</h3>
                    <p className="mt-2 text-stone-600">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="font-heading text-3xl font-bold text-stone-900 sm:text-4xl">What people say</h2>
            </div>
            <div className="grid gap-6 sm:grid-cols-3">
              {testimonials.map((testimonial, idx) => (
                <div key={idx} className="rounded-2xl border border-stone-100 bg-white p-6 shadow-sm">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} className="fill-orange-400 text-orange-400" />
                    ))}
                  </div>
                  <p className="text-stone-700">"{testimonial.quote}"</p>
                  <p className="mt-4 font-medium text-stone-900">{testimonial.author}</p>
                  <p className="text-sm text-stone-500">{testimonial.role}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-stone-900 py-20 sm:py-28">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
            <h2 className="font-heading text-3xl font-bold text-white sm:text-4xl">Ready to get started?</h2>
            <p className="mt-4 text-lg text-stone-400">Join hundreds of teens, parents, and neighbors already using Churro.</p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/signup/role" className="inline-flex h-12 items-center rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white hover:bg-orange-600 transition-colors">
                Create an account
              </Link>
              <Link to="/login" className="inline-flex h-12 items-center rounded-full border border-stone-600 px-6 py-3 text-sm font-medium text-white hover:bg-stone-800 transition-colors">
                Log in
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-stone-100 bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <img src="/churro-logo.png" alt="Churro" className="h-8 w-auto" />
              <span className="font-heading text-lg font-bold text-stone-900">Churro</span>
            </div>
            <p className="text-sm text-stone-500">Churro is a task marketplace, not an employer.</p>
            <div className="flex items-center gap-4 text-sm text-stone-500">
              <Link to="#" className="hover:text-stone-900 transition-colors">Privacy</Link>
              <Link to="#" className="hover:text-stone-900 transition-colors">Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
