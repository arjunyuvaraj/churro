import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '../lib/useTheme';

export default function ThemeToggle({ showLabel = false }) {
  const theme = useTheme();
  if (!theme) return null;

  const options = [
    { value: 'light', icon: Sun, label: 'Light' },
    { value: 'dark', icon: Moon, label: 'Dark' },
    { value: 'system', icon: Monitor, label: 'Auto' }
  ];

  return (
    <div className="flex items-center gap-1 rounded-full border border-border bg-card p-1" role="radiogroup" aria-label="Theme options">
      {options.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={theme.mode === value}
          aria-label={`${label} theme`}
          onClick={() => theme.setTheme(value)}
          className={`flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition-all ${
            theme.mode === value
              ? 'bg-primary text-white shadow-sm'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          <Icon size={16} />
          {showLabel && <span>{label}</span>}
        </button>
      ))}
    </div>
  );
}
