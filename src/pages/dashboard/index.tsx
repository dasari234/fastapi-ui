import { Download, FileSpreadsheet, Loader2, Trash2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import FileUpload from "../../components/fileupload/FileUpload";
import PDFView from "../../components/pdf-view/PDFView";
import { Button } from "../../components/ui/Button";
import Modal from "../../components/ui/modal/Modal";
import type { Column, TableRef } from "../../components/ui/table";
import Table from "../../components/ui/table";
import Tooltip from "../../components/ui/Tooltip";
import { downloadFile, formatDate } from "../../lib/utils";
import S3Service from "../../services/s3-service";

const DashboardPage: React.FC = () => {
  const tableRef = useRef<TableRef>(null);
  const [rowdata, setRowdata] = useState<FileRow | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isDownload, setIsDownload] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState<FileRow | null>();
  const [selectedRows, setSelectedRows] = useState<FileRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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
      console.error("Failed to view file", err);
      toast.error("Failed to view file");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      const row = selectedRow;
      const response = await S3Service.deleteFile(row?.s3_key || "");
      if (Object.hasOwn(response, "deleted_key")) {
        toast.success("File deleted successfully");
        tableRef.current?.refresh();
      }
    } catch (err) {
      console.error("Failed to delete file", err);
      toast.error("Failed to delete file");
    } finally {
      setIsLoading(false);
      setDeleteModal(false);
    }
  };

  const handleDeleteModal = async (row: FileRow) => {
    setSelectedRow(row);
    setDeleteModal(true);
  };

  const handleDownload = async (row: FileRow) => {
    try {
      setIsDownload(true);
      const response = await S3Service.downloadFile(row.s3_key || "");
      if (response.success) {
        toast.success("File downloaded successfully");
        downloadFile(response.data.url, response.data.filename);
        setIsDownload(false);
      }
    } catch (err) {
      console.error("Failed to download file", err);
      toast.error("Failed to download file");
      setIsDownload(false);
    } finally {
      setIsDownload(false);
    }
  };

  const handleUploadSuccess = (msg: string) => {
    toast.success(msg || "File uploaded successfully");
    tableRef.current?.refresh();
  };

  useEffect(() => {
    document.title = "Dashboard";
  }, []);

  const columns: Column<FileRow>[] = [
    {
      key: "original_filename",
      label: "File Name",
      sortable: true,
      // fixed: "left",
      width: "150px",
      truncate: true,
    },
    {
      key: "version",
      label: "Version",
      sortable: true,
      // fixed: "left",
      width: "100px",
    },
    {
      key: "file_size",
      label: "Size (MB)",
      sortable: true,
      width: "120px",
      truncate: true,
      render: (row: FileRow) => `${(row.file_size / 1000).toFixed(2)}`,
    },
    {
      key: "user_details.first_name",
      label: "Uploaded By",
      sortable: true,
      width: "150px",
      truncate: true,
    },
    {
      key: "created_at",
      label: "Created At",
      sortable: true,
      width: "150px",
      truncate: true,
      render: (row: FileRow) => formatDate(row.created_at),
    },
    {
      key: "updated_at",
      label: "Updated At",
      sortable: true,
      width: "150px",
      render: (row: FileRow) =>
        row.updated_at ? formatDate(row.updated_at) : "—",
    },
    {
      key: "upload_status",
      label: "Status",
      sortable: true,
      width: "100px",
    },
    {
      key: "score",
      label: "Score",
      sortable: true,
      width: "100px",
      render: (row: FileRow) =>
        row.score !== undefined && row.score !== null
          ? row.score.toFixed(2)
          : "—",
    },
    {
      key: "processing_time_ms",
      label: "Process Time",
      sortable: true,
      // fixed: "right",
      width: "150px",
      truncate: true,
      render: (row: FileRow) =>
        row.processing_time_ms !== undefined && row.processing_time_ms !== null
          ? `${row.processing_time_ms.toFixed(2)}ms`
          : "—",
    },
    {
      key: "actions",
      label: "Actions",
      sortable: false,
      fixed: "right",
      align: "center",
      width: "110px",
      render: (row: FileRow) => (
        <div className="flex gap-3 relative ml-0.5">
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
              onClick={() => handleDeleteModal(row)}
            >
              <Trash2 className="size-3.5" />
            </Button>
          </Tooltip>
        </div>
      ),
    },
  ];

  const handleSelectionChange = useCallback((selectedRows: FileRow[]) => {
    setSelectedRows(selectedRows);
  }, []);

  return (
    <>
      <div className="flex items-center justify-center mb-6">
        <FileUpload onSuccess={handleUploadSuccess} />
      </div>

      {/* Add a wrapper div with proper styling for fixed columns */}
      <div className="mb-4 text-xl flex">
        My Uploads
        {selectedRows && selectedRows.length > 0 && (
          <div className="ml-2 text-gray-600">
            ({selectedRows.length} files{selectedRows.length !== 1 ? "s" : ""}{" "}
            selected)
          </div>
        )}
      </div>
      <div className="border border-gray-200 rounded-lg bg-white">
        <Table<FileRow>
          url="/files"
          limit={15}
          ref={tableRef}
          columns={columns}
          responseKey="records"
          fixedHeader={true}
          maxHeight="65vh"
          selectable={true}
          onSelectionChange={handleSelectionChange}
        />
      </div>

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

      <Modal
        open={isDownload}
        onClose={() => setIsDownload(false)}
        showCloseButton={false}
        className="max-w-1/4"
      >
        <div className="max-h-[30vh] overflow-y-hidden">
          {isDownload && (
            <div className="flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-3" />
              <p className="text-gray-600 text-sm">Downloading file...</p>
            </div>
          )}
        </div>
      </Modal>

      <Modal
        open={deleteModal}
        onClose={() => setDeleteModal(false)}
        showCloseButton={true}
      >
        <div className="max-h-[80vh] overflow-auto p-2">
          <h1>
            Are you sure, you want to delete{" "}
            <b>{selectedRow?.original_filename}</b>?
          </h1>
          <div className="flex justify-end gap-4 mt-5">
            <Button
              variant="outline"
              disabled={isLoading}
              onClick={() => setDeleteModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isLoading}
              loading={isLoading}
            >
              Yes, Delete
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default DashboardPage;
