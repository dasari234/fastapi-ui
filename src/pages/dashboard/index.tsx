import { Download, FileSpreadsheet, Loader2, Trash2 } from "lucide-react";
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
  const [loading, setLoading] = useState(false);

  interface FileRow extends Record<string, unknown> {
    id: number;
    original_filename: string;
    file_size: number;
    created_at: string;
    s3_key?: string;
    score?: number;
    filename?: string;
    url?: string;
    processing_time_ms?: number;
    updated_at?: string | Date;
    version?: number;
    upload_status?: string;
    user_details?: {
      first_name?: string;
      last_name?: string;
      email?: string;
    };
  }

  const handleView = async (row: FileRow) => {
    try {
      setOpen(true);
      setLoading(true);
      const response = await S3Service.viewFile(row.s3_key || "");
      if (response.success) {
        setRowdata(response.data || "");
      }
    } catch (err) {
      setOpen(false);
      setLoading(false);
      console.error("Failed to delete", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (row: FileRow) => {
    try {
      const response = await S3Service.deleteFile(row.s3_key || "");
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
        downloadFile(response.data.url, response.data.filename);
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
    { key: "original_filename", label: "File Name", sortable: true },
    { key: "version", label: "Version", sortable: true },
    {
      key: "file_size",
      label: "Size (MB)",
      sortable: true,
      render: (row: FileRow) => `${(row.file_size / 1000).toFixed(2)}`,
    },
    { key: "user_details.first_name", label: "Uploaded By", sortable: true },
    {
      key: "created_at",
      label: "Created At",
      sortable: true,
      render: (row: FileRow) => formatDate(row.created_at),
    },
    {
      key: "updated_at",
      label: "Updated At",
      sortable: true,
      render: (row: FileRow) => row.updated_at ? formatDate(row.updated_at) : "—",
    },
    {
      key: "upload_status",
      label: "Status",
      sortable: true,
    },
    {
      key: "score",
      label: "Score",
      sortable: true,
      render: (row: FileRow) =>
        row.score !== undefined && row.score !== null
          ? row.score.toFixed(2)
          : "—",
    },
    {
      key: "processing_time_ms",
      label: "Process Time",
      sortable: true,
      render: (row: FileRow) =>
        row.processing_time_ms !== undefined && row.processing_time_ms !== null
          ? `${row.processing_time_ms.toFixed(2)}ms`
          : "—",
    },
    {
      key: "actions",
      label: "Actions",
      sortable: false,
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
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-3" />
              <p className="text-gray-600 text-sm">Loading file...</p>
            </div>
          ) : rowdata?.url ? (
            <PDFView pdfUrl={rowdata.url} className="mt-4" />
          ) : (
            <p className="text-gray-500">No file available</p>
          )}
        </div>
      </Modal>
    </>
  );
};

export default DashboardPage;
