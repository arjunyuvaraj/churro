import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/useAuth';

function useRoleFromQuery() {
  const location = useLocation();
  return useMemo(() => new URLSearchParams(location.search).get('role') || 'teen', [location.search]);
}

export default function Signup() {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
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

  const fromGoogle = location.state?.fromGoogle || false;

  useEffect(() => {
    if (!auth?.loading && auth?.isAuthenticated && auth?.role) {
      const from = location.state?.from?.pathname;
      if (from && from !== '/signup') {
        navigate(from, { replace: true });
      } else if (auth.role === 'teen') {
        navigate('/teen/survey', { replace: true });
      } else {
        navigate(`/${auth.role}`, { replace: true });
      }
    }
  }, [auth?.loading, auth?.isAuthenticated, auth?.role, navigate, location]);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (fromGoogle && auth?.currentUser) {
        await auth.completeGoogleSignup({ role, dateOfBirth, address, parentEmail });
      } else {
        await auth.signup({ email, password, fullName, role, dateOfBirth, address, parentEmail });
      }
    } catch (currentError) {
      setError(getReadableAuthError(currentError));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignup() {
    setLoading(true);
    setError('');
    try {
      const result = await auth.loginWithGoogle();
      if (result.isNewUser) {
        navigate('/signup?role=' + role, { state: { fromGoogle: true }, replace: true });
      }
    } catch (currentError) {
      setError(getReadableAuthError(currentError));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-5xl items-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid w-full gap-8 rounded-3xl border border-border bg-card p-6 shadow-soft lg:grid-cols-[1.1fr_0.9fr] lg:p-8 animate-fade-in">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-dark">Create account</p>
          <h1 className="mt-3 font-heading text-4xl font-extrabold text-text-primary">
            {fromGoogle ? 'Complete your profile' : 'Join Churro'}
          </h1>
          <p className="mt-3 max-w-md text-text-secondary">
            {fromGoogle
              ? 'Choose your role and fill in a few more details to get started.'
              : 'Pick the role that matches how you\'ll use the platform. Teens require DOB and parent linking. Neighbors require an address.'
            }
          </p>
          <div className="mt-6 flex gap-3">
            {['teen', 'parent', 'neighbor'].map((candidateRole) => (
              <button
                key={candidateRole}
                type="button"
                onClick={() => setRole(candidateRole)}
                className={`rounded-full px-4 py-2 text-sm font-semibold capitalize transition ${role === candidateRole ? 'bg-primary text-white' : 'border border-border bg-card text-text-primary hover:border-primary'}`}
              >
                {candidateRole}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          {error ? <div className="rounded-xl bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-danger">{error}</div> : null}

          {!fromGoogle && (
            <>
              <button
                type="button"
                onClick={handleGoogleSignup}
                disabled={loading}
                className="flex min-h-12 w-full items-center justify-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm font-semibold text-text-primary hover:bg-surface transition"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                  <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
                  <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                  <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                </svg>
                Sign up with Google
              </button>
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs font-medium text-text-secondary">or use email</span>
                <div className="h-px flex-1 bg-border" />
              </div>
            </>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!fromGoogle && (
              <>
                <label className="block">
                  <span className="mb-1 block text-sm font-semibold text-text-primary">Full name</span>
                  <input className="w-full rounded-xl border border-border bg-card px-4 py-3 text-text-primary outline-none focus:border-primary transition" value={fullName} onChange={(event) => setFullName(event.target.value)} required />
                </label>
                <label className="block">
                  <span className="mb-1 block text-sm font-semibold text-text-primary">Email</span>
                  <input className="w-full rounded-xl border border-border bg-card px-4 py-3 text-text-primary outline-none focus:border-primary transition" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
                </label>
                <label className="block">
                  <span className="mb-1 block text-sm font-semibold text-text-primary">Password</span>
                  <input className="w-full rounded-xl border border-border bg-card px-4 py-3 text-text-primary outline-none focus:border-primary transition" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
                </label>
              </>
            )}
            {role === 'teen' ? (
              <>
                <label className="block">
                  <span className="mb-1 block text-sm font-semibold text-text-primary">Date of birth</span>
                  <input className="w-full rounded-xl border border-border bg-card px-4 py-3 text-text-primary outline-none focus:border-primary transition" type="date" value={dateOfBirth} onChange={(event) => setDateOfBirth(event.target.value)} required />
                </label>
                <label className="block">
                  <span className="mb-1 block text-sm font-semibold text-text-primary">Parent or guardian email</span>
                  <input className="w-full rounded-xl border border-border bg-card px-4 py-3 text-text-primary outline-none focus:border-primary transition" type="email" value={parentEmail} onChange={(event) => setParentEmail(event.target.value)} placeholder="We'll send them an invite" required />
                </label>
              </>
            ) : null}
            {role === 'neighbor' ? (
              <label className="block">
                <span className="mb-1 block text-sm font-semibold text-text-primary">Home address</span>
                <input className="w-full rounded-xl border border-border bg-card px-4 py-3 text-text-primary outline-none focus:border-primary transition" value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Used for verification only" required />
              </label>
            ) : null}
            <button type="submit" disabled={loading} className="flex min-h-12 w-full items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-primary-dark transition disabled:opacity-50">
              {loading ? 'Creating...' : fromGoogle ? 'Complete setup' : 'Create account'}
            </button>
          </form>
          <p className="text-sm text-text-secondary">
            Already have an account? <Link to="/login" className="font-semibold text-primary hover:text-primary-dark transition">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function getReadableAuthError(error) {
  const message = error?.message || '';
  if (message.includes('auth/configuration-not-found') || message.includes('CONFIGURATION_NOT_FOUND')) {
    return 'Firebase Auth is not enabled for this project yet. Open Firebase Console -> Authentication -> Get started -> enable Email/Password, then retry.';
  }
  if (message.includes('auth/operation-not-allowed')) {
    return 'Email/password sign-in is disabled. Enable it in Firebase Console -> Authentication -> Sign-in method.';
  }
  if (message.includes('auth/popup-closed-by-user')) {
    return 'Sign-in popup was closed. Please try again.';
  }
  if (message.includes('auth/email-already-in-use')) {
    return 'An account with this email already exists. Try logging in instead.';
  }
  return message || 'Unable to create account.';
}
