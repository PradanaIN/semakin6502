"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VALID_ROLES = void 0;
exports.normalizeRole = normalizeRole;
const common_1 = require("@nestjs/common");
exports.VALID_ROLES = ["admin", "pimpinan", "ketua", "anggota"];
function normalizeRole(role) {
    if (!role) {
        throw new common_1.BadRequestException("role is required");
    }
    const r = role.toLowerCase();
    if (!exports.VALID_ROLES.includes(r)) {
        throw new common_1.BadRequestException(`invalid role: ${role}`);
    }
    return r;
}
