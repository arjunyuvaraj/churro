import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import PageState from '../../components/PageState';
import { useAuth } from '../../lib/useAuth';

export default function Login() {
  const auth = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!auth?.loading && auth?.isAuthenticated && auth?.role) {
      if (auth.role === 'teen') {
        navigate(auth.profile?.surveyCompleted ? '/teen' : '/teen/survey', { replace: true });
      } else {
        navigate(`/${auth.role}`, { replace: true });
      }
    }
  }, [auth?.loading, auth?.isAuthenticated, auth?.role, auth?.profile?.surveyCompleted, navigate]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Missing required fields: email, password');
      return;
    }
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
        navigate('/signup?fromGoogle=1', { state: { fromGoogle: true } });
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
    <div className="min-h-screen bg-[#f4f2ff] text-slate-950 lg:grid lg:grid-cols-[1.18fr_0.82fr]">
      <section className="relative isolate flex flex-col justify-between overflow-hidden bg-[#FF5500] px-8 py-10 text-white sm:px-12 lg:px-16 lg:py-12">
        <div className="flex flex-1 flex-col justify-center">
          <div className="max-w-xl pb-8">
            <h1 className="max-w-md text-5xl font-black tracking-tighter text-white sm:text-6xl lg:text-[4.8rem] lg:leading-[0.95]">
              Welcome back.
            </h1>
            <p className="mt-8 max-w-lg text-lg leading-relaxed text-white/90 sm:text-xl">
              Sign in, continue where you left off, and get routed straight to the right dashboard.
            </p>
          </div>
        </div>
        <p className="text-sm text-white/70">© 2026 Churro. All rights reserved.</p>
      </section>

      <section className="flex items-center justify-center bg-[#fffaf3] px-6 py-8 sm:px-10 lg:px-12">
        <div className="w-full max-w-[30rem]">
          <div className="mb-8">
            <h2 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Welcome Back</h2>
            <p className="mt-2 text-sm text-slate-600">
              Don’t have an account? <Link to={inviteToken ? `/signup?role=parent&inviteToken=${encodeURIComponent(inviteToken)}` : '/signup'} className="font-semibold text-slate-900 underline decoration-orange-200 underline-offset-4 transition hover:decoration-orange-700">Sign up</Link>
            </p>
          </div>

          <div className="space-y-6">
            {error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="flex min-h-12 w-full items-center justify-center gap-3 rounded-2xl border border-orange-200 bg-white px-4 py-3 text-sm font-semibold text-slate-950 shadow-sm transition hover:border-orange-300 hover:bg-orange-50 disabled:opacity-50"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853" />
                <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
              </svg>
              Continue with Google
            </button>

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-orange-200" />
              <span className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">or use email</span>
              <div className="h-px flex-1 bg-orange-200" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-slate-900">Email</span>
                <input
                  className="w-full rounded-2xl border border-orange-200 bg-white px-4 py-3.5 text-slate-950 outline-none transition focus:border-orange-500"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-slate-900">Password</span>

                <div className="relative">
                  <input
                    className="w-full rounded-2xl border border-orange-200 bg-white px-4 py-3.5 pr-14 text-slate-950 outline-none transition focus:border-orange-500"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-3 flex items-center text-sm font-medium text-slate-500 transition hover:text-slate-950"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="flex min-h-12 w-full items-center justify-center rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
              >
                {loading ? 'Signing in...' : 'Login Now'}
              </button>
            </form>

            <p className="text-center text-sm text-slate-500">
              Forgot password?{' '}
              <button type="button" className="font-semibold text-slate-900 underline decoration-orange-200 underline-offset-4 transition hover:decoration-orange-700">
                Click here
              </button>
            </p>
          </div>
        </div>
      </section>
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
  if (message.includes('Missing required fields:')) {
    return message;
  }
  return message || 'Unable to sign in.';
}