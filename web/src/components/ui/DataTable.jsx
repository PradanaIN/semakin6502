import React from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
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

function DefaultColumnFilter({ column }) {
  return (
    <Input
      value={column.getFilterValue() || ""}
      onChange={(e) => column.setFilterValue(e.target.value || undefined)}
      className="mt-1 w-full"
      placeholder="Filter..."
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

export default function DataTable({ columns, data, initialPageSize = 10, showGlobalFilter = true }) {
  const tableColumns = React.useMemo(
    () =>
      columns.map((col) => ({
        id: col.id,
        accessorKey: typeof col.accessor === "string" ? col.accessor : undefined,
        accessorFn: typeof col.accessor === "function" ? col.accessor : undefined,
        header: col.Header,
        cell: col.Cell ? ((info) => col.Cell({ row: { original: info.row.original } })) : undefined,
        enableColumnFilter: !col.disableFilters,
        filterFn: col.filter,
        meta: { Filter: col.Filter },
      })),
    [columns]
  );

  const [globalFilter, setGlobalFilter] = React.useState("");
  const [columnFilters, setColumnFilters] = React.useState([]);
  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: initialPageSize });

  const table = useReactTable({
    data,
    columns: tableColumns,
    state: { globalFilter, columnFilters, pagination },
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="space-y-4">
      {showGlobalFilter && <GlobalFilter table={table} />}
      <Table>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="px-2 py-2 text-left">
                  {flexRender(header.column.columnDef.header, header.getContext())}
                  {header.column.getCanFilter() && (
                    <div className="mt-1">
                      {(() => {
                        const FilterComp = header.column.columnDef.meta?.Filter;
                        return FilterComp ? (
                          <FilterComp column={header.column} />
                        ) : (
                          <DefaultColumnFilter column={header.column} />
                        );
                      })()}
                    </div>
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.length === 0 ? (
            <tr>
              <td colSpan={table.getAllColumns().length} className="py-4 text-center">
                Data tidak ditemukan
              </td>
            </tr>
          ) : (
            table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="border-t dark:border-gray-700">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-2 py-2 text-center">
                    {flexRender(cell.column.columnDef.cell || cell.column.columnDef.header, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </Table>
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
    </div>
  );
}
