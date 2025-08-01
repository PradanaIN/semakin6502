import { toast } from "react-toastify";
import confirmAlert from "./confirmAlert.js";


const showToast = (type, title, text) => {
  toast[type](`${title}${text ? `: ${text}` : ""}`);
};

export const showSuccess = (title, text = "") => showToast("success", title, text);

export const showError = (title, text = "") => showToast("error", title, text);

export const showWarning = (title, text = "") => showToast("warn", title, text);

export const confirmDelete = (title = "Hapus item ini?") =>
  confirmAlert({
    title,
    icon: "warning",
    confirmButtonText: "Hapus",
  });

export const confirmCancel = (title = "Batalkan perubahan?") =>
  confirmAlert({
    title,
    icon: "question",
  });

export const handleAxiosError = (error, defaultMessage = "Terjadi kesalahan") => {
  const message =
    error?.response?.status === 429
      ? "Terlalu banyak permintaan, coba lagi beberapa saat lagi."
      : error?.response?.data?.message ||
        (error?.request
          ? "Tidak dapat terhubung ke server. Coba lagi nanti."
          : defaultMessage);
  showError("Error", message);
};

export default {
  showSuccess,
  showError,
  showWarning,
  confirmDelete,
  confirmCancel,
  handleAxiosError,
};
