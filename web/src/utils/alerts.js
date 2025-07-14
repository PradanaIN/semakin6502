import Swal from "sweetalert2";

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
  Swal.fire({
    title,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Hapus",
    cancelButtonText: "Batal",
    ...baseOptions,
  });

export default {
  showSuccess,
  showError,
  showWarning,
  confirmDelete,
};
