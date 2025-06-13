import { HelmetIcon } from "@/assets/svg/HelmetIcon";
import Navbar from "@/components/navbar";
import WatchBar from "@/components/watchbar/WatchBar";

export default function StudentPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen flex flex-col items-center justify-center p-8">
        <div className="flex flex-col items-center gap-6">
          <div className="p-8 border-2 border-yellow-500 bg-transparent rounded-xl shadow-lg">
            <HelmetIcon className="h-24 w-24 text-slate-700 dark:text-slate-200" />
          </div>
          <h1 className="text-4xl font-bold text-slate-700 dark:text-slate-300">
            Student Portal
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 text-center max-w-md">
            Welcome to the student section of North Compass. Here you can access your learning materials and track your progress.
          </p>
        </div>
        <WatchBar />
      </main>
    </>
  );
}
