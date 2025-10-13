import { ArrowDown, ArrowUp, ArrowUpDown, UserRoundPlus } from "lucide-react";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "react-toastify";
import { buildUrlWithParams } from "../../../lib/utils";
import { UtilService } from "../../../services/util-service";
import { Button } from "../Button";
import { Checkbox } from "../form/checkbox/Checkbox";
import { LoadingOverlay } from "../loading-overlay/LoadingOverlay";
import Pagination from "../pagination/Pagination";
import SearchInput from "../search/SearchInput";

export interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
  fixed?: "left" | "right";
  width?: string;
  align?: "left" | "right" | "center";
  truncate?: boolean;
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

export interface TableRef {
  refresh: () => void;
  getSelectedRows: () => void;
  clearSelection: () => void;
}

interface TableProps<T> {
  url: string;
  columns?: Column<T>[];
  limit?: number;
  responseKey?: string | undefined;
  actionButton?: ActionButton[];
  selectable?: boolean;
  onSelectionChange?: (selectedRows: T[]) => void;
  rowIdentifier?: keyof T;
  stripeRows?: boolean;
  fixedHeader?: boolean;
  maxHeight?: string;
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

function TableInner<T extends Record<string, unknown>>(
  {
    url,
    columns,
    limit = 25,
    responseKey = "records",
    actionButton,
    selectable = false,
    onSelectionChange,
    rowIdentifier = "id" as keyof T,
    stripeRows = true,
    fixedHeader = false,
    maxHeight = "65vh",
  }: TableProps<T>,
  ref: React.Ref<TableRef>
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
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  const CHECKBOX_WIDTH = 48;

  const tableContainerRef = useRef<HTMLDivElement>(null);

  const fetchData = async (page: number = currentPage, overlay = true) => {
    try {
      setError(null);
      setShowOverlay(!isFirstLoad && overlay);
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
      setIsFirstLoad(false);
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

  // Calculate fixed columns
  const fixedLeftColumns = useMemo(
    () => headers.filter((col) => col.fixed === "left"),
    [headers]
  );

  const fixedRightColumns = useMemo(
    () => headers.filter((col) => col.fixed === "right"),
    [headers]
  );

  const regularColumns = useMemo(
    () => headers.filter((col) => !col.fixed),
    [headers]
  );

  // Calculate cumulative left positions for fixed columns
  const calculateFixedLeftPositions = useMemo(() => {
    let leftPosition = selectable ? CHECKBOX_WIDTH : 0;

    return fixedLeftColumns.map((column) => {
      const currentLeft = leftPosition;
      const columnWidth = column.width ? parseInt(column.width) : 100;
      leftPosition += columnWidth;
      return currentLeft;
    });
  }, [fixedLeftColumns, selectable]);

  // Calculate cumulative right positions for fixed columns
  const calculateFixedRightPositions = useMemo(() => {
    let rightPosition = 0;

    // Reverse the fixed right columns to calculate from right to left
    const reversedColumns = [...fixedRightColumns].reverse();

    return reversedColumns
      .map((column) => {
        const columnWidth = column.width ? parseInt(column.width) : 100;
        const currentRight = rightPosition;
        rightPosition += columnWidth;
        return currentRight;
      })
      .reverse();
  }, [fixedRightColumns]);

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

  const getRowClasses = (row: T, index: number) => {
    const rowId = getRowId(row);
    const isSelected = selectedRows.has(rowId);

    const baseClasses = ["transition-colors duration-150", "group"];

    // Handle selection and hover states at row level
    if (isSelected) {
      baseClasses.push("bg-blue-100");
    } else if (stripeRows) {
      baseClasses.push(index % 2 === 0 ? "bg-white" : "bg-gray-50");
    } else {
      baseClasses.push("bg-white");
    }

    return baseClasses.filter(Boolean).join(" ");
  };

  const getColumnClasses = (
    column: Column<T>,
    row: T,
    rowIndex: number,
    isHeader = false,
    isLastFixedLeft: boolean = false,
    isFirstFixedRight: boolean = false
  ) => {
    const rowId = getRowId(row);
    const isSelected = selectedRows.has(rowId);

    const baseClasses = [
      "px-4 py-2 text-sm border-b border-gray-300",
      selectable && "pl-0",
      isHeader ? "font-semibold text-gray-700" : "text-gray-700",
      column.truncate && "truncate",
      "overflow-hidden",
      "transition-colors duration-150",
    ];

    if (!isHeader) {
      baseClasses.push("group-hover:bg-blue-50");
      if (isSelected) baseClasses.push("bg-blue-100 group-hover:bg-blue-200");
      else if (stripeRows)
        baseClasses.push(rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50");
    }

    if (column.fixed === "left") {
      baseClasses.push("sticky left-0 z-20");
      if (isLastFixedLeft)
        baseClasses.push(
          "after:absolute after:right-0 after:top-0 after:h-full after:w-[2px] after:bg-gray-300"
        );
    } else if (column.fixed === "right") {
      baseClasses.push("sticky right-0 z-20");
      if (isFirstFixedRight)
        baseClasses.push(
          "before:absolute before:left-0 before:top-0 before:h-full before:w-[2px] before:bg-gray-300"
        );
    }

    return baseClasses.filter(Boolean).join(" ");
  };

  const getHeaderClasses = (
    column: Column<T>,
    isLastFixedLeft: boolean = false,
    isFirstFixedRight: boolean = false
  ) => {
    const baseClasses = [
      "px-4 py-2 text-sm font-semibold text-gray-700 border-b-2 border-gray-300",
      selectable && "pl-0",
      "group cursor-pointer select-none",
      column.truncate && "truncate",
      "overflow-hidden",
      "bg-gray-100",
    ];

    if (fixedHeader) {
      baseClasses.push("sticky top-0");
      if (!column.fixed) baseClasses.push("z-30");
    }

    if (column.fixed === "left") {
      baseClasses.push("sticky left-0 z-40");
      if (isLastFixedLeft)
        baseClasses.push(
          "after:absolute after:right-0 after:top-0 after:h-full after:w-[2px] after:bg-gray-300"
        );
    } else if (column.fixed === "right") {
      baseClasses.push("sticky right-0 z-40");
      if (isFirstFixedRight)
        baseClasses.push(
          "before:absolute before:left-0 before:top-0 before:h-full before:w-[2px] before:bg-gray-300"
        );
    }

    return baseClasses.filter(Boolean).join(" ");
  };

  const getCheckboxHeaderClasses = (isLastFixedLeft: boolean) => {
    const baseClasses = ["px-2 py-2 border-b-2 bg-gray-100 sticky left-0 z-40 border-gray-300"];

    if (fixedHeader) {
      baseClasses.push("top-0");
    }

    if (isLastFixedLeft) {
      baseClasses.push("shadow-[2px_0_4px_-1px_rgba(0,0,0,0.1)]");
    }

    return baseClasses.join(" ");
  };

  const getCheckboxCellClasses = (
    row: T,
    rowIndex: number,
    isLastFixedLeft: boolean
  ) => {
    const rowId = getRowId(row);
    const isSelected = selectedRows.has(rowId);

    const baseClasses = [
      "px-2 py-2 border-b sticky left-0 z-20 transition-colors duration-150 border-gray-300",
      "group-hover:bg-blue-50",
    ];

    if (stripeRows && !isSelected) {
      baseClasses.push(rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50");
    } else if (isSelected) {
      baseClasses.push("bg-blue-100 group-hover:bg-blue-200");
    }

    if (isLastFixedLeft) {
      baseClasses.push("shadow-[2px_0_4px_-1px_rgba(0,0,0,0.1)]");
    }

    return baseClasses.join(" ");
  };

  const renderTableCell = (
    column: Column<T>,
    row: T,
    rowIndex: number,
    leftPosition: number = 0,
    rightPosition: number = 0,
    isLastFixedLeft: boolean = false,
    isFirstFixedRight: boolean = false
  ) => {
    let value: React.ReactNode;
    if (column.render) {
      value = column.render(row);
    } else {
      const nested = getNestedValue(row, String(column.key));
      value = nested !== undefined && nested !== null ? String(nested) : "";
    }

    const cellContent = column.truncate ? (
      <div
        className="truncate w-full"
        title={typeof value === "string" ? value : undefined}
      >
        {value !== undefined && value !== null ? value : ""}
      </div>
    ) : value !== undefined && value !== null ? (
      value
    ) : (
      ""
    );

    return (
      <td
        key={String(column.key)}
        className={`${getColumnClasses(
          column,
          row,
          rowIndex,
          false,
          isLastFixedLeft,
          isFirstFixedRight
        )} ${
          column.align === "center"
            ? "text-center"
            : column.align === "right"
            ? "text-right"
            : "text-left"
        }`}
        style={
          column.fixed === "left"
            ? {
                width: column.width,
                minWidth: column.width,
                maxWidth: column.width,
                left: `${leftPosition}px`,
              }
            : column.fixed === "right"
            ? {
                width: column.width,
                minWidth: column.width,
                maxWidth: column.width,
                right: `${rightPosition}px`,
              }
            : column.width
            ? {
                width: column.width,
                minWidth: column.width,
                maxWidth: column.width,
              }
            : undefined
        }
      >
        {cellContent}
      </td>
    );
  };

  const renderTableHeader = (
    column: Column<T>,
    leftPosition: number = 0,
    rightPosition: number = 0,
    isLastFixedLeft: boolean = false,
    isFirstFixedRight: boolean = false
  ) => {
    const isActive = sortBy === column.key;

    return (
      <th
        key={String(column.key)}
        className={getHeaderClasses(column, isLastFixedLeft, isFirstFixedRight)}
        style={
          column.fixed === "left"
            ? {
                width: column.width,
                minWidth: column.width,
                maxWidth: column.width,
                left: `${leftPosition}px`,
              }
            : column.fixed === "right"
            ? {
                width: column.width,
                minWidth: column.width,
                maxWidth: column.width,
                right: `${rightPosition}px`,
              }
            : column.width
            ? {
                width: column.width,
                minWidth: column.width,
                maxWidth: column.width,
              }
            : undefined
        }
        scope="col"
        onClick={() => handleSort(String(column.key), column.sortable)}
      >
        <div
          className={`flex items-center justify-between w-full ${
            column.truncate ? "min-w-0" : ""
          }`}
        >
          <span
            className={`
              ${column.truncate ? "truncate flex-1 min-w-0" : "flex-1"}
              ${
                column.align === "center"
                  ? "text-center"
                  : column.align === "right"
                  ? "text-right"
                  : "text-left"
              }
            `}
            title={column.label}
          >
            {column.label}
          </span>

          {column.sortable && (
            <div className="flex-shrink-0 ml-2">
              {isActive ? (
                sortOrder === "asc" ? (
                  <ArrowUp className="w-4 h-4 opacity-40 group-hover:opacity-70" />
                ) : (
                  <ArrowDown className="w-4 h-4 opacity-40 group-hover:opacity-70" />
                )
              ) : (
                <ArrowUpDown className="w-4 h-4 opacity-40 group-hover:opacity-70" />
              )}
            </div>
          )}
        </div>
      </th>
    );
  };
  

  return (
    <div className="relative">
      <LoadingOverlay visible={showOverlay} />

      {error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <>
          <div className="flex justify-between p-2 bg-white">
            <div className="flex gap-2 w-full">
              {/* Selection info */}
              {selectable && selectedRows.size > 0 && (
                <div className="mt-2 text-sm text-gray-600">
                  {selectedRows.size} row{selectedRows.size !== 1 ? "s" : ""}{" "}
                  selected
                </div>
              )}
              <SearchInput
                onSearch={handleSearch}
                placeholder="Search files..."
              />
            </div>

            {actionButton &&
              actionButton?.map((btn, idx) => (
                <div
                  className="flex w-full justify-end"
                  key={`action-div-${idx}`}
                >
                  <Button
                    key={`action-btn-${idx}`}
                    onClick={btn.onClick}
                    className="flex items-center gap-2"
                    disabled={btn.onClick.length > 0 && selectedRows.size === 0}
                  >
                    <UserRoundPlus className="size-4" />{" "}
                    <span>{btn.label}</span>
                  </Button>
                </div>
              ))}
          </div>

          {/* Scrollable table container with proper overflow handling */}
          <div
            ref={tableContainerRef}
            className="relative border border-gray-300 rounded-lg bg-white overflow-auto"
            style={{
              maxHeight: fixedHeader ? maxHeight : "none",
            }}
          >
            <table className="w-full table-fixed bg-white relative">
              <thead className="bg-gray-100">
                <tr>
                  {selectable && (
                    <th
                      className={getCheckboxHeaderClasses(
                        fixedLeftColumns.length === 0
                      )}
                      style={{
                        width: `${CHECKBOX_WIDTH}px`,
                        minWidth: `${CHECKBOX_WIDTH}px`,
                        maxWidth: `${CHECKBOX_WIDTH}px`,
                        left: "0px",
                      }}
                    >
                      <Checkbox
                        checked={isAllSelected}
                        indeterminate={isIndeterminate}
                        onChange={toggleSelectAll}
                      />
                    </th>
                  )}

                  {/* Fixed left columns with cumulative positioning */}
                  {fixedLeftColumns.map((column, index) =>
                    renderTableHeader(
                      column,
                      calculateFixedLeftPositions[index],
                      0,
                      index === fixedLeftColumns.length - 1,
                      false
                    )
                  )}

                  {/* Regular columns */}
                  {regularColumns.map((column) =>
                    renderTableHeader(column, 0, 0, false, false)
                  )}

                  {/* Fixed right columns with cumulative positioning */}
                  {fixedRightColumns.map((column, index) =>
                    renderTableHeader(
                      column,
                      0,
                      calculateFixedRightPositions[index],
                      false,
                      index === 0
                    )
                  )}
                </tr>
              </thead>

              <tbody>
                {isFirstLoad && loading ? (
                  // Skeleton rows
                  Array.from({ length: limit }).map((_, idx) => (
                    <tr
                      key={idx}
                      className={
                        stripeRows && idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }
                    >
                      {selectable && (
                        <td className="px-2 py-2">
                          <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                        </td>
                      )}
                      {headers.map((col, colIdx) => (
                        <td key={colIdx} className="px-4 py-2">
                          <div className="w-full h-4 bg-gray-200 rounded animate-pulse"></div>
                        </td>
                      ))}
                    </tr>
                  ))
                ) : data.length > 0 ? (
                  // Render normal rows here
                  data.map((row, rowIndex) => {
                    const rowId = getRowId(row);
                    return (
                      <tr key={rowId} className={getRowClasses(row, rowIndex)}>
                        {selectable && (
                          <td
                            className={getCheckboxCellClasses(
                              row,
                              rowIndex,
                              fixedLeftColumns.length === 0
                            )}
                            style={{
                              width: `${CHECKBOX_WIDTH}px`,
                              minWidth: `${CHECKBOX_WIDTH}px`,
                              maxWidth: `${CHECKBOX_WIDTH}px`,
                              left: "0px",
                            }}
                          >
                            <Checkbox
                              checked={selectedRows.has(rowId)}
                              onChange={() => toggleRow(rowId)}
                            />
                          </td>
                        )}
                        {fixedLeftColumns.map((col, colIndex) =>
                          renderTableCell(
                            col,
                            row,
                            rowIndex,
                            calculateFixedLeftPositions[colIndex],
                            0,
                            colIndex === fixedLeftColumns.length - 1,
                            false
                          )
                        )}
                        {regularColumns.map((col) =>
                          renderTableCell(col, row, rowIndex, 0, 0)
                        )}
                        {fixedRightColumns.map((col, colIndex) =>
                          renderTableCell(
                            col,
                            row,
                            rowIndex,
                            0,
                            calculateFixedRightPositions[colIndex],
                            false,
                            colIndex === 0
                          )
                        )}
                      </tr>
                    );
                  })
                ) : !loading ? (
                  <tr>
                    <td
                      colSpan={headers.length + (selectable ? 1 : 0)}
                      className="py-4 text-center text-md text-gray-600"
                    >
                      No records found.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

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

const Table = forwardRef(TableInner) as <T>(
  props: TableProps<T> & { ref?: React.Ref<TableRef> }
) => React.ReactElement;

export default Table;
