import { Search } from "lucide-react";
import styles from "./SearchInput.module.css";

export default function SearchInput({
  value,
  onChange,
  placeholder,
  ariaLabel,
}) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.icon}>
        <Search size={16} />
      </div>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className={`${styles.input} w-full border rounded-md py-[4px] pl-10 pr-3 bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500`.trim()}
      />
    </div>
  );
}
