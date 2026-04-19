import { useState } from 'react';
import AppShell from '../../components/AppShell';
import PageState from '../../components/PageState';
import { useNotifications } from '../../lib/useNotifications';
import { useAuth } from '../../lib/useAuth';
import { Bell } from 'lucide-react';

export default function ParentNotifications() {
  const auth = useAuth();
  const { notifications, unreadCount } = useNotifications();
  const pendingInvitations = auth?.pendingInvitations || [];
  const [invitationLoading, setInvitationLoading] = useState(null);
  const [invitationError, setInvitationError] = useState('');

  async function handleAcceptInvitation(invitationId) {
    setInvitationLoading(invitationId);
    setInvitationError('');
    try {
      await auth.acceptParentInvitationById(invitationId);
    } catch (err) {
      setInvitationError(err.message || 'Unable to accept invitation.');
    } finally {
      setInvitationLoading(null);
    }
  }

  async function handleDeclineInvitation(invitationId) {
    setInvitationLoading(invitationId);
    setInvitationError('');
    try {
      await auth.declineParentInvitationById(invitationId);
    } catch (err) {
      setInvitationError(err.message || 'Unable to decline invitation.');
    } finally {
      setInvitationLoading(null);
    }
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-dark">Alerts</p>
            <h1 className="mt-2 font-heading text-3xl font-extrabold">Notifications</h1>
          </div>
          {unreadCount > 0 && (
            <div className="flex h-8 items-center rounded-full bg-red-100 px-3 text-sm font-semibold text-red-700">
              {unreadCount} unread
            </div>
          )}
        </div>

        {invitationError && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {invitationError}
          </div>
        )}

        {pendingInvitations.length > 0 && (
          <div className="space-y-4">
            <h2 className="font-heading text-xl font-bold">Action Required</h2>
            {pendingInvitations.map((inv) => (
              <div key={inv.id} className="flex flex-col gap-4 rounded-2xl border border-orange-200 bg-orange-50 p-6 sm:flex-row sm:items-center sm:justify-between shadow-sm">
                <div>
                  <p className="font-semibold text-slate-900">{inv.teenName || 'A teen'} has invited you</p>
                  <p className="mt-1 text-sm text-slate-600">Accept to link accounts and start reviewing their tasks.</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button type="button" onClick={() => handleAcceptInvitation(inv.id)} disabled={invitationLoading === inv.id} className="rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50">
                    {invitationLoading === inv.id ? 'Linking...' : 'Accept Link'}
                  </button>
                  <button type="button" onClick={() => handleDeclineInvitation(inv.id)} disabled={invitationLoading === inv.id} className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50">
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="rounded-2xl border border-border bg-white shadow-sm overflow-hidden">
          {notifications.length === 0 ? (
            <div className="p-8">
              <PageState title="You're all caught up" description="Updates across your teen's tasks will appear here." />
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {notifications.map((notif) => (
                <li key={notif.id} className={`flex gap-4 p-5 transition hover:bg-surface ${!notif.read ? 'bg-primary-light/10' : ''}`}>
                  <div className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${!notif.read ? 'bg-primary-light text-primary' : 'bg-slate-100 text-slate-500'}`}>
                    <Bell size={20} />
                  </div>
                  <div>
                    <p className={`text-sm ${!notif.read ? 'font-bold' : 'font-medium'}`}>{notif.title}</p>
                    <p className="mt-1 text-sm text-text-secondary">{notif.message}</p>
                    <p className="mt-2 text-xs text-slate-400">
                      {notif.createdAt?.seconds ? new Date(notif.createdAt.seconds * 1000).toLocaleString() : 'Just now'}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </AppShell>
  );
}
