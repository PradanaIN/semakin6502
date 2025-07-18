import React from "react";
import {
  useTable,
  useFilters,
  useGlobalFilter,
  usePagination,
} from "react-table";
import Table from "./Table";
import Pagination from "../Pagination";
import SelectDataShow from "./SelectDataShow";
import SearchInput from "../SearchInput";
import Input from "./Input";

function GlobalFilter({ globalFilter, setGlobalFilter }) {
  return (
    <SearchInput
      value={globalFilter || ""}
      onChange={(e) => setGlobalFilter(e.target.value || undefined)}
      placeholder="Cari..."
      ariaLabel="Cari dalam tabel"
    />
  );
}

function DefaultColumnFilter({ column: { filterValue, setFilter } }) {
  return (
    <Input
      value={filterValue || ""}
      onChange={(e) => setFilter(e.target.value || undefined)}
      className="mt-1 w-full"
      placeholder="Filter..."
    />
  );
}

export function SelectColumnFilter({
  column: { filterValue, setFilter, preFilteredRows, id },
  options,
}) {
  const opts = React.useMemo(() => {
    if (options) return options;
    const set = new Set();
    preFilteredRows.forEach((row) => {
      set.add(row.values[id]);
    });
    return [...set];
  }, [id, preFilteredRows, options]);

  return (
    <select
      value={filterValue || ""}
      onChange={(e) => setFilter(e.target.value || undefined)}
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

export default function DataTable({
  columns,
  data,
  initialPageSize = 10,
  showGlobalFilter = true,
}) {
  const defaultColumn = React.useMemo(
    () => ({
      Filter: DefaultColumnFilter,
    }),
    []
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    state: { pageIndex, pageSize, globalFilter },
    setGlobalFilter,
    setPageSize,
    gotoPage,
    pageCount,
  } = useTable(
    {
      columns,
      data,
      defaultColumn,
      initialState: { pageIndex: 0, pageSize: initialPageSize },
    },
    useFilters,
    useGlobalFilter,
    usePagination
  );

  return (
    <div className="space-y-4">
      {showGlobalFilter && (
        <GlobalFilter globalFilter={globalFilter} setGlobalFilter={setGlobalFilter} />
      )}
      <Table {...getTableProps()}>
        <thead>
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <th {...column.getHeaderProps()} className="px-2 py-2 text-left">
                  {column.render("Header")}
                  {column.canFilter && (
                    <div className="mt-1">{column.render("Filter")}</div>
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {page.length === 0 ? (
            <tr>
              <td colSpan={headerGroups[0].headers.length} className="py-4 text-center">
                Data tidak ditemukan
              </td>
            </tr>
          ) : (
            page.map((row) => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps()} className="border-t dark:border-gray-700">
                  {row.cells.map((cell) => (
                    <td {...cell.getCellProps()} className="px-2 py-2 text-center">
                      {cell.render("Cell")}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </Table>
      <div className="flex items-center justify-between mt-4">
        <SelectDataShow
          pageSize={pageSize}
          setPageSize={setPageSize}
          setCurrentPage={(p) => gotoPage(p - 1)}
          options={[5, 10, 25, 50]}
          className="w-32"
        />
        <Pagination
          currentPage={pageIndex + 1}
          totalPages={pageCount || 1}
          onPageChange={(p) => gotoPage(p - 1)}
        />
      </div>
    </div>
  );
}
