import { HttpMethod } from "../../types";
import UseApi from "../use-api";

export interface NotificationResponse {
  success: boolean;
  data: {
    notifications: unknown[];
  };
}

class NotificationService {
  public async getNotifications(): Promise<NotificationResponse> {
    const response = await UseApi.request<NotificationResponse>(
      HttpMethod.GET,
      "/notifications",
      {}
    );

    return (
      response ?? {
        success: false,
        data: { notifications: [] },
      }
    );
  }

  public async getUnreadNotifications(): Promise<NotificationResponse> {
    const response = await UseApi.request<NotificationResponse>(
      HttpMethod.GET,
      "/notifications?unread_only=true",
      {}
    );

    return (
      response ?? {
        success: false,
        data: { notifications: [] },
      }
    );
  }

  public async notificationsMarkAllRead<T>(): Promise<T | undefined> {
    return UseApi.request(HttpMethod.PUT, `/notifications/read-all`, {});
  }

  public async notificationMarkAsRead<T>(id: number): Promise<T | undefined> {
    return UseApi.request(HttpMethod.PUT, `/notifications/${id}/read`, {});
  }

  public async adminGetAllNotifications(): Promise<NotificationResponse> {
    const response = await UseApi.request<NotificationResponse>(
      HttpMethod.GET,
      "/notifications/admin/all",
      {}
    );

    return (
      response ?? {
        success: false,
        data: { notifications: [] },
      }
    );
  }

  public async adminGetAllUnreadNotifications(): Promise<NotificationResponse> {
    const response = await UseApi.request<NotificationResponse>(
      HttpMethod.GET,
      "/notifications/admin/all?unread_only=true",
      {}
    );

    return (
      response ?? {
        success: false,
        data: { notifications: [] },
      }
    );
  }

  public async adminNotificationsMarkAllRead<T>(): Promise<T | undefined> {
    return UseApi.request(HttpMethod.PUT, `/notifications/admin/read-all`, {});
  }

  public async adminNotificationMarkAsRead<T>(
    id: number
  ): Promise<T | undefined> {
    return UseApi.request(
      HttpMethod.PUT,
      `/notifications/admin/${id}/read`,
      {}
    );
  }
}

export default new NotificationService();
