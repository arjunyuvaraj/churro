import TopNav from './TopNav';
import BottomNav from './BottomNav';
import { useAuth } from '../lib/useAuth';

export default function AppShell({ children }) {
  const auth = useAuth();

  return (
    <div className="flex min-h-screen flex-col bg-surface text-text-primary">
      <TopNav />
      <main className="mx-auto flex-1 w-full max-w-7xl px-4 pb-28 pt-4 sm:px-6 lg:px-8 lg:pb-10">
        {children}
      </main>
      {auth?.role ? <BottomNav role={auth.role} /> : null}
      <footer className="border-t border-border bg-white px-4 py-5 text-center text-xs text-text-secondary sm:px-6 lg:px-8">
        Churro is a task marketplace, not an employer. All tasks are independent service arrangements between neighbors and teens.
      </footer>
    </div>
  );
}
