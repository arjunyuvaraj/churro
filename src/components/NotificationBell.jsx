import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/useAuth';
import { useNotifications } from '../lib/useTask';

export default function NotificationBell() {
  const auth = useAuth();
  const navigate = useNavigate();
  const { data } = useNotifications(auth?.currentUser?.uid);
  const unread = data.filter((notification) => !notification.read).length;

  return (
    <button
      type="button"
      onClick={() => navigate('/messages')}
      className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-text-primary hover:bg-surface transition"
      aria-label={`Notifications${unread > 0 ? ` (${unread} unread)` : ''}`}
    >
      <Bell size={18} />
      {unread > 0 ? (
        <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-bold text-white animate-scale-in">
          {unread}
        </span>
      ) : null}
    </button>
  );
}
