import React from "react";
import styles from "./Input.module.css";

export default function Input({ className = "", ...props }) {
  return <input className={`${styles.input} ${className}`.trim()} {...props} />;
}
