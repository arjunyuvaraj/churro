import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageState from '../../components/PageState';
import { useAuth } from '../../lib/useAuth';

export default function Login() {
  const auth = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // ✅ added
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Auto-redirect once profile is loaded after login
  useEffect(() => {
    if (!auth?.loading && auth?.isAuthenticated && auth?.role) {
      if (auth.role === 'teen') {
        navigate(
          auth.profile?.surveyCompleted ? '/teen' : '/teen/survey',
          { replace: true }
        );
      } else {
        navigate(`/${auth.role}`, { replace: true });
      }
    }
  }, [
    auth?.loading,
    auth?.isAuthenticated,
    auth?.role,
    auth?.profile?.surveyCompleted,
    navigate,
  ]);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      await auth.login(email, password);
    } catch (currentError) {
      setError(getReadableAuthError(currentError));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setLoading(true);
    setError('');
    try {
      const result = await auth.loginWithGoogle();
      if (result.isNewUser) {
        navigate('/signup/role', { state: { fromGoogle: true } });
      }
    } catch (currentError) {
      setError(getReadableAuthError(currentError));
    } finally {
      setLoading(false);
    }
  }

  if (!auth) {
    return (
      <PageState
        title="Churro is not configured"
        description="Set the Firebase VITE_ environment variables before logging in."
      />
    );
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-5xl items-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid w-full gap-8 rounded-3xl border border-border bg-card p-6 shadow-soft lg:grid-cols-2 lg:p-8 animate-fade-in">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-dark">
            Welcome back
          </p>
          <h1 className="mt-3 font-heading text-4xl font-extrabold text-text-primary">
            Sign in to Churro
          </h1>
          <p className="mt-3 max-w-md text-text-secondary">
            Manage volunteer tasks, track hours, and connect with your
            neighborhood — all in one safe, trusted place.
          </p>
        </div>

        <div className="space-y-4">
          {error ? (
            <div className="rounded-xl bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-danger">
              {error}
            </div>
          ) : null}

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="flex min-h-12 w-full items-center justify-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm font-semibold text-text-primary hover:bg-surface transition"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853" />
              <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs font-medium text-text-secondary">
              or use email
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-text-primary">
                Email
              </span>
              <input
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-text-primary outline-none focus:border-primary transition"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-text-primary">
                Password
              </span>

              <div className="relative">
                <input
                  className="w-full rounded-xl border border-border bg-card px-4 py-3 pr-12 text-text-primary outline-none focus:border-primary transition"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((prev) => !prev)
                  }
                  className="absolute inset-y-0 right-3 flex items-center text-sm text-text-secondary hover:text-text-primary"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="flex min-h-12 w-full items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-primary-dark transition disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="text-sm text-text-secondary">
            New here?{' '}
            <Link
              to="/signup/role"
              className="font-semibold text-primary hover:text-primary-dark transition"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function getReadableAuthError(error) {
  const message = error?.message || '';
  if (
    message.includes('auth/configuration-not-found') ||
    message.includes('CONFIGURATION_NOT_FOUND')
  ) {
    return 'Firebase Auth is not enabled for this project yet. Open Firebase Console -> Authentication -> Get started -> enable Email/Password, then retry.';
  }
  if (message.includes('auth/operation-not-allowed')) {
    return 'Email/password sign-in is disabled. Enable it in Firebase Console -> Authentication -> Sign-in method.';
  }
  if (message.includes('auth/popup-closed-by-user')) {
    return 'Sign-in popup was closed. Please try again.';
  }
  return message || 'Unable to sign in.';
}