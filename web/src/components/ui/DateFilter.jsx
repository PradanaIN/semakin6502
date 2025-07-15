import { useRef } from "react";

export default function DateFilter({ tanggal, setTanggal, setCurrentPage }) {
  const inputRef = useRef(null);

  return (
    <div>
      <input
        id="filterTanggal"
        type="date"
        ref={inputRef}
        value={tanggal}
        onChange={(e) => {
          setTanggal(e.target.value);
          setCurrentPage(1);
        }}
        onFocus={() => inputRef.current?.showPicker()}
        className="cursor-pointer border border-gray-300 dark:border-gray-600
          rounded-xl px-0.5 py-[7px] bg-white dark:bg-gray-800
          text-gray-900 dark:text-gray-100 text-center
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          hover:border-blue-400 dark:hover:border-blue-400
          shadow-sm transition duration-150 ease-in-out"
      />
    </div>
  );
}
