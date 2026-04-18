import { useNavigate } from 'react-router-dom';
import AppShell from '../../components/AppShell';
import PageState from '../../components/PageState';
import StatusBadge from '../../components/StatusBadge';
import { useAuth } from '../../lib/useAuth';
import { useUserTasks } from '../../lib/useTask';

export default function NeighborDashboard() {
  const auth = useAuth();
  const navigate = useNavigate();
  const { data: tasks, loading } = useUserTasks(auth?.currentUser?.uid, 'neighbor');

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="rounded-2xl border border-border bg-white p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-dark">Neighbor dashboard</p>
              <h1 className="mt-2 font-heading text-3xl font-extrabold">Posted tasks</h1>
            </div>
            <button type="button" onClick={() => navigate('/neighbor/post-task')} className="rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white">
              Post a Task
            </button>
          </div>
        </div>
        {loading ? <PageState title="Loading tasks" description="Fetching your task listings." /> : null}
        {!loading && !tasks.length ? <PageState title="No tasks yet" description="Post your first task to get started." /> : null}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {tasks.map((task) => (
            <button key={task.id} type="button" onClick={() => navigate(`/neighbor/task/${task.id}`)} className="rounded-2xl border border-border bg-white p-5 text-left transition hover:border-primary">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-heading text-xl font-bold">{task.title}</h2>
                  <p className="mt-1 text-sm text-text-secondary">{task.neighborName} · ${task.pay}</p>
                </div>
                <StatusBadge status={task.status} />
              </div>
              <p className="mt-3 text-sm text-text-secondary line-clamp-2">{task.description}</p>
            </button>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
