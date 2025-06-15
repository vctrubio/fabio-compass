'use client'
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import {
  Settings,
  Moon,
  Sun,
  Monitor,
  User,
  X,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Wallet } from "@/rails/types";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useWalletContext } from "@/providers/WalletProvider";
import { toast } from "sonner";

interface SettingsBarProps {
  isOpen: boolean;
  onClose: () => void;
  wallet: Wallet | null;
}

// Theme Settings Component
interface ThemeSettingsProps {
  theme: string | undefined;
  setTheme: (theme: string) => void;
  mounted: boolean;
}

function ThemeSettings({ theme, setTheme, mounted }: ThemeSettingsProps) {
  return (
    <div className="space-y-3">
 
      <div className="space-y-2">
        
        <div className="w-full flex justify-around mt-2">
          <Button
            variant={theme === 'light' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTheme('light')}
            className="h-auto p-3 flex-col gap-2"
          >
            <Sun className="h-4 w-4" />
            <span className="text-xs">Light Poniente</span>
          </Button>
          <Button
            variant={theme === 'dark' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTheme('dark')}
            className="h-auto p-3 flex-col gap-2"
          >
            <Moon className="h-4 w-4" />
            <span className="text-xs">Strong Levante</span>
          </Button>

        </div>
      </div>
    </div>
  );
}

export default function SettingsBar({ isOpen, onClose, wallet }: SettingsBarProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { signOut } = useWalletContext();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    try {
      toast.loading("Signing out...", { id: "logout" });
      
      await signOut();
      onClose(); // Close the settings panel
      
      toast.success("Successfully signed out!", { id: "logout" });
      
      // Force a page refresh and redirect
      window.location.href = "/auth/login";
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to sign out. Please try again.", { id: "logout" });
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />
      
      {/* Settings Panel */}
      <div className="fixed top-0 right-0 h-full w-80 bg-background border-l border-border z-50 shadow-2xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              <h2 className="font-semibold">Settings</h2>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* User Info */}
            {wallet && (
              <div className="space-y-3">
                <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                  User Information
                </h3>
                <div className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                  <User className="h-4 w-4" />
                  <div className="flex-1">
                    <div className="font-medium text-sm">{wallet.email || 'No email'}</div>
                    <div className="text-xs text-muted-foreground capitalize">
                      {wallet.role} • {wallet.status ? 'Authenticated' : 'Guest'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Theme Settings */}
            <ThemeSettings theme={theme} setTheme={setTheme} mounted={mounted} />
          </div>

          {/* Footer */}
          {wallet?.status && (
            <div className="p-4 border-t border-border">
              <Button 
                variant="outline" 
                className="w-full justify-start gap-2"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}