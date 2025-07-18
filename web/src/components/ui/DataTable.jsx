import React from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import Table from "./Table";
import Pagination from "../Pagination";
import SelectDataShow from "./SelectDataShow";
import SearchInput from "../SearchInput";
import Input from "./Input";

function GlobalFilter({ table }) {
  return (
    <SearchInput
      value={table.getState().globalFilter || ""}
      onChange={(e) => table.setGlobalFilter(e.target.value || undefined)}
      placeholder="Cari..."
      ariaLabel="Cari dalam tabel"
    />
  );
}

export function SelectColumnFilter({ column, options }) {
  const opts = React.useMemo(() => {
    if (options) return options;
    const values = new Set();
    column.getFacetedRowModel().rows.forEach((row) => {
      values.add(row.getValue(column.id));
    });
    return Array.from(values);
  }, [column, options]);

  return (
    <select
      value={column.getFilterValue() || ""}
      onChange={(e) => column.setFilterValue(e.target.value || undefined)}
      className="mt-1 w-full border border-gray-300 dark:border-gray-600 rounded-xl px-2 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
      aria-label="Filter kolom"
    >
      <option value="">Semua</option>
      {opts.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

export default function DataTable({
  columns,
  data,
  initialPageSize = 10,
  showGlobalFilter = true,
  initialSorting = [],
  onRowSelectionChange,
  showPagination = true,
  selectable = true,
}) {
  const tableColumns = React.useMemo(() => {
    const base = columns.map((col) => ({
      id: col.id,
      accessorKey: typeof col.accessor === "string" ? col.accessor : undefined,
      accessorFn: typeof col.accessor === "function" ? col.accessor : undefined,
      header: col.Header,
      cell: col.Cell
        ? (info) =>
            col.Cell({
              row: { original: info.row.original, index: info.row.index },
            })
        : undefined,
      enableColumnFilter: !col.disableFilters,
      filterFn: col.filter,
      meta: { Filter: col.Filter },
    }));

    const selectColumn = {
      id: "select",
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllRowsSelected()}
          onChange={table.getToggleAllRowsSelectedHandler()}
          aria-label="Pilih semua"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          disabled={!row.getCanSelect()}
          onChange={row.getToggleSelectedHandler()}
          aria-label="Pilih baris"
        />
      ),
      enableSorting: false,
      enableColumnFilter: false,
    };

    return selectable ? [selectColumn, ...base] : base;
  }, [columns, selectable]);

  const [globalFilter, setGlobalFilter] = React.useState("");
  const [columnFilters, setColumnFilters] = React.useState([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: initialPageSize,
  });
  const [sorting, setSorting] = React.useState(initialSorting);
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data,
    columns: tableColumns,
    state: { globalFilter, columnFilters, pagination, sorting, rowSelection },
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onRowSelectionChange: (updater) => {
      setRowSelection(updater);
      if (onRowSelectionChange) onRowSelectionChange(updater);
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableRowSelection: selectable,
  });

  return (
    <div className="space-y-4 overflow-x-auto md:overflow-x-visible">
      {showGlobalFilter && <GlobalFilter table={table} />}
      <Table className="min-w-full">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr
              key={headerGroup.id}
              className="bg-gray-100 dark:bg-gray-800"
            >
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-4 py-3 font-semibold text-center border-t border-b border-gray-300 dark:border-gray-700 select-none text-left"
                  onClick={header.column.getToggleSortingHandler()}
                >
                  <div className="flex items-center gap-1">
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                    {header.column.getCanSort() &&
                      (header.column.getIsSorted() === "asc" ? (
                        <ArrowUp size={12} />
                      ) : header.column.getIsSorted() === "desc" ? (
                        <ArrowDown size={12} />
                      ) : (
                        <ArrowUpDown size={12} className="text-gray-400" />
                      ))}
                  </div>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.length === 0 ? (
            <tr>
              <td
                colSpan={table.getAllColumns().length}
                className="py-4 text-center"
              >
                Data tidak ditemukan
              </td>
            </tr>
          ) : (
            table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="text-center odd:bg-white even:bg-gray-50 dark:odd:bg-gray-900 dark:even:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-4 py-3 border-t border-b border-gray-300 dark:border-gray-700"
                  >
                    {flexRender(
                      cell.column.columnDef.cell ?? cell.getValue(),
                      cell.getContext()
                    )}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </Table>
      {showPagination && (
        <div className="flex items-center justify-between mt-4">
          <SelectDataShow
            pageSize={table.getState().pagination.pageSize}
            setPageSize={(size) => table.setPageSize(size)}
            setCurrentPage={(p) => table.setPageIndex(p - 1)}
            options={[5, 10, 25, 50]}
            className="w-32"
          />
          <Pagination
            currentPage={table.getState().pagination.pageIndex + 1}
            totalPages={table.getPageCount() || 1}
            onPageChange={(p) => table.setPageIndex(p - 1)}
          />
        </div>
      )}
    </div>
  );
}
