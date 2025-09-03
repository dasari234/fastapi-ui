import { useRef } from "react";
import { formatDate } from "../lib/utils";

import { FileSpreadsheet, Trash2 } from "lucide-react";
import S3Service from "../services/s3-service";
import DynamicTable, { type DynamicTableRef } from "./DynamicTable";
import FileUpload from "./FileUpload";
import Tooltip from "./ui/Tooltip";

export default function DocumentList() {
  const tableRef = useRef<DynamicTableRef>(null);

  interface FileRow extends Record<string, unknown> {
    id: number;
    original_filename: string;
    file_size: number;
    created_at: string;
    s3_key?: string;
  }

  const handleView = async (row: FileRow) => {
    // const response = await FileUploadService.viewFile(id);
    console.log("View file", row);
  };

  const handleDelete = async (row: FileRow) => {
    try {
      const response = await S3Service.deleteFile(row.s3_key || "");
      console.log("Deleted file", response);

      tableRef.current?.refresh();
    } catch (err) {
      console.error("Failed to delete", err);
    }
  };

  const handleUploadSuccess = (msg: string) => {
    console.log("Upload success callback:", msg);
    tableRef.current?.refresh();
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <FileUpload onSuccess={handleUploadSuccess} />
      </div>
      <DynamicTable<FileRow>
        url="/files"
        ref={tableRef}
        columns={[
          { key: "id", label: "ID" },
          { key: "original_filename", label: "File Name" },
          {
            key: "file_size",
            label: "Size (KB)",
            render: (row) => `${row.file_size} KB`,
          },
          {
            key: "created_at",
            label: "Created At",
            render: (row) => formatDate(row.created_at),
          },
          {
            key: "upload_status",
            label: "Status",
          },
          {
            key: "score",
            label: "Score",
          },
          {
            key: "actions",
            label: "Actions",
            render: (row) => (
              <div className="flex gap-2">
                <button
                  className="text-blue-500 hover:text-blue-700"
                  onClick={() => handleView(row)}
                >
                  <Tooltip content="View" maxWidth="max-w-xl">
                    <FileSpreadsheet className="size-3.5" />
                  </Tooltip>
                </button>
                <button
                  className="text-red-500 hover:text-red-700"
                  onClick={() => handleDelete(row)}
                >
                  <Tooltip content="Delete" maxWidth="max-w-xl">
                    <Trash2 className="size-3.5" />
                  </Tooltip>
                </button>
              </div>
            ),
          },
        ]}
      />
    </>
  );
}
