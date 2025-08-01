import React from "react";

export default function Input({ className = "", ...props }) {
  const baseClasses =
    "w-full border rounded px-3 py-2 bg-white text-gray-900 dark:bg-gray-700 dark:text-gray-200";
  return <input className={`${baseClasses} ${className}`.trim()} {...props} />;
}
