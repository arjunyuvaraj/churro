import AppShell from '../../components/AppShell';
import PageState from '../../components/PageState';
import { useNotifications } from '../../lib/useNotifications';
import { Bell } from 'lucide-react';

export default function NeighborNotifications() {
    const { notifications, unreadCount } = useNotifications();

    return (
        <AppShell>
            <div className="mx-auto max-w-3xl space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-dark">Alerts</p>
                        <h1 className="mt-2 font-heading text-3xl font-extrabold">Notifications</h1>
                    </div>
                    {unreadCount > 0 && (
                        <div className="flex h-8 items-center rounded-full bg-red-100 px-3 text-sm font-semibold text-red-700">
                            {unreadCount} unread
                        </div>
                    )}
                </div>

                <div className="rounded-2xl border border-border bg-white shadow-sm overflow-hidden">
                    {notifications.length === 0 ? (
                        <div className="p-8">
                            <PageState title="You're all caught up" description="Updates on your task applicants and completions will appear here." />
                        </div>
                    ) : (
                        <ul className="divide-y divide-border">
                            {notifications.map((notif) => (
                                <li key={notif.id} className={`flex gap-4 p-5 transition hover:bg-surface ${!notif.read ? 'bg-primary-light/10' : ''}`}>
                                    <div className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${!notif.read ? 'bg-primary-light text-primary' : 'bg-slate-100 text-slate-500'}`}>
                                        <Bell size={20} />
                                    </div>
                                    <div>
                                        <p className={`text-sm ${!notif.read ? 'font-bold' : 'font-medium'}`}>{notif.title}</p>
                                        <p className="mt-1 text-sm text-text-secondary">{notif.message}</p>
                                        <p className="mt-2 text-xs text-slate-400">
                                            {notif.createdAt?.seconds ? new Date(notif.createdAt.seconds * 1000).toLocaleString() : 'Just now'}
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </AppShell>
    );
}
