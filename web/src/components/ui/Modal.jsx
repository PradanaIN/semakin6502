import React, { useEffect, useRef, useState } from "react";

export default function Modal({ onClose, children, widthClass = "w-full max-w-md" }) {
  const containerRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);

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
    setTimeout(() => setVisible(true), 10);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  function handleClose() {
    setClosing(true);
    setVisible(false);
    setTimeout(onClose, 300);
  }

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 transition-opacity duration-300 ${visible && !closing ? 'opacity-100' : 'opacity-0'}`}
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        ref={containerRef}
        onClick={(e) => e.stopPropagation()}
        className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl space-y-4 transform transition-all duration-300 ${visible && !closing ? 'scale-100 opacity-100' : 'scale-95 opacity-0'} ${widthClass}`}
      >
        {children}
      </div>
    </div>
  );
}
