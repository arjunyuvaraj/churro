import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import AppShell from './components/AppShell';
import PageState from './components/PageState';
import { useAuth } from './lib/useAuth';
import { firebaseReady } from './lib/firebase';
import { seedDemoData } from './lib/seedDemoData';
import Login from './views/auth/Login';
import Signup from './views/auth/Signup';
import RoleSelect from './views/auth/RoleSelect';
import Landing from './views/public/Landing';
import TeenDashboard from './views/teen/TeenDashboard';
import TaskDetail from './views/teen/TaskDetail';
import ActiveTask from './views/teen/ActiveTask';
import Earnings from './views/teen/Earnings';
import TeenProfile from './views/teen/TeenProfile';
import ParentDashboard from './views/parent/ParentDashboard';
import ParentSettings from './views/parent/ParentSettings';
import NeighborDashboard from './views/neighbor/NeighborDashboard';
import PostTask from './views/neighbor/PostTask';
import NeighborTaskDetail from './views/neighbor/NeighborTaskDetail';

function RequireAuth({ children }) {
  const auth = useAuth();
  const location = useLocation();

  if (auth?.loading) {
    return (
      <AppShell>
        <PageState title="Loading Churro" description="Syncing your account and recent task activity." />
      </AppShell>
    );
  }

  if (!auth?.isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}

function RequireRole({ role, children }) {
  const auth = useAuth();

  if (auth?.role && auth.role !== role) {
    return <Navigate to={`/${auth.role}`} replace />;
  }

  return children;
}

export default function App() {
  useEffect(() => {
    if (!firebaseReady) return;
    seedDemoData().catch(() => {});
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/signup/role" element={<RoleSelect />} />
      <Route
        path="/teen"
        element={
          <RequireAuth>
            <RequireRole role="teen">
              <TeenDashboard />
            </RequireRole>
          </RequireAuth>
        }
      />
      <Route
        path="/teen/task/:taskId"
        element={
          <RequireAuth>
            <RequireRole role="teen">
              <TaskDetail />
            </RequireRole>
          </RequireAuth>
        }
      />
      <Route
        path="/teen/active"
        element={
          <RequireAuth>
            <RequireRole role="teen">
              <ActiveTask />
            </RequireRole>
          </RequireAuth>
        }
      />
      <Route
        path="/teen/earnings"
        element={
          <RequireAuth>
            <RequireRole role="teen">
              <Earnings />
            </RequireRole>
          </RequireAuth>
        }
      />
      <Route
        path="/teen/profile"
        element={
          <RequireAuth>
            <RequireRole role="teen">
              <TeenProfile />
            </RequireRole>
          </RequireAuth>
        }
      />
      <Route
        path="/parent"
        element={
          <RequireAuth>
            <RequireRole role="parent">
              <ParentDashboard />
            </RequireRole>
          </RequireAuth>
        }
      />
      <Route
        path="/parent/settings"
        element={
          <RequireAuth>
            <RequireRole role="parent">
              <ParentSettings />
            </RequireRole>
          </RequireAuth>
        }
      />
      <Route
        path="/neighbor"
        element={
          <RequireAuth>
            <RequireRole role="neighbor">
              <NeighborDashboard />
            </RequireRole>
          </RequireAuth>
        }
      />
      <Route
        path="/neighbor/post-task"
        element={
          <RequireAuth>
            <RequireRole role="neighbor">
              <PostTask />
            </RequireRole>
          </RequireAuth>
        }
      />
      <Route
        path="/neighbor/task/:taskId"
        element={
          <RequireAuth>
            <RequireRole role="neighbor">
              <NeighborTaskDetail />
            </RequireRole>
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
