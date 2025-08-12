import { forwardRef } from "react";

const Input = forwardRef(function Input({ className = "", ...props }, ref) {
  const baseClasses =
    "w-full border rounded px-3 py-2 bg-white text-gray-900 dark:bg-gray-700 dark:text-gray-200";
  return (
    <input
      ref={ref}
      className={`${baseClasses} ${className}`.trim()}
      {...props}
    />
  );
});

export default Input;
