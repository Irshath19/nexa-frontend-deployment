import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants';

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-dvh bg-zinc-50 dark:bg-zinc-950 p-8 text-center">
      <div className="mb-6">
        <span className="text-indigo-500 text-4xl font-bold">✦</span>
      </div>
      <h1 className="text-6xl font-bold text-zinc-200 dark:text-zinc-800 mb-4">404</h1>
      <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">Page not found</h2>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-8 max-w-xs">
        This page doesn't exist or has been moved. Let's get you back on track.
      </p>
      <Link to={ROUTES.DASHBOARD} className="btn-primary">
        Back to Dashboard
      </Link>
    </div>
  );
}
