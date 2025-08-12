import styles from "./Table.module.css";

export default function Table({
  children,
  className = "",
  caption,
  ...props
}) {
  return (
    <div className={styles.wrapper}>
      <table className={`${styles.table} ${className}`} {...props}>
        {caption && <caption>{caption}</caption>}
        {children}
      </table>
    </div>
  );
}
