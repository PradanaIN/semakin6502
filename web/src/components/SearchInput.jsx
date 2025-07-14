import { Search } from "lucide-react";
import styles from "./SearchInput.module.css";

export default function SearchInput({ value, onChange, placeholder, ariaLabel }) {
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
        className={styles.input}
      />
    </div>
  );
}
