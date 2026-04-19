import { useMemo, useState } from 'react';
import AppShell from '../../components/AppShell';
import PageState from '../../components/PageState';
import RatingPrompt from '../../components/RatingPrompt';
import StatusBadge from '../../components/StatusBadge';
import TaskCard from '../../components/TaskCard';
import { markTeenCheckIn, updateTaskStatus, useTasksForFeed } from '../../lib/useTask';
import { useAuth } from '../../lib/useAuth';
import { useNavigate } from 'react-router-dom';

const statusLabels = {
  none: 'Ready to start',
  on_the_way: 'Heading to the task',
  arrived: 'Arrived at the task',
  done: 'Waiting for neighbor confirmation'
};

export default function MyTasks() {
  const auth = useAuth();
  const navigate = useNavigate();
  const { data: tasks, loading } = useTasksForFeed();
  const [activeTab, setActiveTab] = useState('active');

  const myTasks = useMemo(
    () => tasks.filter((task) => task.applicantTeenUid === auth?.currentUser?.uid),
    [tasks, auth?.currentUser?.uid]
  );

  const activeTasks = myTasks.filter((t) => ['active', 'in_progress', 'pending_confirmation'].includes(t.status));
  const pendingTasks = myTasks.filter((t) => t.status === 'pending_parent_approval');
  const completedTasks = myTasks.filter((t) => t.status === 'completed');

  async function updateStep(taskId, teenCheckInStatus) {
    await markTeenCheckIn({ taskId, teenCheckInStatus });
    if (teenCheckInStatus === 'on_the_way' || teenCheckInStatus === 'arrived') {
      await updateTaskStatus(taskId, { status: 'in_progress' });
    }
    if (teenCheckInStatus === 'done') {
      await updateTaskStatus(taskId, { status: 'pending_confirmation' });
    }
  }

  if (loading) {
    return <AppShell><PageState title="Loading tasks" description="Checking your task status." /></AppShell>;
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-dark">My Tasks</p>
          <h1 className="mt-2 font-heading text-3xl font-extrabold">Track your work</h1>
        </div>

        {/* Sub-tabs */}
        <div className="flex space-x-1 rounded-xl bg-surface p-1 max-w-fit">
          {['active', 'pending', 'completed'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-lg px-4 py-2 text-sm font-medium capitalize transition ${activeTab === tab ? 'bg-white text-primary-dark shadow pointer-events-none' : 'text-text-secondary hover:text-text-primary'
                }`}
            >
              {tab === 'pending' ? 'Pending Approval' : tab}
            </button>
          ))}
        </div>

        <div>
          {/* Active Tab */}
          {activeTab === 'active' && (
            <div className="space-y-4">
              {activeTasks.length === 0 ? (
                <PageState title="No active tasks" description="You don't have any tasks in progress right now." />
              ) : (
                activeTasks.map(activeTask => (
                  <div key={activeTask.id} className="rounded-2xl border border-border bg-white p-6">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h2 className="font-heading text-2xl font-bold">{activeTask.title}</h2>
                      </div>
                      <StatusBadge status={activeTask.status} />
                    </div>
                    <div className="mt-5 grid gap-3 sm:grid-cols-3 text-sm">
                      <div className="rounded-xl bg-surface p-4"><div className="text-text-secondary">Neighbor</div><div className="font-semibold">{activeTask.neighborName}</div></div>
                      <div className="rounded-xl bg-surface p-4"><div className="text-text-secondary">Address</div><div className="font-semibold">{activeTask.neighborAddress || 'Hidden until approved'}</div></div>
                      <div className="rounded-xl bg-surface p-4"><div className="text-text-secondary">Progress</div><div className="font-semibold">{statusLabels[activeTask.teenCheckInStatus] || 'Ready'}</div></div>
                    </div>
                    <div className="mt-6 grid gap-3 sm:grid-cols-3">
                      <button type="button" disabled={activeTask.teenCheckInStatus !== 'none' && activeTask.teenCheckInStatus !== 'on_the_way'} onClick={() => updateStep(activeTask.id, 'on_the_way')} className="rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white disabled:opacity-50">
                        On my way
                      </button>
                      <button type="button" disabled={activeTask.teenCheckInStatus !== 'on_the_way' && activeTask.teenCheckInStatus !== 'arrived'} onClick={() => updateStep(activeTask.id, 'arrived')} className="rounded-lg border border-primary bg-white px-4 py-3 text-sm font-semibold text-primary-dark disabled:opacity-50">
                        I've arrived
                      </button>
                      <button type="button" disabled={activeTask.teenCheckInStatus !== 'arrived'} onClick={() => updateStep(activeTask.id, 'done')} className="rounded-lg bg-secondary px-4 py-3 text-sm font-semibold text-white disabled:opacity-50">
                        I'm done
                      </button>
                    </div>
                    {activeTask.status === 'pending_confirmation' || activeTask.teenCheckInStatus === 'done' ? (
                      <p className="mt-4 text-sm font-medium text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-100">
                        Waiting for the neighbor to confirm your completion before funds are released.
                      </p>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          )}

          {/* Pending Tab */}
          {activeTab === 'pending' && (
            <div className="space-y-4">
              {pendingTasks.length === 0 ? (
                <PageState title="No pending tasks" description="Tasks waiting for parent approval will appear here." />
              ) : (
                pendingTasks.map(task => (
                  <TaskCard key={task.id} task={task} onClick={() => navigate(`/teen/task/${task.id}`)} />
                ))
              )}
            </div>
          )}

          {/* Completed Tab */}
          {activeTab === 'completed' && (
            <div className="space-y-4">
              {completedTasks.length === 0 ? (
                <PageState title="No completed tasks yet" description="Finish some tasks to build your reputation and earn rewards." />
              ) : (
                completedTasks.map(task => (
                  <div key={task.id} className="space-y-2">
                    <TaskCard task={task} onClick={() => navigate(`/teen/task/${task.id}`)} />
                    <div className="pl-2 pr-2">
                      <RatingPrompt task={task} ratedUid={task.neighborUid} title="Rate the neighbor" />
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
