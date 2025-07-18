import React, { useMemo } from "react";
import DataTable from "../../components/ui/DataTable";

const WeeklyMatrix = ({ data = [], weeks = [], onSelectWeek }) => {

  const colorFor = (p) => {
    if (p >= 80) return "green";
    if (p >= 50) return "yellow";
    return "red";
  };

  const progressColor = (p) => {
    const c = colorFor(p);
    return c === "green"
      ? "bg-green-500"
      : c === "yellow"
      ? "bg-yellow-500"
      : "bg-red-500";
  };

  const columns = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) return [];
    const cols = [
      {
        Header: "Nama",
        accessor: "nama",
        meta: { cellClassName: "p-2 border text-left whitespace-nowrap text-sm" },
        disableFilters: true,
      },
    ];
    weeks.forEach((_, i) => {
      cols.push({
        id: `week-${i + 1}`,
        Header: (
          <span onClick={() => onSelectWeek && onSelectWeek(i)} className="cursor-pointer">
            Minggu {i + 1}
          </span>
        ),
        accessor: (row) => row.weeks[i],
        Cell: ({ row }) => (
          <div className="space-y-1">
            <div
              role="progressbar"
              aria-valuenow={row.original.weeks[i].persen}
              aria-valuemin="0"
              aria-valuemax="100"
              className="w-full bg-gray-200 dark:bg-gray-700 rounded h-2"
            >
              <div
                className={`${progressColor(row.original.weeks[i].persen)} h-2 rounded`}
                style={{ width: `${row.original.weeks[i].persen}%` }}
              />
            </div>
            <span className="text-xs font-medium">{row.original.weeks[i].persen}%</span>
          </div>
        ),
        meta: { cellClassName: "p-1 border text-center" },
        disableFilters: true,
      });
    });
    return cols;
  }, [weeks, onSelectWeek, progressColor, data]);

  if (!Array.isArray(data) || data.length === 0) return null;

  return (
    <div className="overflow-auto md:overflow-visible">
      <DataTable
        columns={columns}
        data={data}
        showGlobalFilter={false}
        showPagination={false}
        selectable={false}
      />
    </div>
  );
};

export default WeeklyMatrix;
