export const STATUS = {
  BELUM: "Belum",
  SEDANG_DIKERJAKAN: "Sedang Dikerjakan",
  SELESAI_DIKERJAKAN: "Selesai Dikerjakan",
};

export const STATUS_LABELS = {
  [STATUS.BELUM]: "Belum",
  [STATUS.SEDANG_DIKERJAKAN]: "Sedang",
  [STATUS.SELESAI_DIKERJAKAN]: "Selesai",
};

export function formatStatus(status) {
  return STATUS_LABELS[status] || status;
}

export default STATUS;
