import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import AppShell from '../../components/AppShell';
import PageState from '../../components/PageState';
import { db } from '../../lib/firebase';
import { useAuth } from '../../lib/useAuth';

function toDate(value) {
  return value?.toDate?.() ? value.toDate() : null;
}

export default function ParentNotifications() {
  const auth = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState('');
  const [error, setError] = useState('');

  const parentEmail = (auth?.profile?.email || auth?.currentUser?.email || '').trim().toLowerCase();

  useEffect(() => {
    if (!db || !parentEmail) {
      setRequests([]);
      setLoading(false);
      return () => {};
    }

    setLoading(true);
    const requestsQuery = query(
      collection(db, 'invitations'),
      where('parentEmail', '==', parentEmail),
      where('status', '==', 'pending')
    );

    const unsubscribe = onSnapshot(
      requestsQuery,
      (snapshot) => {
        const mapped = snapshot.docs
          .map((docSnapshot) => ({ id: docSnapshot.id, ...docSnapshot.data() }))
          .sort((a, b) => {
            const left = toDate(a.resentAt) || toDate(a.updatedAt) || toDate(a.createdAt) || new Date(0);
            const right = toDate(b.resentAt) || toDate(b.updatedAt) || toDate(b.createdAt) || new Date(0);
            return right.getTime() - left.getTime();
          });
        setRequests(mapped);
        setLoading(false);
      },
      () => {
        setError('Unable to load parent requests right now.');
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [parentEmail]);

  async function handleAccept(invitationId) {
    setError('');
    setActingId(invitationId);
    try {
      await auth.acceptParentInvitationById(invitationId);
    } catch (nextError) {
      setError(nextError?.message || 'Unable to accept this request.');
    } finally {
      setActingId('');
    }
  }

  async function handleDecline(invitationId) {
    setError('');
    setActingId(invitationId);
    try {
      await auth.declineParentInvitationById(invitationId);
    } catch (nextError) {
      setError(nextError?.message || 'Unable to decline this request.');
    } finally {
      setActingId('');
    }
  }

  return (
    <AppShell>
      <div className="space-y-6 animate-fade-in">
        <section className="rounded-2xl border border-border bg-card p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-dark">Parent notifications</p>
          <h1 className="mt-2 font-heading text-3xl font-extrabold text-text-primary">Teen verification requests</h1>
          <p className="mt-2 text-text-secondary">Approve requests here to verify a teen account and connect it to your parent dashboard.</p>
        </section>

        {error ? (
          <div className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">{error}</div>
        ) : null}

        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-heading text-xl font-bold text-text-primary">Pending requests</h2>
          <div className="mt-4 space-y-3">
            {loading ? (
              <PageState title="Loading requests" description="Checking recent teen verification requests." />
            ) : null}

            {!loading && requests.length === 0 ? (
              <PageState title="No pending requests" description="When a teen asks to connect, the request appears here." />
            ) : null}

            {!loading && requests.length > 0 ? requests.map((request) => {
              const requestedAt = toDate(request.resentAt) || toDate(request.updatedAt) || toDate(request.createdAt);
              const requestedLabel = requestedAt ? requestedAt.toLocaleString() : 'Just now';
              const resendCount = Number(request.resendCount || 0);

              return (
                <div key={request.id} className="rounded-xl border border-border bg-surface p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-semibold text-text-primary">{request.teenName || 'Teen account'} wants to connect</p>
                      <p className="text-sm text-text-secondary">Teen UID: {request.teenUid}</p>
                      <p className="text-sm text-text-secondary">Requested: {requestedLabel}</p>
                      {resendCount > 0 ? <p className="text-sm text-text-secondary">Resent {resendCount} time{resendCount === 1 ? '' : 's'}</p> : null}
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleAccept(request.id)}
                        disabled={actingId === request.id}
                        className="rounded-xl bg-success px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-success/90 disabled:opacity-60"
                      >
                        {actingId === request.id ? 'Saving...' : 'Accept'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDecline(request.id)}
                        disabled={actingId === request.id}
                        className="rounded-xl bg-danger px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-danger/90 disabled:opacity-60"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                </div>
              );
            }) : null}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
