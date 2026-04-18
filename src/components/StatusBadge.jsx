const badgeStyles = {
  open: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  active: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  completed: 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300',
  declined: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  cancelled: 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400',
  pending_parent_approval: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  in_progress: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  pending_confirmation: 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400'
};

export default function StatusBadge({ status }) {
  const label = status?.replaceAll('_', ' ') || 'unknown';
  return (
    <span className={`inline-flex min-h-9 items-center rounded-full px-3 text-xs font-semibold capitalize ${badgeStyles[status] || 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300'}`}>
      {label}
    </span>
  );
}
