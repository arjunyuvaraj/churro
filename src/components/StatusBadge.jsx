const badgeStyles = {
  open: 'bg-emerald-100 text-emerald-800',
  pending: 'bg-amber-100 text-amber-800',
  active: 'bg-orange-100 text-orange-800',
  completed: 'bg-stone-100 text-stone-700',
  declined: 'bg-red-100 text-red-800',
  cancelled: 'bg-stone-100 text-stone-600',
  pending_parent_approval: 'bg-amber-100 text-amber-800',
  in_progress: 'bg-orange-100 text-orange-800',
  pending_confirmation: 'bg-sky-100 text-sky-800'
};

export default function StatusBadge({ status }) {
  const label = status?.replaceAll('_', ' ') || 'unknown';
  return (
    <span className={`inline-flex min-h-9 items-center rounded-full px-3 text-xs font-semibold capitalize ${badgeStyles[status] || 'bg-stone-100 text-stone-700'}`}>
      {label}
    </span>
  );
}
