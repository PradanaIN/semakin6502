import React from "react";

export default function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}) {
  const base = "px-4 py-2 rounded focus:outline-none transition";
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white",
    secondary:
      "bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white",
  };
  return (
    <button
      className={`${base} ${variants[variant] ?? ""} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
