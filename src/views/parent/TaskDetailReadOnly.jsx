import { useParams } from 'react-router-dom';
import { Clock, MapPin, ShieldCheck, User, Wallet } from 'lucide-react';
import AppShell from '../../components/AppShell';
import PageState from '../../components/PageState';
import ReportButton from '../../components/ReportButton';
import StatusBadge from '../../components/StatusBadge';
import RatingStars from '../../components/RatingStars';
import { SkeletonCard } from '../../components/Skeleton';
import { useAuth } from '../../lib/useAuth';
import { useTaskById } from '../../lib/useTask';

export default function TaskDetailReadOnly() {
  const auth = useAuth();
  const { taskId } = useParams();
  const { data: task, loading } = useTaskById(taskId);

  if (loading) {
    return <AppShell><SkeletonCard /><SkeletonCard /></AppShell>;
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
      <div className="mx-auto max-w-2xl space-y-6 animate-fade-in">
        {/* Task header */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="font-heading text-3xl font-extrabold text-text-primary">{task.title}</h1>
              <p className="mt-2 text-text-secondary">{task.description}</p>
            </div>
            <StatusBadge status={task.status} />
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-4">
            <div className="flex items-center gap-2 rounded-xl bg-surface p-3">
              <Wallet size={16} className="text-primary shrink-0" />
              <div>
                <p className="text-xs text-text-secondary">Reward</p>
                <p className="font-mono font-bold text-text-primary">{task.pay}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-surface p-3">
              <Clock size={16} className="text-primary shrink-0" />
              <div>
                <p className="text-xs text-text-secondary">Date</p>
                <p className="font-semibold text-text-primary">{task.date}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-surface p-3">
              <Clock size={16} className="text-primary shrink-0" />
              <div>
                <p className="text-xs text-text-secondary">Time</p>
                <p className="font-semibold text-text-primary">{task.startTime} – {task.endTime}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-surface p-3">
              <User size={16} className="text-primary shrink-0" />
              <div>
                <p className="text-xs text-text-secondary">Your teen</p>
                <p className="font-semibold text-text-primary">{task.teenName}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Task details */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-heading text-xl font-bold text-text-primary">Task details</h2>
          <dl className="mt-4 space-y-3">
            <div>
              <dt className="text-sm text-text-secondary">Category</dt>
              <dd className="font-semibold text-text-primary capitalize">{task.category?.replaceAll('_', ' ')}</dd>
            </div>
            <div>
              <dt className="text-sm text-text-secondary">Location</dt>
              <dd className="font-semibold text-text-primary">{task.neighborAddress}</dd>
            </div>
            {task.specialInstructions && (
              <div>
                <dt className="text-sm text-text-secondary">Special instructions</dt>
                <dd className="font-semibold text-text-primary">{task.specialInstructions}</dd>
              </div>
            )}
            <div>
              <dt className="text-sm text-text-secondary">Requires power tools</dt>
              <dd className="font-semibold text-text-primary">{task.requiresPowerTools ? 'Yes' : 'No'}</dd>
            </div>
          </dl>
        </div>

        {/* Neighbor info */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-heading text-xl font-bold text-text-primary">Neighbor details</h2>
          <dl className="mt-4 space-y-3">
            <div>
              <dt className="text-sm text-text-secondary">Name</dt>
              <dd className="font-semibold text-text-primary">{task.neighborName}</dd>
            </div>
            <div>
              <dt className="text-sm text-text-secondary">Address</dt>
              <dd className="font-semibold text-text-primary">{task.neighborAddress}</dd>
            </div>
            <div>
              <dt className="text-sm text-text-secondary">Rating</dt>
              <dd className="font-semibold text-text-primary">{task.neighborRating ? `${task.neighborRating.toFixed(1)} / 5` : 'No rating'}</dd>
            </div>
          </dl>
        </div>

        {/* Completion status (if completed) */}
        {task.status === 'completed' && (
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-heading text-xl font-bold text-text-primary">Completion</h2>
            <dl className="mt-4 space-y-3">
              <div>
                <dt className="text-sm text-text-secondary">Completed at</dt>
                <dd className="font-semibold text-text-primary">{new Date(task.completedAt?.toDate?.() || task.completedAt).toLocaleString()}</dd>
              </div>
              {task.teenRating && (
                <div>
                  <dt className="text-sm text-text-secondary">Neighbor's rating of your teen</dt>
                  <dd className="mt-1 flex items-center gap-2">
                    <RatingStars value={task.teenRating} />
                    <span className="font-semibold text-text-primary">{task.teenRating} / 5</span>
                  </dd>
                </div>
              )}
            </dl>
          </div>
        )}

        <ReportButton targetType="task" targetId={taskId} />
      </div>
    </AppShell>
  );
}
