import React from "react";

export default function Label({ className = "", ...props }) {
  const baseClasses = "block text-sm mb-1";
  return <label className={`${baseClasses} ${className}`.trim()} {...props} />;
}
