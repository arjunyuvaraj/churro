import { Star } from 'lucide-react';

export default function RatingStars({ value = 0, onChange, size = 'md' }) {
  const iconSize = size === 'sm' ? 16 : 20;

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className="rounded-full p-1"
          onClick={() => onChange?.(star)}
          aria-label={`${star} star rating`}
        >
          <Star size={iconSize} className={star <= value ? 'fill-warning text-warning' : 'text-border'} />
        </button>
      ))}
    </div>
  );
}
