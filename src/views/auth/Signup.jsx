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
  const [showPassword, setShowPassword] = useState(false); // ✅ added
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [address, setAddress] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fromGoogle = location.state?.fromGoogle || false;

  useEffect(() => {
    if (!auth?.loading && auth?.isAuthenticated && auth?.role) {
      if (auth.role === 'teen') {
        navigate('/teen/survey', { replace: true });
      } else {
        navigate(`/${auth.role}`, { replace: true });
      }
    }
  }, [auth?.loading, auth?.isAuthenticated, auth?.role, navigate]);

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
              : 'Pick the role that matches how you\'ll use the platform. Teens require date of birth and parent linking. Neighbors require an address.'
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

                {/* ✅ PASSWORD WITH TOGGLE */}
                <label className="block">
                  <span className="mb-1 block text-sm font-semibold text-text-primary">Password</span>
                  <div className="relative">
                    <input
                      className="w-full rounded-xl border border-border bg-card px-4 py-3 pr-12 text-text-primary outline-none focus:border-primary transition"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(prev => !prev)}
                      className="absolute inset-y-0 right-3 flex items-center text-sm text-text-secondary hover:text-text-primary"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
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