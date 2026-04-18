import { useParams } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import AppShell from '../../components/AppShell';
import PageState from '../../components/PageState';
import StatusBadge from '../../components/StatusBadge';
import RatingStars from '../../components/RatingStars';
import { useAuth } from '../../lib/useAuth';
import { useTaskById } from '../../lib/useTask';

export default function TaskDetailReadOnly() {
  const auth = useAuth();
  const { taskId } = useParams();
  const { data: task, loading } = useTaskById(taskId);

  if (loading) {
    return <AppShell><PageState title="Loading task" description="Fetching task details." /></AppShell>;
  }

  if (!task) {
    return <AppShell><PageState title="Task not found" description="This task doesn't exist or has been deleted." /></AppShell>;
  }

  // Only allow viewing if teen is linked and task belongs to them
  if (task.applicantTeenUid !== auth?.profile?.linkedTeenUid) {
    return <AppShell><PageState title="Access denied" description="You can only view tasks for your linked teen." /></AppShell>;
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Task header */}
        <div className="rounded-2xl border border-border bg-white p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="font-heading text-3xl font-extrabold">{task.title}</h1>
              <p className="mt-2 text-text-secondary">{task.description}</p>
            </div>
            <StatusBadge status={task.status} />
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-4">
            <div>
              <p className="text-sm text-text-secondary">Pay</p>
              <p className="font-mono text-xl font-bold">${task.pay}</p>
            </div>
            <div>
              <p className="text-sm text-text-secondary">Date</p>
              <p className="font-semibold">{task.date}</p>
            </div>
            <div>
              <p className="text-sm text-text-secondary">Time</p>
              <p className="font-semibold">{task.startTime} - {task.endTime}</p>
            </div>
            <div>
              <p className="text-sm text-text-secondary">Your teen</p>
              <p className="font-semibold">{task.teenName}</p>
            </div>
          </div>
        </div>

        {/* Task details */}
        <div className="rounded-2xl border border-border bg-white p-6">
          <h2 className="font-heading text-xl font-bold">Task details</h2>
          <dl className="mt-4 space-y-3">
            <div>
              <dt className="text-sm text-text-secondary">Category</dt>
              <dd className="font-semibold">{task.category}</dd>
            </div>
            <div>
              <dt className="text-sm text-text-secondary">Location</dt>
              <dd className="font-semibold">{task.neighborAddress}</dd>
            </div>
            {task.specialInstructions && (
              <div>
                <dt className="text-sm text-text-secondary">Special instructions</dt>
                <dd className="font-semibold">{task.specialInstructions}</dd>
              </div>
            )}
            <div>
              <dt className="text-sm text-text-secondary">Requires power tools</dt>
              <dd className="font-semibold">{task.requiresPowerTools ? 'Yes' : 'No'}</dd>
            </div>
          </dl>
        </div>

        {/* Neighbor info */}
        <div className="rounded-2xl border border-border bg-white p-6">
          <h2 className="font-heading text-xl font-bold">Neighbor details</h2>
          <dl className="mt-4 space-y-3">
            <div>
              <dt className="text-sm text-text-secondary">Name</dt>
              <dd className="font-semibold">{task.neighborName}</dd>
            </div>
            <div>
              <dt className="text-sm text-text-secondary">Address</dt>
              <dd className="font-semibold">{task.neighborAddress}</dd>
            </div>
            <div>
              <dt className="text-sm text-text-secondary">Rating</dt>
              <dd className="font-semibold">{task.neighborRating ? `${task.neighborRating.toFixed(1)} / 5` : 'No rating'}</dd>
            </div>
          </dl>
        </div>

        {/* Completion status (if completed) */}
        {task.status === 'completed' && (
          <div className="rounded-2xl border border-border bg-white p-6">
            <h2 className="font-heading text-xl font-bold">Completion</h2>
            <dl className="mt-4 space-y-3">
              <div>
                <dt className="text-sm text-text-secondary">Completed at</dt>
                <dd className="font-semibold">{new Date(task.completedAt?.toDate?.() || task.completedAt).toLocaleString()}</dd>
              </div>
              {task.teenRating && (
                <div>
                  <dt className="text-sm text-text-secondary">Neighbor's rating of your teen</dt>
                  <dd className="mt-1 flex items-center gap-2">
                    <RatingStars rating={task.teenRating} interactive={false} />
                    <span className="font-semibold">{task.teenRating} / 5</span>
                  </dd>
                </div>
              )}
            </dl>
          </div>
        )}
      </div>
    </AppShell>
  );
}
