import { create } from "zustand";
import NotificationService from "../services/notification";
import UserService from "../services/userService";
import type { Notification, WebSocketState } from "../types";

interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  wsState: WebSocketState;
  isLoading: boolean;
  // Track which notifications we've already seen from WebSocket
  seenNotificationIds: Set<number | string>;
  // Actions
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  markAsRead: (notificationId: number | string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  setWsState: (state: Partial<WebSocketState>) => void;
  setLoading: (loading: boolean) => void;
  // API Actions
  fetchNotifications: () => Promise<void>;
  markNotificationAsRead: (notificationId: number | string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  // New actions for WebSocket management
  addSeenNotificationId: (id: number | string) => void;
  clearSeenNotificationIds: () => void;
  // Admin specific
  adminNotifications: Notification[];
  adminUnreadCount: number;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  adminNotifications: [],
  unreadCount: 0,
  adminUnreadCount: 0,
  isLoading: false,
  seenNotificationIds: new Set<number | string>(),
  wsState: {
    isConnected: false,
    error: null,
    connectionStats: null,
  },

  setNotifications: (notifications) => {
    const isAdmin = UserService.isAdmin();

    // Separate user and admin notifications
    const userNotifications: Notification[] = [];
    const adminNotifications: Notification[] = [];

    notifications.forEach((notification) => {
      if (
        notification.is_admin_notification ||
        notification.action_type?.includes("admin") ||
        notification.action_type === "user_created" ||
        notification.action_type === "user_deleted" ||
        notification.action_type === "file_uploaded_admin"
      ) {
        adminNotifications.push(notification);
      } else {
        userNotifications.push(notification);
      }
    });

    // Sort by created_at descending (newest first)
    const sortedUserNotifications = [...userNotifications].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    const sortedAdminNotifications = [...adminNotifications].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    const userUnreadCount = sortedUserNotifications.filter(
      (n) => !n.is_read
    ).length;
    const adminUnreadCount = sortedAdminNotifications.filter(
      (n) => !n.is_read
    ).length;

    // Add all notification IDs to seen set to prevent duplicates from WebSocket
    const newSeenIds = new Set(get().seenNotificationIds);
    notifications.forEach((notification) => {
      newSeenIds.add(notification.id);
    });

    set({
      notifications: isAdmin
        ? [...sortedAdminNotifications, ...sortedUserNotifications]
        : sortedUserNotifications,
      adminNotifications: sortedAdminNotifications,
      unreadCount: isAdmin
        ? adminUnreadCount + userUnreadCount
        : userUnreadCount,
      adminUnreadCount,
      seenNotificationIds: newSeenIds,
    });
  },

  addNotification: (notification) => {
    const state = get();
    const { notifications, seenNotificationIds } = state;
    const isAdmin = UserService.isAdmin();

    // Atomic duplicate check - do both checks
    if (seenNotificationIds.has(notification.id)) {
      return;
    }

    if (notifications.some((n) => n.id === notification.id)) {
      // Still add to seen IDs to prevent future duplicates
      const updatedSeenIds = new Set(seenNotificationIds);
      updatedSeenIds.add(notification.id);
      set({ seenNotificationIds: updatedSeenIds });
      return;
    }

    // Check if this is an admin notification
    const isAdminNotification =
      notification.is_admin_notification ||
      notification.action_type?.includes("admin") ||
      notification.action_type === "user_created" ||
      notification.action_type === "user_deleted" ||
      notification.action_type === "file_uploaded_admin";

    // For regular users, ignore admin notifications
    if (!isAdmin && isAdminNotification) {
      console.log("Regular user ignoring admin notification:", notification.id);
      return;
    }

    // Add to seen IDs first to prevent race conditions
    const updatedSeenIds = new Set(seenNotificationIds);
    updatedSeenIds.add(notification.id);

    const updatedNotifications = [notification, ...notifications];

    // Calculate counts
    const userNotifications = updatedNotifications.filter(
      (n) =>
        !n.is_admin_notification &&
        !n.action_type?.includes("admin") &&
        n.action_type !== "user_created" &&
        n.action_type !== "user_deleted" &&
        n.action_type !== "file_uploaded_admin"
    );

    const adminNotifications = updatedNotifications.filter(
      (n) =>
        n.is_admin_notification ||
        n.action_type?.includes("admin") ||
        n.action_type === "user_created" ||
        n.action_type === "user_deleted" ||
        n.action_type === "file_uploaded_admin"
    );

    const userUnreadCount = userNotifications.filter((n) => !n.is_read).length;
    const adminUnreadCount = adminNotifications.filter(
      (n) => !n.is_read
    ).length;

    const finalNotifications = isAdmin
      ? updatedNotifications
      : userNotifications;
    const finalUnreadCount = isAdmin
      ? adminUnreadCount + userUnreadCount
      : userUnreadCount;

    set({
      notifications: finalNotifications,
      adminNotifications,
      unreadCount: finalUnreadCount,
      adminUnreadCount,
      seenNotificationIds: updatedSeenIds,
    });
  },

  markAsRead: (notificationId) => {
    const { notifications, adminNotifications } = get();

    const updatedNotifications = notifications.map((notification) =>
      notification.id === notificationId
        ? { ...notification, is_read: true }
        : notification
    );

    const updatedAdminNotifications = adminNotifications.map((notification) =>
      notification.id === notificationId
        ? { ...notification, is_read: true }
        : notification
    );

    const unreadCount = updatedNotifications.filter((n) => !n.is_read).length;
    const adminUnreadCount = updatedAdminNotifications.filter(
      (n) => !n.is_read
    ).length;

    set({
      notifications: updatedNotifications,
      adminNotifications: updatedAdminNotifications,
      unreadCount,
      adminUnreadCount,
    });
  },

  markAllAsRead: () => {
    const { notifications, adminNotifications } = get();

    const updatedNotifications = notifications.map((notification) => ({
      ...notification,
      is_read: true,
    }));

    const updatedAdminNotifications = adminNotifications.map(
      (notification) => ({
        ...notification,
        is_read: true,
      })
    );

    set({
      notifications: updatedNotifications,
      adminNotifications: updatedAdminNotifications,
      unreadCount: 0,
      adminUnreadCount: 0,
    });
  },

  clearNotifications: () => {
    set({
      notifications: [],
      adminNotifications: [],
      unreadCount: 0,
      adminUnreadCount: 0,
    });
  },

  setWsState: (state) => {
    set({ wsState: { ...get().wsState, ...state } });
  },

  setLoading: (loading) => {
    set({ isLoading: loading });
  },

  // New actions for WebSocket management
  addSeenNotificationId: (id: number | string) => {
    const { seenNotificationIds } = get();
    const updatedSeenIds = new Set(seenNotificationIds);
    updatedSeenIds.add(id);
    set({ seenNotificationIds: updatedSeenIds });
  },

  clearSeenNotificationIds: () => {
    set({ seenNotificationIds: new Set<number | string>() });
  },

  // API Methods
  fetchNotifications: async () => {
    const { setLoading, setNotifications } = get();

    try {
      setLoading(true);
      let response;
      if (UserService.isAdmin()) {
        response = await NotificationService.getAllUnreadNotifications();
      } else {
        response = await NotificationService.getUnreadNotifications();
      }

      if (response.success && response.data) {
        const notifications = (response.data.notifications ||
          []) as Notification[];
        setNotifications(notifications);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  },

  markNotificationAsRead: async (notificationId: number | string) => {
    const { markAsRead } = get();

    try {
      const id =
        typeof notificationId === "string"
          ? parseInt(notificationId, 10)
          : notificationId;

      if (isNaN(id)) {
        console.error("Invalid notification ID:", notificationId);
        return;
      }
      // Optimistically update UI
      markAsRead(id);

      // Call API
      await NotificationService.notificationMarkAsRead(id);
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      get().fetchNotifications();
    }
  },

  markAllNotificationsAsRead: async () => {
    const { markAllAsRead } = get();

    try {
      // Optimistically update UI
      markAllAsRead();

      // Call API
      await NotificationService.notificationsMarkAllRead();
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
      get().fetchNotifications();
    }
  },
}));
