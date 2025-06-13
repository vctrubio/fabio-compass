'use client'
import { useState, useEffect } from "react";
import { ThemeSwitcher } from "@/components/theme-switcher";

export default function WatchBar() {
    const [isOnline, setIsOnline] = useState(true);

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

    return (
        <div className={`fixed top-4 right-4 z-30 flex items-center bg-background/95 backdrop-blur-sm rounded-lg p-2 shadow-lg transition-all duration-300 ${
            isOnline 
                ? 'border-0' 
                : 'border-2 border-red-500 animate-pulse'
        }`}>
            {/* Theme Switcher */}
            <ThemeSwitcher />
        </div>
    );
}