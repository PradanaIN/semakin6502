import { Search } from "lucide-react";

export default function SearchInput({
  value,
  onChange,
  placeholder,
  ariaLabel,
}) {
  return (
    <div className="relative w-64 max-w-full">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 dark:text-gray-300">
        <Search size={16} />
      </div>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className="w-full border border-gray-300 dark:border-gray-600 rounded-xl py-2 pl-11 pr-4 
          bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 
          placeholder-gray-400 dark:placeholder-gray-400 
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          transition duration-150 ease-in-out shadow-sm
          hover:border-blue-400 dark:hover:border-blue-400"
      />
    </div>
  );
}
