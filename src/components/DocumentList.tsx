import { useRef } from "react";
import { formatDate } from "../lib/utils";

import S3Service from "../services/s3-service";
import DynamicTable, { type DynamicTableRef } from "./DynamicTable";

export default function DocumentList() {
  const tableRef = useRef<DynamicTableRef>(null);

  interface FileRow {
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

  return (
    <>
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
            key: "actions",
            label: "Actions",
            render: (row) => (
             <div className="flex gap-2">
              <button
                className="text-blue-500 hover:underline"
                onClick={() => handleView(row)}
              >
                View
              </button>
              <button
                className="text-red-500 hover:underline"
                onClick={() => handleDelete(row)}
              >
                Delete
              </button>
            </div>
            ),
          },
        ]}
      />
    </>
  );
}
