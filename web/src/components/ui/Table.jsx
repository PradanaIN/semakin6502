import styles from "./Table.module.css";

export default function Table({ children, className = "", ...props }) {
  return (
    <div className={styles.wrapper}>
      <table className={`${styles.table} ${className}`} {...props}>
        {children}
      </table>
    </div>
  );
}
