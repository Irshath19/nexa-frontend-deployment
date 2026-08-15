import { useThemeStore, applyTheme } from '@/app/store';
import type { Theme } from '@/types';

const themes: { value: Theme; label: string; description: string }[] = [
  { value: 'light', label: 'Light', description: 'Always use light mode' },
  { value: 'dark', label: 'Dark', description: 'Always use dark mode' },
  { value: 'system', label: 'System', description: 'Follow your OS preference' },
];

export default function SettingsPage() {
  const { theme, setTheme } = useThemeStore();

  return (
    <div className="max-w-2xl mx-auto px-6 py-8 page-enter">
      <div className="mb-8">
        <h1 className="text-page-title text-zinc-900 dark:text-zinc-100">Settings</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Customize your NEXA workspace
        </p>
      </div>

      <div className="space-y-6">
        {/* Appearance */}
        <section className="nexa-card p-5">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-1">Appearance</h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">Choose your preferred color theme.</p>

          <div className="space-y-2">
            {themes.map((t) => (
              <label
                key={t.value}
                className="flex items-center gap-3 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                <input
                  type="radio"
                  name="theme"
                  value={t.value}
                  checked={theme === t.value}
                  onChange={() => { setTheme(t.value); applyTheme(t.value); }}
                  className="accent-indigo-600"
                />
                <div>
                  <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t.label}</p>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500">{t.description}</p>
                </div>
              </label>
            ))}
          </div>
        </section>

        {/* About */}
        <section className="nexa-card p-5">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-1">About NEXA</h2>
          <div className="space-y-2 text-sm text-zinc-500 dark:text-zinc-400">
            <div className="flex items-center gap-2">
              <span className="text-indigo-600 dark:text-indigo-400 font-bold">✦</span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">NEXA</span>
              <span className="badge badge-muted">v1.0.0</span>
            </div>
            <p>A premium personal AI productivity workspace with intelligent email management.</p>
          </div>
        </section>
      </div>
    </div>
  );
}
