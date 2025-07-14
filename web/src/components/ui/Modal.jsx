import React from "react";

export default function Modal({ onClose, children, widthClass = "w-full max-w-md" }) {
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl space-y-4 ${widthClass}`}
      >
        {children}
      </div>
    </div>
  );
}
