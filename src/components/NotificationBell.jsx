import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/useAuth';
import { useNotifications } from '../lib/useNotifications';

export default function NotificationBell() {
  const auth = useAuth();
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();

  return (
    <button
      type="button"
      onClick={() => {
        if (!auth?.role) return;
        navigate(`/${auth.role}/notifications`);
      }}
      className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-text-primary hover:bg-surface transition"
      aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
    >
      <Bell size={18} />
      {unreadCount > 0 ? (
        <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-bold text-white animate-scale-in">
          {unreadCount}
        </span>
      ) : null}
    </button>
  );
}
