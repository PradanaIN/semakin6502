import Skeleton from "../../../components/ui/Skeleton";

export default function DailyMatrixSkeleton({ dayCount = 30, rows = 8 }) {
  const safeDays = Math.max(28, Math.min(31, Number(dayCount) || 30));
  const safeRows = Math.max(5, Math.min(12, Number(rows) || 8));

  return (
    <div className="overflow-x-auto w-full rounded-md shadow border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 max-h-[65vh]">
      <table className="min-w-[1000px] w-full table-fixed text-sm border-collapse">
        <thead className="sticky top-0 bg-gray-50 dark:bg-gray-800 z-20 border-b border-gray-300 dark:border-gray-700">
          <tr>
            <th className="sticky left-0 z-30 bg-gray-50 dark:bg-gray-800 px-4 py-2 text-left font-bold border-r border-gray-300 dark:border-gray-700 w-48 md:w-60">
              <Skeleton className="h-4 w-24" />
            </th>
            {Array.from({ length: safeDays }).map((_, i) => (
              <th key={i} className="p-0 w-10 border-r border-gray-300 dark:border-gray-700 text-center align-middle">
                <div className="flex items-center justify-center px-2 py-2">
                  <Skeleton className="h-4 w-6" />
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: safeRows }).map((_, r) => (
            <tr
              key={r}
              className="text-center transition-colors duration-200 border-b border-gray-200 dark:border-gray-700 odd:bg-gray-50/60 dark:odd:bg-gray-800/40"
            >
              <td className="sticky left-0 bg-white dark:bg-gray-800 z-10 px-4 py-2 text-left font-semibold border-r border-gray-300 dark:border-gray-700 w-60 md:w-72">
                <Skeleton className="h-4 w-40" />
              </td>
              {Array.from({ length: safeDays }).map((_, c) => (
                <td key={c} className="px-2 py-2 border border-gray-300 dark:border-gray-600 text-center align-middle">
                  <Skeleton className="h-5 w-8 mx-auto" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

