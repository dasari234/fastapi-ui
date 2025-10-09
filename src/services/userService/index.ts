import { getLocalStorage } from "../../lib/utils";
import { HttpMethod } from "../../types";
import UseApi from "../use-api";

interface User {
  id: string;
  name: string;
  role: string;
}

class UserService {
  public async register<T>(
    payload: Record<string, string>
  ): Promise<T | undefined> {
    const response = UseApi.request<T>(HttpMethod.POST, "/auth/register", {
      data: payload,
    });
    return response;
  }

  public async getUser<T>(): Promise<T | undefined> {
    return UseApi.request(HttpMethod.GET, "/users/me", {});
  }

  public async updateUser<T>(
    id: number,
    payload: Record<string, string | undefined>
  ): Promise<T | undefined> {
    return UseApi.request(HttpMethod.PUT, `/users/${id}`, {
      data: payload,
    });
  }

  public async deleteUser<T>(id: number): Promise<T | undefined> {
    return UseApi.request(HttpMethod.DELETE, `/users/${id}`);
  }

  public async changePassword<T>(
    payload: Record<string, string>
  ): Promise<T | undefined> {
    return UseApi.request(HttpMethod.POST, "/users/change-password", {
      data: payload,
    });
  }

  isAdmin(): boolean {
    const storedUser = getLocalStorage<User>("user");
    if (!storedUser) return false;
    return storedUser?.role === "admin";
  }

  currentUserId() {
    const storedUser = getLocalStorage<User>("user");
    return storedUser?.id;
  }

  accessToken(): string | null {
    const storedToken = getLocalStorage<string | undefined>("accessToken");
    return storedToken ?? null
  }
}

export default new UserService();
