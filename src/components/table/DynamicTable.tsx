import { ArrowDown, ArrowUp, ArrowUpDown, UserRoundPlus } from "lucide-react";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import { toast } from "react-toastify";
import { buildUrlWithParams } from "../../lib/utils";
import { UtilService } from "../../services/util-service";
import { Button } from "../ui/Button";
import { Checkbox } from "../ui/form/checkbox/Checkbox";
import { LoadingOverlay } from "../ui/loading-overlay/LoadingOverlay";
import Pagination from "../ui/pagination/Pagination";
import SearchInput from "../ui/search/SearchInput";

interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
}

interface ActionButton {
  label: string;
  onClick: () => void;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: {
    [key: string]: unknown;
    records?: T[];
    total_pages?: number;
  };
}

export interface DynamicTableRef {
  refresh: () => void;
  getSelectedRows: () => void;
  clearSelection: () => void;
}

interface DynamicTableProps<T> {
  url: string;
  columns?: Column<T>[];
  limit?: number;
  responseKey?: string | undefined;
  actionButton?: ActionButton[];
  selectable?: boolean;
  onSelectionChange?: (selectedRows: T[]) => void;
  rowIdentifier?: keyof T;
}

/**
 * Utility to resolve nested keys (e.g., "user.name.first")
 */
