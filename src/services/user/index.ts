/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpMethod } from "../../types";
import UseApi from "../use-api";

class UserService {
  public async getUser(): Promise<any> {
    return UseApi.request(HttpMethod.GET, "/users/me", {});
  }
}

export default new UserService();
