import { useMemo } from 'react';
import AppShell from '../../components/AppShell';
import PageState from '../../components/PageState';
import { SkeletonFeed } from '../../components/Skeleton';
import { parentDecision, useTasksForFeed } from '../../lib/useTask';
import { useAuth } from '../../lib/useAuth';

export default function ParentApprovals() {
    const auth = useAuth();
    const { data: tasks, loading } = useTasksForFeed();

    const pendingTasks = useMemo(() => {
        return tasks.filter((task) => task.status === 'pending_parent_approval' && task.applicantTeenUid === auth?.profile?.linkedTeenUid);
    }, [tasks, auth?.profile?.linkedTeenUid]);

    async function handleDecision(task, approved) {
        await parentDecision({ task, approved, parentUid: auth.currentUser.uid, teenUid: auth.profile.linkedTeenUid });
    }

    if (loading) {
        return <AppShell><SkeletonFeed count={2} /></AppShell>;
    }

    return (
        <AppShell>
            <div className="mx-auto max-w-3xl space-y-6 animate-fade-in">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-dark">Queue</p>
                    <h1 className="mt-2 font-heading text-3xl font-extrabold text-text-primary">Pending Approvals</h1>
                    <p className="mt-2 text-text-secondary">Review tasks your teen has applied for.</p>
                </div>

                <div className="space-y-4">
                    {pendingTasks.length > 0 ? (
                        pendingTasks.map((task) => (
                            <div key={task.id} className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                    <h2 className="font-heading text-xl font-bold text-text-primary">{task.title}</h2>
                                    <div className="mt-3 grid gap-x-8 gap-y-2 text-sm text-text-secondary sm:grid-cols-2">
                                        <p><span className="font-semibold text-slate-700">Neighbor:</span> {task.neighborName}</p>
                                        <p><span className="font-semibold text-slate-700">Address:</span> {task.neighborAddress}</p>
                                        <p><span className="font-semibold text-slate-700">Reward:</span> <span className="font-mono">{task.pay}</span></p>
                                        <p><span className="font-semibold text-slate-700">Time:</span> {task.startTime} – {task.endTime}</p>
                                    </div>
                                </div>
                                <div className="flex shrink-0 flex-row gap-2 sm:flex-col">
                                    <button type="button" onClick={() => handleDecision(task, true)} className="rounded-xl bg-success px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-success/90 w-full">
                                        Approve
                                    </button>
                                    <button type="button" onClick={() => handleDecision(task, false)} className="rounded-xl border border-danger/30 bg-danger/10 px-5 py-2.5 text-sm font-semibold text-danger transition hover:bg-danger/20 w-full">
                                        Decline
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="rounded-2xl border border-border bg-white p-8">
                            <PageState title="No pending approvals" description="When your teen applies for a new task, it will appear here for your review." />
                        </div>
                    )}
                </div>
            </div>
        </AppShell>
    );
}
