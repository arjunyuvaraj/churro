import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AppShell from '../../components/AppShell';
import PageState from '../../components/PageState';
import RatingPrompt from '../../components/RatingPrompt';
import StatusBadge from '../../components/StatusBadge';
import { confirmCompletion, useTasksForFeed } from '../../lib/useTask';
import { useAuth } from '../../lib/useAuth';

export default function NeighborTaskDetail() {
  const { taskId } = useParams();
  const auth = useAuth();
  const navigate = useNavigate();
  const { data: tasks, loading } = useTasksForFeed();
  const task = useMemo(() => tasks.find((entry) => entry.id === taskId), [tasks, taskId]);

  async function handleConfirm() {
    if (!task) return;
    await confirmCompletion({ task, teenUid: task.applicantTeenUid, neighborUid: auth.currentUser.uid });
  }

  if (loading) {
    return <AppShell><PageState title="Loading task" description="Fetching task details." /></AppShell>;
  }

  if (!task) {
    return <AppShell><PageState title="Task not found" description="This listing may have been removed." /></AppShell>;
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="rounded-2xl border border-border bg-white p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-dark">Neighbor task</p>
              <h1 className="mt-2 font-heading text-3xl font-extrabold">{task.title}</h1>
            </div>
            <StatusBadge status={task.status} />
          </div>
          <p className="mt-4 text-text-secondary">Teen: {task.teenName || 'Not yet assigned'} · Rating: {task.teenRating ?? 'n/a'}</p>
          <p className="mt-2 text-text-secondary">Status: {task.teenCheckInStatus.replaceAll('_', ' ')}</p>
          {task.teenCheckInStatus === 'done' || task.status === 'pending_confirmation' ? (
            <button type="button" onClick={handleConfirm} className="mt-5 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white">
              Confirm Completion
            </button>
          ) : null}
          {task.status === 'completed' ? <div className="mt-5"><RatingPrompt task={task} ratedUid={task.applicantTeenUid} title="Rate the teen" /></div> : null}
          <button type="button" onClick={() => navigate('/neighbor')} className="mt-5 ml-3 rounded-lg border border-primary px-4 py-3 text-sm font-semibold text-primary-dark">
            Back
          </button>
        </div>
      </div>
    </AppShell>
  );
}
