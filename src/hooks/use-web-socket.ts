import { useCallback, useEffect, useRef } from "react";
import { websocketManager } from "../lib/websocketManager";
import UserService from "../services/userService";
import { useNotificationStore } from "../stores/notificationStore";

// Global cache for deduplication
const recentlyProcessed = new Set<number | string>();

import { toast } from "react-toastify/unstyled";
import type { Notification, WebSocketState } from "../types";

interface WebSocketMessage {
  type: string;
  data?: Notification | unknown;
  message?: string;
}

export const useWebSocket = (url: string, token: string | null) => {
  const { addNotification, setWsState, fetchNotifications } =
    useNotificationStore();
  const isAdmin = UserService.isAdmin();
  const currentUserId = UserService.currentUserId?.();
  const initializedRef = useRef(false);
  const subscribedRef = useRef(false);

  useEffect(() => {
    if (!token || initializedRef.current) return;
    initializedRef.current = true;

    console.log("Initializing WebSocket connection");

    websocketManager.connect(url, token).then((success) => {
      setWsState({
        isConnected: success,
        error: success ? null : "Failed to connect",
      });
      if (success) fetchNotifications();
    });

    // Prevent duplicate subscriptions
    if (subscribedRef.current) return;
    subscribedRef.current = true;

    const unsubscribe = websocketManager.subscribe(
      (message: WebSocketMessage) => {
        if (!message || !message.type) return;

        // Handle notification messages
        if (
          message.type === "notification" ||
          message.type === "admin_notification"
        ) {
          const notif = message.data as Notification;
          const id = notif?.id;

          if (!notif || !id) return;

          // Ignore WebSocket temp IDs
          if (typeof id === "string" && id.startsWith("ws_")) {
            return;
          }

          // Role filtering (admin vs user)
          if (!isAdmin && notif.user_id !== Number(currentUserId)) return;

          // Duplicate guard
          if (recentlyProcessed.has(id)) return;

          recentlyProcessed.add(id);
          setTimeout(() => recentlyProcessed.delete(id), 5000);

          addNotification(notif);
          if(notif.is_admin_notification){
            toast.success(`${notif.message}`);
          }
          return;
        }

        // Other message types
        switch (message.type) {
          case "connection_established":
            console.info("Connection established:", message.message);
            break;
          case "connection_stats":
            setWsState({ connectionStats: message.data as WebSocketState["connectionStats"] });
            break;
          case "error":
            console.error("WebSocket error:", message.message);
            setWsState({ error: message.message || "Unknown error" });
            break;
          default:
            console.info("Unknown WebSocket message type:", message.type);
        }
      }
    );

    return () => unsubscribe();
  }, [
    url,
    token,
    isAdmin,
    currentUserId,
    addNotification,
    setWsState,
    fetchNotifications,
  ]);

  const markAsRead = useCallback((notificationId: number) => {
    websocketManager.send({
      type: "mark_as_read",
      notification_id: notificationId,
    });
  }, []);

  const ping = useCallback(() => {
    websocketManager.send({ type: "ping" });
  }, []);

  const getStats = useCallback(() => {
    if (isAdmin) websocketManager.send({ type: "get_stats" });
  }, [isAdmin]);

  const connectionState = websocketManager.getConnectionState();

  return {
    markAsRead,
    ping,
    getStats,
    isConnected: connectionState === "connected",
    isConnecting: connectionState === "connecting",
  };
};
