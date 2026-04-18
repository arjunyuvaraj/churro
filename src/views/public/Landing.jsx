import { ArrowRight, BadgeCheck, BellRing, MapPinned, ShieldCheck, Sparkles, WalletCards } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '../../lib/useAuth';

const featureCards = [
  {
    title: 'Role-based dashboards',
    description: 'Teens, parents, and neighbors each get a completely tailored workflow and navigation.',
    icon: Sparkles
  },
  {
    title: 'Built-in safety controls',
    description: 'Parent approvals, age-aware task visibility, and address privacy are baked into every step.',
    icon: ShieldCheck
  },
  {
    title: 'Real-time task updates',
    description: 'Live status tracking keeps families and neighbors synced from application to completion.',
    icon: BellRing
  },
  {
    title: 'Local map-based discovery',
    description: 'Teens browse nearby opportunities with interactive maps and distance-aware task cards.',
    icon: MapPinned
  },
  {
    title: 'Mock earnings + payouts',
    description: 'MVP payment simulation tracks balances, weekly trends, and payout requests in-app.',
    icon: WalletCards
  },
  {
    title: 'Ratings and trust layer',
    description: 'After completion, both sides can rate the experience to build neighborhood credibility.',
    icon: BadgeCheck
  }
];

const roleSummaries = [
  {
    name: 'Teen',
    accent: 'bg-orange-50 text-orange-900 border-orange-200',
    bullets: [
      'Age-filtered local task feed',
      'Parent-linked account and approvals',
      'Step-by-step active task check-ins',
      'Earnings chart + payout request'
    ]
  },
  {
    name: 'Parent',
    accent: 'bg-sky-50 text-sky-900 border-sky-200',
    bullets: [
      'Live view of teen task status',
      'Approve or decline applications',
      'Set radius, categories, and caps',
      'Activity feed and safety controls'
    ]
  },
  {
    name: 'Neighbor',
    accent: 'bg-emerald-50 text-emerald-900 border-emerald-200',
    bullets: [
      'Multi-step task posting flow',
      'Address verification mock for MVP',
      'Live progress and completion confirm',
      'Post-task ratings and history'
    ]
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
    <div className="min-h-screen bg-surface text-text-primary">
      <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <img
              src="/churro-logo.png"
              alt="Churro"
              className="h-9 w-auto"
              onError={(event) => {
                event.currentTarget.style.display = 'none';
                const fallback = event.currentTarget.nextElementSibling;
                if (fallback) fallback.classList.remove('hidden');
              }}
            />
            <div className="hidden items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white font-heading font-bold">C</div>
              <div className="font-heading text-2xl font-extrabold text-primary">Churro</div>
            </div>
          </Link>
          <nav className="flex items-center gap-2">
            <Link to="/signup/role" className="hidden min-h-11 items-center rounded-lg border border-primary px-4 py-2 text-sm font-semibold text-primary-dark sm:inline-flex">
              Get started
            </Link>
            <Link to="/login" className="inline-flex min-h-11 items-center rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white">
              Login
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-primary-light via-white to-orange-100/60">
          <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-primary/10 blur-2xl" />
          <div className="absolute -bottom-32 -left-16 h-72 w-72 rounded-full bg-secondary/10 blur-2xl" />
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8 lg:py-24">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-dark">Neighborhood trust, teen safety</p>
              <h1 className="mt-3 font-heading text-4xl font-extrabold leading-tight sm:text-5xl">
                A safer way for teens to earn locally with parent oversight.
              </h1>
              <p className="mt-5 max-w-xl text-base text-text-secondary sm:text-lg">
                Churro is a gig marketplace connecting teens aged 13-17 with verified neighbors for age-appropriate local tasks. Every step is designed with legal and safety safeguards first.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link to="/signup/role" className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white">
                  Explore roles <ArrowRight size={16} />
                </Link>
                <Link to="/login" className="inline-flex min-h-11 items-center rounded-lg border border-primary bg-white px-5 py-3 text-sm font-semibold text-primary-dark">
                  I already have an account
                </Link>
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-white p-5 shadow-soft sm:p-6">
              <h2 className="font-heading text-2xl font-bold">Why families choose Churro</h2>
              <ul className="mt-4 space-y-3 text-sm text-text-secondary">
                <li className="rounded-xl bg-surface px-4 py-3">Teen full names are never exposed to neighbors.</li>
                <li className="rounded-xl bg-surface px-4 py-3">Neighbor addresses stay hidden until parent approval.</li>
                <li className="rounded-xl bg-surface px-4 py-3">Task visibility is filtered by age and time restrictions.</li>
                <li className="rounded-xl bg-surface px-4 py-3">No direct teen-neighbor messaging in the MVP.</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-dark">Core platform capabilities</p>
              <h2 className="mt-2 font-heading text-3xl font-extrabold">Everything needed for a safe teen gig marketplace</h2>
            </div>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featureCards.map((feature) => {
              const Icon = feature.icon;
              return (
                <article key={feature.title} className="rounded-2xl border border-border bg-white p-5 shadow-soft">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-light text-primary-dark">
                    <Icon size={20} />
                  </div>
                  <h3 className="mt-4 font-heading text-xl font-bold">{feature.title}</h3>
                  <p className="mt-2 text-sm text-text-secondary">{feature.description}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="border-y border-border bg-white">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-dark">Three focused experiences</p>
            <h2 className="mt-2 font-heading text-3xl font-extrabold">Each role gets its own dashboard and workflow</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {roleSummaries.map((role) => (
                <article key={role.name} className={`rounded-2xl border p-5 ${role.accent}`}>
                  <h3 className="font-heading text-2xl font-bold">{role.name}</h3>
                  <ul className="mt-4 space-y-2 text-sm">
                    {role.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-start gap-2">
                        <span className="mt-1 inline-block h-2 w-2 rounded-full bg-current" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-border bg-secondary p-8 text-white shadow-soft sm:p-10">
            <h2 className="font-heading text-3xl font-extrabold">Ready to try Churro?</h2>
            <p className="mt-3 max-w-2xl text-sm text-white/90 sm:text-base">
              Start with the role that matches your workflow. You can sign in any time from the top-right Login button.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/signup/role" className="inline-flex min-h-11 items-center rounded-lg bg-white px-5 py-3 text-sm font-semibold text-secondary">
                Choose role
              </Link>
              <Link to="/login" className="inline-flex min-h-11 items-center rounded-lg border border-white/60 px-5 py-3 text-sm font-semibold text-white">
                Go to login
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-white px-4 py-6 text-center text-xs text-text-secondary sm:px-6 lg:px-8">
        Churro is a task marketplace, not an employer. All tasks are independent service arrangements between neighbors and teens.
      </footer>
    </div>
  );
}
