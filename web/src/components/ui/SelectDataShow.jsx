export default function SelectDataShow({
  pageSize,
  setPageSize,
  setCurrentPage,
  options = [5, 10, 25],
  className = "",
}) {
  return (
    <div className={`space-x-2 ${className}`}>
      <select
        value={pageSize}
        aria-label="Data per halaman"
        onChange={(e) => {
          setPageSize(parseInt(e.target.value, 10));
          setCurrentPage(1);
        }}
        className="cursor-pointer border border-gray-300 dark:border-gray-600 
          rounded-xl px-3 py-2 bg-white dark:bg-gray-800 
          text-gray-900 dark:text-gray-100 text-center
          placeholder-gray-400 dark:placeholder-gray-400
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          hover:border-blue-400 dark:hover:border-blue-400
          shadow-sm transition duration-150 ease-in-out"
      >
        {options.map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>
    </div>
  );
}
