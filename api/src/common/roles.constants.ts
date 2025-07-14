export const ROLES = {
  ADMIN: "admin",
  KETUA: "ketua",
  ANGGOTA: "anggota",
  PIMPINAN: "pimpinan",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
