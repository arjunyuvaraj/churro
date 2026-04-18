import { useMemo, useState } from 'react';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Award, Calendar, Clock, Copy, Download, Share2 } from 'lucide-react';
import AppShell from '../../components/AppShell';
import PageState from '../../components/PageState';
import { SkeletonCard } from '../../components/Skeleton';
import { useAuth } from '../../lib/useAuth';
import { useCompletedTasksByTeen } from '../../lib/useTask';
import { useVolunteerHours, generateHoursSummary } from '../../lib/useVolunteerHours';

export default function VolunteerHours() {
  const auth = useAuth();
  const { data: completedTasks, loading } = useCompletedTasksByTeen(auth?.currentUser?.uid);
  const { totalHours, taskCount, weeklyData, monthlyData, badges } = useVolunteerHours(completedTasks);
  const [viewMode, setViewMode] = useState('weekly'); // 'weekly' or 'monthly'
  const [copied, setCopied] = useState(false);

  const chartData = viewMode === 'weekly' ? weeklyData : monthlyData;
  const chartKey = viewMode === 'weekly' ? 'week' : 'month';

  function handleExport() {
    const summary = generateHoursSummary({
      name: auth?.profile?.fullName || 'Volunteer',
      totalHours,
      taskCount,
      badges
    });

    // Copy to clipboard
    navigator.clipboard.writeText(summary).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleShare() {
    const summary = generateHoursSummary({
      name: auth?.profile?.fullName || 'Volunteer',
      totalHours,
      taskCount,
      badges
    });

    if (navigator.share) {
      navigator.share({
        title: 'My Churro Volunteer Hours',
        text: summary
      }).catch(() => {});
    } else {
      handleExport();
    }
  }

  if (loading) {
    return (
      <AppShell>
        <div className="space-y-4">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-dark">Volunteer hours</p>
          <h1 className="mt-2 font-heading text-3xl font-extrabold text-text-primary">Your impact</h1>
          <p className="mt-2 text-text-secondary">Track your volunteer hours and share your progress with schools or organizations.</p>
        </div>

        {/* Stats cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-5 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Clock size={24} />
            </div>
            <p className="mt-3 font-mono text-3xl font-bold text-text-primary">{totalHours}</p>
            <p className="mt-1 text-sm text-text-secondary">Total hours</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-success/10 text-success">
              <Calendar size={24} />
            </div>
            <p className="mt-3 font-mono text-3xl font-bold text-text-primary">{taskCount}</p>
            <p className="mt-1 text-sm text-text-secondary">Tasks completed</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10 text-warning">
              <Award size={24} />
            </div>
            <p className="mt-3 font-mono text-3xl font-bold text-text-primary">{badges.length}</p>
            <p className="mt-1 text-sm text-text-secondary">Badges earned</p>
          </div>
        </div>

        {/* Hours chart */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-heading text-xl font-bold text-text-primary">Hours over time</h2>
            <div className="flex gap-1 rounded-full border border-border p-1">
              <button
                type="button"
                onClick={() => setViewMode('weekly')}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                  viewMode === 'weekly' ? 'bg-primary text-white' : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Weekly
              </button>
              <button
                type="button"
                onClick={() => setViewMode('monthly')}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                  viewMode === 'monthly' ? 'bg-primary text-white' : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Monthly
              </button>
            </div>
          </div>
          <div className="mt-4 h-64">
            {chartData.some((d) => d.hours > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey={chartKey} tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--color-card)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '12px',
                      fontSize: '14px'
                    }}
                  />
                  <Bar dataKey="hours" fill="#F97316" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-text-secondary">
                Complete tasks to see your hours here
              </div>
            )}
          </div>
        </div>

        {/* Badges */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-heading text-xl font-bold text-text-primary">Badges & Achievements</h2>
          {badges.length > 0 ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {badges.map((badge) => (
                <div key={badge.id} className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4 badge-glow">
                  <span className="text-3xl">{badge.emoji}</span>
                  <div>
                    <p className="font-semibold text-text-primary">{badge.label}</p>
                    <p className="text-xs text-text-secondary">{badge.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-text-secondary">Complete your first task to earn your first badge!</p>
          )}
        </div>

        {/* Export / Share */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-heading text-xl font-bold text-text-primary">Export your hours</h2>
          <p className="mt-2 text-sm text-text-secondary">Share your volunteer summary with schools, colleges, or community organizations.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleExport}
              className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-3 text-sm font-semibold text-text-primary hover:border-primary transition"
            >
              <Copy size={16} />
              {copied ? 'Copied!' : 'Copy summary'}
            </button>
            <button
              type="button"
              onClick={handleShare}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white"
            >
              <Share2 size={16} />
              Share
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
