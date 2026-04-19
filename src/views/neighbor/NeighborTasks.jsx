import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../../components/AppShell';
import PageState from '../../components/PageState';
import StatusBadge from '../../components/StatusBadge';
import { SkeletonFeed } from '../../components/Skeleton';
import { useAuth } from '../../lib/useAuth';
import { useUserTasks } from '../../lib/useTask';

export default function NeighborTasks() {
    const auth = useAuth();
    const navigate = useNavigate();
    const { data: tasks = [], loading } = useUserTasks(
        auth?.currentUser?.uid,
        'neighbor'
    );

    const [activeTab, setActiveTab] = useState('active');

    const activeTasks = useMemo(() => tasks.filter(t => ['active', 'in_progress', 'pending_confirmation'].includes(t.status)), [tasks]);
    const applicantTasks = useMemo(() => tasks.filter(t => t.status === 'pending_neighbor_approval' || t.status === 'pending_parent_approval'), [tasks]);
    const pastTasks = useMemo(() => tasks.filter(t => t.status === 'completed'), [tasks]);

    if (loading) {
        return <AppShell><SkeletonFeed count={2} /></AppShell>;
    }

    return (
        <AppShell>
            <div className="mx-auto max-w-4xl space-y-6 animate-fade-in">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-dark">Manage Postings</p>
                    <h1 className="mt-2 font-heading text-3xl font-extrabold text-text-primary">Your Tasks</h1>
                </div>

                {/* Sub-tabs */}
                <div className="flex space-x-1 rounded-xl bg-surface p-1 max-w-fit">
                    {['active', 'applicants', 'past'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`rounded-lg px-4 py-2 text-sm font-medium capitalize transition ${activeTab === tab ? 'bg-white text-primary-dark shadow pointer-events-none' : 'text-text-secondary hover:text-text-primary'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div>
                    {/* Active Tab */}
                    {activeTab === 'active' && (
                        <div className="space-y-4">
                            {activeTasks.length === 0 ? (
                                <PageState title="No active tasks" description="Tasks that teens are currently working on will appear here." />
                            ) : (
                                activeTasks.map(task => (
                                    <button
                                        key={task.id}
                                        type="button"
                                        onClick={() => navigate(`/neighbor/task/${task.id}`)}
                                        className="w-full text-left rounded-2xl border border-border bg-white p-6 transition hover:border-primary/50 shadow-sm card-hover"
                                    >
                                        <div className="flex items-center justify-between gap-4">
                                            <div>
                                                <h2 className="font-heading text-xl font-bold">{task.title}</h2>
                                                <p className="mt-1 text-sm text-text-secondary">Teen: {task.applicantTeenUid ? task.teenName || 'Assigned' : 'Open'}</p>
                                            </div>
                                            <StatusBadge status={task.status} />
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    )}

                    {/* Applicants Tab */}
                    {activeTab === 'applicants' && (
                        <div className="space-y-4">
                            {applicantTasks.length === 0 ? (
                                <PageState title="No pending applicants" description="When a teen applies for your open tasks, you can review them here." />
                            ) : (
                                applicantTasks.map(task => (
                                    <button
                                        key={task.id}
                                        type="button"
                                        onClick={() => navigate(`/neighbor/task/${task.id}`)}
                                        className="w-full flex justify-between items-center text-left rounded-xl border border-border bg-white p-5 transition hover:border-primary/50"
                                    >
                                        <div>
                                            <p className="font-semibold">{task.title}</p>
                                            <p className="text-sm text-text-secondary">Applicant awaits approval</p>
                                        </div>
                                        <StatusBadge status={task.status} />
                                    </button>
                                ))
                            )}
                        </div>
                    )}

                    {/* Past Tab */}
                    {activeTab === 'past' && (
                        <div className="space-y-4">
                            {pastTasks.length === 0 ? (
                                <PageState title="No past tasks" description="Completed tasks and payment history will appear here." />
                            ) : (
                                pastTasks.map(task => (
                                    <button
                                        key={task.id}
                                        type="button"
                                        onClick={() => navigate(`/neighbor/task/${task.id}`)}
                                        className="w-full text-left rounded-xl border border-border bg-white p-5 transition hover:border-primary/50"
                                    >
                                        <p className="font-semibold">{task.title}</p>
                                        <p className="text-sm text-text-secondary">Completed on {task.completedAt?.toDate?.() ? new Date(task.completedAt.toDate()).toLocaleDateString() : task.date}</p>
                                    </button>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
        </AppShell>
    );
}
