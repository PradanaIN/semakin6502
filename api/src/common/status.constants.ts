export const STATUS = {
  BELUM: "Belum",
  SEDANG_DIKERJAKAN: "Sedang Dikerjakan",
  SELESAI_DIKERJAKAN: "Selesai Dikerjakan",
} as const;

export type Status = (typeof STATUS)[keyof typeof STATUS];

export default STATUS;
