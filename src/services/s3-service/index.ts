/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpMethod } from "../../types";
import UseApi from "../use-api";

class S3Service {
  getBooks(): Promise<undefined> {
    return UseApi.request(HttpMethod.GET, "/books", {});
  }

  fileUpload(payload: FormData): Promise<any> {
    return UseApi.request(HttpMethod.POST, "/files/upload", {
      data: payload,
    });
  }

  multipleFileUpload(payload: FormData): Promise<any> {
    return UseApi.request(HttpMethod.POST, "/files/upload-multiple", {
      data: payload,
    });
  }

  deleteFile(id: string): Promise<any> {
    return UseApi.request(HttpMethod.DELETE, `/files/${id}`, {});
  }
}

export default new S3Service();
