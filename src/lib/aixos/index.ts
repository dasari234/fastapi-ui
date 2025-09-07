import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from "axios";
import { getLocalStorage } from "../utils";

let accessToken =
  getLocalStorage("accessToken") !== null
    ? getLocalStorage("accessToken")
    : null;

const config = {
  baseURL: import.meta.env.VITE_API_URL,
};

export const axiosInstance: AxiosInstance = axios.create(config);

const headers = (config: AxiosRequestConfig): AxiosRequestConfig => {
  if (!config.headers) {
    config.headers = {};
  }
  accessToken =
    getLocalStorage("accessToken") !== null
      ? getLocalStorage("accessToken") || ""
      : null;

  if (accessToken !== null) {
    config.headers.Authorization = `Bearer ${accessToken}`;
    config.headers["Access-Control-Allow-Origin"] = "*";
    config.headers["Access-Control-Allow-Methods"] =
      "GET, PUT, POST, DELETE, PATCH";
  }
  return config;
};

const logger = (config: AxiosRequestConfig): AxiosRequestConfig => config;
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
axiosInstance.interceptors.request.use(headers);
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
axiosInstance.interceptors.request.use(logger);

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    const errorMessage = error.response.data.error;
    localStorage.setItem("errorMessage", errorMessage);
    console.error(errorMessage);
    throw error;
  }
);