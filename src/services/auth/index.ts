/* eslint-disable @typescript-eslint/no-explicit-any */
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

  public async getUser(): Promise<any> {
    return UseApi.request(HttpMethod.GET, "/users/me", {});
  }
}

export default new AuthService();
