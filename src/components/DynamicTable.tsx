import { Loader2 } from "lucide-react";
import React, {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useMemo,
    useState,
} from "react";
import { UtilService } from "../services/util-service";
import Pagination from "./Pagination";

interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (row: T) => React.ReactNode;
}

export interface DynamicTableRef {
  refresh: () => void;
}

interface DynamicTableProps<T> {
  url: string;
  columns?: Column<T>[];
  limit?: number;
}

function DynamicTableInner<T extends Record<string, unknown>>(
  { url, columns, limit = 2 }: DynamicTableProps<T>,
  ref: React.Ref<DynamicTableRef>
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true); // overlay by default
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchData = async (page: number = currentPage, overlay = true) => {
    try {
      setError(null);
      setShowOverlay(overlay);
      setLoading(true);

      const response = await UtilService.get(
        `${url}?limit=${limit}&page=${page}`
      );

      const rows =
        response && typeof response === "object" && "data" in response
          ? (response as { data: T[] }).data
          : [];

      const totalPages =
        response && typeof response === "object" && "total_pages" in response
          ? (response as { total_pages: number }).total_pages
          : 0;

      setTotalPages(totalPages);
      setData(rows);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to fetch data");
    } finally {
      setLoading(false);
      setShowOverlay(false);
    }
  };

  useEffect(() => {
    fetchData(currentPage, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  useImperativeHandle(ref, () => ({
    refresh: () => fetchData(currentPage, true),
  }));

  const headers = useMemo<Column<T>[]>(() => {
    if (columns) return columns;
    if (data.length === 0) return [];
    return (Object.keys(data[0]) as (keyof T)[]).map((key) => ({
      key,
      label: String(key),
    }));
  }, [columns, data]);

  const onPageChange = (page: number) => {
    if (page !== currentPage) {
      setCurrentPage(page);
      fetchData(page, true);
    }
  };

  return (
    <div className="relative">
      {showOverlay && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-10">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      )}

      {error ? (
        <p className="text-red-500">{error}</p>
      ) : data.length === 0 && !loading ? (
        <p className="text-gray-600">No records found.</p>
      ) : (
        <>
          <table className="min-w-full border border-gray-200 bg-white shadow-md rounded-lg">
            <thead>
              <tr className="bg-gray-100 text-left">
                {headers.map((col) => (
                  <th
                    key={String(col.key)}
                    className="px-4 py-2 text-sm font-semibold text-gray-700 border-b"
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  {headers.map((col) => (
                    <td
                      key={String(col.key)}
                      className="px-4 py-2 text-sm text-gray-700 border-b"
                    >
                      {col.render
                        ? col.render(row)
                        : String(row[col.key] ?? "")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          <Pagination
            totalPages={totalPages}
            currentPage={currentPage}
            onPageChange={onPageChange}
          />
        </>
      )}
    </div>
  );
}

const DynamicTable = forwardRef(DynamicTableInner) as <T>(
  props: DynamicTableProps<T> & { ref?: React.Ref<DynamicTableRef> }
) => React.ReactElement;

export default DynamicTable;
