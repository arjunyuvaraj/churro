import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import AppShell from './components/AppShell';
import PageState from './components/PageState';
import { useAuth } from './lib/useAuth';
import { firebaseReady } from './lib/firebase';
import { seedDemoData } from './lib/seedDemoData';
import Login from './views/auth/Login';
import Signup from './views/auth/Signup';
import AcceptParentInvite from './views/auth/AcceptParentInvite';
import Landing from './views/public/Landing';
import Privacy from './views/public/Privacy';
import Terms from './views/public/Terms';
import SkillsSurvey from './views/teen/SkillsSurvey';
import TeenDashboard from './views/teen/TeenDashboard';
import TaskDetail from './views/teen/TaskDetail';
import ActiveTask from './views/teen/ActiveTask';
import Earnings from './views/teen/Earnings';
import TeenProfile from './views/teen/TeenProfile';
import ParentDashboard from './views/parent/ParentDashboard';
import ParentNotifications from './views/parent/ParentNotifications';
import ParentSettings from './views/parent/ParentSettings';
import ParentOnboarding from './views/parent/ParentOnboarding';
import TaskDetailReadOnly from './views/parent/TaskDetailReadOnly';
import NeighborDashboard from './views/neighbor/NeighborDashboard';
import PostTask from './views/neighbor/PostTask';
import BulkTaskSchedule from './views/neighbor/BulkTaskSchedule';
import NeighborTaskDetail from './views/neighbor/NeighborTaskDetail';
import { ConversationList, ChatView } from './views/shared/Messaging';

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

  // Google user with no profile yet — send them to finish signup
  if (auth?.currentUser && auth?.needsProfileSetup) {
    return <Navigate to="/signup" replace state={{ from: location, fromGoogle: true }} />;
  }

  if (!auth?.isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}

function RedirectIfAuthenticated({ children }) {
  const auth = useAuth();

  if (auth?.loading) {
    return (
      <AppShell>
        <PageState title="Loading" description="Syncing your account." />
      </AppShell>
    );
  }

  // Google user with no profile — let them through to signup
  if (auth?.currentUser && auth?.needsProfileSetup) {
    return children;
  }

  if (auth?.isAuthenticated && auth?.role) {
    if (auth.role === 'teen' && !auth?.profile?.surveyCompleted) {
      return <Navigate to="/teen/survey" replace />;
    }
    if (auth.role === 'parent' && !auth?.profile?.onboardingComplete) {
      return <Navigate to="/parent/onboarding" replace />;
    }
    return <Navigate to={`/${auth.role}`} replace />;
  }

  return children;
}

function RequireRole({ role, children }) {
  const auth = useAuth();

  if (auth?.loading) {
    return (
      <AppShell>
        <PageState title="Loading" description="Syncing your account." />
      </AppShell>
    );
  }

  if (auth?.role && auth.role !== role) {
    return <Navigate to={`/${auth.role}`} replace />;
  }

  return children;
}

function RequireSurveyComplete({ children }) {
  const auth = useAuth();
  const location = useLocation();

  if (auth?.loading) {
    return (
      <AppShell>
        <PageState title="Loading" description="Syncing your account." />
      </AppShell>
    );
  }

  if (auth?.role === 'teen' && !auth?.profile?.surveyCompleted && location.pathname !== '/teen/survey') {
    return <Navigate to="/teen/survey" replace />;
  }

  if (auth?.role === 'teen' && auth?.profile?.surveyCompleted && location.pathname === '/teen/survey') {
    return <Navigate to="/teen" replace />;
  }

  return children;
}

function RequireParentOnboarding({ children }) {
  const auth = useAuth();
  const location = useLocation();

  if (auth?.loading) {
    return (
      <AppShell>
        <PageState title="Loading" description="Syncing your account." />
      </AppShell>
    );
  }

  // Redirect to onboarding if not complete (unless already there)
  if (auth?.role === 'parent' && !auth?.profile?.onboardingComplete && location.pathname !== '/parent/onboarding') {
    return <Navigate to="/parent/onboarding" replace />;
  }

  // If onboarding is complete and they're at the onboarding page, send to dashboard
  if (auth?.role === 'parent' && auth?.profile?.onboardingComplete && location.pathname === '/parent/onboarding') {
    return <Navigate to="/parent" replace />;
  }

  return children;
}

