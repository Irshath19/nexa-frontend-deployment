import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { useAuthStore } from '@/app/store';
import { ROUTES } from '@/constants';

// ── Lazy-loaded pages ─────────────────────────────────────────
const LoginPage = lazy(() => import('@/features/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/features/auth/RegisterPage'));
const DashboardPage = lazy(() => import('@/features/dashboard/DashboardPage'));
const ChatPage = lazy(() => import('@/features/chat/ChatPage'));
const EmailPage = lazy(() => import('@/features/emails/EmailPage'));
const JobsPage = lazy(() => import('@/features/jobs/JobsPage'));
const SettingsPage = lazy(() => import('@/features/settings/SettingsPage'));
const ProfilePage = lazy(() => import('@/features/profile/ProfilePage'));
const OAuthCallbackPage = lazy(() => import('@/features/auth/OAuthCallbackPage'));
const NotFoundPage = lazy(() => import('@/features/common/NotFoundPage'));
const ComingSoonPage = lazy(() => import('@/features/common/ComingSoonPage'));

// ── Page loader ───────────────────────────────────────────────
function PageLoader() {
  return (
    <div className="flex items-center justify-center h-full min-h-[400px]">
      <div className="flex flex-col items-center gap-3">
        <span className="text-indigo-500 text-2xl animate-pulse">✦</span>
        <span className="text-sm text-zinc-500">Loading...</span>
      </div>
    </div>
  );
}

// ── Protected route wrapper ───────────────────────────────────
function RequireAuth({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }
  return <>{children}</>;
}

// ── Public route wrapper (redirect if already authed) ─────────
function PublicOnly({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (isAuthenticated) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }
  return <>{children}</>;
}

function withSuspense(element: React.ReactNode) {
  return <Suspense fallback={<PageLoader />}>{element}</Suspense>;
}

export const router = createBrowserRouter([
  // ── Root redirect ───────────────────────────────────────────
  {
    path: '/',
    element: <Navigate to={ROUTES.DASHBOARD} replace />,
  },

  // ── Public routes ───────────────────────────────────────────
  {
    path: ROUTES.LOGIN,
    element: withSuspense(
      <PublicOnly>
        <LoginPage />
      </PublicOnly>
    ),
  },
  {
    path: ROUTES.REGISTER,
    element: withSuspense(
      <PublicOnly>
        <RegisterPage />
      </PublicOnly>
    ),
  },

  // ── OAuth callbacks ─────────────────────────────────────────
  {
    path: '/oauth/:provider/callback',
    element: withSuspense(<OAuthCallbackPage />),
  },

  // ── Protected routes (inside AppShell) ──────────────────────
  {
    element: (
      <RequireAuth>
        <AppShell />
      </RequireAuth>
    ),
    children: [
      {
        path: ROUTES.DASHBOARD,
        element: withSuspense(<DashboardPage />),
      },
      {
        path: ROUTES.CHAT,
        element: withSuspense(<ChatPage />),
      },
      {
        path: ROUTES.EMAILS,
        element: withSuspense(<EmailPage />),
      },
      {
        path: ROUTES.SETTINGS,
        element: withSuspense(<SettingsPage />),
      },
      {
        path: '/profile',
        element: withSuspense(<ProfilePage />),
      },
      {
        path: ROUTES.JOBS,
        element: withSuspense(<JobsPage />),
      },
      {
        path: '/knowledge',
        element: withSuspense(<ComingSoonPage module="Knowledge" icon="🧠" description="Your personal AI knowledge base, always ready to help." />),
      },
      {
        path: '/expenses',
        element: withSuspense(<ComingSoonPage module="Expenses" icon="💰" description="Track and analyze your spending with intelligent categorization." />),
      },
      {
        path: '/calculator',
        element: withSuspense(<ComingSoonPage module="Calculator" icon="🧮" description="Smart calculations with context from your workspace." />),
      },
    ],
  },

  // ── 404 ─────────────────────────────────────────────────────
  {
    path: '*',
    element: withSuspense(<NotFoundPage />),
  },
]);
