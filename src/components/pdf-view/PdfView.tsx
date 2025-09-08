import { useRef, useState } from "react";
interface PDFViewerProps {
  pdfUrl: string | null | undefined;
  className?: string;
}

const PDFView = ({ pdfUrl, className }: PDFViewerProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleLoad = () => {
    setIsLoading(false);
    setError(null); 
  };

  const handleError = () => {
    setIsLoading(false);
    setError("Failed to load profile");
  };

  const validUrl =
    pdfUrl && typeof pdfUrl === "string" && pdfUrl.trim().length > 0;

  return (
    <div className={`relative w-full ${className}`}>
      {isLoading && validUrl && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-3"></div>
            <p className="text-gray-600">Loading document...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-center">
          <p className="text-red-600 font-medium">{error}</p>
          <p className="text-red-500 text-sm mt-1">
            Please check the URL or try again later
          </p>
        </div>
      )}

      {validUrl && !error && (
        <div className="overflow-hidden bg-white">
          <iframe
            ref={iframeRef}
            src={`https://docs.google.com/gview?url=${encodeURIComponent(
              pdfUrl
            )}&embedded=true`}
            onLoad={handleLoad}
            onError={handleError}
            className="w-full h-[500px]"
            title="PDF Document Viewer"
          />
        </div>
      )}
    </div>
  );
};

export default PDFView;