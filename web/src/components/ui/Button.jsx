import React from "react";

export default function Button({
  children,
  variant = "primary",
  icon = false,
  className = "",
  ...props
}) {
  const baseClasses =
    "focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none";
  const base = icon
    ? `icon-button ${baseClasses}`
    : `px-4 py-2 rounded transition focus-visible:ring-offset-2 ${baseClasses}`;
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white",
    secondary:
      "bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white",
    danger: "bg-red-600 hover:bg-red-700 text-white",
    warning: "bg-yellow-500 hover:bg-yellow-600 text-white",
    icon: "text-blue-600 hover:underline dark:text-blue-400",
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
