import { useMemo } from 'react';

/**
 * Calculate volunteer hours from completed tasks.
 * Each task's hours are derived from startTime/endTime.
 */
function parseHoursFromTask(task) {
  if (!task.startTime || !task.endTime) return 1; // default 1 hour
  const [sh, sm] = task.startTime.split(':').map(Number);
  const [eh, em] = task.endTime.split(':').map(Number);
  const diff = (eh * 60 + em) - (sh * 60 + sm);
  return Math.max(diff / 60, 0.5); // minimum 30 min
}

/**
 * Hook to calculate volunteer hour stats from completed tasks
 */
export function useVolunteerHours(completedTasks = []) {
  return useMemo(() => {
    const totalHours = completedTasks.reduce((sum, task) => sum + parseHoursFromTask(task), 0);

    // Weekly hours (last 4 weeks)
    const now = new Date();
    const weeklyData = [];
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - (i * 7) - weekStart.getDay());
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      const weekLabel = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      const weekHours = completedTasks
        .filter((task) => {
          const taskDate = task.completedAt?.toDate?.()
            ? task.completedAt.toDate()
            : task.date
              ? new Date(task.date)
              : null;
          return taskDate && taskDate >= weekStart && taskDate < weekEnd;
        })
        .reduce((sum, task) => sum + parseHoursFromTask(task), 0);

      weeklyData.push({ week: weekLabel, hours: Math.round(weekHours * 10) / 10 });
    }

    // Monthly hours (last 6 months)
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      const monthLabel = monthStart.toLocaleDateString('en-US', { month: 'short' });

      const monthHours = completedTasks
        .filter((task) => {
          const taskDate = task.completedAt?.toDate?.()
            ? task.completedAt.toDate()
            : task.date
              ? new Date(task.date)
              : null;
          return taskDate && taskDate >= monthStart && taskDate <= monthEnd;
        })
        .reduce((sum, task) => sum + parseHoursFromTask(task), 0);

      monthlyData.push({ month: monthLabel, hours: Math.round(monthHours * 10) / 10 });
    }

    // Badges based on hours
    const badges = [];
    if (totalHours >= 1) badges.push({ id: 'first_hour', label: 'First Hour', emoji: '🌱', desc: 'Completed your first volunteer hour' });
    if (totalHours >= 10) badges.push({ id: 'ten_hours', label: 'Helper', emoji: '⭐', desc: '10 volunteer hours completed' });
    if (totalHours >= 25) badges.push({ id: 'twenty_five', label: 'Community Star', emoji: '🌟', desc: '25 volunteer hours completed' });
    if (totalHours >= 50) badges.push({ id: 'fifty_hours', label: 'Changemaker', emoji: '🏆', desc: '50 volunteer hours completed' });
    if (totalHours >= 100) badges.push({ id: 'hundred_hours', label: 'Legend', emoji: '💎', desc: '100 volunteer hours completed' });

    const taskCount = completedTasks.length;
    if (taskCount >= 1) badges.push({ id: 'first_task', label: 'Starter', emoji: '🎯', desc: 'Completed first task' });
    if (taskCount >= 5) badges.push({ id: 'five_tasks', label: 'Consistent', emoji: '🔥', desc: 'Completed 5 tasks' });
    if (taskCount >= 10) badges.push({ id: 'ten_tasks', label: 'Dedicated', emoji: '💪', desc: 'Completed 10 tasks' });

    return {
      totalHours: Math.round(totalHours * 10) / 10,
      taskCount,
      weeklyData,
      monthlyData,
      badges
    };
  }, [completedTasks]);
}

/**
 * Generate a shareable volunteer hours summary text
 */
export function generateHoursSummary({ name, totalHours, taskCount, badges }) {
  const lines = [
    '═══════════════════════════════════',
    '    CHURRO VOLUNTEER HOURS SUMMARY',
    '═══════════════════════════════════',
    '',
    `Volunteer: ${name}`,
    `Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`,
    '',
    `Total Volunteer Hours: ${totalHours}`,
    `Tasks Completed: ${taskCount}`,
    '',
    'Badges Earned:',
    ...badges.map((b) => `  ${b.emoji} ${b.label} — ${b.desc}`),
    '',
    '═══════════════════════════════════',
    'Verified by Churro | churro.app',
    '═══════════════════════════════════'
  ];

  return lines.join('\n');
}
