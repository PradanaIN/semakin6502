import React, { useMemo } from "react";
import DataTable from "../ui/DataTable";

import months from "../../utils/months";

const MonthlyMatrix = ({ data = [] }) => {

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
    months.forEach((m, i) => {
      cols.push({
        id: `month-${i + 1}`,
        Header: m.slice(0, 3),
        accessor: (row) => (row.months || [])[i],
        Cell: ({ row }) => {
          const val = (row.original.months || [])[i] || { persen: 0 };
          return (
            <div className="space-y-1">
              <div
                role="progressbar"
                aria-valuenow={val.persen}
                aria-valuemin="0"
                aria-valuemax="100"
                className="w-full bg-gray-200 dark:bg-gray-700 rounded h-2"
              >
                <div
                  className={`${progressColor(val.persen)} h-2 rounded`}
                  style={{ width: `${val.persen}%` }}
                />
              </div>
              <span className="text-xs font-medium">{val.persen}%</span>
            </div>
          );
        },
        meta: { cellClassName: "p-1 border text-center" },
        disableFilters: true,
      });
    });
    return cols;
  }, [data, progressColor]);

  if (!Array.isArray(data) || data.length === 0) return null;

  return (
    <div className="overflow-auto">
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

export default MonthlyMatrix;
