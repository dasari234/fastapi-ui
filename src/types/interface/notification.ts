export interface UserDetails {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
}

export interface Notification {
  id: string | number;
  user_id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  action_type: string;
  action_data?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  is_read: boolean;
  is_sent?: boolean;
  created_at: string;
  read_at?: string;
  is_realtime?: boolean;
  is_admin_notification?: boolean;
  target_user_id?: number;
  user_details?: UserDetails;
}

export interface ConnectionStats {
  total_users: number;
  total_connections: number;
  admin_users: number;
  active_user_ids: number[];
}

export interface WebSocketState {
  isConnected: boolean;
  error: string | null;
  connectionStats: ConnectionStats | null;
}

export interface NotificationState {
  notifications: Notification[];
  adminNotifications: Notification[];
  // WebSocket state
  wsState: WebSocketState;
  
  // Actions
  addNotification: (notification: Notification) => void;
  addAdminNotification: (notification: Notification) => void;
  markAsRead: (notificationId: string | number) => void;
  clearNotifications: () => void;
  clearAdminNotifications: () => void;
  setConnectionStatus: (isConnected: boolean) => void;
  setError: (error: string | null) => void;
  setConnectionStats: (stats: ConnectionStats) => void;
  
  // Computed values
  unreadCount: number;
  adminUnreadCount: number;
  totalNotifications: number;
  totalAdminNotifications: number;
}