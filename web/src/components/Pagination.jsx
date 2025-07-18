export default function Pagination({ currentPage, totalPages, onPageChange }) {
  const getPages = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages = [1];
    let start = Math.max(2, currentPage - 1);
    let end = Math.min(totalPages - 1, currentPage + 1);
    if (start > 2) pages.push("...");
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages - 1) pages.push("...");
    pages.push(totalPages);
    return pages;
  };

  const pages = getPages();

  return (
    <div className="flex flex-wrap items-center space-x-2">
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        aria-label="Halaman sebelumnya"
        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl
          bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 
          text-gray-800 dark:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed
          focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition"
      >
        Prev
      </button>

      {pages.map((p, idx) =>
        typeof p === "number" ? (
          <button
            key={idx}
            onClick={() => onPageChange(p)}
            className={`px-4 py-2 rounded-xl
              ${
                currentPage === p
                  ? "bg-blue-600 text-white dark:bg-blue-700"
                  : "border border-gray-300 dark:border-gray-600 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100"
              }
              focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition`}
            aria-label={`Halaman ${p}`}
            aria-current={currentPage === p ? "page" : undefined}
          >
            {p}
          </button>
        ) : (
          <span key={idx} className="px-3 text-gray-500 dark:text-gray-400">
            {p}
          </span>
        )
      )}

      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage >= totalPages}
        aria-label="Halaman selanjutnya"
        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl
          bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 
          text-gray-800 dark:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed
          focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition"
      >
        Next
      </button>
    </div>
  );
}
