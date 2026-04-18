/**
 * Skeleton loader — shows a pulsing placeholder shape.
 * Supports: text lines, cards, avatars.
 */
export function SkeletonLine({ width = '100%', height = '16px', className = '' }) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ width, height, minHeight: height }}
      aria-hidden="true"
    />
  );
}

export function SkeletonCard({ className = '' }) {
  return (
    <div className={`rounded-2xl border border-border bg-card p-5 space-y-4 ${className}`} aria-hidden="true">
      <div className="flex items-start gap-3">
        <div className="skeleton h-11 w-11 shrink-0 rounded-xl" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-5 w-3/4 rounded" />
          <div className="skeleton h-4 w-full rounded" />
        </div>
      </div>
      <div className="flex gap-3">
        <div className="skeleton h-4 w-16 rounded" />
        <div className="skeleton h-4 w-24 rounded" />
        <div className="skeleton h-4 w-20 rounded" />
      </div>
    </div>
  );
}

export function SkeletonAvatar({ size = 48, className = '' }) {
  return (
    <div
      className={`skeleton rounded-full ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    />
  );
}

export function SkeletonFeed({ count = 3 }) {
  return (
    <div className="space-y-4 animate-fade-in" aria-label="Loading content" role="status">
      <span className="sr-only">Loading...</span>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
