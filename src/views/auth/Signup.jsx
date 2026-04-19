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
  const inviteToken = new URLSearchParams(location.search).get('inviteToken');
  const initialRole = location.state?.accountType || useRoleFromQuery();
  const initialGoogleSignup = Boolean(location.state?.fromGoogle || new URLSearchParams(location.search).get('fromGoogle') === '1');

  const [role, setRole] = useState(initialRole);
  const [step, setStep] = useState('accountType');
  const [googleSignupMode, setGoogleSignupMode] = useState(initialGoogleSignup);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [address, setAddress] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isAccountTypeStep = step === 'accountType';
  const isGoogleSignup = googleSignupMode || initialGoogleSignup;

  const accountTypes = [
    {
      id: 'teen',
      label: 'Teen',
      description: 'Parent-linked, age-filtered tasks.'
    },
    {
      id: 'parent',
      label: 'Parent',
      description: 'Approve tasks and manage activity.'
    },
    {
      id: 'neighbor',
      label: 'Neighbor',
      description: 'Post local help requests.'
    }
  ];

  useEffect(() => {
    if (!auth?.loading && auth?.isAuthenticated && auth?.role) {
      if (inviteToken && auth.role === 'parent') {
        navigate(`/accept-parent-invite?token=${encodeURIComponent(inviteToken)}`, { replace: true });
        return;
      }
      const from = location.state?.from?.pathname;
      if (from && from !== '/signup') {
        navigate(from, { replace: true });
      } else if (auth.role === 'teen') {
        navigate('/teen/survey', { replace: true });
      } else {
        navigate(`/${auth.role}`, { replace: true });
      }
    }
  }, [auth?.loading, auth?.isAuthenticated, auth?.role, navigate, location, inviteToken]);

  function validateRequiredFields() {
    const missing = [];
    if (!role) missing.push('account type');

    if (!isGoogleSignup) {
      if (!fullName.trim()) missing.push('full name');
      if (!email.trim()) missing.push('email');
      if (!password.trim()) missing.push('password');
    }

    if (role === 'teen') {
      if (!dateOfBirth.trim()) missing.push('date of birth');
      if (!parentEmail.trim()) missing.push('parent email');
    }

    if (role === 'neighbor' && !address.trim()) {
      missing.push('home address');
    }

    if (missing.length) {
      return `Missing required fields: ${missing.join(', ')}`;
    }

    return null;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (isAccountTypeStep) {
      setStep('details');
      return;
    }

    const missingError = validateRequiredFields();
    if (missingError) {
      setError(missingError);
      return;
    }

    setLoading(true);
    setError('');
    try {
      if (isGoogleSignup && auth?.currentUser) {
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
        setGoogleSignupMode(true);
        setStep('details');
      }
    } catch (currentError) {
      setError(getReadableAuthError(currentError));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#fff7ed] text-slate-950 lg:grid lg:grid-cols-[1.14fr_0.86fr]">
      <section className="relative isolate flex flex-col justify-between overflow-hidden bg-[#FF5500] px-8 py-10 text-white sm:px-12 lg:px-16 lg:py-12">
        <div className="flex flex-1 flex-col justify-center">
          <div className="max-w-xl pb-8">
            <h1 className="max-w-md text-5xl font-black tracking-tighter text-white sm:text-6xl lg:text-[4.8rem] lg:leading-[0.95]">
              Create an account in two steps.
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-white/90 sm:text-xl">
              Choose the account type first, then finish the actual details in the same panel. No popups, no separate window.
            </p>
          </div>
        </div>
        <p className="text-sm text-white/70">© 2026 Churro. All rights reserved.</p>
      </section>

      <section className="flex items-center justify-center bg-[#fffaf3] px-6 py-8 sm:px-10 lg:px-12">
        <div className="w-full max-w-[30rem]">
          <div className="mb-8">
            <h2 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              {isAccountTypeStep ? 'Select account type' : isGoogleSignup ? 'Complete setup' : 'Enter your details'}
            </h2>
          </div>

          {error ? (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          {isAccountTypeStep ? (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-3">
                {accountTypes.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setRole(item.id)}
                    className={`flex flex-col items-start rounded-[1.25rem] border p-5 text-left transition ${role === item.id ? 'border-orange-500 bg-orange-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                  >
                    <h3 className="text-lg font-bold tracking-tight text-slate-950">{item.label}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">{item.description}</p>
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setStep('details')}
                className="flex min-h-12 w-full items-center justify-center rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Continue
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setStep('accountType')}
                  className="text-sm font-semibold text-orange-700 underline decoration-orange-200 underline-offset-4 transition hover:decoration-orange-700"
                >
                  Back
                </button>
                <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-orange-700">
                  {role}
                </span>
              </div>

              {!isGoogleSignup ? (
                <>
                  <button
                    type="button"
                    onClick={handleGoogleSignup}
                    disabled={loading}
                    className="flex min-h-12 w-full items-center justify-center gap-3 rounded-2xl border border-orange-200 bg-white px-4 py-3 text-sm font-semibold text-slate-950 shadow-sm transition hover:border-orange-300 hover:bg-orange-50 disabled:opacity-50"
                  >
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
                      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853" />
                      <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
                      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
                    </svg>
                    Sign up with Google
                  </button>

                  <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-orange-200" />
                    <span className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">or use email</span>
                    <div className="h-px flex-1 bg-orange-200" />
                  </div>
                </>
              ) : null}

              <form onSubmit={handleSubmit} className="space-y-4">
                {!isGoogleSignup ? (
                  <>
                    <label className="block">
                      <span className="mb-1.5 block text-sm font-semibold text-slate-900">Full name</span>
                      <input className="w-full rounded-2xl border border-orange-200 bg-white px-4 py-3.5 text-slate-950 outline-none transition focus:border-orange-500" value={fullName} onChange={(event) => setFullName(event.target.value)} required />
                    </label>

                    <label className="block">
                      <span className="mb-1.5 block text-sm font-semibold text-slate-900">Email</span>
                      <input className="w-full rounded-2xl border border-orange-200 bg-white px-4 py-3.5 text-slate-950 outline-none transition focus:border-orange-500" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
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
                  </>
                ) : null}

                {role === 'teen' ? (
                  <>
                    <label className="block">
                      <span className="mb-1.5 block text-sm font-semibold text-slate-900">Date of birth</span>
                      <input className="w-full rounded-2xl border border-orange-200 bg-white px-4 py-3.5 text-slate-950 outline-none transition focus:border-orange-500" type="date" value={dateOfBirth} onChange={(event) => setDateOfBirth(event.target.value)} required />
                    </label>

                    <label className="block">
                      <span className="mb-1.5 block text-sm font-semibold text-slate-900">Parent or guardian email</span>
                      <input className="w-full rounded-2xl border border-orange-200 bg-white px-4 py-3.5 text-slate-950 outline-none transition focus:border-orange-500" type="email" value={parentEmail} onChange={(event) => setParentEmail(event.target.value)} placeholder="We’ll send them an invite" required />
                    </label>
                  </>
                ) : null}

                {role === 'neighbor' ? (
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-semibold text-slate-900">Home address</span>
                    <input className="w-full rounded-2xl border border-orange-200 bg-white px-4 py-3.5 text-slate-950 outline-none transition focus:border-orange-500" value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Used for verification only" required />
                  </label>
                ) : null}

                <button type="submit" disabled={loading} className="flex min-h-12 w-full items-center justify-center rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50">
                  {loading ? 'Creating...' : isGoogleSignup ? 'Complete setup' : 'Create account'}
                </button>
              </form>

              <p className="text-center text-sm text-slate-500">
                Already have an account?{' '}
                <Link to={inviteToken ? `/login?inviteToken=${encodeURIComponent(inviteToken)}` : '/login'} className="font-semibold text-slate-900 underline decoration-orange-200 underline-offset-4 transition hover:decoration-orange-700">
                  Log in
                </Link>
              </p>

              {inviteToken ? (
                <p className="text-center text-xs text-slate-500">
                  Parent invite detected. Use a parent account to accept it after sign in.
                </p>
              ) : null}
            </div>
          )}
        </div>
      </section>
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
  if (message.includes('Missing required fields:')) {
    return message;
  }
  return message || 'Unable to create account.';
}