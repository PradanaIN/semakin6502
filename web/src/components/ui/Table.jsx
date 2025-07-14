import React from "react";

export default function Table({ children, className = "", ...props }) {
  return (
    <table
      className={`min-w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow ${className}`.trim()}
      {...props}
    >
      {children}
    </table>
  );
}