export default function App() {
  useEffect(() => {
    if (!firebaseReady) return;
    seedDemoData().catch(() => { });
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      <Route
        path="/login"
        element={
          <RedirectIfAuthenticated>
            <Login />
          </RedirectIfAuthenticated>
        }
      />
      <Route
        path="/signup"
        element={
          <RedirectIfAuthenticated>
            <Signup />
          </RedirectIfAuthenticated>
        }
      />
      <Route path="/signup/role" element={<Navigate to="/signup" replace />} />
      <Route path="/accept-parent-invite" element={<AcceptParentInvite />} />
      <Route
        path="/teen/survey"
        element={
          <RequireAuth>
            <RequireRole role="teen">
              <SkillsSurvey />
            </RequireRole>
          </RequireAuth>
        }
      />
      <Route
        path="/teen"
        element={
          <RequireAuth>
            <RequireRole role="teen">
              <RequireSurveyComplete>
                <TeenDashboard />
              </RequireSurveyComplete>
            </RequireRole>
          </RequireAuth>
        }
      />
      <Route
        path="/teen/dashboard"
        element={
          <RequireAuth>
            <RequireRole role="teen">
              <RequireSurveyComplete>
                <TeenDashboard />
              </RequireSurveyComplete>
            </RequireRole>
          </RequireAuth>
        }
      />
      <Route
        path="/teen/task/:taskId"
        element={
          <RequireAuth>
            <RequireRole role="teen">
              <RequireSurveyComplete>
                <TaskDetail />
              </RequireSurveyComplete>
            </RequireRole>
          </RequireAuth>
        }
      />
      <Route
        path="/teen/active"
        element={
          <RequireAuth>
            <RequireRole role="teen">
              <RequireSurveyComplete>
                <ActiveTask />
              </RequireSurveyComplete>
            </RequireRole>
          </RequireAuth>
        }
      />
      <Route
        path="/teen/earnings"
        element={
          <RequireAuth>
            <RequireRole role="teen">
              <RequireSurveyComplete>
                <Earnings />
              </RequireSurveyComplete>
            </RequireRole>
          </RequireAuth>
        }
      />
      <Route
        path="/teen/profile"
        element={
          <RequireAuth>
            <RequireRole role="teen">
              <RequireSurveyComplete>
                <TeenProfile />
              </RequireSurveyComplete>
            </RequireRole>
          </RequireAuth>
        }
      />
      <Route
        path="/parent/onboarding"
        element={
          <RequireAuth>
            <RequireRole role="parent">
              <ParentOnboarding />
            </RequireRole>
          </RequireAuth>
        }
      />
      <Route
        path="/parent"
        element={
          <RequireAuth>
            <RequireRole role="parent">
              <RequireParentOnboarding>
                <ParentDashboard />
              </RequireParentOnboarding>
            </RequireRole>
          </RequireAuth>
        }
      />
      <Route
        path="/parent/settings"
        element={
          <RequireAuth>
            <RequireRole role="parent">
              <RequireParentOnboarding>
                <ParentSettings />
              </RequireParentOnboarding>
            </RequireRole>
          </RequireAuth>
        }
      />
      <Route
        path="/parent/notifications"
        element={
          <RequireAuth>
            <RequireRole role="parent">
              <RequireParentOnboarding>
                <ParentNotifications />
              </RequireParentOnboarding>
            </RequireRole>
          </RequireAuth>
        }
      />
      <Route
        path="/parent/task/:taskId"
        element={
          <RequireAuth>
            <RequireRole role="parent">
              <RequireParentOnboarding>
                <TaskDetailReadOnly />
              </RequireParentOnboarding>
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
        path="/neighbor/bulk-schedule"
        element={
          <RequireAuth>
            <RequireRole role="neighbor">
              <BulkTaskSchedule />
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
      <Route
        path="/messages"
        element={
          <RequireAuth>
            <ConversationList />
          </RequireAuth>
        }
      />
      <Route
        path="/messages/:conversationId"
        element={
          <RequireAuth>
            <ChatView />
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
