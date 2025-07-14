import React from "react";
import Input from "./Input";
import months from "../../utils/months";

export default function MonthYearPicker({ month, year, onMonthChange, onYearChange }) {
  return (
    <div className="flex items-center gap-2">
      <select
        value={month}
        onChange={(e) => onMonthChange(e.target.value)}
        className="border rounded px-2 py-[4px] bg-white dark:bg-gray-700 dark:text-gray-200"
      >
        <option value="">Bulan</option>
        {months.map((m, i) => (
          <option key={i + 1} value={i + 1}>
            {m}
          </option>
        ))}
      </select>
      <Input
        type="number"
        value={year}
        onChange={(e) => onYearChange(parseInt(e.target.value, 10))}
        className="w-24"
      />
    </div>
  );
}
