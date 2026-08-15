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
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8 page-enter">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">Settings</h1>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Customize your NEXA workspace preferences
        </p>
      </div>

      <div className="space-y-5 sm:space-y-6">
        {/* Appearance */}
        <section className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-1">Appearance</h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">Choose your preferred color theme.</p>

          <div className="space-y-2">
            {themes.map((t) => (
              <label
                key={t.value}
                className="flex items-center gap-3.5 p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-700/80 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/80 transition-colors"
              >
                <input
                  type="radio"
                  name="theme"
                  value={t.value}
                  checked={theme === t.value}
                  onChange={() => { setTheme(t.value); applyTheme(t.value); }}
                  className="accent-indigo-600 w-4 h-4 cursor-pointer"
                />
                <div>
                  <p className="text-xs sm:text-sm font-bold text-zinc-800 dark:text-zinc-200">{t.label}</p>
                  <p className="text-[11px] text-zinc-400 dark:text-zinc-500">{t.description}</p>
                </div>
              </label>
            ))}
          </div>
        </section>

        {/* About */}
        <section className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-1">About NEXA</h2>
          <div className="space-y-2 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
            <div className="flex items-center gap-2">
              <span className="text-indigo-600 dark:text-indigo-400 font-bold">✦</span>
              <span className="font-bold text-zinc-900 dark:text-zinc-100">NEXA</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">v1.0.0</span>
            </div>
            <p className="text-xs leading-relaxed">A personal AI productivity workspace with intelligent email management and automated job search discovery.</p>
          </div>
        </section>
      </div>
    </div>
  );
}
