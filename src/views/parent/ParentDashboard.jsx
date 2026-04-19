import { useMemo } from 'react';
import AppShell from '../../components/AppShell';
import PageState from '../../components/PageState';
import StatusBadge from '../../components/StatusBadge';
import { SkeletonFeed } from '../../components/Skeleton';
import { useTasksForFeed } from '../../lib/useTask';
import { useAuth } from '../../lib/useAuth';

export default function ParentDashboard() {
  const auth = useAuth();
  const { data: tasks, loading } = useTasksForFeed();

  const activeTask = useMemo(() => tasks.find((task) => task.applicantTeenUid === auth?.profile?.linkedTeenUid && ['active', 'in_progress', 'pending_confirmation'].includes(task.status)), [tasks, auth?.profile?.linkedTeenUid]);

  // Check-in status steps
  const checkInSteps = ['none', 'on_the_way', 'arrived', 'done'];
  const currentCheckInIndex = activeTask ? checkInSteps.indexOf(activeTask.teenCheckInStatus || 'none') : -1;
  const checkInProgress = currentCheckInIndex >= 0 ? ((currentCheckInIndex + 1) / checkInSteps.length) * 100 : 0;

  if (loading) {
    return <AppShell><SkeletonFeed count={1} /></AppShell>;
  }

  return (
    <AppShell>
      <div className="space-y-6 animate-fade-in mx-auto max-w-3xl">
        <section className="rounded-2xl border border-border bg-card p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-dark">Parent dashboard</p>
          <h1 className="mt-2 font-heading text-3xl font-extrabold text-text-primary">{auth?.profile?.linkedTeenUid ? 'Teen status' : 'Link a teen account'}</h1>
          <p className="mt-2 text-text-secondary">Live status updates refresh as the teen changes check-in states.</p>

          {!auth?.profile?.linkedTeenUid ? (
            <div className="mt-4 rounded-xl border border-border bg-surface p-4">
              <p className="font-semibold text-text-primary">No teen account linked yet</p>
              <p className="text-sm text-text-secondary mt-1">When your teen sends an invitation, it will appear in your Alerts tab.</p>
            </div>
          ) : activeTask ? (
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
          ) : (
            <div className="mt-4 rounded-xl bg-surface p-4">
              <p className="font-semibold text-text-primary">Your teen is not currently on a task.</p>
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
