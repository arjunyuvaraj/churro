import TopNav from './TopNav';
import BottomNav from './BottomNav';
import SideNav from './SideNav';
import { useAuth } from '../lib/useAuth';

export default function AppShell({ children }) {
  const auth = useAuth();

  return (
    <div className="flex min-h-screen flex-col bg-surface text-text-primary">
      <main className="flex-1">
        <TopNav />
        <div className="mx-auto w-full max-w-7xl px-4 pb-28 pt-4 sm:px-6 lg:px-8 lg:pb-10">
          <div className="grid gap-6 md:grid-cols-[15rem_minmax(0,1fr)]">
            {auth?.role ? <div className="hidden md:block"><SideNav role={auth.role} /></div> : null}
            <main className="min-w-0">{children}</main>
          </div>
        </div>
        {auth?.role ? <BottomNav role={auth.role} /> : null}
      </main>
      <footer className="border-t border-border bg-white px-4 py-5 text-center text-xs text-text-secondary sm:px-6 lg:px-8">
        Churro is a task marketplace, not an employer. All tasks are independent service arrangements between neighbors and teens.
      </footer>
    </div>
  );
}
