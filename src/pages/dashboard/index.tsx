import { Download, FileSpreadsheet, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import FileUpload from "../../components/fileupload/FileUpload";
import PDFView from "../../components/pdf-view/PDFView";
import type { DynamicTableRef } from "../../components/table/DynamicTable";
import DynamicTable from "../../components/table/DynamicTable";
import { Button } from "../../components/ui/Button";
import Modal from "../../components/ui/modal/Modal";
import Tooltip from "../../components/ui/Tooltip";
import { downloadFile, formatDate } from "../../lib/utils";
import S3Service from "../../services/s3-service";

const DashboardPage: React.FC = () => {
  const tableRef = useRef<DynamicTableRef>(null);
  const [rowdata, setRowdata] = useState<FileRow | null>(null);
  const [open, setOpen] = useState(false);

  interface FileRow extends Record<string, unknown> {
    id: number;
    original_filename: string;
    file_size: number;
    created_at: string;
    s3_key?: string;
    score?: number;
    filename?: string;
    url?: string;
  }

  const handleView = async (row: FileRow) => {
    try {
      setOpen(true);
      const response = await S3Service.downloadFile(row.s3_key || "");
      if (response.success) {
        setRowdata(response.data || "");
      }
    } catch (err) {
      setOpen(false);
      console.error("Failed to delete", err);
    }
  };

  const handleDelete = async (row: FileRow) => {
    try {
      const response = await S3Service.viewFile(row.s3_key || "");
      if (Object.hasOwn(response, "deleted_key")) {
        toast.success("File deleted successfully");
        tableRef.current?.refresh();
      }
    } catch (err) {
      console.error("Failed to delete", err);
    }
  };

  const handleDownload = async (row: FileRow) => {
    try {
      const response = await S3Service.downloadFile(row.s3_key || "");
      if (response.success) {
        toast.success("File downloaded successfully");
        downloadFile(response.data.url);
      }
    } catch (err) {
      console.error("Failed to delete", err);
    }
  };

  const handleUploadSuccess = (msg: string) => {
    toast.success(msg || "File uploaded successfully");
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
      render: (row: FileRow) =>
        row.score !== undefined && row.score !== null
          ? (row.score / 100).toFixed(2)
          : "—",
    },
    {
      key: "actions",
      label: "Actions",
      render: (row: FileRow) => (
        <div className="flex gap-2">
          <Tooltip content="View" maxWidth="max-w-xl">
            <Button
              variant="ghost"
              size="icon"
              className="text-blue-500 hover:text-blue-700"
              onClick={() => handleView(row)}
            >
              <FileSpreadsheet className="size-3.5" />
            </Button>
          </Tooltip>

          <Tooltip content="Download" maxWidth="max-w-xl">
            <Button
              variant="ghost"
              size="icon"
              className="text-blue-500 hover:text-blue-700"
              onClick={() => handleDownload(row)}
            >
              <Download className="size-3.5" />
            </Button>
          </Tooltip>

          <Tooltip content="Delete" maxWidth="max-w-xl">
            <Button
              variant="ghost"
              size="icon"
              className="text-red-500 hover:text-red-700"
              onClick={() => handleDelete(row)}
            >
              <Trash2 className="size-3.5" />
            </Button>
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="flex items-center justify-center mb-6">
        <FileUpload onSuccess={handleUploadSuccess} />
      </div>
      <DynamicTable<FileRow>
        url="/files"
        limit={10}
        ref={tableRef}
        columns={columns}
      />

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={rowdata?.filename || "File Details"}
        closeOnOverlayClick
        className="max-w-4xl w-full"
      >
        <div className="max-h-[80vh] overflow-y-auto">
          <PDFView pdfUrl={rowdata?.url || ""} className="mt-4" />
        </div>
      </Modal>
    </>
  );
};

export default DashboardPage;
