import { useMemo } from 'react';
import AppShell from '../../components/AppShell';
import PageState from '../../components/PageState';
import RatingPrompt from '../../components/RatingPrompt';
import StatusBadge from '../../components/StatusBadge';
import { markTeenCheckIn, updateTaskStatus, useTasksForFeed } from '../../lib/useTask';
import { useAuth } from '../../lib/useAuth';

const statusLabels = {
  none: 'Waiting for parent approval',
  on_the_way: 'Heading to the task',
  arrived: 'Arrived at the task',
  done: 'Waiting for neighbor confirmation'
};

export default function ActiveTask() {
  const auth = useAuth();
  const { data: tasks, loading } = useTasksForFeed();
  const activeTask = useMemo(
    () => tasks.find((task) => task.applicantTeenUid === auth?.currentUser?.uid && ['pending_parent_approval', 'active', 'in_progress', 'pending_confirmation', 'completed'].includes(task.status)),
    [tasks, auth?.currentUser?.uid]
  );

  async function updateStep(teenCheckInStatus) {
    if (!activeTask) return;
    await markTeenCheckIn({ taskId: activeTask.id, teenCheckInStatus });
    if (teenCheckInStatus === 'on_the_way' || teenCheckInStatus === 'arrived') {
      await updateTaskStatus(activeTask.id, { status: 'in_progress' });
    }
    if (teenCheckInStatus === 'done') {
      await updateTaskStatus(activeTask.id, { status: 'pending_confirmation' });
    }
  }

  if (loading) {
    return <AppShell><PageState title="Loading active task" description="Checking your current task status." /></AppShell>;
  }

  if (!activeTask) {
    return <AppShell><PageState title="No active task" description="When a parent approves an application, the task will appear here." /></AppShell>;
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="rounded-2xl border border-border bg-white p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-dark">Active task</p>
              <h1 className="mt-2 font-heading text-3xl font-extrabold">{activeTask.title}</h1>
            </div>
            <StatusBadge status={activeTask.status} />
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3 text-sm">
            <div className="rounded-xl bg-surface p-4"><div className="text-text-secondary">Neighbor</div><div className="font-semibold">{activeTask.neighborName}</div></div>
            <div className="rounded-xl bg-surface p-4"><div className="text-text-secondary">Address</div><div className="font-semibold">{activeTask.neighborAddress}</div></div>
            <div className="rounded-xl bg-surface p-4"><div className="text-text-secondary">Progress</div><div className="font-semibold">{statusLabels[activeTask.teenCheckInStatus] || 'Waiting'}</div></div>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <button type="button" disabled={activeTask.teenCheckInStatus !== 'none' && activeTask.teenCheckInStatus !== 'on_the_way'} onClick={() => updateStep('on_the_way')} className="rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white disabled:opacity-50">
              On my way
            </button>
            <button type="button" disabled={activeTask.teenCheckInStatus !== 'on_the_way' && activeTask.teenCheckInStatus !== 'arrived'} onClick={() => updateStep('arrived')} className="rounded-lg border border-primary bg-white px-4 py-3 text-sm font-semibold text-primary-dark disabled:opacity-50">
              I've arrived
            </button>
            <button type="button" disabled={activeTask.teenCheckInStatus !== 'arrived'} onClick={() => updateStep('done')} className="rounded-lg bg-secondary px-4 py-3 text-sm font-semibold text-white disabled:opacity-50">
              I'm done
            </button>
          </div>
          {activeTask.status === 'pending_confirmation' || activeTask.teenCheckInStatus === 'done' ? (
            <PageState title="Waiting for confirmation" description="The neighbor must confirm completion before your earnings are released." />
          ) : null}
          {activeTask.status === 'completed' ? <RatingPrompt task={activeTask} ratedUid={activeTask.neighborUid} title="Rate the neighbor" /> : null}
        </div>
      </div>
    </AppShell>
  );
}
