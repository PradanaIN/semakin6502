import React from "react";
import styles from "./Label.module.css";

export default function Label({ className = "", ...props }) {
  return <label className={`${styles.label} ${className}`.trim()} {...props} />;
}
