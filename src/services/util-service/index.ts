import { errorHandler } from "../../lib/utils/error-handler";
import { HttpMethod } from "../../types";
import UseApi from "../use-api";

export class UtilService {
  static async get<T>(url: string): Promise<T> {
    try {
      const response = await UseApi.request<T>(HttpMethod.GET, url);
       if (response === undefined) {
        throw new Error("Response is undefined");
      }
      return response;
    } catch (error) {
      errorHandler(error);
      throw error;
    }
  }

  static async post<T, D>(url: string, data: D): Promise<T> {
    try {
      const response = await UseApi.request<T>(HttpMethod.POST, url, { data });
       if (response === undefined) {
        throw new Error("Response is undefined");
      }
      return response;
    } catch (error) {
      errorHandler(error);
      throw error;
    }
  }

  static async put<T, D>(url: string, data: D, id:D): Promise<T> {
    try {
      const response = await UseApi.request<T>(HttpMethod.PUT, `${url}/${id}`, { data });
       if (response === undefined) {
        throw new Error("Response is undefined");
      }
      return response;
    } catch (error) {
      errorHandler(error);
      throw error;
    }
  }

  static async delete<T, D>(url: string, id:D): Promise<T> {
    try {
      const response = await UseApi.request<T>(HttpMethod.DELETE, `${url}/${id}`);
      if (response === undefined) {
        throw new Error("Response is undefined");
      }
      return response;
    } catch (error) {
      errorHandler(error);
      throw error;
    }
  }
}

export default new UtilService();