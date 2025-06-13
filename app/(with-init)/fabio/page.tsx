import { UsersIcon } from "@/assets/svg/UsersIcon";

export default function FabioPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="flex flex-col items-center gap-6">
        <div className="p-8 border-2 border-slate-500 bg-transparent rounded-xl shadow-lg">
          <UsersIcon className="h-24 w-24 text-slate-700 dark:text-slate-200" />
        </div>
        <h1 className="text-4xl font-bold text-slate-700 dark:text-slate-300">
          Fabio Portal
        </h1>
      </div>
    </main>
  );
}
