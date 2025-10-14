import {
  CloudUpload,
  File as FileIcon,
  Image as ImageIcon,
  Music,
  Video,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
import { cn } from "../../lib/utils";
import S3Service from "../../services/s3-service";
import { Button } from "../ui/Button";

const ALLOWED_EXTENSIONS = {
  image: ["jpg", "jpeg", "png", "gif", "webp"],
  document: ["pdf", "doc", "docx", "txt", "csv", "xlsx"],
  video: ["mp4", "mov", "avi", "mkv"],
  audio: ["mp3", "wav", "ogg"],
};

type FileCategory = "image" | "document" | "video" | "audio" | null;

const getFileCategory = (extension: unknown): FileCategory => {
  if (typeof extension !== "string") return null;
  for (const [category, exts] of Object.entries(ALLOWED_EXTENSIONS)) {
    if (exts.includes(extension.toLowerCase())) {
      return category as FileCategory;
    }
  }
  return null;
};

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
  progress?: number;
  isUploading?: boolean;
};

const FileItem = ({
  file,
  onRemove,
  progress = 0,
  isUploading,
}: FileItemProps) => {
  const ext = file.name.split(".").pop() || "";
  const category = getFileCategory(ext);

  return (
    <div className="flex flex-col gap-1 p-2 border rounded-md bg-white shadow-sm w-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileTypeIcon category={category} />
          <span className="text-sm text-gray-700 break-all">{file.name}</span>
        </div>
        {!isUploading && (
          <button
            className="cursor-pointer ml-2 p-1 text-gray-400 hover:text-red-500 transition rounded-full bg-gray-100 hover:bg-gray-200"
            onClick={() => onRemove(file.name)}
          >
            <X className="size-3" />
          </button>
        )}
      </div>

      {/* Progress Bar */}
      {isUploading && (
        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
          <div
            className={cn("h-2 rounded-full bg-blue-500 transition-all")}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
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
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
          const ext = file.name.split(".").pop() || "";
          if (getFileCategory(ext)) acc.valid.push(file);
          else acc.invalid.push(file.name);
          return acc;
        },
        { valid: [], invalid: [] }
      );

    if (invalid.length) setError(`Invalid file types: ${invalid.join(", ")}`);
    else setError(null);

    setFiles((prev) => {
      const existingNames = new Set(prev.map((f) => f.name));
      const duplicates = valid.filter((f) => existingNames.has(f.name));
      if (duplicates.length)
        setError(
          `Duplicate file(s): ${duplicates.map((d) => d.name).join(", ")}`
        );

      const uniqueFiles = valid.filter((f) => !existingNames.has(f.name));
      return [...prev, ...uniqueFiles];
    });

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (name: string) => {
    setFiles((prev) => prev.filter((f) => f.name !== name));
    setProgressMap((prev) => {
      const copy = { ...prev };
      delete copy[name];
      return copy;
    });
  };

  const uploadFiles = async () => {
    if (!files.length) {
      setError("Please select at least one file.");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      for (const file of files) {
        await uploadSingleFile(file);
      }

      if (onSuccess) onSuccess("All files uploaded successfully!");
      setFiles([]);
      setProgressMap({});
    } catch (err) {
      console.error("Upload failed:", err);
      setError("Some files failed to upload. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const uploadSingleFile = (file: File): Promise<unknown> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "documents");
    formData.append("version_comment", "Updated with new data");

    return S3Service.fileUpload(formData, {
      onUploadProgress: (progressEvent: ProgressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / (progressEvent.total || 1)
        );
        setProgressMap((prev) => ({ ...prev, [file.name]: percentCompleted }));
      },
    }).catch((err) => {
      setProgressMap((prev) => ({ ...prev, [file.name]: 0 }));
      throw err;
    });
  };

  return (
    <div className="w-full">
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
        <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
          {files.map((file) => (
            <FileItem
              key={file.name}
              file={file}
              onRemove={removeFile}
              progress={progressMap[file.name] || 0}
              isUploading={uploading}
            />
          ))}
        </div>
      )}

      {/* Upload Button */}
      {files.length > 0 && (
        <Button
          onClick={uploadFiles}
          className="flex gap-2 mt-4 w-full"
          disabled={uploading}
          loading={uploading}
          variant="round"
        >
          {uploading
            ? "Uploading..."
            : `Upload ${files.length} File${files.length > 1 ? "s" : ""}`}
        </Button>
      )}
    </div>
  );
}
