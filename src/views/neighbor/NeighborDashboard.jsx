import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../../components/AppShell';
import { SkeletonFeed } from '../../components/Skeleton';
import { useAuth } from '../../lib/useAuth';
import { useUserTasks } from '../../lib/useTask';
import { Plus, ListTodo } from 'lucide-react';

export default function NeighborDashboard() {
  const auth = useAuth();
  const navigate = useNavigate();

  const { data: tasks = [], loading } = useUserTasks(
    auth?.currentUser?.uid,
    'neighbor'
  );

  const activeCount = useMemo(() => tasks.filter(t => ['open', 'active', 'in_progress', 'pending_confirmation'].includes(t.status)).length, [tasks]);
  const applicantCount = useMemo(() => tasks.filter(t => t.status === 'pending_neighbor_approval' || t.status === 'pending_parent_approval').length, [tasks]);
  const completedCount = useMemo(() => tasks.filter(t => t.status === 'completed').length, [tasks]);
  const totalSpent = useMemo(() => tasks.filter(t => t.status === 'completed').reduce((sum, t) => sum + (Number(t.pay.replace(/[^0-9.-]+/g, "")) || 0), 0), [tasks]);

  if (loading) {
    return <AppShell><SkeletonFeed count={2} /></AppShell>;
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl space-y-6 animate-fade-in">
        <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-dark">
                Neighbor dashboard
              </p>
              <h1 className="mt-2 font-heading text-3xl font-extrabold text-text-primary">
                Welcome back, {auth?.profile?.fullName?.split(' ')[0] || 'Neighbor'}
              </h1>
              <p className="mt-2 text-text-secondary">
                Manage your postings and track your community impact.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => navigate('/neighbor/tasks')}
                className="flex items-center gap-2 rounded-xl border border-border bg-white px-5 py-3 text-sm font-semibold text-text-primary hover:bg-surface transition"
              >
                <ListTodo size={18} />
                Manage Tasks
              </button>
              <button
                type="button"
                onClick={() => navigate('/neighbor/post-task')}
                className="flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary-dark transition"
              >
                <Plus size={18} />
                Post a Task
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-text-secondary">Active tasks</p>
            <p className="mt-2 font-mono text-4xl font-bold text-text-primary">{activeCount}</p>
          </div>
          <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-text-secondary">Pending applicants</p>
            <p className="mt-2 font-mono text-4xl font-bold text-amber-600">{applicantCount}</p>
          </div>
          <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-text-secondary">Completed tasks</p>
            <p className="mt-2 font-mono text-4xl font-bold text-success">{completedCount}</p>
          </div>
          <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-text-secondary">Total invested</p>
            <p className="mt-2 font-mono text-4xl font-bold text-text-primary">{totalSpent}</p>
          </div>
        </div>

        {tasks.length > 0 && (
          <div className="rounded-2xl border border-border bg-white p-6 md:p-8 shadow-sm text-center">
            <h2 className="font-heading text-xl font-bold text-text-primary">Want to see all your tasks?</h2>
            <p className="mt-2 text-text-secondary">Head over to the Tasks tab to manage approvals, track in-progress jobs, and review past work.</p>
            <button
              type="button"
              onClick={() => navigate('/neighbor/tasks')}
              className="mt-6 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition shadow-md"
            >
              Go to Tasks
            </button>
          </div>
        )}
      </div>
    </AppShell>
  );
}