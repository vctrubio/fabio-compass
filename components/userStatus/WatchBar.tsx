'use client'
import { useState, useEffect } from "react";
import { Settings, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import SettingsBar from "@/components/userStatus/SettingsBar";
import NotificationBar, { useNotifications } from "@/components/userStatus/NotificationBar";
import { useWalletContext } from "@/providers/WalletProvider";

export default function WatchBar() {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [isOnline, setIsOnline] = useState(true);
    const { wallet, isLoading } = useWalletContext();

    // Use the notifications hook
    const {
        notifications,
        unreadCount,
        markAsRead,
        deleteNotification,
        markAllAsRead,
        clearAllNotifications
    } = useNotifications();

    // Monitor online/offline status
    useEffect(() => {
        const updateOnlineStatus = () => {
            setIsOnline(navigator.onLine);
        };

        // Set initial status
        setIsOnline(navigator.onLine);

        // Listen for online/offline events
        window.addEventListener('online', updateOnlineStatus);
        window.addEventListener('offline', updateOnlineStatus);

        // Cleanup listeners
        return () => {
            window.removeEventListener('online', updateOnlineStatus);
            window.removeEventListener('offline', updateOnlineStatus);
        };
    }, []);

    // Don't show WatchBar if user is not authenticated or still loading
    if (!wallet?.status || isLoading || !wallet) {
        return null;
    }

    return (
        <>
            {/* Watch Bar */}
            <div className="fixed top-4 right-4 z-30 flex flex-col gap-2">
                {/* Main buttons */}
                <div className={`flex items-center gap-2 bg-background/95 backdrop-blur-sm border rounded-lg p-2 shadow-lg ${isOnline
                    ? 'border-gray-200 dark:border-gray-700'
                    : 'border-red-500 dark:border-red-400'
                    }`}>

                    {/* Notifications */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsNotificationOpen(true)}
                        className="h-9 w-9 p-0 relative"
                    >
                        <Bell className="h-4 w-4" />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </Button>

                    {/* Settings */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsSettingsOpen(true)}
                        className="h-9 w-9 p-0"
                    >
                        <Settings className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Settings Panel */}
            <SettingsBar
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                wallet={wallet}
            />

            {/* Notification Panel */}
            <NotificationBar
                isOpen={isNotificationOpen}
                onClose={() => setIsNotificationOpen(false)}
                notifications={notifications}
                onMarkAsRead={markAsRead}
                onDelete={deleteNotification}
                onMarkAllAsRead={markAllAsRead}
                onClearAll={clearAllNotifications}
            />
        </>
    );
}