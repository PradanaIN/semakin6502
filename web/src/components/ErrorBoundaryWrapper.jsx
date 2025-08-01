import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import ErrorBoundary from "./ErrorBoundary";

export default function ErrorBoundaryWrapper({ children }) {
  const location = useLocation();
  const [errorKey, setErrorKey] = useState(0);

  // Ganti key saat route berubah agar ErrorBoundary di-*reset*
  useEffect(() => {
    setErrorKey((prev) => prev + 1);
  }, [location.pathname]);

  return <ErrorBoundary key={errorKey}>{children}</ErrorBoundary>;
}
