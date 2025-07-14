import React from "react";
import { STATUS } from "../../utils/status";

const colorMap = {
  [STATUS.BELUM]:
    "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
  [STATUS.SEDANG_DIKERJAKAN]:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-200",
  [STATUS.SELESAI_DIKERJAKAN]:
    "bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-200",
};

export default function StatusBadge({ status }) {
  const cls = colorMap[status] ||
    "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${cls}`}>{status}</span>
  );
}
