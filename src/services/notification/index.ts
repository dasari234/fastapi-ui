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

  public async notificationsMarkAllRead<T>(): Promise<T | undefined> {
    return UseApi.request(HttpMethod.PUT, `/notifications/read-all`, {});
  }

  public async notificationMarkAsRead<T>(id: number): Promise<T | undefined> {
    return UseApi.request(HttpMethod.PUT, `/notifications/${id}/read`, {});
  }

  public async getAllNotifications(): Promise<NotificationResponse> {
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
}

export default new NotificationService();
