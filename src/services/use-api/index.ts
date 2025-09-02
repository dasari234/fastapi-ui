import type { AxiosRequestConfig, AxiosResponse } from "axios";
import { axiosInstance as http } from "../../lib/aixos";
import type { HttpMethod } from "../../types";

class UseApi {
  async request<T>(
    method: HttpMethod,
    url: string,
    options?: AxiosRequestConfig
  ): Promise<T | undefined> {
    try {
      const response: AxiosResponse<T> = await http.request<T>({
        method,
        url,
        ...options,
      });
      return response.data;
    } catch (error) {
      console.error(error);      
      throw new Error('An error occurred while making the API request');
    }
  }
}

export default new UseApi();