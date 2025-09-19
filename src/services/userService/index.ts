import type { T } from "vitest/dist/chunks/environment.d.cL3nLXbE.js";
import { HttpMethod } from "../../types";
import UseApi from "../use-api";


class UserService {
  public async register<T>(payload: Record<string, string>): Promise<T | undefined> {
    const response =  UseApi.request<T>(HttpMethod.POST, "/auth/register", {
      data: payload,
    });
    return response;
  }

  public async getUser(): Promise<T | undefined> {
    return UseApi.request(HttpMethod.GET, "/users/me", {});
  }

  public async updateUser<T>(id:number, payload:Record<string, string>):Promise<T | undefined> {
    return UseApi.request(HttpMethod.PUT,`/users/${id}`,{
      data: payload
    })
  }

  public async deleteUser<T>(id:number):Promise<T | undefined>{
    return UseApi.request(HttpMethod.DELETE,`/users/${id}`)
  }
}


export default new UserService();

