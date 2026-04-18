import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AppShell from '../../components/AppShell';
import PageState from '../../components/PageState';
import RatingStars from '../../components/RatingStars';
import { useAuth } from '../../lib/useAuth';
import { applyToTask, useTasksForFeed } from '../../lib/useTask';

export default function TaskDetail() {
  const { taskId } = useParams();
  const auth = useAuth();
  const navigate = useNavigate();
  const { data: tasks, loading } = useTasksForFeed();
  const [status, setStatus] = useState('');

  const task = useMemo(() => tasks.find((entry) => entry.id === taskId), [tasks, taskId]);

  async function handleApply() {
    if (!task) return;
    setStatus('Applying...');
    try {
      await applyToTask({ task, teenProfile: auth.profile });
      navigate('/teen/active');
    } catch (error) {
      setStatus(error.message || 'Unable to apply.');
    }
  }

  if (loading) {
    return <AppShell><PageState title="Loading task" description="Fetching task details." /></AppShell>;
  }

  if (!task) {
    return <AppShell><PageState title="Task not found" description="This task may no longer be available." /></AppShell>;
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="rounded-2xl border border-border bg-white p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-dark">Task detail</p>
          <h1 className="mt-2 font-heading text-3xl font-extrabold">{task.title}</h1>
          <p className="mt-3 text-text-secondary">{task.description}</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3 text-sm">
            <div className="rounded-xl bg-surface p-4"><div className="text-text-secondary">Pay</div><div className="font-semibold">${task.pay}</div></div>
            <div className="rounded-xl bg-surface p-4"><div className="text-text-secondary">Time window</div><div className="font-semibold">{task.startTime} - {task.endTime}</div></div>
            <div className="rounded-xl bg-surface p-4"><div className="text-text-secondary">Neighbor</div><div className="font-semibold">{task.neighborName}</div></div>
          </div>
          <div className="mt-5 rounded-xl border border-border bg-primary-light p-4 text-sm text-text-primary">
            Rating: <span className="font-semibold">{task.neighborRating}</span>
            <div className="mt-2"><RatingStars value={Math.round(task.neighborRating)} size="sm" /></div>
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={handleApply} className="flex min-h-11 items-center justify-center rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white">
              Apply
            </button>
            <button type="button" onClick={() => navigate('/teen')} className="flex min-h-11 items-center justify-center rounded-lg border border-primary bg-white px-4 py-3 text-sm font-semibold text-primary-dark">
              Back to browse
            </button>
          </div>
          {status ? <p className="mt-3 text-sm text-text-secondary">{status}</p> : null}
        </div>
      </div>
    </AppShell>
  );
}
