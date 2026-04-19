import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, limit, query, where } from 'firebase/firestore';
import AppShell from '../../components/AppShell';
import MapView from '../../components/MapView';
import PageState from '../../components/PageState';
import TaskCard from '../../components/TaskCard';
import { filterTasksByAge } from '../../lib/ageFilter';
import { useAuth } from '../../lib/useAuth';
import { db } from '../../lib/firebase';
import { useTasksForFeed } from '../../lib/useTask';
import { categoryLabels } from '../../lib/taskCategories';

export default function TeenDashboard() {
  const auth = useAuth();
  const navigate = useNavigate();
  const { data: tasks, loading } = useTasksForFeed();
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState(null);
  const [pendingInvite, setPendingInvite] = useState(null);
  const [resendState, setResendState] = useState('idle');
  const [refreshKey, setRefreshKey] = useState(0);

  const visibleTasks = useMemo(() => {
    const ageFiltered = filterTasksByAge(tasks, auth?.profile?.age || 0, new Date());
    const approvedCategories = auth?.profile?.approvedCategories || [];
    let filtered = ageFiltered.filter((task) => approvedCategories.includes(task.category));
    if (selectedCategoryFilter) {
      filtered = filtered.filter((task) => task.category === selectedCategoryFilter);
    }
    return filtered;
  }, [tasks, auth?.profile?.age, auth?.profile?.approvedCategories, selectedCategoryFilter]);

  const approvedCategories = auth?.profile?.approvedCategories || [];
  const center = visibleTasks[0] ? [visibleTasks[0].latitude || 37.7749, visibleTasks[0].longitude || -122.4194] : [37.7749, -122.4194];

  useEffect(() => {
    let cancelled = false;

    async function loadPendingInvitation() {
      if (!db || !auth?.currentUser?.uid || auth?.profile?.parentApproved) {
        setPendingInvite(null);
        return;
      }

      const invitationsQuery = query(
        collection(db, 'invitations'),
        where('teenUid', '==', auth.currentUser.uid),
        where('status', '==', 'pending'),
        limit(1)
      );

      const snapshot = await getDocs(invitationsQuery);
      if (cancelled) return;

      setPendingInvite(snapshot.empty ? null : { id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
    }

    loadPendingInvitation().catch(() => {
      if (!cancelled) setPendingInvite(null);
    });

    return () => {
      cancelled = true;
    };
  }, [auth?.currentUser?.uid, auth?.profile?.parentApproved, refreshKey]);

  // Skills for recommendation messaging
  const skills = auth?.profile?.skills || [];
  const skillsToDisplay = skills.length > 0 ? skills.slice(0, 2).map((s) => s.replace(/^[a-z_]+_/, '').replace(/_/g, ' ')).join(', ') : 'your interests';

  const lastRequestAt = pendingInvite?.resentAt?.toDate?.() || pendingInvite?.updatedAt?.toDate?.() || pendingInvite?.createdAt?.toDate?.() || null;
  const resendCount = Number(pendingInvite?.resendCount || 0);

  return (
    <AppShell>
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="space-y-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-dark">Teen dashboard</p>
            <h1 className="mt-2 font-heading text-3xl font-extrabold">Tasks near you</h1>
            <p className="mt-2 text-text-secondary">
              {skills.length > 0 ? (
                <>Based on your skills in <span className="font-semibold">{skillsToDisplay}</span>, we found tasks you might like. Only age-appropriate tasks are shown.</>
              ) : (
                'Only age-appropriate tasks are shown here. Parent approval is required before applying.'
              )}
            </p>
          </div>
          {!auth?.profile?.parentApproved ? (
            <div className="space-y-3">
              <PageState title="Waiting for parent link" description="Your account is pending until a parent accepts the link invitation. Browse is disabled until then." />
              {pendingInvite ? (
                <div className="rounded-2xl border border-orange-200 bg-white p-4 text-sm">
                  <p className="font-semibold text-slate-900">Parent request sent</p>
                  <p className="mt-1 text-slate-600">We sent a verification request to the parent dashboard notifications tab for <span className="font-medium">{auth?.profile?.parentEmail || 'your parent email'}</span>.</p>
                  {lastRequestAt ? <p className="mt-1 text-xs text-slate-500">Last request: {lastRequestAt.toLocaleString()}</p> : null}
                  {resendCount > 0 ? <p className="mt-1 text-xs text-slate-500">Resent: {resendCount} time{resendCount === 1 ? '' : 's'}</p> : null}
                  <button
                    type="button"
                    onClick={async () => {
                      setResendState('sending');
                      try {
                        await auth.resendParentInvitationRequest();
                        setResendState('sent');
                        setRefreshKey((prev) => prev + 1);
                      } catch {
                        setResendState('failed');
                      }
                    }}
                    className="mt-3 rounded-xl bg-slate-950 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
                  >
                    {resendState === 'sending' ? 'Resending...' : resendState === 'sent' ? 'Request resent' : resendState === 'failed' ? 'Resend failed' : 'Resend request'}
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}
          {loading ? <PageState title="Loading tasks" description="Fetching nearby tasks and map pins." /> : null}
          {auth?.profile?.parentApproved ? <MapView center={center} tasks={visibleTasks} /> : null}

          {/* Category filter chips */}
          {auth?.profile?.parentApproved && approvedCategories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedCategoryFilter(null)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  selectedCategoryFilter === null ? 'bg-primary text-white' : 'border border-border bg-white text-text-secondary hover:border-primary'
                }`}
              >
                All tasks
              </button>
              {approvedCategories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategoryFilter(selectedCategoryFilter === category ? null : category)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    selectedCategoryFilter === category ? 'bg-primary text-white' : 'border border-border bg-white text-text-secondary hover:border-primary'
                  }`}
                >
                  {categoryLabels[category]}
                </button>
              ))}
            </div>
          )}

          <div className="space-y-3">
            {auth?.profile?.parentApproved && visibleTasks.length ? visibleTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                distanceText={`${task.distance || '0.3'} miles away`}
                onClick={() => navigate(`/teen/task/${task.id}`)}
              />
            )) : null}
            {auth?.profile?.parentApproved && !loading && !visibleTasks.length ? (
              <PageState title="No tasks near you yet" description="Check back soon, refresh the page, or try a different category filter." />
            ) : null}
          </div>
        </section>
        <aside className="space-y-4">
          <div className="rounded-2xl border border-border bg-white p-5">
            <h2 className="font-heading text-xl font-bold">Quick stats</h2>
            <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-text-secondary">Age</dt>
                <dd className="font-semibold">{auth?.profile?.age ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-text-secondary">Allowed categories</dt>
                <dd className="font-semibold">{auth?.profile?.approvedCategories?.length || 0}</dd>
              </div>
              <div>
                <dt className="text-text-secondary">Rewards</dt>
                <dd className="font-mono font-semibold">{auth?.profile?.balance ?? 0}</dd>
              </div>
              <div>
                <dt className="text-text-secondary">Completed</dt>
                <dd className="font-semibold">{auth?.profile?.completedTasks ?? 0}</dd>
              </div>
            </dl>
            {skills.length > 0 && (
              <div className="mt-4 border-t border-border pt-4">
                <dt className="text-xs text-text-secondary">Your skills</dt>
                <div className="mt-2 flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <span key={skill} className="rounded-lg bg-primary-light px-2.5 py-1 text-xs font-medium text-primary-dark">
                      {skill.replace(/^[a-z_]+_/, '').replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="rounded-2xl border border-border bg-white p-5">
            <h2 className="font-heading text-xl font-bold">Safety reminder</h2>
            <p className="mt-2 text-sm text-text-secondary">Neighbors only see your first name, and you cannot have more than one active task at a time.</p>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
