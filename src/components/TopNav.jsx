import { Link, NavLink } from 'react-router-dom';
import NotificationBell from './NotificationBell';
import { useAuth } from '../lib/useAuth';

const navItems = {
  teen: [
    { to: '/teen', label: 'Browse' },
    { to: '/teen/active', label: 'My Tasks' },
    { to: '/teen/earnings', label: 'Earnings' },
    { to: '/teen/profile', label: 'Profile' }
  ],
  parent: [
    { to: '/parent', label: 'Dashboard' },
    { to: '/parent/settings', label: 'Settings' }
  ],
  neighbor: [
    { to: '/neighbor', label: 'Dashboard' },
    { to: '/neighbor/post-task', label: 'Post Task' }
  ]
};

export default function TopNav() {
  const auth = useAuth();
  const role = auth?.role;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-white font-heading text-lg font-bold">C</div>
          <div>
            <div className="font-heading text-lg font-bold">Churro</div>
            <div className="text-xs text-text-secondary">Neighborhood task marketplace</div>
          </div>
        </Link>
        <nav className="hidden items-center gap-2 md:flex">
          {(navItems[role] || []).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rounded-full px-4 py-2 text-sm font-medium transition ${isActive ? 'bg-primary-light text-primary-dark' : 'text-text-secondary hover:text-text-primary'}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          {auth?.isAuthenticated ? <NotificationBell /> : null}
          {auth?.isAuthenticated ? (
            <button type="button" onClick={auth.logout} className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-text-primary">
              Sign out
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
}
