import { BriefcaseBusiness, Home, LayoutDashboard, User } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const items = {
  teen: [
    { to: '/teen', label: 'Browse', icon: Home },
    { to: '/teen/active', label: 'My Tasks', icon: BriefcaseBusiness },
    { to: '/teen/earnings', label: 'Earnings', icon: LayoutDashboard },
    { to: '/teen/profile', label: 'Profile', icon: User }
  ],
  parent: [
    { to: '/parent', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/parent/settings', label: 'Settings', icon: User }
  ],
  neighbor: [
    { to: '/neighbor', label: 'Dashboard', icon: Home },
    { to: '/neighbor/post-task', label: 'Post', icon: BriefcaseBusiness }
  ]
};

export default function BottomNav({ role }) {
  const visibleItems = items[role] || [];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-white/95 backdrop-blur md:hidden">
      <div className="grid gap-1 px-2 py-2" style={{ gridTemplateColumns: `repeat(${visibleItems.length || 1}, minmax(0, 1fr))` }}>
        {visibleItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex min-h-11 flex-col items-center justify-center rounded-lg text-xs font-medium ${isActive ? 'text-primary' : 'text-text-secondary'}`
            }
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
