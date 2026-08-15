interface ComingSoonPageProps {
  module: string;
  icon: string;
  description: string;
}

export default function ComingSoonPage({ module, icon, description }: ComingSoonPageProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-8 py-20 text-center page-enter">
      <div className="mb-6">
        <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto text-3xl mb-4">
          {icon}
        </div>
        <div className="badge badge-muted mx-auto">Coming soon</div>
      </div>

      <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
        NEXA {module}
      </h1>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xs">
        {description}
      </p>

      <div className="mt-8 p-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg max-w-sm">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          <span className="text-indigo-600 dark:text-indigo-400 font-medium">✦ NEXA</span> is currently focused on delivering intelligent email management.
          More modules are coming soon.
        </p>
      </div>
    </div>
  );
}
