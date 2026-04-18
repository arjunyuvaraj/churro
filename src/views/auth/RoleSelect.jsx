import { Sparkles, Users, UserRound } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const roles = [
  {
    id: 'teen',
    title: 'Teen',
    description: 'Ages 13-17, parent-linked, age-filtered tasks.',
    icon: Sparkles
  },
  {
    id: 'parent',
    title: 'Parent',
    description: 'Approves tasks, sets limits, and monitors progress.',
    icon: Users
  },
  {
    id: 'neighbor',
    title: 'Neighbor',
    description: 'Posts safe, local tasks for verified teens.',
    icon: UserRound
  }
];

export default function RoleSelect() {
  const navigate = useNavigate();

  return (
    <div className="mx-auto flex min-h-screen max-w-5xl items-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="w-full rounded-3xl border border-border bg-white p-6 shadow-soft sm:p-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-dark">Churro</p>
          <h1 className="mt-3 font-heading text-4xl font-extrabold text-text-primary">Choose your role</h1>
          <p className="mt-3 text-text-secondary">Every account is tailored to a different workflow and dashboard experience.</p>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <button
                key={role.id}
                type="button"
                onClick={() => navigate(`/signup?role=${role.id}`)}
                className="flex min-h-44 flex-col items-start rounded-2xl border border-border p-5 text-left transition hover:border-primary hover:shadow-soft"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-light text-primary-dark">
                  <Icon size={22} />
                </div>
                <h2 className="mt-4 font-heading text-xl font-bold">{role.title}</h2>
                <p className="mt-2 text-sm text-text-secondary">{role.description}</p>
              </button>
            );
          })}
        </div>
        <div className="mt-6 text-sm text-text-secondary">
          Already have an account? <Link to="/login" className="font-semibold text-primary-dark">Log in</Link>
        </div>
      </div>
    </div>
  );
}
