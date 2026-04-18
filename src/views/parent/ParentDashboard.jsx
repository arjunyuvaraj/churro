import { useMemo, useState } from 'react';
import { doc, runTransaction } from 'firebase/firestore';
import AppShell from '../../components/AppShell';
import PageState from '../../components/PageState';
import StatusBadge from '../../components/StatusBadge';
import { db } from '../../lib/firebase';
import { parentDecision, useNotifications, useTasksForFeed } from '../../lib/useTask';
import { useAuth } from '../../lib/useAuth';

export default function ParentDashboard() {
  const auth = useAuth();
  const { data: tasks, loading } = useTasksForFeed();
  const notifications = useNotifications(auth?.currentUser?.uid);
  const [teenUidInput, setTeenUidInput] = useState('');
  const [linking, setLinking] = useState(false);

  const pendingTasks = useMemo(() => tasks.filter((task) => task.status === 'pending_parent_approval' && task.applicantTeenUid === auth?.profile?.linkedTeenUid), [tasks, auth?.profile?.linkedTeenUid]);
  const activeTask = useMemo(() => tasks.find((task) => task.applicantTeenUid === auth?.profile?.linkedTeenUid && ['active', 'in_progress', 'pending_confirmation'].includes(task.status)), [tasks, auth?.profile?.linkedTeenUid]);

  async function handleDecision(task, approved) {
    await parentDecision({ task, approved, parentUid: auth.currentUser.uid, teenUid: auth.profile.linkedTeenUid });
  }

  async function linkTeen() {
    if (!auth?.currentUser || !teenUidInput || !db) return;
    setLinking(true);
    try {
      await runTransaction(db, async (transaction) => {
        const parentRef = doc(db, 'users', auth.currentUser.uid);
        const teenRef = doc(db, 'users', teenUidInput.trim());
        const parentSnapshot = await transaction.get(parentRef);
        const teenSnapshot = await transaction.get(teenRef);
        if (!parentSnapshot.exists() || !teenSnapshot.exists()) {
          throw new Error('Unable to find one of the accounts.');
        }
        transaction.update(parentRef, { linkedTeenUid: teenUidInput.trim() });
        transaction.update(teenRef, { linkedParentUid: auth.currentUser.uid, parentApproved: true });
      });
    } finally {
      setLinking(false);
    }
  }

  if (loading) {
    return <AppShell><PageState title="Loading dashboard" description="Syncing teen activity and approvals." /></AppShell>;
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <section className="rounded-2xl border border-border bg-white p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-dark">Parent dashboard</p>
          <h1 className="mt-2 font-heading text-3xl font-extrabold">{auth?.profile?.linkedTeenUid ? 'Teen status' : 'Link a teen account'}</h1>
          <p className="mt-2 text-text-secondary">Live status updates refresh as the teen changes check-in states.</p>
          {!auth?.profile?.linkedTeenUid ? (
            <div className="mt-4 rounded-xl border border-border p-4">
              <p className="text-sm font-semibold">Paste teen account ID to link</p>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                <input value={teenUidInput} onChange={(event) => setTeenUidInput(event.target.value)} className="flex-1 rounded-xl border border-border px-4 py-3" placeholder="Teen UID" />
                <button type="button" onClick={linkTeen} disabled={linking} className="rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white">
                  {linking ? 'Linking...' : 'Link teen'}
                </button>
              </div>
            </div>
          ) : null}
          <div className="mt-4 rounded-xl bg-surface p-4">
            {activeTask ? (
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold">{activeTask.teenName} is on {activeTask.title}</p>
                  <p className="text-sm text-text-secondary">Current step: {activeTask.teenCheckInStatus.replaceAll('_', ' ')}</p>
                </div>
                <StatusBadge status={activeTask.status} />
              </div>
            ) : (
              <p className="font-semibold">{auth?.profile?.fullName?.split(/\s+/)[0]} is not currently on a task.</p>
            )}
          </div>
        </section>
        <section className="rounded-2xl border border-border bg-white p-6">
          <h2 className="font-heading text-xl font-bold">Pending approvals</h2>
          <div className="mt-4 space-y-3">
            {pendingTasks.length ? pendingTasks.map((task) => (
              <div key={task.id} className="rounded-xl border border-border p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold">{task.title}</p>
                    <p className="text-sm text-text-secondary">{task.neighborName} · {task.neighborAddress} · ${task.pay} · {task.startTime} - {task.endTime}</p>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => handleDecision(task, true)} className="rounded-lg bg-success px-4 py-2 text-sm font-semibold text-white">Approve</button>
                    <button type="button" onClick={() => handleDecision(task, false)} className="rounded-lg bg-danger px-4 py-2 text-sm font-semibold text-white">Decline</button>
                  </div>
                </div>
              </div>
            )) : <PageState title="No pending approvals" description="New applications will appear here." />}
          </div>
        </section>
        <section className="rounded-2xl border border-border bg-white p-6">
          <h2 className="font-heading text-xl font-bold">Recent activity</h2>
          <div className="mt-4 space-y-3">
            {notifications.data.slice(0, 10).map((notification) => (
              <div key={notification.id} className="rounded-xl border border-border px-4 py-3 text-sm">
                <p className="font-semibold">{notification.type.replaceAll('_', ' ')}</p>
                <p className="text-text-secondary">{notification.message}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
