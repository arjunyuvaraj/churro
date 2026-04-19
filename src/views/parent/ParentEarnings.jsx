import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import AppShell from '../../components/AppShell';
import PageState from '../../components/PageState';
import { useCompletedTasksByTeen } from '../../lib/useTask';
import { useAuth } from '../../lib/useAuth';

export default function ParentEarnings() {
    const auth = useAuth();
    const { data: completedTasks, loading } = useCompletedTasksByTeen(auth?.profile?.linkedTeenUid);

    const chartData = useMemo(() => {
        if (!auth?.profile?.linkedTeenUid || !completedTasks?.length) return [];
        return completedTasks
            .reduce((acc, task) => {
                const date = task.completedAt?.toDate?.() ? new Date(task.completedAt.toDate()).toISOString().split('T')[0] : task.date || 'Unknown';
                const found = acc.find((e) => e.week === date);
                const numericPay = Number(String(task.pay || '0').replace(/[^0-9.-]+/g, '')) || 0;
                if (found) {
                    found.value += numericPay;
                } else {
                    acc.push({ week: date, value: numericPay });
                }
                return acc;
            }, [])
            .slice(-8);
    }, [auth?.profile?.linkedTeenUid, completedTasks]);

    const totalEarnings = completedTasks?.reduce((sum, task) => sum + (Number(String(task.pay || '0').replace(/[^0-9.-]+/g, '')) || 0), 0) || 0;

    if (loading) {
        return <AppShell><PageState title="Loading rewards" description="Fetching teen rewards history." /></AppShell>;
    }

    return (
        <AppShell>
            <div className="mx-auto max-w-4xl space-y-6 animate-fade-in">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-dark">Financials</p>
                    <h1 className="mt-2 font-heading text-3xl font-extrabold text-text-primary">Rewards Tracker</h1>
                    <p className="mt-2 text-text-secondary">Track your teen's performance and earnings over time.</p>
                </div>

                {!auth?.profile?.linkedTeenUid ? (
                    <div className="rounded-2xl border border-border bg-white p-8">
                        <PageState title="No teen account linked" description="Link an account to track rewards." />
                    </div>
                ) : (
                    <>
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                                <p className="text-sm font-semibold text-text-secondary">Current balance</p>
                                <p className="mt-2 font-mono text-4xl font-bold text-text-primary">{totalEarnings}</p>
                            </div>
                            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                                <p className="text-sm font-semibold text-text-secondary">Lifetime rewards</p>
                                <p className="mt-2 font-mono text-4xl font-bold text-success">{totalEarnings}</p>
                            </div>
                            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                                <p className="text-sm font-semibold text-text-secondary">Tasks completed</p>
                                <p className="mt-2 font-mono text-4xl font-bold text-text-primary">{completedTasks?.length || 0}</p>
                            </div>
                        </div>

                        {chartData.length > 0 && (
                            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                                <h2 className="font-heading text-xl font-bold text-text-primary">Rewards over time</h2>
                                <div className="mt-6 h-72">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData}>
                                            <XAxis dataKey="week" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                                            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                                            <Tooltip contentStyle={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} cursor={{ fill: '#f1f5f9' }} />
                                            <Bar dataKey="value" fill="#22c55e" radius={[6, 6, 0, 0]} barSize={40} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}

                        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                            <h2 className="font-heading text-xl font-bold text-text-primary">Task History</h2>
                            <div className="mt-4 space-y-3">
                                {completedTasks && completedTasks.length > 0 ? completedTasks.map((task) => (
                                    <Link
                                        key={task.id}
                                        to={`/parent/task/${task.id}`}
                                        className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-4 transition hover:border-primary sm:flex-row sm:items-center sm:justify-between"
                                    >
                                        <div>
                                            <p className="font-semibold text-text-primary">{task.title}</p>
                                            <p className="text-sm text-text-secondary">{task.neighborName} · {task.date}</p>
                                        </div>
                                        <div className="flex flex-col sm:items-end">
                                            <p className="font-mono font-bold text-text-primary">+{task.pay}</p>
                                            <p className="text-xs font-semibold text-success uppercase tracking-wider">Completed</p>
                                        </div>
                                    </Link>
                                )) : <PageState title="No completed tasks" description="Your teen's completed work will appear here." />}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </AppShell>
    );
}
