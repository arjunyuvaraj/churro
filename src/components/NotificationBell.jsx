import { Bell } from 'lucide-react';
import { useAuth } from '../lib/useAuth';
import { useNotifications } from '../lib/useTask';

export default function NotificationBell() {
  const auth = useAuth();
  const { data } = useNotifications(auth?.currentUser?.uid);
  const unread = data.filter((notification) => !notification.read).length;

  return (
    <button type="button" className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-white text-text-primary">
      <Bell size={18} />
      {unread > 0 ? <span className="absolute right-0 top-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-bold text-white">{unread}</span> : null}
    </button>
  );
}
