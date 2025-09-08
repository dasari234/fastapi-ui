import { Download, FileSpreadsheet, Trash2 } from "lucide-react";
import { useEffect, useRef } from "react";
import type { DynamicTableRef } from "../../components/DynamicTable";
import DynamicTable from "../../components/DynamicTable";
import FileUpload from "../../components/FileUpload";
import { Button } from "../../components/ui/Button";
import Tooltip from "../../components/ui/Tooltip";
import { formatDate } from "../../lib/utils";
import S3Service from "../../services/s3-service";

const DashboardPage: React.FC = () => {
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

  useEffect(() => {
    document.title = "Dashboard";
  }, []);

  const columns = [
    { key: "original_filename", label: "File Name" },
    {
      key: "file_size",
      label: "Size (MB)",
      render: (row: FileRow) => `${(row.file_size / 1000).toFixed(2)}`,
    },
    { key: "user_details.first_name", label: "Uploaded By" },
    {
      key: "created_at",
      label: "Created At",
      render: (row: FileRow) => formatDate(row.created_at),
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
      render: (row: FileRow) => (
        <div className="flex">
          <Button
            variant="ghost"
            size="icon"
            className="text-blue-500 hover:text-blue-700"
            onClick={() => handleView(row)}
          >
            <Tooltip content="View" maxWidth="max-w-xl">
              <FileSpreadsheet className="size-3.5" />
            </Tooltip>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="text-blue-500 hover:text-blue-700"
            onClick={() => handleView(row)}
          >
            <Tooltip content="Download" maxWidth="max-w-xl">
              <Download className="size-3.5" />
            </Tooltip>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-red-500 hover:text-red-700"
            onClick={() => handleDelete(row)}
          >
            <Tooltip content="Delete" maxWidth="max-w-xl">
              <Trash2 className="size-3.5" />
            </Tooltip>
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="min-h-screen flex items-center justify-center">
        <FileUpload onSuccess={handleUploadSuccess} />
      </div>
      <DynamicTable<FileRow>
        url="/files"
        limit={10}
        ref={tableRef}
        columns={columns}
      />
    </>
  );
};

export default DashboardPage;
