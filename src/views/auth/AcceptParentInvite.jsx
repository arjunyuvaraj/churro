import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../lib/useAuth';

export default function AcceptParentInvite() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = useMemo(() => (searchParams.get('token') || '').trim().toUpperCase(), [searchParams]);

  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const [attemptKey, setAttemptKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!token) {
        setStatus('error');
        setMessage('Missing invitation token.');
        return;
      }

      if (auth?.loading) {
        return;
      }

      if (!auth?.isAuthenticated) {
        setStatus('needs-auth');
        setMessage('Please sign in with the parent email that received this invitation.');
        return;
      }

      if (auth?.role !== 'parent') {
        setStatus('error');
        setMessage('This invitation can only be accepted by a parent account.');
        return;
      }

      setStatus('working');
      setMessage('Verifying invitation...');

      try {
        await auth.acceptParentInvitation(token);
        if (!cancelled) {
          setStatus('success');
          setMessage('Parent verification complete. Your teen account is now linked.');
        }
      } catch (error) {
        if (!cancelled) {
          const nextMessage = error?.message || 'Unable to accept invitation.';
          setStatus('error');
          setMessage(nextMessage);
        }
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [auth, token, attemptKey]);

  return (
    <div className="min-h-screen bg-[#fffaf3] px-6 py-10 text-slate-950 sm:px-10 lg:px-12">
      <div className="mx-auto w-full max-w-xl rounded-2xl border border-orange-200 bg-white p-6 sm:p-8">
        <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Parent Invitation</h1>
        <p className="mt-3 text-sm text-slate-600">Token: <span className="font-semibold text-slate-900">{token || 'N/A'}</span></p>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          {message || 'Preparing invitation check...'}
        </div>

        {status === 'needs-auth' ? (
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link to={`/login?inviteToken=${encodeURIComponent(token)}`} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800">
              Log in as parent
            </Link>
            <Link to={`/signup?role=parent&inviteToken=${encodeURIComponent(token)}`} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-orange-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-orange-50">
              Create parent account
            </Link>
          </div>
        ) : null}

        {status === 'error' ? (
          <div className="mt-6">
            <button
              type="button"
              onClick={() => setAttemptKey((prev) => prev + 1)}
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-orange-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-orange-50"
            >
              Try again
            </button>
          </div>
        ) : null}

        {status === 'success' ? (
          <div className="mt-6">
            <button type="button" onClick={() => navigate('/parent', { replace: true })} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800">
              Continue to parent dashboard
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
