import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./assets/styles/index.css";
import "sweetalert2/dist/sweetalert2.min.css";
import "./assets/styles/sweetalert-fix.css";
import "react-toastify/dist/ReactToastify.css";
import "./assets/styles/toast.css";
import { AuthProvider } from "./pages/auth/useAuth.jsx";
import { ThemeProvider } from "./theme/useTheme.jsx";
import { BrowserRouter } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import camelizeKeys from "./utils/camelizeKeys.js";
import { HelmetProvider } from "react-helmet-async";

function resolveApiBaseUrl() {
  const fallbackOrigin = window.location.origin;
  const rawValue = import.meta.env.VITE_API_URL;

  let parsedUrl;

  try {
    parsedUrl = new URL(rawValue ?? fallbackOrigin, window.location.origin);
  } catch (error) {
    console.warn(
      "Failed to parse VITE_API_URL. Falling back to window.location.origin.",
      error
    );
    parsedUrl = new URL(fallbackOrigin);
  }

  const isLocal =
    parsedUrl.hostname === "localhost" || parsedUrl.hostname === "127.0.0.1";

  const resolvedBeforeSanitizing = parsedUrl.href;
  const shouldForceHttps =
    window.location.protocol === "https:" &&
    parsedUrl.protocol === "http:" &&
    !isLocal;

  if (shouldForceHttps) {
    if (import.meta.env.PROD) {
      console.warn(
        `VITE_API_URL resolved to insecure endpoint "${resolvedBeforeSanitizing}". Forcing HTTPS to match current origin.`
      );
    }
    parsedUrl.protocol = "https:";
  }

  return {
    baseUrl: parsedUrl.href.replace(/\/$/, ""),
    isLocal,
  };
}

const { baseUrl: apiUrl, isLocal } = resolveApiBaseUrl();

axios.defaults.baseURL = apiUrl;
axios.defaults.withCredentials = true;

// Warn developers when the backend is not reachable over HTTPS
if (import.meta.env.PROD && !isLocal) {
  fetch(apiUrl, { method: "HEAD", mode: "no-cors" }).catch(() => {
    console.warn(
      `Unable to reach backend over HTTPS at ${apiUrl}. ` +
        `Please configure SSL before deployment.`
    );
  });
}

axios.interceptors.response.use((response) => {
  if (response.data && typeof response.data === "object") {
    response.data = camelizeKeys(response.data);
  }
  return response;
});

axios.interceptors.response.use(undefined, (error) => {
  const message = error.response?.data?.message || error.message;
  if (message && !error.config?.suppressToast) {
    toast.error(message);
  }
  if (
    error.response?.status === 401 &&
    window.location.pathname !== "/login"
  ) {
    window.location.href = "/login";
  }
  return Promise.reject(error);
});

export const apiClient = axios;

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <AuthProvider>
          <ThemeProvider>
            <App />
          </ThemeProvider>
        </AuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);
