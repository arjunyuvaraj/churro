import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../../components/AppShell';
import PageState from '../../components/PageState';
import StatusBadge from '../../components/StatusBadge';
import TaskCalendar from './TaskCalendar';
import { SkeletonFeed } from '../../components/Skeleton';
import { useAuth } from '../../lib/useAuth';
import { useUserTasks } from '../../lib/useTask';

export default function NeighborDashboard() {
  const auth = useAuth();
  const navigate = useNavigate();
  const { data: tasks, loading } = useUserTasks(auth?.currentUser?.uid, 'neighbor');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(null);

  // Filter tasks for selected calendar date if in calendar mode
  const tasksToDisplay = selectedCalendarDate
    ? tasks.filter((t) => t.date === selectedCalendarDate)
    : tasks;

  return (
    <AppShell>
      <div className="space-y-6 animate-fade-in">
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-dark">Neighbor dashboard</p>
              <h1 className="mt-2 font-heading text-3xl font-extrabold text-text-primary">Posted tasks</h1>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => navigate('/neighbor/bulk-schedule')}
                className="rounded-xl border border-border bg-card px-5 py-3 text-sm font-semibold text-text-primary hover:bg-surface transition"
              >
                Bulk schedule
              </button>
              <button
                type="button"
                onClick={() => navigate('/neighbor/post-task')}
                className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary-dark transition"
              >
                Post a Task
              </button>
            </div>
          </div>

          {/* View mode tabs */}
          <div className="mt-6 flex gap-2 border-b border-border">
            <button
              type="button"
              onClick={() => {
                setViewMode('list');
                setSelectedCalendarDate(null);
              }}
              className={`px-4 py-3 text-sm font-medium transition ${
                viewMode === 'list'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              List view
            </button>
            <button
              type="button"
              onClick={() => setViewMode('calendar')}
              className={`px-4 py-3 text-sm font-medium transition ${
                viewMode === 'calendar'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Calendar view
            </button>
          </div>
        </div>

        {loading ? <SkeletonFeed count={3} /> : null}
        {!loading && !tasks.length ? <PageState title="No tasks yet" description="Post your first task to get started." /> : null}

        {/* Calendar view */}
        {viewMode === 'calendar' && !loading && (
          <div>
            <TaskCalendar tasks={tasks} onDateSelect={setSelectedCalendarDate} />
            {selectedCalendarDate && (
              <div className="mt-4 rounded-2xl border border-border bg-card p-4">
                <div className="flex items-center justify-between mb-4">
                  <p className="font-semibold text-text-primary">Tasks on {selectedCalendarDate}</p>
                  <button
                    type="button"
                    onClick={() => setSelectedCalendarDate(null)}
                    className="text-sm text-primary hover:underline"
                  >
                    Clear filter
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* List view */}
        {viewMode === 'list' && !loading && (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {tasksToDisplay.length > 0 ? (
              tasksToDisplay.map((task) => (
                <button
                  key={task.id}
                  type="button"
                  onClick={() => navigate(`/neighbor/task/${task.id}`)}
                  className="rounded-2xl border border-border bg-card p-5 text-left transition hover:border-primary/50 hover:shadow-soft card-hover"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="font-heading text-xl font-bold text-text-primary">{task.title}</h2>
                      <p className="mt-1 text-sm text-text-secondary">{task.date} · ${task.pay}</p>
                    </div>
                    <StatusBadge status={task.status} />
                  </div>
                  <p className="mt-3 text-sm text-text-secondary line-clamp-2">{task.description}</p>
                </button>
              ))
            ) : (
              <div className="col-span-full">
                <PageState title="No tasks on this date" description="Select a different date or create a new task." />
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
