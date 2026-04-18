import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, HandHeart, ShieldCheck, Sparkles } from 'lucide-react';

const slides = [
  {
    icon: HandHeart,
    title: 'Welcome to Churro',
    description: 'A safe, friendly place where teens can volunteer and help neighbors in their community.',
    color: 'from-orange-500 to-amber-500'
  },
  {
    icon: ShieldCheck,
    title: 'Built for Safety',
    description: 'Every task is age-appropriate and parent-approved. Verified neighbors, real-time tracking, and simple communication.',
    color: 'from-emerald-500 to-teal-500'
  },
  {
    icon: Sparkles,
    title: 'Start Earning Badges',
    description: 'Complete tasks, track your volunteer hours, earn achievements, and build a portfolio for school or college applications.',
    color: 'from-violet-500 to-purple-500'
  }
];

export default function Onboarding() {
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();

  const slide = slides[current];
  const Icon = slide.icon;
  const isLast = current === slides.length - 1;

  function next() {
    if (isLast) {
      localStorage.setItem('churro-onboarded', 'true');
      navigate('/signup/role');
    } else {
      setCurrent(current + 1);
    }
  }

  function skip() {
    localStorage.setItem('churro-onboarded', 'true');
    navigate('/signup/role');
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-4 py-10">
      <div className="w-full max-w-md space-y-8 text-center animate-fade-in" key={current}>
        {/* Icon */}
        <div className={`mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br ${slide.color} shadow-lg`}>
          <Icon size={40} className="text-white" />
        </div>

        {/* Content */}
        <div className="space-y-3 animate-slide-up">
          <h1 className="font-heading text-3xl font-extrabold text-text-primary">{slide.title}</h1>
          <p className="mx-auto max-w-sm text-lg text-text-secondary leading-relaxed">{slide.description}</p>
        </div>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrent(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-2.5 rounded-full transition-all ${
                i === current ? 'w-8 bg-primary' : 'w-2.5 bg-border hover:bg-text-secondary'
              }`}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={next}
            className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3 text-base font-semibold text-white hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20"
          >
            {isLast ? 'Get Started' : 'Next'}
            <ArrowRight size={18} />
          </button>
          {!isLast && (
            <button
              type="button"
              onClick={skip}
              className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
            >
              Skip intro
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
