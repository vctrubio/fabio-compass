'use client'

import { LoginForm } from "@/components/with-init/login-form";
import { HelmetIcon } from "@/assets/svg/HelmetIcon";
import { HeadsetIcon } from "@/assets/svg/HeadsetIcon";
import { UsersIcon } from "@/assets/svg/UsersIcon";
import usersConfig from "@/config/users.json";
import { quickLogin } from "@/actions/auth";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const ICON_MAP = {
  HelmetIcon,
  HeadsetIcon,
  UsersIcon
} as const;

export default function Page() {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const router = useRouter();

  const handleQuickLogin = async (userKey: string) => {
    const user = usersConfig[userKey as keyof typeof usersConfig];
    if (!user) return;

    setIsLoading(userKey);
    toast.loading(`Logging in as ${user.label}...`, { id: userKey });
    
    try {
      const result = await quickLogin(user.email, user.password, user.route);
      if (result?.error) {
        toast.error(`Login failed: ${result.error}`, { id: userKey });
      } else if (result?.success) {
        toast.success(`Successfully logged in as ${user.label}!`, { id: userKey });
        router.push(result.redirectTo);
      }
    } catch (error) {
      console.error('Quick login error:', error);
      toast.error(`Login error: ${error instanceof Error ? error.message : 'Unknown error'}`, { id: userKey });
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm />
        
        <div className="mt-6 space-y-3">
          <div className="text-sm text-center text-slate-600 dark:text-slate-400 mb-4">
            Quick Login:
          </div>
          
          {Object.entries(usersConfig).map(([key, user]) => {
            const Icon = ICON_MAP[user.icon as keyof typeof ICON_MAP];
            const isButtonLoading = isLoading === key;
            
            return (
              <button 
                key={key}
                onClick={() => handleQuickLogin(key)}
                disabled={isButtonLoading}
                className={`w-full px-4 py-3 text-sm ${user.bgColor} hover:opacity-80 ${user.color} border rounded-md transition-all duration-200 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <div className="p-1">
                  <Icon className={`h-5 w-5 ${user.textColor} ${isButtonLoading ? 'animate-pulse' : ''}`} />
                </div>
                <span className={`font-medium ${user.textColor}`}>
                  {isButtonLoading ? 'Logging in...' : `${user.label} (${user.email})`}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
