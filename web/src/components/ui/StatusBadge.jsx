import { STATUS } from "../../utils/status";

const colorMap = {
  [STATUS.BELUM]: "bg-red-500 text-gray-100 dark:bg-red-600 dark:text-gray-100",
  [STATUS.SEDANG_DIKERJAKAN]:
    "bg-yellow-200 text-yellow-900 dark:bg-yellow-600 dark:text-gray-100",
  [STATUS.SELESAI_DIKERJAKAN]:
    "bg-green-200 text-green-900 dark:bg-green-600 dark:text-gray-100",
};

export default function StatusBadge({ status }) {
  const cls =
    colorMap[status] ||
    "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${cls}`}>
      {status}
    </span>
  );
}
