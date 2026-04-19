import { useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useAuth } from '../../lib/useAuth';

export default function Landing() {
  const auth = useAuth();

  useEffect(() => {
    document.title = 'Churro | Neighborhood help, the way it used to work.';
  }, []);

  if (auth?.isAuthenticated && auth?.role) {
    return <Navigate to={`/${auth.role}`} replace />;
  }

  const tags = ["Yardwork", "Tech Help", "Babysitting", "Pet Care", "House Chores", "Yardwork", "Tech Help", "Babysitting", "Pet Care", "House Chores"];

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-text-primary selection:bg-primary selection:text-white">
      {/* Top Nav */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#FAFAF8] border-b border-stone-200">
        <div className="mx-auto flex h-20 max-w-[1400px] items-center justify-between px-6 xl:px-12">
          {/* Left side */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 group hover:opacity-80 transition-opacity">
              <img src="/churro-logo.png" alt="Churro" className="h-8 w-auto transform group-hover:scale-110 transition-transform duration-300" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }} />
              <span className="hidden font-heading text-2xl font-bold tracking-tight text-primary">Churro</span>
            </Link>
            
            <nav className="hidden lg:flex items-center gap-6">
              <Link to="/signup/role" className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-primary-dark hover:scale-105 active:scale-95 hover:shadow-lg hover:shadow-primary/30">
                Post A Task
              </Link>
              <a href="#learn-more" className="text-sm font-medium text-stone-600 transition-colors hover:text-stone-900">Learn More</a>
              <a href="#faq" className="text-sm font-medium text-stone-600 transition-colors hover:text-stone-900">FAQ</a>
              <a href="#our-story" className="text-sm font-medium text-stone-600 transition-colors hover:text-stone-900">Our Story</a>
            </nav>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <Link to="/signup/role" className="hidden sm:flex rounded-full bg-black px-6 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-stone-800 hover:scale-105 active:scale-95">
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
              />
            </div>
          </div>

          {/* Marquee Tags */}
          <div className="mt-12 w-full overflow-hidden animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <div className="relative flex w-full">
              <div className="flex animate-marquee gap-3 whitespace-nowrap">
                {tags.map((tag, i) => (
                  <span key={i} className="inline-flex rounded-full border border-stone-300 px-5 py-2 text-sm font-medium text-stone-900 transition-all duration-300 hover:border-primary hover:bg-primary-light hover:text-primary-dark cursor-pointer">
                    {tag}
                  </span>
                ))}
                {tags.map((tag, i) => (
                  <span key={`dup-${i}`} className="inline-flex rounded-full border border-stone-300 px-5 py-2 text-sm font-medium text-stone-900 transition-all duration-300 hover:border-primary hover:bg-primary-light hover:text-primary-dark cursor-pointer">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="h-px w-full bg-stone-200 mt-10"></div>

        {/* Context Section */}
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
              <div className="aspect-[4/3] w-full overflow-hidden rounded-sm bg-stone-200 transition-transform duration-500 hover:scale-[1.02]">
                <img src="/images/teens-dog-walking.jpg" alt="Teens walking dogs" className="h-full w-full object-cover" onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=1200'; }} />
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
            {/* Left Orange Panel */}
            <div className="bg-primary px-8 py-16 lg:px-16 flex flex-col justify-center gap-8">
              {[
                { num: '01', text: 'Neighbor Posts' },
                { num: '02', text: 'Teen Browses & Applies' },
                { num: '03', text: 'Parent Approves' },
                { num: '04', text: 'Task Happens Safely' },
                { num: '05', text: 'Teens Earn' }
              ].map((step) => (
                <div key={step.num} className="flex items-baseline gap-6 group cursor-default">
                  <span className="font-heading text-6xl lg:text-7xl font-bold tracking-tighter text-white/30 transition-colors duration-300 group-hover:text-white">{step.num}</span>
                  <span className="font-heading text-4xl lg:text-5xl font-bold tracking-tighter text-stone-900 transition-colors duration-300 group-hover:text-white">{step.text}</span>
                </div>
              ))}
            </div>
            
            {/* Right Image Panel */}
            <div className="bg-stone-300 relative overflow-hidden flex items-center justify-center min-h-[400px] border-l border-stone-200">
              <div className="text-stone-900 font-heading text-4xl font-bold tracking-tighter">Example Image</div>
              {/* Optional: Add a real image here covering the div */}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
