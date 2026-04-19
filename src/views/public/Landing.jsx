import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Search, MapPin, Shield, Clock, DollarSign, Star, AlertTriangle, CreditCard, MessageCircle, ChevronDown, Mail, ChevronRight } from 'lucide-react';
import { useAuth } from '../../lib/useAuth';

const features = [
  { icon: MapPin, title: 'Address-Verified Neighbors', description: 'Every neighbor is verified with a valid address before posting tasks.' },
  { icon: Shield, title: 'Real-Time Notifications', description: 'Parents get instant updates on task applications and status.' },
  { icon: Shield, title: 'Age-Gated Tasks (FLSA)', description: 'Tasks are filtered by age to comply with federal child labor laws.' },
  { icon: DollarSign, title: 'Earnings Tracking', description: 'Teens can track their earnings and request payouts through the app.' },
  { icon: Star, title: 'Ratings & Reviews', description: 'Both sides rate each other after every task for accountability.' },
  { icon: AlertTriangle, title: 'No Hazardous Tasks', description: 'Tasks involving driving, heavy machinery, or dangerous equipment are excluded.' },
  { icon: CreditCard, title: 'Direct Payment', description: 'Mock payment system for MVP (Stripe Connect in production).' },
  { icon: MessageCircle, title: 'Dispute Resolution', description: 'Coming soon: Built-in support for resolving any issues.' }
];

const faqs = [
  { 
    question: "Is Churro legal?", 
    answer: "Yes. Churro tasks comply with federal child labor laws (FLSA). Teens aged 13-17 can only access age-appropriate tasks. No hazardous work, no late hours, no heavy equipment."
  },
  { 
    question: "What tasks can my teen do?", 
    answer: "It depends on age. Ages 13-15 can do grocery runs, tech help, pet sitting, and light housework. Ages 16-17 can also do yard work with power tools (with supervision)."
  },
  { 
    question: "How much do teens earn?", 
    answer: "Rates vary by task and location. Typical range is $12–$30/hour. Neighbors and teens agree on pay before the task begins."
  },
  { 
    question: "Is there a fee?", 
    answer: "No fees for teens. Neighbors pay what they agree to with the teen. Platform fees (if any) will be disclosed in production."
  },
  { 
    question: "What if something goes wrong?", 
    answer: "Parent approval and real-time tracking reduce risk. The ratings system creates accountability on both sides. Most issues are prevented before they happen."
  },
  { 
    question: "How do we handle payment?", 
    answer: "Mock system for MVP – think of it as a digital allowance tracker. In production, Stripe Connect will handle real payouts."
  }
];

