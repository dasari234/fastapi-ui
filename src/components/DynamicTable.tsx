import React, {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useState,
} from "react";
import { UtilService } from "../services/util-service";

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
}

function DynamicTableInner<T extends Record<string, unknown>>(
  { url, columns }: DynamicTableProps<T>,
  ref: React.Ref<DynamicTableRef>
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await UtilService.get(url);

      const rows =
        response && typeof response === "object" && "data" in response
          ? (response as { data: T[] }).data
          : [];
      setData(rows);
    } catch {
      setError("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  useImperativeHandle(ref, () => ({
    refresh: fetchData,
  }));

  if (loading) return <p className="text-gray-600">Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!data.length) return <p className="text-gray-600">No records found.</p>;

  const headers =
    columns ||
    (Object.keys(data[0]) as (keyof T)[]).map((key) => ({
      key,
      label: String(key),
    }));

  return (
    <div className="overflow-x-auto">
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
                  {"render" in col && typeof col.render === "function"
                      ? col.render(row)
                      : String(row[col.key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const DynamicTable = forwardRef(DynamicTableInner) as <
  T extends Record<string, unknown>
>(
  props: DynamicTableProps<T> & { ref?: React.Ref<DynamicTableRef> }
) => ReturnType<typeof DynamicTableInner>;

export default DynamicTable;
