import { useCallback, useRef, useState } from "react";

interface UseFileUploadProps {
  allowedTypes?: string[];
  maxSizeMB?: number;
  uploadUrl: string;
  multiple?: boolean;
}

interface FilePreview {
  file: File;
  previewUrl: string;
}

interface UseFileUploadReturn {
  files: FilePreview[];
  error: string | null;
  uploadProgress: number;
  isUploading: boolean;
  uploadSuccess: boolean | null;
  setFiles: (files: FilePreview[]) => void;
  onDrop: (event: React.DragEvent<HTMLDivElement>) => void;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  uploadFiles: () => Promise<void>;
  cancelUpload: () => void;
}

export function useFileUpload({
  allowedTypes = [],
  maxSizeMB = 5,
  uploadUrl,
  multiple = false,
}: UseFileUploadProps): UseFileUploadReturn {
  const [files, setFiles] = useState<FilePreview[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadSuccess, setUploadSuccess] = useState<boolean | null>(null);

  const xhrRef = useRef<XMLHttpRequest | null>(null);

  const validateFile = useCallback(
    (file: File) => {
      if (allowedTypes.length && !allowedTypes.includes(file.type)) {
        setError("Invalid file type.");
        return false;
      }
      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`File must be less than ${maxSizeMB}MB.`);
        return false;
      }
      setError(null);
      return true;
    },
    [allowedTypes, maxSizeMB]
  );

  const createPreview = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    return { file, previewUrl: url };
  }, []);

  const handleFiles = useCallback(
    (selectedFiles: FileList | File[]) => {
      const validFiles: FilePreview[] = [];
      Array.from(selectedFiles).forEach((file) => {
        if (validateFile(file)) {
          validFiles.push(createPreview(file));
        }
      });

      if (validFiles.length) {
        setFiles(multiple ? validFiles : [validFiles[0]]);
        setUploadSuccess(null);
      }
    },
    [createPreview, multiple, validateFile]
  );

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      if (event.dataTransfer.files.length) {
        handleFiles(event.dataTransfer.files);
      }
    },
    [handleFiles]
  );

  const onFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.files?.length) {
        handleFiles(event.target.files);
      }
    },
    [handleFiles]
  );

  const cancelUpload = () => {
    if (xhrRef.current) {
      xhrRef.current.abort();
      setIsUploading(false);
      setUploadProgress(0);
      setUploadSuccess(false);
      setError("Upload canceled");
    }
  };

  const uploadFiles = async () => {
    if (!files.length) return;
    setIsUploading(true);
    setUploadProgress(0);
    setUploadSuccess(null);

    try {
      const formData = new FormData();
      files.forEach((f) => formData.append("file", f.file));

      const xhr = new XMLHttpRequest();
      xhrRef.current = xhr;

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(progress);
        }
      };

      const uploadPromise = new Promise<void>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error("Upload failed"));
          }
        };
        xhr.onerror = () => reject(new Error("Upload error"));
        xhr.onabort = () => reject(new Error("Upload canceled"));
        xhr.open("POST", uploadUrl, true);
        xhr.send(formData);
      });

      await uploadPromise;
      setUploadSuccess(true);
      setUploadProgress(100);
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error) {
        setError(err.message || "File upload failed.");
      } else {
        setError("File upload failed.");
      }
      setUploadSuccess(false);
    } finally {
      setIsUploading(false);
      xhrRef.current = null;
    }
  };

  return {
    files,
    error,
    uploadProgress,
    isUploading,
    uploadSuccess,
    setFiles,
    onDrop,
    onFileChange,
    uploadFiles,
    cancelUpload,
  };
}



// import React from "react";
// import { useFileUpload } from "@/hooks/useFileUpload";

// export default function FileUploadDemo() {
//   const {
//     files,
//     error,
//     onFileChange,
//     onDrop,
//     uploadFiles,
//     uploadProgress,
//     isUploading,
//     cancelUpload,
//   } = useFileUpload({
//     allowedTypes: ["image/png", "image/jpeg", "application/pdf"],
//     maxSizeMB: 10,
//     uploadUrl: "/api/upload",
//     multiple: true,
//   });

//   return (
//     <div
//       onDrop={onDrop}
//       onDragOver={(e) => e.preventDefault()}
//       className="p-4 border-dashed border-2 border-gray-300 rounded"
//     >
//       <input type="file" multiple onChange={onFileChange} />
//       {error && <p className="text-red-600">{error}</p>}

//       <div className="mt-2 space-y-2">
//         {files.map((f, idx) => (
//           <div key={idx} className="flex items-center space-x-2">
//             {f.file.type.startsWith("image/") && (
//               <img src={f.previewUrl} alt={f.file.name} className="w-16 h-16 object-cover" />
//             )}
//             <span>{f.file.name}</span>
//           </div>
//         ))}
//       </div>

//       <button
//         onClick={uploadFiles}
//         disabled={isUploading || !files.length}
//         className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
//       >
//         Upload
//       </button>
//       {isUploading && (
//         <button onClick={cancelUpload} className="ml-2 px-4 py-2 bg-red-600 text-white rounded">
//           Cancel
//         </button>
//       )}
//       {uploadProgress > 0 && <p>Progress: {uploadProgress}%</p>}
//     </div>
//   );
// }
