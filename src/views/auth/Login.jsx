import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageState from '../../components/PageState';
import { useAuth } from '../../lib/useAuth';

export default function Login() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      await auth.login(email, password);
      navigate('/', { replace: true });
    } catch (currentError) {
      setError(currentError.message || 'Unable to sign in.');
    } finally {
      setLoading(false);
    }
  }

  if (!auth) {
    return <PageState title="Churro is not configured" description="Set the Firebase VITE_ environment variables before logging in." />;
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-5xl items-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid w-full gap-8 rounded-3xl border border-border bg-white p-6 shadow-soft lg:grid-cols-2 lg:p-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-dark">Welcome back</p>
          <h1 className="mt-3 font-heading text-4xl font-extrabold text-text-primary">Sign in to Churro</h1>
          <p className="mt-3 max-w-md text-text-secondary">Manage teen jobs, parent approvals, and neighbor postings from one trusted neighborhood marketplace.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error ? <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-danger">{error}</div> : null}
          <label className="block">
            <span className="mb-1 block text-sm font-semibold">Email</span>
            <input className="w-full rounded-xl border border-border px-4 py-3 outline-none focus:border-primary" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold">Password</span>
            <input className="w-full rounded-xl border border-border px-4 py-3 outline-none focus:border-primary" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          </label>
          <button type="submit" disabled={loading} className="flex min-h-11 w-full items-center justify-center rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white">
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
          <p className="text-sm text-text-secondary">
            New here? <Link to="/signup" className="font-semibold text-primary-dark">Create an account</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
