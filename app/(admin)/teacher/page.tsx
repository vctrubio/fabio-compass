import { HeadsetIcon } from "@/assets/svg/HeadsetIcon";

export default function TeacherPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="flex flex-col items-center gap-6">
        <div className="p-8 border-2 border-emerald-600 bg-transparent rounded-xl shadow-lg">
          <HeadsetIcon className="h-24 w-24 text-slate-700 dark:text-slate-200" />
        </div>
        <h1 className="text-4xl font-bold text-slate-700 dark:text-slate-300">
          Teacher Portal
        </h1>
      </div>
    </main>
  );
}
