import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./assets/styles/index.css";
import "sweetalert2/dist/sweetalert2.min.css";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "./pages/auth/useAuth.jsx";
import { ThemeProvider } from "./theme/useTheme.jsx";
import { BrowserRouter } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import camelizeKeys from "./utils/camelizeKeys.js";

axios.defaults.baseURL =
  import.meta.env.VITE_API_URL || "http://localhost:3000";
axios.defaults.withCredentials = true;

axios.interceptors.response.use((response) => {
  if (response.data && typeof response.data === "object") {
    response.data = camelizeKeys(response.data);
  }
  return response;
});

axios.interceptors.response.use(undefined, (error) => {
  const message = error.response?.data?.message || error.message;
  if (message) {
    toast.error(message);
  }
  if (error.response?.status === 401) {
    window.location.href = "/login";
  }
  return Promise.reject(error);
});

export const apiClient = axios;

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
