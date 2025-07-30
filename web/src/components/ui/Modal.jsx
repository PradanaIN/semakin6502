import React, { useEffect, useRef, useState } from "react";

export default function Modal({
  onClose,
  children,
  widthClass = "w-full max-w-md",
  titleId,
  descriptionId,
  initialFocusRef,
}) {
  const containerRef = useRef(null);
  const onCloseRef = useRef(onClose);
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Escape") onCloseRef.current();
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
    if (initialFocusRef?.current) {
      initialFocusRef.current.focus();
    } else {
      firstInput?.focus();
    }
    setTimeout(() => setVisible(true), 10);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  function handleClose() {
    setClosing(true);
    setVisible(false);
    setTimeout(() => onCloseRef.current(), 300);
  }

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 transition-opacity duration-300 ${visible && !closing ? 'opacity-100' : 'opacity-0'}`}
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
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
