import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BadgeCheck, MessageCircle } from 'lucide-react';
import AppShell from '../../components/AppShell';
import PageState from '../../components/PageState';
import RatingPrompt from '../../components/RatingPrompt';
import ReportButton from '../../components/ReportButton';
import StatusBadge from '../../components/StatusBadge';
import { SkeletonCard } from '../../components/Skeleton';
import { confirmCompletion, useTasksForFeed } from '../../lib/useTask';
import { useAuth } from '../../lib/useAuth';
import { getOrCreateConversation } from '../../lib/useMessages';

export default function NeighborTaskDetail() {
  const { taskId } = useParams();
  const auth = useAuth();
  const navigate = useNavigate();
  const { data: tasks, loading } = useTasksForFeed();
  const task = useMemo(() => tasks.find((entry) => entry.id === taskId), [tasks, taskId]);
  const [startingChat, setStartingChat] = useState(false);

  async function handleConfirm() {
    if (!task) return;
    await confirmCompletion({ task, teenUid: task.applicantTeenUid, neighborUid: auth.currentUser.uid });
  }

  async function handleStartChat() {
    if (!task || !task.applicantTeenUid) return;
    setStartingChat(true);
    try {
      const conversationId = await getOrCreateConversation({
        taskId: task.id,
        taskTitle: task.title,
        participants: [auth.currentUser.uid, task.applicantTeenUid],
        participantNames: [auth.firstName || 'Neighbor', task.teenName || 'Teen']
      });
      if (conversationId) {
        navigate(`/messages/${conversationId}`);
      }
    } finally {
      setStartingChat(false);
    }
  }

  if (loading) {
    return <AppShell><SkeletonCard /><SkeletonCard /></AppShell>;
  }

  if (!task) {
    return <AppShell><PageState title="Task not found" description="This listing may have been removed." /></AppShell>;
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl space-y-6 animate-fade-in">
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-dark">Task details</p>
              <h1 className="mt-2 font-heading text-3xl font-extrabold text-text-primary">{task.title}</h1>
            </div>
            <StatusBadge status={task.status} />
          </div>
          <p className="mt-3 text-text-secondary">{task.description}</p>

          {/* Teen info */}
          <div className="mt-5 rounded-xl border border-border bg-surface p-4 transition-all duration-300 hover:shadow-md">
            {task.status === 'open' ? (
              <p className="text-sm font-semibold text-text-secondary">Waiting for a volunteer to apply...</p>
            ) : (
              <>
                <p className="text-sm text-text-secondary">Assigned volunteer</p>
                <div className="mt-2 flex items-center justify-between">
                  <p className="font-heading text-lg font-bold text-text-primary">{task.teenName}</p>
                  {task.status === 'pending_parent_approval' && (
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">Waiting for Parent</span>
                  )}
                  {task.status !== 'pending_parent_approval' && task.status !== 'open' && (
                    <div className="flex items-center gap-1 text-success">
                      <BadgeCheck size={16} />
                      <span className="text-xs font-semibold">Parent Approved</span>
                    </div>
                  )}
                </div>
                {task.status !== 'pending_parent_approval' && (
                   <p className="mt-2 text-sm text-text-secondary">Status: <span className="font-semibold capitalize text-primary">{(task.teenCheckInStatus || 'none').replaceAll('_', ' ')}</span></p>
                )}
              </>
            )}
          </div>

          {/* Actions */}
          <div className="mt-5 flex flex-wrap gap-3">
            {(task.teenCheckInStatus === 'done' || task.status === 'pending_confirmation') && (
              <button type="button" onClick={handleConfirm} className="card-hover flex min-h-12 items-center justify-center gap-2 rounded-xl bg-success px-6 py-3 text-sm font-semibold text-white hover:bg-success/90 transition hover:shadow-lg hover:shadow-success/20">
                <BadgeCheck size={18} />
                Confirm Completion
              </button>
            )}
            {task.applicantTeenUid && (
              <button type="button" onClick={handleStartChat} disabled={startingChat} className="card-hover flex min-h-12 items-center justify-center gap-2 rounded-xl border border-border bg-card px-6 py-3 text-sm font-semibold text-text-primary hover:bg-surface transition disabled:opacity-50">
                <MessageCircle size={18} />
                {startingChat ? 'Opening...' : 'Message teen'}
              </button>
            )}
            <button type="button" onClick={() => navigate('/neighbor')} className="card-hover flex min-h-12 items-center justify-center rounded-xl border border-border bg-card px-6 py-3 text-sm font-semibold text-text-primary hover:bg-surface transition">
              Back
            </button>
          </div>

          {task.status === 'completed' && (
            <div className="mt-5">
              <RatingPrompt task={task} ratedUid={task.applicantTeenUid} title="Rate the volunteer" />
            </div>
          )}
        </div>

        <ReportButton targetType="task" targetId={taskId} />
      </div>
    </AppShell>
  );
}
