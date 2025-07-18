import React, { useMemo } from "react";
import { getHolidays } from "../../utils/holidays";
import DataTable from "../../components/ui/DataTable";


const DailyMatrix = ({ data = [] }) => {
  const year = data[0]?.detail?.[0]
    ? new Date(data[0].detail[0].tanggal).getFullYear()
    : new Date().getFullYear();
  const today = new Date().toISOString().slice(0, 10);
  const HOLIDAYS = getHolidays(year);

  const isWeekend = (iso) => {
    const d = new Date(iso);
    const g = d.getDay();
    return g === 0 || g === 6;
  };

  const isHoliday = (iso) => HOLIDAYS.includes(iso);

  const boxClass = (day) => {
    if (day.count > 0) {
      return "bg-green-200 border-green-400 dark:bg-green-700 dark:border-green-500";
    }
    if (isWeekend(day.tanggal) || isHoliday(day.tanggal)) {
      return "bg-blue-200 border-blue-400 dark:bg-blue-700 dark:border-blue-500";
    }
    if (day.tanggal < today) {
      return "bg-yellow-200 border-yellow-400 dark:bg-yellow-700 dark:border-yellow-500";
    }
    return "bg-gray-100 dark:bg-gray-700";
  };

  const dayCount = data[0]?.detail?.length || 0;

  const columns = useMemo(() => {
    if (dayCount === 0) return [];
    const cols = [
      {
        Header: "Nama",
        accessor: "nama",
        meta: { cellClassName: "p-2 border text-left whitespace-nowrap text-sm" },
        disableFilters: true,
      },
    ];
    for (let i = 0; i < dayCount; i += 1) {
      cols.push({
        id: `day-${i + 1}`,
        Header: i + 1,
        accessor: (row) => row.detail[i],
        Cell: ({ row }) => row.original.detail[i].count || "",
        meta: {
          cellClassName: (cell) =>
            `p-1 border text-center ${boxClass(cell.getValue())}`,
        },
        disableFilters: true,
      });
    }
    return cols;
  }, [dayCount, boxClass]);

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

export default DailyMatrix;
