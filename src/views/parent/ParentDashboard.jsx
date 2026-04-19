import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import AppShell from '../../components/AppShell';
import PageState from '../../components/PageState';
import StatusBadge from '../../components/StatusBadge';
import { SkeletonCard, SkeletonFeed } from '../../components/Skeleton';
import { parentDecision, useNotifications, useTasksForFeed, useCompletedTasksByTeen } from '../../lib/useTask';
import { useAuth } from '../../lib/useAuth';

export default function ParentDashboard() {
  const auth = useAuth();
  const { data: tasks, loading } = useTasksForFeed();
  const { data: completedTasks } = useCompletedTasksByTeen(auth?.profile?.linkedTeenUid);
  const notifications = useNotifications(auth?.currentUser?.uid);
  const pendingInvitations = auth?.pendingInvitations || [];
  const [invitationLoading, setInvitationLoading] = useState(null);
  const [invitationError, setInvitationError] = useState('');

  const pendingTasks = useMemo(() => tasks.filter((task) => task.status === 'pending_parent_approval' && task.applicantTeenUid === auth?.profile?.linkedTeenUid), [tasks, auth?.profile?.linkedTeenUid]);
  const activeTask = useMemo(() => tasks.find((task) => task.applicantTeenUid === auth?.profile?.linkedTeenUid && ['active', 'in_progress', 'pending_confirmation'].includes(task.status)), [tasks, auth?.profile?.linkedTeenUid]);

  // Earnings chart data
  const chartData = useMemo(() => {
    if (!auth?.profile?.linkedTeenUid || !completedTasks?.length) return [];
    return completedTasks
      .reduce((acc, task) => {
        const date = task.completedAt?.toDate?.() ? new Date(task.completedAt.toDate()).toISOString().split('T')[0] : task.date || 'Unknown';
        const found = acc.find((e) => e.week === date);
        if (found) {
          found.value += task.pay;
        } else {
          acc.push({ week: date, value: task.pay });
        }
        return acc;
      }, [])
      .slice(-8);
  }, [auth?.profile?.linkedTeenUid, completedTasks]);

  // Check-in status steps
  const checkInSteps = ['none', 'on_the_way', 'arrived', 'done'];
  const currentCheckInIndex = activeTask ? checkInSteps.indexOf(activeTask.teenCheckInStatus || 'none') : -1;
  const checkInProgress = currentCheckInIndex >= 0 ? ((currentCheckInIndex + 1) / checkInSteps.length) * 100 : 0;

  async function handleDecision(task, approved) {
    await parentDecision({ task, approved, parentUid: auth.currentUser.uid, teenUid: auth.profile.linkedTeenUid });
  }

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

  if (loading) {
    return <AppShell><SkeletonFeed count={2} /></AppShell>;
  }

  return (
    <AppShell>
      <div className="space-y-6 animate-fade-in">
        <section className="rounded-2xl border border-border bg-card p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-dark">Parent dashboard</p>
          <h1 className="mt-2 font-heading text-3xl font-extrabold text-text-primary">{auth?.profile?.linkedTeenUid ? 'Teen status' : 'Link a teen account'}</h1>
          <p className="mt-2 text-text-secondary">Live status updates refresh as the teen changes check-in states.</p>

          {/* Pending invitations — replaces the old manual UID paste */}
          {!auth?.profile?.linkedTeenUid && pendingInvitations.length > 0 ? (
            <div className="mt-4 space-y-3">
              {invitationError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{invitationError}</div>
              ) : null}
              {pendingInvitations.map((inv) => (
                <div key={inv.id} className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-text-primary">{inv.teenName || 'A teen'} wants to link accounts</p>
                    <p className="text-xs text-text-secondary">Accept to start monitoring their tasks and activity</p>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => handleAcceptInvitation(inv.id)} disabled={invitationLoading === inv.id} className="rounded-xl bg-success px-5 py-2.5 text-sm font-semibold text-white hover:bg-success/90 transition disabled:opacity-50">
                      {invitationLoading === inv.id ? 'Linking...' : 'Accept'}
                    </button>
                    <button type="button" onClick={() => handleDeclineInvitation(inv.id)} disabled={invitationLoading === inv.id} className="rounded-xl bg-danger px-5 py-2.5 text-sm font-semibold text-white hover:bg-danger/90 transition disabled:opacity-50">
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : !auth?.profile?.linkedTeenUid ? (
            <div className="mt-4 rounded-xl border border-border bg-surface p-4">
              <p className="font-semibold text-text-primary">No teen account linked yet</p>
              <p className="text-sm text-text-secondary mt-1">When a teen signs up with your email address, their invitation will appear here automatically.</p>
            </div>
          ) : null}

          {auth?.profile?.linkedTeenUid && activeTask ? (
            <div className="mt-4 rounded-xl bg-surface p-4">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-text-primary">{activeTask.teenName} is on {activeTask.title}</p>
                  <p className="text-sm text-text-secondary">Current step: {activeTask.teenCheckInStatus?.replaceAll('_', ' ')}</p>
                </div>
                <StatusBadge status={activeTask.status} />
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold text-text-secondary">Task progress</p>
                <div className="h-2.5 w-full rounded-full bg-border overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-primary to-amber-500 transition-all duration-500" style={{ width: `${checkInProgress}%` }} />
                </div>
                <div className="flex justify-between text-[10px] text-text-secondary">
                  <span>Not started</span>
                  <span>On the way</span>
                  <span>Arrived</span>
                  <span>Done</span>
                </div>
              </div>
            </div>
          ) : auth?.profile?.linkedTeenUid ? (
            <div className="mt-4 rounded-xl bg-surface p-4">
              <p className="font-semibold text-text-primary">Your teen is not currently on a task.</p>
            </div>
          ) : null}
        </section>

        {/* Rewards widget */}
        {auth?.profile?.linkedTeenUid && (
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-border bg-card p-5">
              <p className="text-sm text-text-secondary">Current balance</p>
              <p className="mt-2 font-mono text-3xl font-bold text-text-primary">{completedTasks?.reduce((sum, task) => sum + (task.pay || 0), 0) || 0}</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5">
              <p className="text-sm text-text-secondary">Lifetime rewards</p>
              <p className="mt-2 font-mono text-3xl font-bold text-success">{completedTasks?.reduce((sum, task) => sum + (task.pay || 0), 0) || 0}</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5">
              <p className="text-sm text-text-secondary">Tasks completed</p>
              <p className="mt-2 font-mono text-3xl font-bold text-text-primary">{completedTasks?.length || 0}</p>
            </div>
          </div>
        )}

        {/* Weekly rewards chart */}
        {auth?.profile?.linkedTeenUid && chartData.length > 0 && (
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-heading text-xl font-bold text-text-primary">Rewards over time</h2>
            <div className="mt-4 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="week" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                  <Tooltip contentStyle={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: '12px' }} />
                  <Bar dataKey="value" fill="#22c55e" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Completed tasks */}
        {auth?.profile?.linkedTeenUid && (
          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-heading text-xl font-bold text-text-primary">Completed tasks</h2>
            <div className="mt-4 space-y-3">
              {completedTasks && completedTasks.length > 0 ? completedTasks.slice(0, 5).map((task) => (
                <Link
                  key={task.id}
                  to={`/parent/task/${task.id}`}
                  className="block rounded-xl border border-border bg-surface p-4 transition hover:border-primary card-hover"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-text-primary">{task.title}</p>
                      <p className="text-sm text-text-secondary">{task.neighborName} · Reward: {task.pay} · {task.date}</p>
                    </div>
                    <div className="text-sm font-semibold text-success">Completed</div>
                  </div>
                </Link>
              )) : <PageState title="No completed tasks" description="Your teen hasn't completed any tasks yet." />}
            </div>
          </section>
        )}

        {/* Pending approvals */}
        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-heading text-xl font-bold text-text-primary">Pending approvals</h2>
          <div className="mt-4 space-y-3">
            {pendingTasks.length ? pendingTasks.map((task) => (
              <div key={task.id} className="rounded-xl border border-border bg-surface p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-text-primary">{task.title}</p>
                    <p className="text-sm text-text-secondary">{task.neighborName} · {task.neighborAddress} · Reward: {task.pay} · {task.startTime} – {task.endTime}</p>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => handleDecision(task, true)} className="rounded-xl bg-success px-5 py-2.5 text-sm font-semibold text-white hover:bg-success/90 transition">Approve</button>
                    <button type="button" onClick={() => handleDecision(task, false)} className="rounded-xl bg-danger px-5 py-2.5 text-sm font-semibold text-white hover:bg-danger/90 transition">Decline</button>
                  </div>
                </div>
              </div>
            )) : <PageState title="No pending approvals" description="New applications will appear here." />}
          </div>
        </section>

        {/* Recent activity */}
        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-heading text-xl font-bold text-text-primary">Recent activity</h2>
          <div className="mt-4 space-y-3">
            {notifications.data.slice(0, 10).map((notification) => (
              <div key={notification.id} className="rounded-xl border border-border bg-surface px-4 py-3 text-sm">
                <p className="font-semibold text-text-primary capitalize">{notification.type.replaceAll('_', ' ')}</p>
                <p className="text-text-secondary">{notification.message}</p>
              </div>
            ))}
            {notifications.data.length === 0 && <p className="text-sm text-text-secondary">No recent activity.</p>}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
