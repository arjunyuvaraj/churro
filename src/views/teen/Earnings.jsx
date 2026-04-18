import { useMemo } from 'react';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import AppShell from '../../components/AppShell';
import PageState from '../../components/PageState';
import { useAuth } from '../../lib/useAuth';
import { useTasksForFeed } from '../../lib/useTask';

export default function Earnings() {
  const auth = useAuth();
  const { data: tasks, loading } = useTasksForFeed();

  const chartData = useMemo(() => {
    const weekly = auth?.profile?.weeklyEarnings || {};
    return Object.entries(weekly).map(([week, value]) => ({ week, value }));
  }, [auth?.profile?.weeklyEarnings]);

  const completedTasks = tasks.filter((task) => task.applicantTeenUid === auth?.currentUser?.uid && task.status === 'completed');

  if (loading) {
    return <AppShell><PageState title="Loading earnings" description="Fetching your payout history." /></AppShell>;
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-border bg-white p-5 md:col-span-1">
            <p className="text-sm text-text-secondary">Total balance</p>
            <p className="mt-2 font-mono text-4xl font-bold text-text-primary">${auth?.profile?.balance ?? 0}</p>
            <button type="button" onClick={() => window.alert('Request payout submitted.')} className="mt-5 w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white">
              Request payout
            </button>
          </div>
          <div className="rounded-2xl border border-border bg-white p-5 md:col-span-2">
            <h1 className="font-heading text-2xl font-bold">Earnings by week</h1>
            <div className="mt-4 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="week" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#F97316" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-white p-5">
          <h2 className="font-heading text-xl font-bold">Completed tasks</h2>
          <div className="mt-4 space-y-3">
            {completedTasks.length ? completedTasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
                <div>
                  <p className="font-semibold">{task.title}</p>
                  <p className="text-sm text-text-secondary">{task.completedAt ? new Date(task.completedAt.seconds ? task.completedAt.seconds * 1000 : task.completedAt).toLocaleDateString() : 'Completed'}</p>
                </div>
                <p className="font-mono font-semibold">${task.pay}</p>
              </div>
            )) : <PageState title="No completed tasks yet" description="Your completed work and payouts will appear here." />}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
