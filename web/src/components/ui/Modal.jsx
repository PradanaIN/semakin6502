import { useEffect, useRef, useState } from "react";
import { createFocusTrap } from "focus-trap";

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
  const trapRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Escape") handleClose();
    }

    const trap = createFocusTrap(containerRef.current, {
      escapeDeactivates: false,
      allowOutsideClick: true,
      initialFocus: initialFocusRef?.current || undefined,
      returnFocusOnDeactivate: true,
    });
    trapRef.current = trap;
    trap.activate();

    document.addEventListener("keydown", handleKey);

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    setTimeout(() => setVisible(true), 10);

    return () => {
      document.removeEventListener("keydown", handleKey);
      trap.deactivate();
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  function handleClose() {
    trapRef.current?.deactivate();
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
        className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg space-y-4 transform transition-all duration-300 ${visible && !closing ? 'scale-100 opacity-100' : 'scale-95 opacity-0'} ${widthClass}`}
      >
        {children}
      </div>
    </div>
  );
}
