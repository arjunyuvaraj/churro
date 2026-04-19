import { MapPin, Timer, Wallet } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { categoryIcons } from '../lib/taskCategories';

export default function TaskCard({ task, distanceText, onClick, showNeighbor = true }) {
  const Icon = categoryIcons[task.category] || MapPin;

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-xl border border-border bg-card p-4 text-left transition hover:border-primary/50 hover:shadow-soft"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-light text-primary-dark">
          <Icon size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="truncate font-heading text-base font-bold text-text-primary">{task.title}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-text-secondary">{task.description}</p>
            </div>
            <StatusBadge status={task.status} />
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-text-secondary">
            <span className="inline-flex items-center gap-1"><Wallet size={14} />Reward: {task.pay}</span>
            <span className="inline-flex items-center gap-1"><Timer size={14} />{task.startTime} - {task.endTime}</span>
            <span>{distanceText}</span>
            {showNeighbor ? <span>{task.neighborName}</span> : null}
          </div>
        </div>
      </div>
    </button>
  );
}
