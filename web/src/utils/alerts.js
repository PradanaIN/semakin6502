import Swal from "sweetalert2";
import confirmAlert from "./confirmAlert.js";

const baseOptions = {
  heightAuto: false,
  width: 400,
};

const showAlert = (title, text, icon) =>
  Swal.fire({
    title,
    text,
    icon,
    confirmButtonText: "OK",
    ...baseOptions,
  });

export const showSuccess = (title, text = "") => showAlert(title, text, "success");

export const showError = (title, text = "") => showAlert(title, text, "error");

export const showWarning = (title, text = "") => showAlert(title, text, "warning");

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
    error?.response?.data?.message ||
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
