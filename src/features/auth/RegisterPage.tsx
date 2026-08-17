import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, AlertCircle, Check } from 'lucide-react';
import { authApi } from '@/services/api/auth';
import { useAuthStore } from '@/app/store';
import { ROUTES } from '@/constants';
import { toast } from 'sonner';
import { cn } from '@/utils';

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: 'At least 8 characters', pass: password.length >= 8 },
    { label: 'Contains a number', pass: /\d/.test(password) },
    { label: 'Contains uppercase', pass: /[A-Z]/.test(password) },
  ];
  const score = checks.filter((c) => c.pass).length;
  const colors = ['bg-red-400', 'bg-amber-400', 'bg-emerald-400', 'bg-emerald-500'];

  if (!password) return null;

  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {checks.map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-1 flex-1 rounded-full transition-colors duration-300',
              i < score ? colors[score - 1] : 'bg-zinc-200 dark:bg-zinc-700'
            )}
          />
        ))}
      </div>
      <div className="space-y-1">
        {checks.map((check) => (
          <div key={check.label} className={cn('flex items-center gap-1.5 text-xs', check.pass ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400')}>
            <Check size={10} className={check.pass ? 'opacity-100' : 'opacity-0'} />
            <span className={check.pass ? '' : 'ml-3.5'}>{check.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function RegisterPage() {
  const { setUser } = useAuthStore();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);
    try {
      const result = await authApi.register({ email, password, displayName });
      setUser(result.data.user);
      toast.success('Welcome to NEXA! 🎉');
      window.location.href = ROUTES.DASHBOARD;
    } catch (err) {
      const msg = (err as { message?: string }).message || 'Failed to create account';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-6">
            <span className="text-indigo-600 dark:text-indigo-400 font-bold text-3xl">✦</span>
            <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">NEXA</span>
          </div>
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Create your account</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Get started with NEXA — it's free
          </p>
        </div>

        <div className="nexa-card p-6">
          {error && (
            <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-md text-sm text-red-700 dark:text-red-400 animate-fade-in">
              <AlertCircle size={15} className="flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="reg-name" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                Full name
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                <input
                  id="reg-name"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your name"
                  required
                  autoFocus
                  autoComplete="name"
                  className="nexa-input !pl-10"
                />
              </div>
            </div>

            <div>
              <label htmlFor="reg-email" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                <input
                  id="reg-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                  className="nexa-input !pl-10"
                />
              </div>
            </div>

            <div>
              <label htmlFor="reg-password" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  required
                  autoComplete="new-password"
                  className="nexa-input !pl-10 !pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <PasswordStrength password={password} />
            </div>

            <button
              type="submit"
              disabled={isLoading || !displayName || !email || !password}
              id="register-submit"
              className="btn-primary w-full mt-2"
            >
              {isLoading ? (
                <>
                  <span className="thinking-dots"><span /><span /><span /></span>
                  Creating account...
                </>
              ) : (
                <>Create account <ArrowRight size={15} /></>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 mt-4">
          Already have an account?{' '}
          <Link to={ROUTES.LOGIN} className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
