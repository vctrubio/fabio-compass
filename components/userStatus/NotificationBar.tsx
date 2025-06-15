'use client'
import { useState, useEffect } from "react";
import {
  Bell,
  X,
  Clock,
  Check,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";

export interface NotificationItem {
  id: string;
  msg: string;
  timestamp: number;
  read?: boolean;
}

// Custom hook to manage notifications
export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Initialize with sample notifications on first load
  useEffect(() => {
    const now = Date.now();
    const sampleNotifications: NotificationItem[] = [
      // Add sample notifications here if needed
    ];
    setNotifications(sampleNotifications);
  }, []);

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev =>
      prev.filter(notification => notification.id !== id)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    unreadCount,
    markAsRead,
    deleteNotification,
    markAllAsRead,
    clearAllNotifications
  };
}

interface NotificationBarProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
}

export default function NotificationBar({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onDelete,
  onMarkAllAsRead,
  onClearAll
}: NotificationBarProps) {
  if (!isOpen) return null;

  const formatTimestamp = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else {
      return `${days}d ago`;
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />
      
      {/* Notification Panel */}
      <div className="fixed top-0 right-0 h-full w-80 bg-background border-l border-border z-50 shadow-2xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              <h2 className="font-semibold">Notifications</h2>
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                  {notifications.filter(n => !n.read).length}
                </span>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Actions */}
          {notifications.length > 0 && (
            <div className="flex items-center gap-2 p-4 border-b border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={onMarkAllAsRead}
                className="flex-1"
              >
                <Check className="h-3 w-3 mr-1" />
                Mark All Read
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onClearAll}
                className="flex-1"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Clear All
              </Button>
            </div>
          )}

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-6">
                <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-medium text-foreground mb-2">No notifications</h3>
                <p className="text-sm text-muted-foreground">
                  You're all caught up! New notifications will appear here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-muted/50 transition-colors ${
                      !notification.read ? 'bg-primary/5 border-l-2 border-l-primary' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${!notification.read ? 'font-medium' : ''}`}>
                          {notification.msg}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {formatTimestamp(notification.timestamp)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onMarkAsRead(notification.id)}
                            className="h-6 w-6 p-0"
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(notification.id)}
                          className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}