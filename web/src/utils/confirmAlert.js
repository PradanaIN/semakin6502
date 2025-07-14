import Swal from "sweetalert2";

const baseOptions = {
  heightAuto: false,
  width: 400,
};

/**
 * Display a confirmation alert with default buttons.
 * @param {import('sweetalert2').SweetAlertOptions} options
 */
export default function confirmAlert(options = {}) {
  return Swal.fire({
    showCancelButton: true,
    confirmButtonText: "Ya",
    cancelButtonText: "Batal",
    ...baseOptions,
    ...options,
  });
}
