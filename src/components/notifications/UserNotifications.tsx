import {
    Bell,
    CheckCircle,
    Loader2,
    Sparkles,
    Trash2,
    Wifi,
    WifiOff,
    X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useWebSocket } from "../../hooks";
import { useClickOutside } from "../../hooks/use-click-outside";
import { websocketManager } from "../../lib/websocketManager";
import UserService from "../../services/userService";
import { useNotificationStore } from "../../stores/notificationStore";
import type { Notification } from "../../types";

export const UserNotifications = () => {
  const [isOpen, setIsOpen] = useState(false);
  const notificationRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const hasFetchedOnceRef = useRef(false);
  const [newNotifications, setNewNotifications] = useState<Set<number>>(
    new Set()
  );
  const hasFetchedRef = useRef(false);

  const {
    notifications,
    unreadCount,
    wsState,
    isLoading,
    clearNotifications,
    fetchNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  } = useNotificationStore();

  // Get token
  const token = UserService.accessToken();
  const wsUrl = `${import.meta.env.VITE_APP_WS_URL}/notifications/ws`;

  const { markAsRead: wsMarkAsRead, isConnected } = useWebSocket(wsUrl, token);

  useEffect(() => {
    return () => {
      // Clean up WebSocket when app unmounts
      websocketManager.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchNotifications();
    }
  }, [fetchNotifications]);

  useEffect(() => {
    if (isOpen && !hasFetchedOnceRef.current && !isLoading) {
      fetchNotifications().then(() => {
        hasFetchedOnceRef.current = true;
      });
    }
  }, [isOpen, isLoading, fetchNotifications]);

  // Clear new notifications indicator when panel closes
  useEffect(() => {
    if (!isOpen) {
      setNewNotifications(new Set());
    }

    if (isOpen) {
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }

    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [isOpen]);

  const handleNotificationClick = useCallback(
    async (notification: Notification) => {
      if (!notification.is_read) {
        const notificationId = Number(notification.id);

        await markNotificationAsRead(notificationId);
        wsMarkAsRead(notificationId);

        setNewNotifications((prev) => {
          const updated = new Set(prev);
          updated.delete(notificationId);
          return updated;
        });
      }
    },
    [markNotificationAsRead, wsMarkAsRead]
  );

  const handleMarkAllAsRead = useCallback(async () => {
    await markAllNotificationsAsRead();
    setNewNotifications(new Set());
  }, [markAllNotificationsAsRead]);

  const handleClearAll = useCallback(() => {
    clearNotifications();
    setNewNotifications(new Set());
  }, [clearNotifications]);

  const handlePanelClick = (e: React.MouseEvent) => {
    // Prevent the click from bubbling to the document and triggering useClickOutside
    e.stopPropagation();
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const getTypeStyles = (type: string) => {
    const baseStyles = "border-l-4";
    switch (type) {
      case "success":
        return `${baseStyles} border-l-green-500`;
      case "warning":
        return `${baseStyles} border-l-yellow-500`;
      case "error":
        return `${baseStyles} border-l-red-500`;
      default:
        return `${baseStyles} border-l-blue-500`;
    }
  };

  const isNewNotification = (notification: Notification) => {
    return newNotifications.has(Number(notification.id));
  };

  useClickOutside(
    () => {
      setIsOpen(false);
    },
    undefined,
    [notificationRef, panelRef]
  );

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        className="relative p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors duration-200"
        ref={notificationRef}
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="size-5 animate-spin" />
        ) : (
          <Bell className="size-5" />
        )}

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Panel */}
      {isOpen && (
        <div
          className="absolute right-0 top-full mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 flex flex-col"
          ref={panelRef}
          onClick={handlePanelClick}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-2 border-b border-gray-200">
            <h3 className="flex items-center text-lg font-semibold text-gray-900">
              {UserService.isAdmin() ? "All Notifications" : "Notifications"}
              <div className="flex items-center ml-2">
                {isConnected ? (
                  <Wifi className="w-3 h-3 text-green-500 mr-1" />
                ) : (
                  <WifiOff className="w-3 h-3 text-red-500 mr-1" />
                )}
              </div>
            </h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsOpen(false)}
                className="cursor-pointer flex items-center p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>

          <div className="p-3 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center text-sm text-gray-500">
              <span>{unreadCount} unread</span>
              <div className="flex items-center space-x-2">
                {notifications.length > 0 && (
                  <>
                    <button
                      onClick={handleMarkAllAsRead}
                      disabled={unreadCount === 0}
                      className="cursor-pointer flex items-center p-2 text-gray-400 hover:text-green-600 transition-colors disabled:opacity-50"
                    >
                      <CheckCircle className="w-3 h-3" />{" "}
                      <span className="text-sm pl-1">Mark all as read</span>
                    </button>
                    <button
                      onClick={handleClearAll}
                      className="cursor-pointer flex items-center p-2 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />{" "}
                      <span className="text-sm pl-1">Clear all</span>
                    </button>
                  </>
                )}
              </div>
            </div>
            {wsState.error && (
              <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded">
                {wsState.error}
              </div>
            )}
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                <span className="ml-2 text-gray-500">
                  Loading notifications...
                </span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                <p>No notifications</p>
                <p className="text-sm mt-1">You're all caught up!</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`m-2 rounded-md p-2 border-b border-gray-100 cursor-pointer transition-all duration-200 hover:bg-gray-50 relative ${
                    notification.is_read ? "bg-white" : "bg-blue-50"
                  } ${getTypeStyles(notification.type)} ${
                    isNewNotification(notification)
                      ? "ring-2 ring-blue-200"
                      : ""
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  {/* New notification indicator */}
                  {isNewNotification(notification) && (
                    <div className="absolute top-2 right-2">
                      <Sparkles className="w-3 h-3 text-blue-500 animate-pulse" />
                    </div>
                  )}

                  {UserService.isAdmin() && notification.user_details && (
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-xs text-white font-semibold uppercase">
                            {notification.user_details.first_name?.[0]}
                            {notification.user_details.last_name?.[0]}
                          </span>
                        </div>
                        <span className="text-xs text-gray-600 font-medium">
                          {notification.user_details.first_name}{" "}
                          {notification.user_details.last_name}
                        </span>
                        <span className="text-xs text-gray-400">
                          ({notification.user_details.email})
                        </span>
                      </div>
                      {notification.user_details.role === "admin" && (
                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                          Admin
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-gray-900 text-sm flex-1 mr-2">
                      {notification.title}
                    </h4>
                    <div className="flex flex-col items-end">
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {formatTime(notification.created_at)}
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatDate(notification.created_at)}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {notification.message}
                  </p>
                  {notification.action_type && (
                    <div className="text-xs text-gray-500 capitalize">
                      {notification.action_type.replace(/_/g, " ")}
                    </div>
                  )}
                  {!notification.is_read && (
                    <div className="flex items-center mt-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
                      <span className="text-xs text-blue-600">Unread</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
