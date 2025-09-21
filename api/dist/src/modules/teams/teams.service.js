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
exports.TeamsService = void 0;
const common_1 = require("@nestjs/common");
const ulid_1 = require("ulid");
const prisma_service_1 = require("../../core/database/prisma.service");
let TeamsService = class TeamsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    findAll() {
        return this.prisma.team.findMany({
            include: { members: { include: { user: true } } },
        });
    }
    findAllPublic() {
        return this.prisma.team.findMany({
            where: { namaTim: { notIn: ["Admin", "Pimpinan"] } },
            include: { members: { include: { user: true } } },
        });
    }
    findByLeader(userId) {
        return this.prisma.team.findMany({
            where: { members: { some: { userId, isLeader: true } } },
            include: { members: { include: { user: true } } },
        });
    }
    findByMember(userId) {
        return this.prisma.team.findMany({
            where: { members: { some: { userId } } },
            include: { members: { include: { user: true } } },
        });
    }
    async findOne(id) {
        const team = await this.prisma.team.findUnique({
            where: { id },
            include: { members: { include: { user: true } } },
        });
        if (!team)
            throw new common_1.NotFoundException("not found");
        return team;
    }
    async create(data) {
        const namaTim = data?.namaTim;
        if (namaTim) {
            const existing = await this.prisma.team.findFirst({
                where: {
                    namaTim,
                },
            });
            if (existing) {
                throw new common_1.ConflictException("Nama tim sudah ada");
            }
        }
        return this.prisma.team.create({ data: { id: (0, ulid_1.ulid)(), ...data } });
    }
    async update(id, data) {
        const namaTim = data?.namaTim;
        if (namaTim) {
            const existing = await this.prisma.team.findFirst({
                where: {
                    namaTim,
                    id: { not: id },
                },
            });
            if (existing) {
                throw new common_1.ConflictException("Nama tim sudah ada");
            }
        }
        return this.prisma.team.update({ where: { id }, data });
    }
    remove(id) {
        return this.prisma.team.delete({ where: { id } });
    }
    addMember(teamId, member) {
        return this.prisma.member.create({
            data: {
                id: (0, ulid_1.ulid)(),
                teamId,
                userId: member.user_id,
                isLeader: member.isLeader,
            },
        });
    }
};
exports.TeamsService = TeamsService;
exports.TeamsService = TeamsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TeamsService);
