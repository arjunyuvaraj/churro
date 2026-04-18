import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/useAuth';

function useRoleFromQuery() {
  const location = useLocation();
  return useMemo(() => new URLSearchParams(location.search).get('role') || 'teen', [location.search]);
}

export default function Signup() {
  const auth = useAuth();
  const navigate = useNavigate();
  const initialRole = useRoleFromQuery();
  const [role, setRole] = useState(initialRole);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [address, setAddress] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      await auth.signup({ email, password, fullName, role, dateOfBirth, address, parentEmail });
      navigate('/', { replace: true });
    } catch (currentError) {
      setError(currentError.message || 'Unable to create account.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-5xl items-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid w-full gap-8 rounded-3xl border border-border bg-white p-6 shadow-soft lg:grid-cols-[1.1fr_0.9fr] lg:p-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-dark">Create account</p>
          <h1 className="mt-3 font-heading text-4xl font-extrabold text-text-primary">Join Churro</h1>
          <p className="mt-3 max-w-md text-text-secondary">Pick the role that matches how you’ll use the platform. Teens require DOB and parent linking. Neighbors require an address.
          </p>
          <div className="mt-6 flex gap-3">
            {['teen', 'parent', 'neighbor'].map((candidateRole) => (
              <button
                key={candidateRole}
                type="button"
                onClick={() => setRole(candidateRole)}
                className={`rounded-full px-4 py-2 text-sm font-semibold ${role === candidateRole ? 'bg-primary text-white' : 'border border-border bg-white text-text-primary'}`}
              >
                {candidateRole}
              </button>
            ))}
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error ? <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-danger">{error}</div> : null}
          <label className="block">
            <span className="mb-1 block text-sm font-semibold">Full name</span>
            <input className="w-full rounded-xl border border-border px-4 py-3 outline-none focus:border-primary" value={fullName} onChange={(event) => setFullName(event.target.value)} required />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold">Email</span>
            <input className="w-full rounded-xl border border-border px-4 py-3 outline-none focus:border-primary" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold">Password</span>
            <input className="w-full rounded-xl border border-border px-4 py-3 outline-none focus:border-primary" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          </label>
          {role === 'teen' ? (
            <>
              <label className="block">
                <span className="mb-1 block text-sm font-semibold">Date of birth</span>
                <input className="w-full rounded-xl border border-border px-4 py-3 outline-none focus:border-primary" type="date" value={dateOfBirth} onChange={(event) => setDateOfBirth(event.target.value)} required />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-semibold">Parent email</span>
                <input className="w-full rounded-xl border border-border px-4 py-3 outline-none focus:border-primary" type="email" value={parentEmail} onChange={(event) => setParentEmail(event.target.value)} required />
              </label>
            </>
          ) : null}
          {role === 'neighbor' ? (
            <label className="block">
              <span className="mb-1 block text-sm font-semibold">Home address</span>
              <input className="w-full rounded-xl border border-border px-4 py-3 outline-none focus:border-primary" value={address} onChange={(event) => setAddress(event.target.value)} required />
            </label>
          ) : null}
          <button type="submit" disabled={loading} className="flex min-h-11 w-full items-center justify-center rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white">
            {loading ? 'Creating...' : 'Create account'}
          </button>
          <p className="text-sm text-text-secondary">
            Already have an account? <Link to="/login" className="font-semibold text-primary-dark">Log in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
