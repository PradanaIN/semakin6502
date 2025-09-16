import { BadRequestException } from "@nestjs/common";

export const VALID_ROLES = ["admin", "pimpinan", "ketua", "anggota"] as const;

export type ValidRole = (typeof VALID_ROLES)[number];

export function normalizeRole(role: string): ValidRole {
  if (!role) {
    throw new BadRequestException("role is required");
  }
  const r = role.toLowerCase();
  if (!VALID_ROLES.includes(r as ValidRole)) {
    throw new BadRequestException(`invalid role: ${role}`);
  }
  return r as ValidRole;
}
