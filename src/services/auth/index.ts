import { HttpMethod } from "../../types";
import UseApi from "../use-api";

class AuthService {
  public async login(payload: Record<string, string>): Promise<undefined> {
    return UseApi.request(HttpMethod.POST, "/auth/login", {
      data: payload,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
  }

  public async refreshToken(
    refresh_token: Record<string, string>
  ): Promise<undefined> {
    return UseApi.request(HttpMethod.POST, "/auth/refresh", {
      data: refresh_token,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  public async logout(): Promise<undefined> {
    return UseApi.request(HttpMethod.POST, "/auth/logout", {
      data: {},
    });
  }

  public async changePassword(newPassword: string): Promise<undefined> {
    return UseApi.request(HttpMethod.POST, "/auth/reset-password", {
      data: {
        new_password: newPassword,
      },
    });
  }

  public async resetPassword(payload: Record<string, string>): Promise<undefined> {
    return UseApi.request(HttpMethod.POST, "/auth/reset-password", {
      data: {
        payload,
      },
    });
  }

  public async forgotPassword(email: string): Promise<undefined> {
    return UseApi.request(HttpMethod.POST, "/auth/forgot-password", {
      data: {
        email: email,
      },
    });
  }
}

export default new AuthService();
