import React, { useEffect, useRef } from "react";

export default function Modal({ onClose, children, widthClass = "w-full max-w-md" }) {
  const containerRef = useRef(null);

  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab") {
        const focusable = containerRef.current?.querySelectorAll(
          "a[href], button, textarea, input, select, [tabindex]:not([tabindex='-1'])"
        );
        if (!focusable || focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener("keydown", handleKey);
    const firstInput = containerRef.current?.querySelector(
      "a[href], button, textarea, input, select, [tabindex]:not([tabindex='-1'])"
    );
    firstInput?.focus();
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        ref={containerRef}
        onClick={(e) => e.stopPropagation()}
        className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl space-y-4 ${widthClass}`}
      >
        {children}
      </div>
    </div>
  );
}
