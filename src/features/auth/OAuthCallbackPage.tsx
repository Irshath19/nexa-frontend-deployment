import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle } from 'lucide-react';
import { useAuthStore } from '@/app/store';
import { ROUTES } from '@/constants';
import { toast } from 'sonner';

export default function OAuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const status = searchParams.get('status');
  const provider = searchParams.get('provider');
  const errorMessage = searchParams.get('error');
  const token = searchParams.get('token');
  const { setUser } = useAuthStore();

  useEffect(() => {
    if (status === 'success') {
      // Save token if provided (e.g., for initial Gmail sign-in)
      if (token) {
        localStorage.setItem('nexa_access_token', token);
      }

      toast.success(
        provider === 'gmail'
          ? 'Gmail account connected successfully!'
          : 'Outlook account connected successfully!'
      );

      // Redirect to emails page
      setTimeout(() => {
        window.location.href = ROUTES.EMAILS;
      }, 1500);
    } else if (status === 'error') {
      setTimeout(() => {
        window.location.href = ROUTES.EMAILS;
      }, 3000);
    }
  }, [status, provider, token, setUser]);

  return (
    <div className="min-h-dvh bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-4">
      <div className="nexa-card p-8 max-w-sm w-full text-center">
        {status === 'success' ? (
          <>
            <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={24} className="text-emerald-500" />
            </div>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
              Account Connected
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Your {provider === 'gmail' ? 'Gmail' : 'Outlook'} account has been connected.
              Redirecting you to your emails...
            </p>
          </>
        ) : (
          <>
            <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-950 flex items-center justify-center mx-auto mb-4">
              <XCircle size={24} className="text-red-500" />
            </div>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
              Connection Failed
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">
              {errorMessage || 'Something went wrong during authentication.'}
            </p>
            <p className="text-xs text-zinc-400 dark:text-zinc-500">
              Redirecting you back...
            </p>
          </>
        )}

        {/* Animated progress indicator */}
        <div className="mt-6 flex justify-center">
          <span className="text-indigo-500 text-lg animate-pulse">✦</span>
        </div>
      </div>
    </div>
  );
}
