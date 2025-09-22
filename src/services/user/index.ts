/* eslint-disable @typescript-eslint/no-explicit-any */
import { getLocalStorage } from "../../lib/utils";
import { HttpMethod } from "../../types";
import UseApi from "../use-api";

class UserService {
  public async getUser(): Promise<any> {
    return UseApi.request(HttpMethod.GET, "/users/me", {});
  }

  isAdmin(): boolean {
    const storedUser = getLocalStorage<any>("user");
    if (!storedUser) return false;
    return storedUser.role === "admin";
  }
}

export default new UserService();
