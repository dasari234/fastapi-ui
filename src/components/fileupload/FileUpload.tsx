import {
  CloudUpload,
  File as FileIcon,
  Image as ImageIcon,
  Music,
  Video,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
import S3Service from "../../services/s3-service";
import { Button } from "../ui/Button";

const ALLOWED_EXTENSIONS = {
  image: ["jpg", "jpeg", "png", "gif", "webp"],
  document: ["pdf", "doc", "docx", "txt", "csv", "xlsx"],
  video: ["mp4", "mov", "avi", "mkv"],
  audio: ["mp3", "wav", "ogg"],
};

const getFileCategory = (extension: unknown): FileCategory => {
  if (typeof extension !== "string") return null;
  for (const [category, exts] of Object.entries(ALLOWED_EXTENSIONS)) {
    if (exts.includes(extension.toLowerCase())) {
      return category as FileCategory;
    }
  }
  return null;
};

type FileCategory = "image" | "document" | "video" | "audio" | null;

const FileTypeIcon = ({ category }: { category: FileCategory }) => {
  const icons = {
    image: <ImageIcon className="w-5 h-5 text-blue-500" />,
    document: <FileIcon className="w-5 h-5 text-gray-600" />,
    video: <Video className="w-5 h-5 text-purple-500" />,
    audio: <Music className="w-5 h-5 text-green-500" />,
  };
  return category ? (
    icons[category]
  ) : (
    <FileIcon className="w-5 h-5 text-gray-500" />
  );
};

type FileItemProps = {
  file: File;
  onRemove: (name: string) => void;
};

const FileItem = ({ file, onRemove }: FileItemProps) => {
  const ext = file.name.split(".").pop() || "";
  const category = getFileCategory(ext);

  return (
    <div className="flex items-center justify-between p-2 border rounded-md bg-white shadow-sm">
      <div className="flex items-center gap-2">
        <FileTypeIcon category={category} />
        <span className="text-sm text-gray-700 break-all">{file.name}</span>
      </div>
      <button
        className="ml-2 p-1 text-gray-400 hover:text-red-500 transition rounded-full bg-gray-100 hover:bg-gray-200"
        onClick={() => onRemove(file.name)}
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
};

export default function FileUpload({
  onSuccess,
}: {
  onSuccess?: (message: string) => void;
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  interface FileValidationResult {
    valid: File[];
    invalid: string[];
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const selectedFiles: File[] = Array.from(e.target.files);
    const { valid, invalid }: FileValidationResult =
      selectedFiles.reduce<FileValidationResult>(
        (acc, file) => {
          const ext: string = file.name.split(".").pop() || "";
          if (getFileCategory(ext)) {
            acc.valid.push(file);
          } else {
            acc.invalid.push(file.name);
          }
          return acc;
        },
        { valid: [], invalid: [] }
      );

    if (invalid.length) {
      setError(`Invalid file types: ${invalid.join(", ")}`);
    } else {
      setError(null);
    }

    setFiles((prev: File[]) => {
      const existingNames = new Set(prev.map((f) => f.name));
      const duplicates = valid.filter((f) => existingNames.has(f.name));

      if (duplicates.length > 0) {
        setError(
          `Duplicate file(s) not allowed: ${duplicates
            .map((d) => d.name)
            .join(", ")}`
        );
      }

      const uniqueFiles = valid.filter((f) => !existingNames.has(f.name));
      return [...prev, ...uniqueFiles];
    });

    // Reset the input so user can select the same file again later
    if (fileInputRef.current) {
      (fileInputRef.current as HTMLInputElement).value = "";
    }
  };

  interface RemoveFileFn {
    (name: string): void;
  }

  const removeFile: RemoveFileFn = (name) => {
    setFiles((prev: File[]) => prev.filter((f: File) => f.name !== name));
  };

  const uploadFiles = async () => {
    if (!files.length) {
      setError("Please select at least one file.");
      return;
    }

    const formData = new FormData();

    if (files.length > 1) {
      files.forEach((file) => {
        formData.append("files", file);
      });
      formData.append("folder", "documents");
    } else {
      formData.append("file", files[0]);
    }

    formData.append('version_comment', 'Updated with new data');

    try {
      setUploading(true);
      let result;
      if (files.length > 1) {
        result = await S3Service.multipleFileUpload(formData);
      } else {
        result = await S3Service.fileUpload(formData);
      }
      if (onSuccess) {
        onSuccess(result.message || "Files uploaded successfully!");
      }
      setFiles([]);
      setError(null);
    } catch (err) {
      console.error("Upload failed:", err);
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full p-4 border rounded-md bg-gray-50 shadow-sm">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">File Upload</h2>

      {/* Upload Input */}
      <label className="flex flex-col items-center justify-center gap-2 rounded-md p-6 cursor-pointer bg-gray-200 hover:bg-gray-300 transition border-2 border-dashed border-gray-400">
        <CloudUpload className="w-8 h-8 text-gray-600" />
        <span className="text-gray-700 font-medium">Choose Files</span>
        <span className="text-sm text-gray-500">
          or drag and drop files here
        </span>
        <span className="text-sm text-gray-500">
          PDF, DOCX, IMG, up to 50MB
        </span>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
      </label>

      {error && (
        <div className="mt-3 p-2 bg-red-100 border border-red-300 rounded-md">
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      )}

      {/* Files List */}
      {files.length > 0 && (
        <div className="mt-4">
          <h3 className="text-md font-medium text-gray-700 mb-2">
            {files.length} File{files.length !== 1 ? "s" : ""} selected
          </h3>
          <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto">
            {files.map((file) => (
              <FileItem key={file.name} file={file} onRemove={removeFile} />
            ))}
          </div>
        </div>
      )}

      {/* Upload Button */}
      {files.length > 0 && (
        <Button
          onClick={uploadFiles}
          className="flex gap-2 mt-4 w-full bg-blue-500 text-white p-2 rounded-md font-medium hover:bg-blue-600 transition disabled:bg-blue-300"
          disabled={uploading}
          loading={uploading}
        >
          Upload {files.length} File{files.length !== 1 ? "s" : ""}
        </Button>
      )}
    </div>
  );
}