function getNestedValue(obj: unknown, path: string): unknown {
  return path.split(".").reduce((acc, part) => {
    if (acc && typeof acc === "object" && acc !== null && part in acc) {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, obj);
}

function DynamicTableInner<T extends Record<string, unknown>>(
  {
    url,
    columns,
    limit = 25,
    responseKey = "records",
    actionButton,
    selectable = false,
    onSelectionChange,
    rowIdentifier = "id" as keyof T,
  }: DynamicTableProps<T>,
  ref: React.Ref<DynamicTableRef>
) {
  const [data, setData] = useState<T[]>([]);
  const [selectedRows, setSelectedRows] = useState<Set<string | number>>(
    new Set()
  );
  const [loading, setLoading] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const fetchData = async (page: number = currentPage, overlay = true) => {
    try {
      setError(null);
      setShowOverlay(overlay);
      setLoading(true);

      const getSortKey = (key?: string) => key?.split(".").pop();

      const urlWithParams = buildUrlWithParams(url, {
        limit,
        page,
        search: searchQuery.trim() || undefined,
        sort_by: getSortKey(sortBy) || undefined,
        sort_order: sortBy ? sortOrder : undefined,
      });

      const response = (await UtilService.get(urlWithParams)) as ApiResponse<T>;

      if (response && typeof response === "object" && "success" in response) {
        if (!response.success) {
          toast.error((response && response.message) || "Failed to fetch data");
          setTotalPages(0);
          setData([]);
          return;
        }

        const rows = Array.isArray(response.data?.[responseKey])
          ? response.data?.[responseKey]
          : [];

        const totalPages =
          response.data && typeof response.data.total_pages === "number"
            ? response.data.total_pages
            : 0;

        setTotalPages(totalPages);
        setData(rows);
      }
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
  }, [currentPage, searchQuery, sortBy, sortOrder, url]);

  // Notify parent when selection changes
  useEffect(() => {
    if (onSelectionChange) {
      const selectedData = data.filter((row) =>
        selectedRows.has(row[rowIdentifier] as string | number)
      );
      onSelectionChange(selectedData);
    }
  }, [selectedRows, data, onSelectionChange, rowIdentifier]);

  const onPageChange = (page: number) => {
    if (page !== currentPage) {
      setCurrentPage(page);
    }
  };

  useImperativeHandle(ref, () => ({
    refresh: () => fetchData(currentPage, true),
    getSelectedRows: () => {
      return data.filter((row) =>
        selectedRows.has(row[rowIdentifier] as string | number)
      );
    },
    clearSelection: () => {
      setSelectedRows(new Set());
    },
  }));

  const headers = useMemo<Column<T>[]>(() => {
    if (columns) return columns;
    if (data.length === 0) return [];
    return (Object.keys(data[0]) as (keyof T)[]).map((key) => ({
      key,
      label: String(key),
    }));
  }, [columns, data]);

  const handleSearch = (query: string) => {
    if (query !== searchQuery) {
      setSearchQuery(query);
      setCurrentPage(1);
    }
  };

  // Toggle sort
  const handleSort = (key: string, sortable?: boolean) => {
    if (!sortable) return;
    if (sortBy === key) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(key);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  const toggleRow = (rowId: string | number) => {
    setSelectedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(rowId)) {
        newSet.delete(rowId);
      } else {
        newSet.add(rowId);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedRows.size === data.length) {
      setSelectedRows(new Set());
    } else {
      const allIds = data.map((row) => row[rowIdentifier] as string | number);
      setSelectedRows(new Set(allIds));
    }
  };

  const isAllSelected = selectedRows.size === data.length && data.length > 0;
  const isIndeterminate =
    selectedRows.size > 0 && selectedRows.size < data.length;

  const getRowId = (row: T): string | number => {
    return row[rowIdentifier] as string | number;
  };

  return (
    <div className="relative">
      <LoadingOverlay visible={showOverlay} />

      {error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <>
          <div className="flex justify-between p-2 bg-white">
            <SearchInput
              onSearch={handleSearch}
              placeholder="Search files..."
            />
            {actionButton &&
              actionButton?.map((btn, idx) => (
                <Button
                  key={idx}
                  onClick={btn.onClick}
                  className="flex items-center gap-2"
                  disabled={btn.onClick.length > 0 && selectedRows.size === 0}
                >
                  <UserRoundPlus className="size-4" /> <span>{btn.label}</span>
                </Button>
              ))}
          </div>

          <table className="min-w-full border border-gray-200 bg-white shadow-md rounded-lg">
            <thead>
              <tr className="bg-gray-100 text-left">
                {selectable && (
                  <th className="px-4 py-2 border-b">
                    <Checkbox
                      checked={isAllSelected}
                      indeterminate={isIndeterminate}
                      onChange={toggleSelectAll}
                    />
                  </th>
                )}

                {headers.map((col) => {
                  const isActive = sortBy === col.key;
                  return (
                    <th
                      key={String(col.key)}
                      className="group px-4 py-2 text-sm font-semibold text-gray-700 border-b"
                      scope="col"
                      onClick={() => handleSort(String(col.key), col.sortable)}
                    >
                      <div className="flex justify-between items-center">
                        <span className="w-min truncate">{col.label}</span>
                        {col.sortable &&
                          (isActive ? (
                            sortOrder === "asc" ? (
                              <ArrowUp className="w-4 h-4 opacity-40 group-hover:opacity-70" />
                            ) : (
                              <ArrowDown className="w-4 h-4 opacity-40 group-hover:opacity-70" />
                            )
                          ) : (
                            <ArrowUpDown className="w-4 h-4 opacity-40 group-hover:opacity-70" />
                          ))}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody>
              {data.length > 0
                ? data.map((row) => {
                    const rowId = getRowId(row);
                    return (
                      <tr
                        key={rowId}
                        className="hover:bg-gray-50 transition-colors duration-150"
                      >
                        {selectable && (
                          <td className="px-4 py-2 border-b">
                            <Checkbox
                              checked={selectedRows.has(rowId)}
                              onChange={() => toggleRow(rowId)}
                            />
                          </td>
                        )}
                        {headers.map((col) => {
                          let value: React.ReactNode;
                          if (col.render) {
                            value = col.render(row);
                          } else {
                            const nested = getNestedValue(row, String(col.key));
                            value =
                              nested !== undefined && nested !== null
                                ? String(nested)
                                : "";
                          }

                          return (
                            <td
                              key={String(col.key)}
                              className="px-4 py-2 text-sm text-gray-700 border-b"
                            >
                              {value !== undefined && value !== null
                                ? value
                                : ""}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })
                : !loading && (
                    <tr>
                      <td
                        colSpan={headers.length + (selectable ? 1 : 0)}
                        className="py-4 text-center text-md text-gray-600"
                      >
                        No records found.
                      </td>
                    </tr>
                  )}
            </tbody>
          </table>

          <Pagination
            totalPages={totalPages}
            currentPage={currentPage}
            onPageChange={onPageChange}
          />

          {/* Selection info */}
          {selectable && selectedRows.size > 0 && (
            <div className="mt-2 text-sm text-gray-600">
              {selectedRows.size} row{selectedRows.size !== 1 ? "s" : ""}{" "}
              selected
            </div>
          )}
        </>
      )}
    </div>
  );
}

const DynamicTable = forwardRef(DynamicTableInner) as <T>(
  props: DynamicTableProps<T> & { ref?: React.Ref<DynamicTableRef> }
) => React.ReactElement;

export default DynamicTable;

// GET /api/v1/files?search={search_term}&limit={limit}&page={page}&folder={folder}&show_all_versions={true/false}
