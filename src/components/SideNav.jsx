import { Bell, BriefcaseBusiness, Home, LayoutDashboard, User } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const items = {
  teen: [
    { to: '/teen', label: 'Browse', icon: Home },
    { to: '/teen/tasks', label: 'My Tasks', icon: BriefcaseBusiness },
    { to: '/teen/earnings', label: 'Earnings', icon: LayoutDashboard },
    { to: '/teen/notifications', label: 'Alerts', icon: Bell },
    { to: '/teen/profile', label: 'Profile', icon: User }
  ],
  parent: [
    { to: '/parent', label: 'Dashboard', icon: Home },
    { to: '/parent/approvals', label: 'Approvals', icon: BriefcaseBusiness },
    { to: '/parent/earnings', label: 'Earnings', icon: LayoutDashboard },
    { to: '/parent/notifications', label: 'Alerts', icon: Bell },
    { to: '/parent/settings', label: 'Settings', icon: User }
  ],
  neighbor: [
    { to: '/neighbor', label: 'Dashboard', icon: Home },
    { to: '/neighbor/post-task', label: 'Post Task', icon: BriefcaseBusiness },
    { to: '/neighbor/tasks', label: 'Active', icon: LayoutDashboard },
    { to: '/neighbor/notifications', label: 'Alerts', icon: Bell },
    { to: '/neighbor/profile', label: 'Profile', icon: User }
  ]
};

export default function SideNav({ role }) {
  const visibleItems = items[role] || [];

  if (!visibleItems.length) return null;

  return (
    <aside className="sticky top-24 h-fit rounded-2xl border border-border bg-white p-3">
      <nav className="space-y-1">
        {visibleItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${isActive ? 'bg-primary-light text-primary-dark' : 'text-text-secondary hover:bg-surface hover:text-text-primary'}`
            }
          >
            <Icon size={17} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
