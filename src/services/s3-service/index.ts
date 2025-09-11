/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpMethod } from "../../types";
import UseApi from "../use-api";

class S3Service {
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

  downloadFile(id: string): Promise<any> {
    return UseApi.request(HttpMethod.GET, `/files/${id}/download-url`, {});
  }

  viewFile(id: string): Promise<any> {
    return UseApi.request(HttpMethod.GET, `/files/${id}/view-url`, {});
  }
}

export default new S3Service();