export default function Landing() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    document.title = 'Churro | Neighborhood help, the way it used to work.';
  }, []);

  if (auth?.isAuthenticated && auth?.role) {
    return <Navigate to={`/${auth.role}`} replace />;
  }

  const tags = [
    "Lawn Mowing", "Yard Cleanup", "Leaf Raking", "Snow Shoveling", "Weeding", "Garden Help",
    "Dog Walking", "Pet Feeding", "Pet Sitting", "Dog Grooming", "Cat Care", "Aquarium Cleaning",
    "Babysitting", "Homework Help", "Tutoring", "Music Lessons", "Art Classes", "Sports Coaching",
    "Tech Support", "Computer Help", "Phone Setup", "Printer Help", "Wifi Troubleshooting", "Smart Home Help",
    "House Cleaning", "Organizing", "Laundry", "Dishwashing", "Meal Prep", "Cooking Help",
    "Grocery Shopping", "Errand Running", "Package Delivery", "Mail Collection", "Car Wash", "Car Detail",
    "Furniture Assembly", "Bike Repair", "Painting", "Wall Decorating", "Light Fixtures", "Furniture Moving",
    "Pressure Washing", "Window Cleaning", "Carpet Cleaning", "Upholstery Cleaning", "Garage Cleanup", "Attic Help",
    "Pool Maintenance", "AC Filter Change", "Smoke Detector", "Garden Watering", "Plant Care", "Tree Trimming"
  ];

  const duplicatedTags = [...tags, ...tags, ...tags];

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-text-primary selection:bg-primary selection:text-white">
      {/* Top Nav */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#FAFAF8] border-b border-stone-200">
        <div className="mx-auto flex h-20 max-w-[1400px] items-center justify-between px-6 xl:px-12">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 group hover:opacity-80 transition-opacity">
              <img src="/images/churro-logo.png" alt="Churro" className="h-16 w-auto transform group-hover:scale-110 transition-transform duration-300 rounded-2xl" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
              <span className="hidden font-heading text-2xl font-bold tracking-tight text-primary">Churro</span>
            </Link>
            
            <nav className="hidden lg:flex items-center gap-6">
              <Link to="/signup" className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-primary-dark hover:scale-105 active:scale-95 hover:shadow-lg hover:shadow-primary/30">
                Post A Task
              </Link>
<a href="#features" className="text-sm font-medium text-stone-600 transition-colors hover:text-stone-900">Features</a>
              <a href="#faq" className="text-sm font-medium text-stone-600 transition-colors hover:text-stone-900">FAQ</a>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/signup" className="hidden sm:flex rounded-full bg-black px-6 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-stone-800 hover:scale-105 active:scale-95">
              Apply Now
            </Link>
            <Link to="/login" className="rounded-full border border-stone-300 px-6 py-2.5 text-sm font-medium text-stone-900 transition-all duration-300 hover:bg-stone-100 hover:scale-105 active:scale-95 bg-white">
              Log In
            </Link>
          </div>
        </div>
      </header>

      <main className="pt-20">
        {/* Hero Section */}
        <section className="flex flex-col items-center pt-24 pb-16 px-4 text-center">
          <h1 className="font-heading text-6xl sm:text-7xl lg:text-[5.5rem] font-bold tracking-tighter text-primary leading-[0.95] animate-fade-in-up">
            Neighborhood help, the<br/>way it used to work.
          </h1>
          <p className="mt-4 font-heading text-3xl sm:text-4xl font-semibold tracking-tight text-stone-900 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            Find teens you can trust.
          </p>

          <div className="mt-12 w-full max-w-2xl px-4 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <div className="group flex h-14 w-full items-center rounded-full border border-stone-300 bg-white px-6 transition-all duration-300 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 hover:shadow-md">
              <Search className="text-stone-400 group-focus-within:text-primary transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="What do you need help with?" 
                className="h-full w-full bg-transparent px-4 py-2 text-stone-900 placeholder:text-stone-400 outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
              />
            </div>
          </div>

          {/* Marquee Tags */}
          <div className="mt-12 w-full overflow-hidden animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <div className="relative flex w-full">
              <div className="flex animate-marquee gap-3 whitespace-nowrap">
                {duplicatedTags.map((tag, i) => (
                  <span key={i} className="inline-flex rounded-full border border-stone-300 px-5 py-2 text-sm font-medium text-stone-900 transition-all duration-300 hover:border-primary hover:bg-primary-light hover:text-primary-dark cursor-pointer">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="h-px w-full bg-stone-200 mt-10"></div>

{/* Earn Money Section (with dog image) */}
        <section className="mx-auto max-w-7xl px-6 py-20 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="max-w-xl">
              <h2 className="font-heading text-5xl sm:text-6xl font-bold tracking-tighter leading-[0.95]">
                Earn money in your neighborhood. <span className="text-primary">The right way.</span>
              </h2>
              <p className="mt-6 text-lg tracking-tight text-stone-800 leading-snug">
                Every gig platform requires you to be 18. Churro doesn't. Earn money doing tasks you can already do including babysitting, yard work, tech help, and much more. Churro connects teens with verified neighbors for paid tasks. With parental approval built in.
              </p>
            </div>
            <div className="relative">
              <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl bg-stone-200 transition-transform duration-500 hover:scale-[1.02]">
                <img src="/images/teens-dog-walking.jpg" alt="Teens walking dogs" className="h-full w-full object-cover rounded-2xl" onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=1200'; }} />
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="border-t border-stone-200">
          <div className="px-6 py-12 lg:px-12">
            <h2 className="font-heading text-5xl sm:text-6xl font-bold tracking-tighter">How It Works.</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[600px]">
            <div className="bg-primary px-8 py-16 lg:px-16 flex flex-col justify-center gap-8">
              {[
                { num: '01', text: 'Neighbor Posts' },
                { num: '02', text: 'Teen Applies' },
                { num: '03', text: 'Parent Approves' },
                { num: '04', text: 'Teen Works' },
                { num: '05', text: 'Teens Earns' }
              ].map((step) => (
                <div key={step.num} className="flex items-baseline gap-6 group cursor-default">
                  <span className="font-heading text-6xl lg:text-7xl font-bold tracking-tighter text-white/30 transition-colors duration-300 group-hover:text-white">{step.num}</span>
                  <span className="font-heading text-4xl lg:text-5xl font-bold tracking-tighter text-stone-900 transition-colors duration-300 group-hover:text-white">{step.text}</span>
                </div>
              ))}
            </div>
            
            <div className="bg-stone-300 relative overflow-hidden flex items-center justify-center min-h-[400px] border-l border-stone-200">
              <img src="https://blog.nsslha.org/wp-content/uploads/2019/06/Paporto_Tutoring-1060x707.jpg" className="rounded-2xl" alt="How it works" />
            </div>
          </div>
        </section>

        {/* Features Section - Why families trust Churro */}
        <section id="features" className="mx-auto max-w-7xl px-6 py-20 lg:py-32">
          <h2 className="font-heading text-5xl sm:text-6xl font-bold tracking-tighter text-center mb-16">
            Why families <span className="text-primary">trust</span> Churro
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div key={i} className="bg-white rounded-2xl border border-stone-200 p-6 hover:border-primary/50 hover:shadow-lg transition-all duration-300">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
                    <Icon size={24} />
                  </div>
                  <h3 className="font-heading text-lg font-bold tracking-tight">{feature.title}</h3>
                  <p className="mt-2 text-sm text-stone-600 leading-snug">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="bg-primary py-20 lg:py-32">
          <div className="mx-auto max-w-3xl px-6">
            <h2 className="font-heading text-5xl sm:text-6xl font-bold tracking-tighter text-center mb-16 text-white">
              Frequently asked <span className="text-white">questions</span>
            </h2>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <div key={i} className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden">
                  <button 
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between p-5 text-left text-white hover:bg-white/10 transition-colors active:scale-100"
                  >
                    <span className="font-heading text-lg font-semibold pr-4">{faq.question}</span>
                    <ChevronDown size={20} className={`text-white/70 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                  </button>
                  {openFaq === i && (
                    <div className="px-5 pb-5 text-white/80 leading-relaxed">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 lg:py-32">
          <div className="mx-auto max-w-4xl px-6 text-center">
            <h2 className="font-heading text-5xl sm:text-6xl font-bold tracking-tighter text-stone-900">
              Ready to get started?
            </h2>
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link to="/signup" className="flex items-center justify-center gap-3 rounded-2xl bg-primary px-8 py-6 text-white font-heading text-xl font-bold hover:bg-primary-dark transition-all hover:scale-105">
                Post your first task <ChevronRight size={24} />
              </Link>
              <Link to="/signup" className="flex items-center justify-center gap-3 rounded-2xl border-2 border-primary px-8 py-6 text-primary font-heading text-xl font-bold hover:bg-primary/5 transition-all hover:scale-105">
                Browse tasks near you <ChevronRight size={24} />
              </Link>
            </div>
          </div>
        </section>

        {/* Footer - Orange */}
        <footer className="bg-primary text-white py-16">
          <div className="mx-auto max-w-[1400px] px-6 xl:px-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
              <div>
                <img src="/images/churro-logo.png" alt="Churro" className="h-12 w-auto mb-4" />
                <p className="text-sm text-white/80">Connecting neighborhoods with trusted local teens for safe, age-appropriate tasks.</p>
              </div>
              <div>
                <h4 className="font-heading text-white font-bold mb-4">Quick Links</h4>
                <div className="space-y-2 text-sm">
                  <Link to="/signup" className="block hover:text-white/80 transition-colors">Get Started</Link>
                  <Link to="/login" className="block hover:text-white/80 transition-colors">Log In</Link>
                  <a href="#features" className="block hover:text-white/80 transition-colors">Features</a>
                  <a href="#faq" className="block hover:text-white/80 transition-colors">FAQ</a>
                </div>
              </div>
              <div>
                <h4 className="font-heading text-white font-bold mb-4">Legal</h4>
                <div className="space-y-2 text-sm">
                  <a href="/privacy" className="block hover:text-white/80 transition-colors">Privacy Policy</a>
                  <a href="/terms" className="block hover:text-white/80 transition-colors">Terms of Service</a>
                </div>
              </div>
              <div>
                <h4 className="font-heading text-white font-bold mb-4">Contact</h4>
                <div className="space-y-2 text-sm">
                  <a href="mailto:hello@churro.app" className="flex items-center gap-2 hover:text-white/80 transition-colors">
                    <Mail size={16} /> hello@churro.app
                  </a>
                </div>
              </div>
            </div>
            <div className="mt-12 pt-8 border-t border-white/20 text-sm text-center">
              © {new Date().getFullYear()} Churro. All rights reserved. Churro is a task marketplace, not an employer.
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}