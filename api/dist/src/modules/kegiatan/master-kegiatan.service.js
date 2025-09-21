"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MasterKegiatanService = void 0;
const common_1 = require("@nestjs/common");
const ulid_1 = require("ulid");
const prisma_service_1 = require("../../core/database/prisma.service");
const roles_constants_1 = require("../../shared/constants/roles.constants");
let MasterKegiatanService = class MasterKegiatanService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(params, userId, role) {
        const page = params.page && params.page > 0 ? params.page : 1;
        const limit = params.limit && params.limit > 0 ? params.limit : 10;
        const skip = (page - 1) * limit;
        const where = {};
        if (params.search)
            where.namaKegiatan = { contains: params.search };
        if (role === roles_constants_1.ROLES.ADMIN) {
            if (params.teamId) {
                where.teamId = params.teamId;
            }
        }
        else {
            const memberWhere = role === roles_constants_1.ROLES.KETUA ? { userId, isLeader: true } : { userId };
            const memberTeams = await this.prisma.member.findMany({
                where: memberWhere,
                select: { teamId: true },
            });
            const teamIds = memberTeams.map((t) => t.teamId);
            if (params.teamId) {
                if (params.forTambahan) {
                    // In tugas tambahan context, allow cross-team lookup
                    where.teamId = params.teamId;
                }
                else {
                    if (!teamIds.includes(params.teamId)) {
                        throw new common_1.ForbiddenException(role === roles_constants_1.ROLES.KETUA
                            ? "bukan ketua tim kegiatan ini"
                            : "bukan anggota tim kegiatan ini");
                    }
                    where.teamId = params.teamId;
                }
            }
            else {
                where.teamId = { in: teamIds };
            }
        }
        const [data, total] = await this.prisma.$transaction([
            this.prisma.masterKegiatan.findMany({
                where,
                include: { team: true },
                skip,
                take: limit,
            }),
            this.prisma.masterKegiatan.count({ where }),
        ]);
        return {
            data,
            total,
            page,
            lastPage: Math.ceil(total / limit),
        };
    }
    async create(data, userId, role) {
        if (role !== roles_constants_1.ROLES.ADMIN) {
            const leader = await this.prisma.member.findFirst({
                where: { teamId: data.teamId, userId, isLeader: true },
            });
            if (!leader) {
                throw new common_1.ForbiddenException("bukan ketua tim kegiatan ini");
            }
        }
        return this.prisma.masterKegiatan.create({
            data: { id: (0, ulid_1.ulid)(), ...data },
            include: { team: true },
        });
    }
    async update(id, data, userId, role) {
        const existing = await this.prisma.masterKegiatan.findUnique({
            where: { id },
        });
        if (!existing)
            throw new common_1.NotFoundException("not found");
        if (role !== roles_constants_1.ROLES.ADMIN) {
            const leader = await this.prisma.member.findFirst({
                where: { teamId: existing.teamId, userId, isLeader: true },
            });
            if (!leader)
                throw new common_1.ForbiddenException("bukan ketua tim kegiatan ini");
        }
        return this.prisma.masterKegiatan.update({
            where: { id },
            data,
            include: { team: true },
        });
    }
    async remove(id, userId, role) {
        const existing = await this.prisma.masterKegiatan.findUnique({ where: { id } });
        if (!existing)
            throw new common_1.NotFoundException("not found");
        if (role !== roles_constants_1.ROLES.ADMIN) {
            const leader = await this.prisma.member.findFirst({
                where: { teamId: existing.teamId, userId, isLeader: true },
            });
            if (!leader)
                throw new common_1.ForbiddenException("bukan ketua tim kegiatan ini");
        }
        return this.prisma.masterKegiatan.delete({ where: { id } });
    }
};
exports.MasterKegiatanService = MasterKegiatanService;
exports.MasterKegiatanService = MasterKegiatanService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MasterKegiatanService);
